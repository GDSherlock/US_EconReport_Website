import {indicatorGuides} from '../data/indicator-guides.mjs';

export function getIndicatorGuide(chartId) {
 const guide=indicatorGuides[chartId];
 if(!guide)throw new Error(`Missing indicator explanation: ${chartId}`);
 return guide;
}
export function validateIndicatorGuide(chart,guide) {
 for(const key of ['summary','definition','purpose','reading','limits']) {
  if(typeof guide[key]!=='string'||!guide[key].trim())throw new Error(`${chart.chartId}: explanation ${key} required`);
 }
 const expected=[...new Set(chart.panels.flatMap(p=>p.seriesIds))].sort();
 if(!Array.isArray(guide.covers)||JSON.stringify([...guide.covers].sort())!==JSON.stringify(expected))throw new Error(`${chart.chartId}: explanation coverage does not match chart series`);
 if(chart.panels.some(p=>p.derive)&&!guide.calculation?.trim())throw new Error(`${chart.chartId}: derived indicator calculation required`);
 for(const ref of guide.references??[]) {
  if(!ref.title?.trim()||!/^https:\/\//.test(ref.url))throw new Error(`${chart.chartId}: invalid explanation reference`);
 }
 return guide;
}
