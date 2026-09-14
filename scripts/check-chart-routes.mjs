import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { DATA_ROOT, readRelease, readObject } from '../src/lib/chart-data.mjs';
const args=process.argv.slice(2);
const arg=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const root=path.resolve(arg('--dist','dist'));
const base=arg('--base','/').replace(/\/?$/,'/');
const topics=['liquidity','rates','growth','inflation','labor','housing','financial-conditions'];
const read=route=>fs.readFileSync(path.join(root,route,'index.html'),'utf8');
assert.ok(read('charts').includes('数据图表'));
const release=readRelease();
for(const topic of topics) {
 const html=read(`charts/${topic}`);
 const defs=Object.values(release.charts).map(ref=>readObject(DATA_ROOT,ref)).filter(d=>d.topic===topic);
 for(const d of defs) {
  assert.ok(html.includes(`id="${d.chartId}"`),`Missing chart ${d.chartId}`);
  assert.ok(html.includes(`id="${d.chartId}-explanation-title"`),`Missing indicator explanation ${d.chartId}`);
 }
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk(root).filter(f=>f.endsWith('.html'))) {
 const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const value=match[1].replaceAll('&amp;','&');
  if(!value.startsWith('/')||value.startsWith('//'))continue;
  assert.ok(value.startsWith(base),`Missing base ${base}: ${value} in ${file}`);
  const url=new URL(value,'https://example.org');
  const relative=decodeURIComponent(url.pathname.slice(base.length));
  let target=path.join(root,relative);
  if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
  assert.ok(fs.existsSync(target),`Broken target: ${value} in ${file}`);
  if(url.hash)assert.ok(fs.readFileSync(target,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`Broken anchor ${value}`);
 }
}
const home=read(''),latest=read('report/2026-09-11'),old=read('report/2026-09-05');
for(const html of [home,latest]) {
 assert.ok(!html.includes('class="indicator-explanation"'),'Full indicator guides belong on Chart Pages');
 assert.equal((html.match(/class="macro-chart"/g)??[]).length,3);
 assert.equal((html.match(/class="chart-svg-narrow"/g)??[]).length,3,'Stale cached report graphics');
 assert.ok(!html.includes('<!-- chart:'),'Unrendered report marker');
}
assert.equal((old.match(/class="macro-chart"/g)??[]).length,0);
console.log(`Verified 8 chart routes, all local targets, report embeds, narrow SVGs and base ${base}`);
