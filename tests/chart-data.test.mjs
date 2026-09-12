import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateSeries, validateDefinition, derivePoints, resolveChart, readRelease, readObject } from '../src/lib/chart-data.mjs';
import { prepareUpdate, writeUpdate } from '../scripts/update-macro-data.mjs';

const point = (period, value) => ({ period, value, status: value === null ? 'missing' : 'observed', sourceRef: 'test', sourcePublishedAt: null });
const series = () => ({ seriesId:'test-rate', name:'Test only', frequency:'weekly',unit:'%',adjustment:'unknown',measure:'test only',sources:{test:{label:'Test fixture',locator:'fixture',retrievedAt:'2026-09-12',fileSha256:null,url:null}},points:[point('2026-09-04',3.65)] });
const chart = {chartId:'test-chart',version:1,topic:'rates',title:'Test',defaultRange:'5y',panels:[{title:'Test',unit:'%',type:'line',seriesIds:['test-rate'],derive:null}]};
test('missing inputs never become zero in liquidity or spreads', () => {
 assert.equal(derivePoints('net-liquidity',[6692903,883335,349663]),5459905);
 assert.equal(derivePoints('net-liquidity',[6692903,null,349663]),null);
 assert.ok(Math.abs(derivePoints('spread-bp',[3.64,3.87775])+23.775)<1e-9);
});
test('invalid periods, conflicting points, missing provenance and nonfinite values are rejected', () => {
 for (const mutate of [s=>s.points.push(point('2026-09-04',4)),s=>s.points[0].period='2026-02-30',s=>s.points[0].value=Infinity,s=>s.unit='',s=>s.sources={},s=>s.points[0]=point('2099-01-01',4)]) {
  const s=series(); mutate(s); assert.throws(()=>validateSeries(s));
 }
 validateSeries(series());
});
test('unit mismatches and unsafe object paths fail before rendering',()=>{
 const all={};for(const id of ['a','b','c'])all[id]={...series(),seriesId:id,unit:'百万美元'};
 assert.throws(()=>validateDefinition({...chart,panels:[{title:'Wrong',type:'line',unit:'bp',seriesIds:['a','b','c'],derive:'net-liquidity'}]},all),/unit/i);
 assert.throws(()=>readObject('/tmp',{path:'../../secrets',sha256:'a'.repeat(64)}),/Unsafe/);
});
test('weekly contribution shows the net change and does not fabricate a missing week',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'macro-weekly-'));
 try {
  const inputs=['liability','tga','repo'].map((id,i)=>({...series(),seriesId:id,unit:'百万美元',points:[point('2026-08-21',[100,20,10][i]),point('2026-09-04',[110,18,9][i]),point('2026-09-11',[112,15,8][i])]}));
  const definition={...chart,panels:[{title:'Contribution',unit:'百万美元',type:'bar',seriesIds:['liability','tga','repo'],derive:'weekly-contribution'}]};
  writeUpdate(root,prepareUpdate(root,{releaseId:'weeks',sourceEdition:'test',newSeries:inputs,chartDefinitions:[definition]}));
  const rows=resolveChart(root,'weeks','test-chart').panels[0].series;
  assert.equal(rows.at(-1).name,'净变化');
  assert.equal(rows.at(-1).points[1].value,null);
  assert.equal(rows.at(-1).points[2].value,6);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('revisions preserve old release and chart definition, dry run is read only, retries idempotent', () => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'macro-test-'));
 try {
  const initial={releaseId:'a',sourceEdition:'test only',newSeries:[series()],chartDefinitions:[chart],updates:[]};
  const a=prepareUpdate(root,initial); assert.deepEqual(fs.readdirSync(root),[]); writeUpdate(root,a);
  const before=resolveChart(root,'a','test-chart');
  assert.throws(()=>prepareUpdate(root,{releaseId:'bad',sourceEdition:'test',updates:[{seriesId:'test-rate',points:[point('2026-09-04',4)]}]}),/reason/i);
  assert.equal(readRelease(root).releaseId,'a');
  const batch={releaseId:'b',sourceEdition:'test',updates:[{seriesId:'test-rate',reason:'source revision',points:[point('2026-09-04',4),point('2026-09-11',5)]}],chartDefinitions:[{...chart,version:2,title:'Revised definition'}]};
  writeUpdate(root,prepareUpdate(root,batch));
  assert.deepEqual(resolveChart(root,'a','test-chart'),before);
  assert.equal(resolveChart(root,'b','test-chart').panels[0].series[0].points.at(-1).value,5);
  assert.equal(resolveChart(root,'b','test-chart').definition.title,'Revised definition');
  writeUpdate(root,prepareUpdate(root,batch));
  assert.equal(resolveChart(root,'b','test-chart').panels[0].series[0].points.length,2);
  assert.throws(()=>prepareUpdate(root,{...batch,sourceEdition:'different'}),/exists/i);
  const ref=readRelease(root,'a').series['test-rate']; fs.appendFileSync(path.join(root,ref.path),' ');
  assert.throws(()=>resolveChart(root,'a','test-chart'),/hash/i);
 } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
