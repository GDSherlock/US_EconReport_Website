import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isISODate } from './report-utils.mjs';

// Astro relocates this module during prerendering. Build-time data stays in the project root.
export const DATA_ROOT = path.resolve('src/data/macro');
export const sha256 = text => createHash('sha256').update(text).digest('hex');
export const jsonText = value => JSON.stringify(value) + '\n';
export const validId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(value);
const requireValue = (ok, message) => { if (!ok) throw new Error(message); };
export function periodEnd(period, frequency) {
 if (frequency === 'monthly' && /^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
  const [y,m]=period.split('-').map(Number); return new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);
 }
 if (frequency === 'quarterly' && /^\d{4}-Q[1-4]$/.test(period)) return new Date(Date.UTC(+period.slice(0,4),+period.at(-1)*3,0)).toISOString().slice(0,10);
 if (['daily','weekly'].includes(frequency) && isISODate(period)) return period;
 throw new Error(`Invalid ${frequency} period: ${period}`);
}
export function validateSeries(s, asOf = new Date().toISOString().slice(0,10)) {
 requireValue(validId(s.seriesId), 'Invalid seriesId');
 for (const key of ['name','unit','measure']) requireValue(typeof s[key]==='string' && s[key].trim(), `${s.seriesId}: missing ${key}`);
 requireValue(['sa','nsa','unknown'].includes(s.adjustment), `${s.seriesId}: adjustment required`);
 requireValue(Array.isArray(s.points) && s.points.length, `${s.seriesId}: no points`);
 let previous='';
 for (const p of s.points) {
  const end=periodEnd(p.period,s.frequency);
  requireValue(end>previous,`${s.seriesId}: duplicate or unsorted period ${p.period}`); previous=end;
  requireValue(['observed','missing','provisional'].includes(p.status),`${s.seriesId}: invalid status`);
  requireValue(p.value===null ? p.status==='missing' : Number.isFinite(p.value) && p.status!=='missing',`${s.seriesId}: invalid value/status ${p.period}`);
  requireValue(end<=asOf || p.status==='provisional' && s.frequency==='monthly' && p.period===asOf.slice(0,7),`${s.seriesId}: future period ${p.period}`);
  requireValue(p.sourcePublishedAt===null || isISODate(p.sourcePublishedAt) && p.sourcePublishedAt<=asOf,`${s.seriesId}: invalid source publication date`);
  const source=s.sources?.[p.sourceRef];
  requireValue(source?.label && source?.locator && isISODate(source?.retrievedAt),`${s.seriesId}: missing provenance ${p.period}`);
  requireValue(source.url===null || /^https?:\/\//.test(source.url),`${s.seriesId}: invalid source URL`);
 }
 return s;
}
export function readObject(root, ref) {
 requireValue(ref && /^[a-f0-9]{64}$/.test(ref.sha256), 'Invalid object hash');
 requireValue(/^(series|charts)\/[a-f0-9]{64}\.json$/.test(ref.path), 'Unsafe object path');
 const full=path.resolve(root,ref.path);
 requireValue(fs.realpathSync(full).startsWith(fs.realpathSync(root)+path.sep),'Unsafe real path');
 const text=fs.readFileSync(full,'utf8');
 requireValue(sha256(text)===ref.sha256,`Object hash mismatch: ${ref.path}`);
 return JSON.parse(text);
}
export function readRelease(root=DATA_ROOT, id) {
 const selected=id ?? JSON.parse(fs.readFileSync(path.join(root,'current.json'),'utf8')).releaseId;
 requireValue(validId(selected),'Invalid releaseId');
 const release=JSON.parse(fs.readFileSync(path.join(root,'releases',`${selected}.json`),'utf8'));
 requireValue(release.releaseId===selected,'Release ID mismatch');
 return release;
}
export function derivePoints(rule, values) {
 if (values.some(v=>v===null || v===undefined)) return null;
 if (rule==='net-liquidity' && values.length===3) return values[0]-values[1]-values[2];
 if (rule==='spread-bp' && values.length===2) return (values[0]-values[1])*100;
 throw new Error(`Unknown derivation: ${rule}`);
}
export function validateDefinition(d, allSeries) {
 requireValue(validId(d.chartId) && Number.isInteger(d.version) && d.version>0 && d.title,'Invalid chart definition');
 requireValue(['liquidity','rates','growth','inflation','labor','housing','financial-conditions'].includes(d.topic),'Invalid topic');
 requireValue(['1y','3y','5y','all'].includes(d.defaultRange),'Invalid range');
 requireValue(Array.isArray(d.panels) && d.panels.length,'No panels');
 for (const p of d.panels) {
  requireValue(['line','bar','yield-curve'].includes(p.type) && p.title && p.unit,'Invalid panel');
  requireValue(p.seriesIds?.length && p.seriesIds.every(id=>allSeries[id]),`${d.chartId}: unknown series`);
  const inputs=p.seriesIds.map(id=>allSeries[id]);
  requireValue(new Set(inputs.map(s=>s.frequency)).size===1,`${d.chartId}: incompatible frequencies`);
  requireValue(inputs.every(s=>s.unit===inputs[0].unit),`${d.chartId}: incompatible units`);
  requireValue([null,'net-liquidity','spread-bp','weekly-contribution'].includes(p.derive), 'Unknown derivation');
  if (p.derive==='net-liquidity' || p.derive==='weekly-contribution') requireValue(inputs.length===3 && inputs[0].unit==='百万美元' && p.unit==='百万美元','Liquidity input/output unit must be million USD');
  if (p.derive==='spread-bp') requireValue(inputs.length===2 && inputs[0].unit==='%' && p.unit==='bp','Spread inputs must be percent');
  if (p.derive==='weekly-contribution') requireValue(inputs[0].frequency==='weekly','Contribution requires weekly observations');
  if (!p.derive) requireValue(p.unit===inputs[0].unit,'Panel unit mismatch');
  if (p.type==='yield-curve') requireValue(p.tenors?.length===inputs.length && p.tenors.every(t=>t.label && t.months>0),'Yield curve requires tenors');
 }
}
export function validateRelease(release, root=DATA_ROOT) {
 requireValue(validId(release.releaseId) && release.sourceEdition && Number.isFinite(Date.parse(release.importedAt)) && Number.isFinite(Date.parse(release.publishedAt)),'Invalid release metadata');
 const all={};
 for (const [id,ref] of Object.entries(release.series)) { const s=validateSeries(readObject(root,ref),release.publishedAt.slice(0,10)); requireValue(id===s.seriesId,'Series ID mismatch'); all[id]=s; }
 for (const [id,ref] of Object.entries(release.charts)) { const d=readObject(root,ref); requireValue(id===d.chartId,'Chart ID mismatch'); validateDefinition(d,all); }
 return all;
}
export function resolveChart(root=DATA_ROOT, releaseId, chartId) {
 const release=readRelease(root,releaseId);
 requireValue(release.charts[chartId],`Unknown chart: ${chartId}`);
 const definition=readObject(root,release.charts[chartId]);
 const all={};
 for (const id of new Set(definition.panels.flatMap(p=>p.seriesIds))) all[id]=validateSeries(readObject(root,release.series[id]),release.publishedAt.slice(0,10));
 validateDefinition(definition,all);
 const panels=definition.panels.map(panel=>{
  let series=panel.seriesIds.map(id=>all[id]);
  if (panel.derive) {
   const periods=[...new Set(series.flatMap(s=>s.points.map(p=>p.period)))].sort();
   const maps=series.map(s=>new Map(s.points.map(p=>[p.period,p])));
   if (panel.derive==='weekly-contribution') {
    series=series.map((s,i)=>({...s,name:['负债变化','TGA贡献','逆回购贡献'][i],points:periods.map(period=>{
     const prev=new Date(Date.parse(period+'T00:00:00Z')-7*86400000).toISOString().slice(0,10);
     const a=maps[i].get(period)?.value, b=maps[i].get(prev)?.value;
     return {period,value:a==null||b==null?null:(a-b)*(i===0?1:-1)};
    })}));
    series.push({...series[0],name:'净变化',points:periods.map((period,index)=>{
     const values=series.map(s=>s.points[index].value);
     return {period,value:values.some(v=>v===null)?null:values.reduce((a,b)=>a+b,0)};
    })});
   } else series=[{...series[0],name:panel.title,unit:panel.unit,points:periods.map(period=>({period,value:derivePoints(panel.derive,maps.map(m=>m.get(period)?.value??null))}))}];
  }
  return {...panel,series};
 });
 const sources=[...new Map(Object.values(all).flatMap(s=>Object.values(s.sources)).map(s=>[JSON.stringify(s),s])).values()];
 const metadata=Object.values(all).map(({seriesId,name,unit,frequency,adjustment,measure})=>({seriesId,name,unit,frequency,adjustment,measure}));
 return {releaseId:release.releaseId,sourceEdition:release.sourceEdition,definition,panels,sources,metadata};
}
