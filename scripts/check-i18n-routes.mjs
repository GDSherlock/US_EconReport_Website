import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {counterpartPath,localePath} from '../src/lib/i18n.mjs';
const args=process.argv.slice(2), arg=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const root=path.resolve(arg('--dist','dist')),base=arg('--base','/');
const read=route=>fs.readFileSync(path.join(root,route,'index.html'),'utf8');
const topics=['liquidity','rates','growth','inflation','labor','housing','financial-conditions'];
const dates=fs.readdirSync(path.join(root,'report')).filter(d=>fs.existsSync(path.join(root,'report',d,'index.html'))).sort().reverse();
for(const route of ['', 'archive','contact','charts',...topics.map(t=>'charts/'+t),...dates.map(d=>'report/'+d)]){
 const zh=read(route),en=read('en/'+route);
 for(const [locale,html] of [['zh',zh],['en',en]]){
  assert.ok(html.includes(`lang="${locale==='zh'?'zh-CN':'en'}"`),`${route}: html lang`);
  const switchTag=html.match(/<a\b[^>]*class="language-switch"[^>]*>/)?.[0];
  const other=counterpartPath(localePath(route?route+'/':'',locale,base),locale==='zh'?'en':'zh',base);
  assert.ok(switchTag?.includes(`href="${other}"`),`${route}: counterpart ${other}`);
  assert.ok(!html.includes("{t('"),'Unexpanded localization expression');
 }
 const pending=en.includes('class="translation-pending"');
 if(pending){assert.ok(en.includes('noindex,follow'));assert.ok(!en.includes('class="report-article"'));continue;}
 const payloads=html=>[...html.matchAll(/<script type="application\/json" class="chart-payload">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
 const a=payloads(zh),b=payloads(en);
 assert.equal(a.length,b.length,`${route}: chart count`);
 a.forEach((c,i)=>{
  assert.equal(c.releaseId,b[i].releaseId);
  assert.equal(c.definition.chartId,b[i].definition.chartId);
  assert.deepEqual(c.panels.map(p=>p.series.map(s=>s.points)),b[i].panels.map(p=>p.series.map(s=>s.points)),`${route}: time series changed with language`);
 });
 const visible=en.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,'').replaceAll('中文','');
 assert.ok(!/[\u3400-\u9fff]/u.test(visible),`${route}: untranslated visible content`);
 if(route.startsWith('report/')||route===''){
  assert.equal((zh.match(/<h[23]\b/g)??[]).length,(en.match(/<h[23]\b/g)??[]).length,`${route}: chapter hierarchy mismatch`);
  const figureAttrs=html=>[...html.matchAll(/<figure[^>]*class="macro-chart"[^>]*>/g)].map(m=>[m[0].match(/data-chart-id="([^"]+)"/)[1],m[0].match(/data-release="([^"]+)"/)[1]]);
  assert.deepEqual(figureAttrs(zh),figureAttrs(en),`${route}: pinned chart mismatch`);
 }
}
for(const d of dates)assert.ok(read('en/archive').includes(localePath(`report/${d}/`,'en',base)),`Archive missing ${d}`);
assert.ok(read('en').includes(dates[0]),'English home lost the latest issue');
console.log(`Verified bilingual counterparts, content coverage and shared chart observations for ${dates.length} issues and ${topics.length} topics (base ${base}).`);
