import {escapeHtml} from './chart-render.mjs';

export function renderIndicatorExplanation(guide,chartId,locale='zh') {
 const t=(zh,en)=>locale==='en'?en:zh;
 const fields=[[t('指标含义','Definition'),guide.definition],[t('研究用途','Research use'),guide.purpose],[t('变化如何解读','Reading changes'),guide.reading],[t('解释边界','Limitations'),guide.limits]];
 const nuances=(guide.nuances??[]).map(item=>`<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></li>`).join('');
 const references=(guide.references??[]).map(ref=>{
  if(!/^https:\/\//.test(ref.url))throw new Error('Invalid explanation reference');
  return `<a href="${escapeHtml(ref.url)}">${escapeHtml(ref.title)}</a>`;
 }).join(locale==='en'?'; ':'、');
 return `<section class="indicator-explanation" aria-labelledby="${escapeHtml(chartId)}-explanation-title"><p class="indicator-explanation-label" id="${escapeHtml(chartId)}-explanation-title">${t('指标解释与作用','Understanding this indicator')}</p><p class="indicator-explanation-lead">${escapeHtml(guide.summary)}</p><details class="indicator-explanation-details"><summary>${t('展开定义、解读与研究边界','Explore definitions, interpretation and limits')}</summary><dl>${fields.map(([label,text])=>`<div><dt>${label}</dt><dd>${escapeHtml(text)}</dd></div>`).join('')}${guide.calculation?`<div class="indicator-calculation"><dt>${t('计算逻辑与处理','Calculation and handling')}</dt><dd>${escapeHtml(guide.calculation)}</dd></div>`:''}</dl>${nuances?`<p class="indicator-nuances-label">${t('分别观察什么','Currency-specific context')}</p><ul class="indicator-nuances">${nuances}</ul>`:''}${references?`<p class="indicator-references">${t('定义与方法参考：','Definition and methodology references: ')}${references}${t('。上述链接用于解释指标，本站历史数据来源仍以图下注明的信息为准。','. These references explain the measures. Historical data sources remain those stated beneath the chart.')}</p>`:''}</details></section>`;
}
