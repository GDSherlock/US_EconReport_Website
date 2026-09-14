import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DATA_ROOT, jsonText, sha256, validId, validateSeries, validateDefinition, validateRelease, readRelease, readObject } from '../src/lib/chart-data.mjs';

export function prepareUpdate(root, batch) {
 if (!validId(batch.releaseId) || !batch.sourceEdition) throw new Error('releaseId/sourceEdition required');
 const batchHash=sha256(jsonText(batch));
 const target=path.join(root,'releases',`${batch.releaseId}.json`);
 if (fs.existsSync(target)) {
  const existing=readRelease(root,batch.releaseId);
  if (existing.batchHash!==batchHash) throw new Error('Release already exists with different batch');
  validateRelease(existing,root);
  return {release:existing,newFiles:[],diff:[],idempotent:true};
 }
 const previous=fs.existsSync(path.join(root,'current.json'))?readRelease(root):null;
 if (previous) validateRelease(previous,root);
 const all=Object.fromEntries(Object.entries(previous?.series??{}).map(([id,ref])=>[id,readObject(root,ref)]));
 const defs=Object.fromEntries(Object.entries(previous?.charts??{}).map(([id,ref])=>[id,readObject(root,ref)]));
 const diff=[];
 for (const s of batch.newSeries??[]) {
  if (all[s.seriesId]) throw new Error(`Series exists: ${s.seriesId}`);
  all[s.seriesId]=structuredClone(s); diff.push({seriesId:s.seriesId,added:s.points.length,revised:0});
 }
 const updated=new Set();
 for (const update of batch.updates??[]) {
  if (updated.has(update.seriesId)) throw new Error('Duplicate series update'); updated.add(update.seriesId);
  const s=all[update.seriesId]; if (!s) throw new Error(`Unknown series ${update.seriesId}`);
  for (const k of ['name','unit','frequency','adjustment','measure']) if (k in update && update[k]!==s[k]) throw new Error('Semantic change requires a new seriesId');
  for (const [key,source] of Object.entries(update.sources??{})) {
   if (s.sources[key] && jsonText(s.sources[key])!==jsonText(source)) throw new Error('Source reference already exists; use new sourceRef');
   s.sources[key]=source;
  }
  const points=new Map(s.points.map(p=>[p.period,p])); let added=0,revised=0;
  const periods=new Set();
  for (const p of update.points??[]) {
   if (periods.has(p.period)) throw new Error('Duplicate period in update'); periods.add(p.period);
   if (points.has(p.period) && jsonText(points.get(p.period))!==jsonText(p)) {
    if (!update.reason?.trim()) throw new Error('Revision reason required'); revised++;
   } else if (!points.has(p.period)) added++;
   points.set(p.period,p);
  }
  s.points=[...points.values()].sort((a,b)=>a.period.localeCompare(b.period));
  diff.push({seriesId:s.seriesId,added,revised,reason:update.reason??null});
 }
 for (const d of batch.chartDefinitions??[]) {
  if (defs[d.chartId] && d.version<=defs[d.chartId].version) throw new Error('Chart version must increase');
  defs[d.chartId]=d;
 }
 for (const s of Object.values(all)) validateSeries(s);
 for (const d of Object.values(defs)) validateDefinition(d,all);
 const now=new Date().toISOString();
 const release={releaseId:batch.releaseId,sourceEdition:batch.sourceEdition,importedAt:now,publishedAt:now,batchHash,parentReleaseId:previous?.releaseId??null,series:{},charts:{},changes:diff};
 const newFiles=[];
 for (const [kind,objects] of [['series',all],['charts',defs]]) for (const [id,obj] of Object.entries(objects)) {
  const text=jsonText(obj),hash=sha256(text),relative=`${kind}/${hash}.json`;
  release[kind][id]={path:relative,sha256:hash};
  if (!fs.existsSync(path.join(root,relative))) newFiles.push({path:relative,text});
 }
 return {release,newFiles,diff};
}
export function writeUpdate(root, prepared) {
 if (prepared.idempotent) return;
 const {release,newFiles}=prepared;
 const current=fs.existsSync(path.join(root,'current.json'))?readRelease(root).releaseId:null;
 if (current!==release.parentReleaseId) throw new Error('Current release changed; re-run preflight');
 for (const file of newFiles) {
  const target=path.join(root,file.path); fs.mkdirSync(path.dirname(target),{recursive:true});
  if (fs.existsSync(target)) { if (fs.readFileSync(target,'utf8')!==file.text) throw new Error('Immutable object conflict'); }
  else fs.writeFileSync(target,file.text,{flag:'wx'});
 }
 validateRelease(release,root);
 fs.mkdirSync(path.join(root,'releases'),{recursive:true});
 fs.writeFileSync(path.join(root,'releases',`${release.releaseId}.json`),jsonText(release),{flag:'wx'});
 const temp=path.join(root,`current-${process.pid}.tmp`);
 fs.writeFileSync(temp,jsonText({releaseId:release.releaseId}),{flag:'wx'});
 fs.renameSync(temp,path.join(root,'current.json'));
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
 try {
  const args=process.argv.slice(2),file=args[args.indexOf('--batch')+1];
  if (!args.includes('--batch') || !(args.includes('--apply')!==args.includes('--dry-run'))) throw new Error('Use --batch FILE and exactly one of --dry-run / --apply');
  const result=prepareUpdate(DATA_ROOT,JSON.parse(fs.readFileSync(file,'utf8')));
  console.log(JSON.stringify({releaseId:result.release.releaseId,changes:result.diff,idempotent:!!result.idempotent},null,2));
  if (args.includes('--apply')) writeUpdate(DATA_ROOT,result);
 } catch(e) { console.error(e.message); process.exitCode=1; }
}
