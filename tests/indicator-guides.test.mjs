import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA_ROOT,readRelease,readObject} from '../src/lib/chart-data.mjs';
import {getIndicatorGuide,validateIndicatorGuide} from '../src/lib/indicator-guides.mjs';
import {renderIndicatorExplanation} from '../src/lib/indicator-explanation.mjs';

test('every published chart explains its complete series coverage and every derived rule',()=>{
 const release=readRelease();const covered=new Set();
 for(const ref of Object.values(release.charts)) {
  const chart=readObject(DATA_ROOT,ref),guide=getIndicatorGuide(chart.chartId);
  validateIndicatorGuide(chart,guide);
  for(const id of chart.panels.flatMap(p=>p.seriesIds)){assert.ok(guide.covers.includes(id));covered.add(id);}
  if(chart.panels.some(p=>p.derive))assert.ok(guide.calculation);
 }
 assert.deepEqual([...covered].sort(),Object.keys(release.series).sort());
});
test('new or changed series cannot silently inherit unrelated explanation content',()=>{
 const chart=readObject(DATA_ROOT,readRelease().charts.payrolls);
 assert.throws(()=>getIndicatorGuide('unknown-chart'),/explanation/i);
 assert.throws(()=>validateIndicatorGuide({...chart,panels:[{...chart.panels[0],seriesIds:['new-series']}]},getIndicatorGuide('payrolls')),/coverage/i);
 assert.throws(()=>validateIndicatorGuide(chart,{...getIndicatorGuide('payrolls'),limits:''}),/limits/i);
});
test('explanation is a static accessible disclosure with escaped prose and safe references',()=>{
 const guide={...getIndicatorGuide('net-liquidity'),summary:'<script>alert(1)</script>'};
 const html=renderIndicatorExplanation(guide,'net-liquidity');
 assert.ok(html.includes('指标解释与作用')&&html.includes('<details')&&html.includes('<summary'));
 assert.ok(html.includes('解释边界')&&html.includes('计算逻辑'));
 assert.ok(html.includes('&lt;script&gt;')&&!html.includes('<script>'));
 assert.throws(()=>renderIndicatorExplanation({...guide,references:[{title:'unsafe',url:'javascript:alert(1)'}]},'test'),/reference/i);
});
