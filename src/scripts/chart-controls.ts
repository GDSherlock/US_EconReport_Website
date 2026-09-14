import { renderPanels, formatValue } from '../lib/chart-render.mjs';
import { selectRange, curveDates, periodTime } from '../lib/chart-geometry.mjs';

document.querySelectorAll<HTMLElement>('.macro-chart[data-mode="page"]').forEach(figure => {
 const payload=figure.querySelector('.chart-payload');
 if (!payload?.textContent) return;
 const data=JSON.parse(payload.textContent);
 let range=data.definition.defaultRange;
 const curve=data.panels.find((p: any)=>p.type==='yield-curve');
 let selectedPeriod=curve?curveDates(curve).at(-1):undefined;
 let lastWidth=0;
 const update=()=>{
  const width=Math.max(280,Math.round(figure.clientWidth));
  const container=figure.querySelector<HTMLElement>('.chart-panels')!;
  container.innerHTML=renderPanels(data,{range,selectedPeriod,instanceId:figure.id,width});
  lastWidth=width;
 };
 figure.querySelectorAll<HTMLButtonElement>('[data-range]').forEach(button=>button.addEventListener('click',()=>{
  range=button.dataset.range;
  figure.querySelectorAll('[data-range]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  update();
 }));
 figure.querySelector<HTMLSelectElement>('[data-curve-date]')?.addEventListener('change',event=>{
  selectedPeriod=(event.target as HTMLSelectElement).value;update();
 });
 figure.addEventListener('pointermove',event=>{
  const svg=(event.target as Element).closest('svg');
  if(!svg)return;
  const section=svg.closest<HTMLElement>('[data-panel]')!;
  const panel=data.panels[Number(section.dataset.panel)];
  const rect=svg.getBoundingClientRect();
  const frac=Math.max(0,Math.min(1,(event.clientX-rect.left-68)/(rect.width-86)));
  let text='';
  if(panel.type==='yield-curve') {
   const i=Math.round(frac*(panel.series.length-1));
   const value=panel.series[i].points.find((p:any)=>p.period===selectedPeriod)?.value??null;
   text=`${selectedPeriod} · ${panel.tenors[i].label}：${formatValue(value,panel.unit,4)}${panel.unit}`;
  } else {
   const end=panel.series.flatMap((s:any)=>s.points.filter((p:any)=>p.value!==null).map((p:any)=>p.period)).sort().at(-1);
   const filtered=panel.series.map((s:any)=>({...s,points:selectRange(s.points,range,end)}));
   const periods=[...new Set<string>(filtered.flatMap((s:any)=>s.points.map((p:any)=>p.period)))].sort();
   const target=periods.length?periodTime(periods[0])+frac*(periodTime(periods.at(-1)!)-periodTime(periods[0])):0;
   const period=periods.reduce<string|undefined>((closest,p)=>!closest||Math.abs(periodTime(p)-target)<Math.abs(periodTime(closest)-target)?p:closest,undefined);
   text=`${period??''} · `+filtered.map((s:any)=>`${s.name}：${formatValue(s.points.find((p:any)=>p.period===period)?.value??null,panel.unit,4)}`).join('；');
  }
  const readout=section.querySelector('.chart-readout');if(readout)readout.textContent=text;
 });
 new ResizeObserver(()=>{if(Math.abs(figure.clientWidth-lastWidth)>5)update();}).observe(figure);
});
