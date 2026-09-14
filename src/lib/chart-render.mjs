import { buildPanelGeometry, selectRange, curveDates } from './chart-geometry.mjs';
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const displayUnit = unit => unit==='百万美元'?'亿美元':unit;
const formatters=new Map();
export function formatValue(value, unit, digits=2) {
 if(!formatters.has(digits))formatters.set(digits,new Intl.NumberFormat('zh-CN',{maximumFractionDigits:digits}));
 return value===null?'—':formatters.get(digits).format(unit==='百万美元'?value/100:value);
}
const f=n=>Number(n.toFixed(2));
const colors=['#9f4437','#406b78','#a17a43','#696b56'];
function normalizePanel(panel,range,selectedPeriod) {
 if(panel.type==='yield-curve') {
  const dates=curveDates(panel), date=selectedPeriod??dates.at(-1);
  if(date && !dates.includes(date)) throw new Error('Yield date has incomplete observations');
  return {...panel,selectedPeriod:date,series:[{name:'国债收益率',frequency:'daily',points:panel.series.map((s,i)=>({period:`2000-01-${String(i+1).padStart(2,'0')}`,label:panel.tenors[i].label,value:s.points.find(p=>p.period===date)?.value??null}))}]};
 }
 const ends=panel.series.map(s=>s.points.filter(p=>p.value!==null).at(-1)?.period).filter(Boolean).sort();
 return {...panel,series:panel.series.map(s=>({...s,points:selectRange(s.points,range,ends.at(-1))}))};
}
export function renderPanels(resolved, options={}) {
 const range=options.range??resolved.definition.defaultRange;
 return resolved.panels.map((original,index)=>{
  const panel=normalizePanel(original,range,options.selectedPeriod);
  const g=buildPanelGeometry(panel,{width:options.width??720,height:260});
  const id=`${options.instanceId??resolved.definition.chartId}-panel-${index}`;
  let marks='';
  for(const [i,line] of g.lines.entries()) {
   const color=colors[i%colors.length];
   for(const segment of line.segments) {
    if(panel.type==='bar') {
     const bw=Math.max(.8,Math.min(18,g.plotWidth/Math.max(1,panel.series[i].points.length)/panel.series.length*.72));
     marks+=segment.map(p=>`<rect x="${f(p.x+(i-(g.lines.length-1)/2)*bw-bw/2)}" y="${f(Math.min(p.y,g.zeroY))}" width="${f(bw)}" height="${f(Math.max(.7,Math.abs(p.y-g.zeroY)))}" fill="${color}" opacity=".8"/>`).join('');
    } else {
     marks+=`<path d="${segment.map((p,j)=>`${j?'L':'M'}${f(p.x)},${f(p.y)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="1.7" ${i===1?'stroke-dasharray="6 3"':''}/>`;
     if(segment.length===1)marks+=`<circle cx="${f(segment[0].x)}" cy="${f(segment[0].y)}" r="2.5" fill="${color}"/>`;
    }
   }
  }
  const ticks=panel.type==='yield-curve'?panel.series[0].points.map((p,i)=>({period:p.label,x:g.left+i*g.plotWidth/Math.max(1,panel.series[0].points.length-1)})).filter((_,i,a)=>(g.width>=450||i%2===0||i===a.length-1)):g.ticks;
  const yTicks=g.yTicks.map(t=>`<line x1="${g.left}" x2="${g.width-18}" y1="${f(t.y)}" y2="${f(t.y)}" stroke="#e4e3dc"/><text x="${g.left-10}" y="${f(t.y+4)}" text-anchor="end">${formatValue(t.value,panel.unit,panel.unit.endsWith('/美元')?4:1)}</text>`).join('');
  const labels=ticks.map((t,i)=>`<text x="${f(t.x)}" y="${g.height-12}" text-anchor="${i===0?'start':i===ticks.length-1?'end':'middle'}">${escapeHtml(t.period)}</text>`).join('');
  const svg=`<svg viewBox="0 0 ${g.width} ${g.height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escapeHtml(panel.title)}</title><desc id="${id}-desc">${escapeHtml(panel.title)}，单位${displayUnit(panel.unit)}。完整读数见下方数据表。</desc><g class="chart-axis">${yTicks}${labels}</g>${marks}${g.empty?`<text x="${g.width/2}" y="130" text-anchor="middle">暂无可用观测</text>`:''}</svg>`;
  if(options.compactSvg)return svg;
  const plot=g.width>450?`<div class="chart-svg-wide">${svg}</div><div class="chart-svg-narrow">${renderPanels({...resolved,panels:[original]},{...options,width:320,instanceId:id+'-narrow',compactSvg:true})}</div>`:svg;
  const latest=panel.series.map(s=>{const p=s.points.filter(p=>p.value!==null).at(-1);return p?`${s.name}：${p.period}`:'';}).join('；');
  const tablePeriods=[...new Set(panel.series.flatMap(s=>s.points.map(p=>p.period)))].sort().reverse();
  const maps=panel.series.map(s=>new Map(s.points.map(p=>[p.period,p])));
  const rows=tablePeriods.map(period=>`<tr><th scope="row">${escapeHtml(maps[0].get(period)?.label??period)}</th>${maps.map(m=>`<td>${formatValue(m.get(period)?.value??null,panel.unit,4)}${m.get(period)?.status==='provisional'?'（初步）':''}</td>`).join('')}</tr>`).join('');
  return `<section class="chart-panel" data-panel="${index}"><div class="chart-panel-heading"><span>${escapeHtml(panel.title)}</span><span>${displayUnit(panel.unit)}${panel.selectedPeriod?' · '+panel.selectedPeriod:''}</span></div><div class="chart-legend">${panel.series.map((s,i)=>`<span><i style="--series-color:${colors[i%colors.length]}"></i>${escapeHtml(s.name)}</span>`).join('')}</div>${plot}<p class="chart-readout" aria-live="polite">${panel.selectedPeriod?'观测日期：'+panel.selectedPeriod:escapeHtml(latest)}</p><details class="chart-data-table"><summary>查看数据表<span>当前区间 · ${tablePeriods.length} 个期间</span></summary><div class="chart-table-scroll" tabindex="0" role="region" aria-label="${escapeHtml(panel.title)}数据表"><table><caption>${escapeHtml(panel.title)}（${displayUnit(panel.unit)}${panel.selectedPeriod?'，'+panel.selectedPeriod:''}）</caption><thead><tr><th scope="col">${panel.type==='yield-curve'?'期限':'统计期间'}</th>${panel.series.map(s=>`<th scope="col">${escapeHtml(s.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></details></section>`;
 }).join('');
}
export function renderChartFigure(resolved, options={}) {
 const d=resolved.definition,id=options.instanceId??d.chartId,mode=options.mode??'page';
 const range=options.range??d.defaultRange;
 const curve=resolved.panels.find(p=>p.type==='yield-curve');
 const dates=curve?curveDates(curve):[];
 const controls=mode==='page'?(curve?`<label class="chart-date-label">观测日期<select data-curve-date aria-label="收益率曲线观测日期">${dates.slice().reverse().map(date=>`<option value="${date}">${date}</option>`).join('')}</select></label>`:`<div class="chart-ranges" role="group" aria-label="${escapeHtml(d.title)}时间范围">${['1y','3y','5y','all'].map(r=>`<button type="button" data-range="${r}" aria-pressed="${r===range}">${{ '1y':'1年','3y':'3年','5y':'5年',all:'全部'}[r]}</button>`).join('')}</div>`):'';
 const safe=mode==='page'?JSON.stringify({...resolved,panels:resolved.panels.map(p=>({...p,series:p.series.map(s=>({name:s.name,frequency:s.frequency,points:s.points.map(q=>({period:q.period,value:q.value,...q.status==='provisional'?{status:q.status}:{}}))}))})),sources:[]}).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026'):'';
 const sourceLabels='Wind、Bloomberg';
 const metadata=(resolved.metadata??[]).map(s=>`<li>${escapeHtml(s.name)}：${{daily:'日度',weekly:'周度',monthly:'月度',quarterly:'季度'}[s.frequency]}，${escapeHtml(s.unit)}，${{sa:'季调',nsa:'未季调',unknown:'来源未明确季调状态'}[s.adjustment]}。${escapeHtml(s.measure)}</li>`).join('');
 return `<figure class="macro-chart" id="${escapeHtml(id)}" data-mode="${mode}" data-release="${escapeHtml(resolved.releaseId)}" data-chart-id="${escapeHtml(d.chartId)}"><figcaption class="chart-title">${escapeHtml(d.title)}</figcaption>${options.caption?`<p class="chart-caption">${escapeHtml(options.caption)}</p>`:''}${controls}<div class="chart-panels">${renderPanels(resolved,{...options,range,instanceId:id})}</div><p class="chart-method">${escapeHtml(d.note??'')}</p><p class="chart-source">来源：${escapeHtml(sourceLabels)}<br/>数据更新日期：${escapeHtml(resolved.sourceEdition)} · ${escapeHtml(options.versionNote??'展示最新已导入版本；统计期间以各序列为准。')}</p><details class="chart-source-detail"><summary>指标口径</summary><ul>${metadata}</ul></details>${options.detailHref?`<a class="chart-detail-link" href="${escapeHtml(options.detailHref)}">查看最新数据与完整历史 <span aria-hidden="true">↗</span></a>`:''}${mode==='page'?`<script type="application/json" class="chart-payload">${safe}</script>`:''}</figure>`;
}
