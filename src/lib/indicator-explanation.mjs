import {escapeHtml} from './chart-render.mjs';

export function renderIndicatorExplanation(guide,chartId) {
 const fields=[['指标含义',guide.definition],['研究用途',guide.purpose],['变化如何解读',guide.reading],['解释边界',guide.limits]];
 const nuances=(guide.nuances??[]).map(item=>`<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></li>`).join('');
 const references=(guide.references??[]).map(ref=>{
  if(!/^https:\/\//.test(ref.url))throw new Error('Invalid explanation reference');
  return `<a href="${escapeHtml(ref.url)}">${escapeHtml(ref.title)}</a>`;
 }).join('、');
 return `<section class="indicator-explanation" aria-labelledby="${escapeHtml(chartId)}-explanation-title"><p class="indicator-explanation-label" id="${escapeHtml(chartId)}-explanation-title">指标解释与作用</p><p class="indicator-explanation-lead">${escapeHtml(guide.summary)}</p><details class="indicator-explanation-details"><summary>展开定义、解读与研究边界</summary><dl>${fields.map(([label,text])=>`<div><dt>${label}</dt><dd>${escapeHtml(text)}</dd></div>`).join('')}${guide.calculation?`<div class="indicator-calculation"><dt>计算逻辑与处理</dt><dd>${escapeHtml(guide.calculation)}</dd></div>`:''}</dl>${nuances?`<p class="indicator-nuances-label">分别观察什么</p><ul class="indicator-nuances">${nuances}</ul>`:''}${references?`<p class="indicator-references">定义与方法参考：${references}。上述链接用于解释指标，本站历史数据来源仍以图下注明的信息为准。</p>`:''}</details></section>`;
}
