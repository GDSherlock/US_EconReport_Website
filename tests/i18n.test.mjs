import test from 'node:test';
import assert from 'node:assert/strict';
import {localePath,counterpartPath,localeReports,reportEdition,validateEditions} from '../src/lib/i18n.mjs';
import {publishedReports} from '../src/lib/report-utils.mjs';
import {DATA_ROOT,readRelease,resolveChart} from '../src/lib/chart-data.mjs';
import {renderChartFigure,renderPanels} from '../src/lib/chart-render.mjs';
import {getIndicatorGuide,validateIndicatorGuide} from '../src/lib/indicator-guides.mjs';
import {localizeChart} from '../src/data/chart-copy.en.mjs';
const issue=(date,locale='zh',draft=false)=>({data:{date,locale,draft}});
test('counterparts retain content routes under root and a deployment subpath',()=>{
 for(const base of ['/','/research/'])for(const path of ['', 'archive/','report/2026-09-05/','charts/rates/','contact/']){
  assert.equal(counterpartPath(localePath(path,'zh',base),'en',base),localePath(path,'en',base));
  assert.equal(counterpartPath(localePath(path,'en',base),'zh',base),localePath(path,'zh',base));
 }
 assert.throws(()=>localePath('','fr'),/Unsupported/);
});
test('an untranslated newest issue never silently becomes an older English report',()=>{
 const entries=[issue('2026-09-11'),issue('2026-09-05'),issue('2026-09-05','en'),issue('2026-09-11','en',true)];
 validateEditions(entries);
 const latest=publishedReports(localeReports(entries))[0];
 assert.equal(latest.data.date,'2026-09-11');
 assert.equal(reportEdition(entries,latest.data.date,'en'),undefined);
 assert.equal(reportEdition(entries,'2026-09-05','en').data.locale,'en');
 assert.throws(()=>validateEditions([...entries,issue('2026-09-05','en')]),/Duplicate/);
 assert.throws(()=>validateEditions([issue('2026-09-05','en')]),/no published Chinese/);
});
test('all charts have complete English explanations and translated labels without changing observations',()=>{
 const r=readRelease();
 for(const id of Object.keys(r.charts)){
  const original=resolveChart(DATA_ROOT,r.releaseId,id), before=JSON.stringify(original);
  validateIndicatorGuide(original.definition,getIndicatorGuide(id,'en'));
  const translated=localizeChart(original,'en');
  assert.equal(JSON.stringify(original),before);
  translated.panels.forEach((p,i)=>p.series.forEach((s,j)=>assert.deepEqual(s.points,original.panels[i].series[j].points)));
  const html=renderChartFigure(original,{locale:'en'});
  const visible=html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,'');
  assert.ok(!/[\u3400-\u9fff]/u.test(visible),id+' contains untranslated chart text');
  assert.ok(html.includes('Data updated: '+original.sourceEdition));
  assert.ok(renderPanels(translated,{locale:'en',range:'1y',width:320}).includes('View data table'));
 }
});
test('translated reports cannot change pinned chart releases or date ranges',()=>{
 const zh=issue('2026-09-11'),en=issue('2026-09-11','en');
 const chart={chartId:'net-liquidity',releaseId:'bootstrap-20260911',range:{from:'2021-09-09',to:'2026-09-09'},caption:'中文',versionNote:'中文'};
 zh.data.charts=[chart];en.data.charts=[{...chart,caption:'English',versionNote:'English'}];
 assert.doesNotThrow(()=>validateEditions([zh,en]));
 en.data.charts[0]={...chart,range:{...chart.range,to:'2026-09-10'}};
 assert.throws(()=>validateEditions([zh,en]),/chart pins differ/);
});
