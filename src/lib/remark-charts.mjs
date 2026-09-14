import { DATA_ROOT, resolveChart, periodEnd } from './chart-data.mjs';
import { renderChartFigure } from './chart-render.mjs';

export default function remarkCharts({base=process.env.PAGES_BASE_PATH??'/'}={}) {
 return (tree,file)=>{
  const locale=file.data?.astro?.frontmatter?.locale??'zh';
  const declarations=file.data?.astro?.frontmatter?.charts??[];
  const configs=new Map();
  for(const config of declarations) {
   if(configs.has(config.chartId))throw new Error(`Duplicate chart declaration: ${config.chartId}`);
   configs.set(config.chartId,config);
  }
  const found=new Set();
  function visit(node) {
   if(node.type==='html') {
    const match=node.value.trim().match(/^<!--\s*chart:\s*([a-z0-9-]+)\s*-->$/);
    if(match) {
     const id=match[1],config=configs.get(id);
     if(!config)throw new Error(`Chart marker has no declaration: ${id}`);
     if(found.has(id))throw new Error(`Duplicate chart marker: ${id}`);
     if(!config.releaseId || !config.caption?.trim() || !config.versionNote?.trim() || !config.range)throw new Error(`Incomplete chart declaration: ${id}`);
     const resolved=resolveChart(DATA_ROOT,config.releaseId,id);
     for(const panel of resolved.panels)for(const series of panel.series) {
      if(periodEnd(config.range.from,series.frequency)>periodEnd(config.range.to,series.frequency))throw new Error(`Invalid report range: ${id}`);
     }
     if(resolved.panels.some(p=>p.type==='yield-curve')&&!config.selectedPeriod)throw new Error('Report yield curve requires selectedPeriod');
     found.add(id);
     node.value=renderChartFigure(resolved,{...config,locale,mode:'report',instanceId:`report-chart-${id}`,detailHref:`${base.replace(/\/$/,'')}/${locale==='en'?'en/':''}charts/${resolved.definition.topic}/#${id}`});
    }
   }
   for(const child of node.children??[])visit(child);
  }
  visit(tree);
  for(const id of configs.keys())if(!found.has(id))throw new Error(`Chart declaration has no marker: ${id}`);
 };
}
