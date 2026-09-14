import remarkCharts from './remark-charts.mjs';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

// Native Astro 7 adapter. Keep the existing processor and heading behavior.
export function satteriCharts() {
 // Astro caches rendered Markdown by processor configuration. Include shared renderer
 // code so a rebuild cannot retain stale report SVG while theme pages use new code.
 const hash=createHash('sha256');
 for(const file of ['chart-render.mjs','chart-geometry.mjs','chart-data.mjs','remark-charts.mjs','satteri-charts.mjs'])hash.update(fs.readFileSync(new URL(file,import.meta.url)));
 hash.update(fs.readFileSync(new URL('../data/chart-copy.en.mjs',import.meta.url)));
 return {
  name:'macro-report-charts-'+hash.digest('hex').slice(0,16),
  before(root,ctx) {
   const originals=[];
   function collect(node) {if(node.type==='html') originals.push(node);for(const child of node.children??[])collect(child);}
   collect(root);
   const copies=originals.map(node=>({type:'html',value:node.value}));
   remarkCharts()({children:copies},{data:ctx.data});
   copies.forEach((node,i)=>{if(node.value!==originals[i].value)ctx.setProperty(originals[i],'value',node.value);});
  },
 };
}
