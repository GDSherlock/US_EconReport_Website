import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRange, buildPanelGeometry } from '../src/lib/chart-geometry.mjs';
import { renderChartFigure } from '../src/lib/chart-render.mjs';
const panel={title:'Test',unit:'%',type:'line',series:[{name:'rate',frequency:'monthly',points:[{period:'2025-01',value:1},{period:'2025-02',value:null},{period:'2025-03',value:3}]}]};
test('missing observations split the line; negative bars retain a zero baseline',()=>{
 const g=buildPanelGeometry(panel); assert.equal(g.lines[0].segments.length,2);
 const bars=buildPanelGeometry({...panel,type:'bar',series:[{...panel.series[0],points:[{period:'2025-01',value:-2},{period:'2025-02',value:5}]}]});
 assert.ok(bars.yMin<=-2 && bars.yMax>=5 && bars.zeroY>0);
});
test('date ranges respect actual monthly and quarterly periods',()=>{
 const p=[{period:'2020-Q1',value:1},{period:'2025-Q1',value:2},{period:'2026-Q1',value:3}];
 assert.deepEqual(selectRange(p,'1y','2026-Q1').map(x=>x.value),[2,3]);
 assert.throws(()=>selectRange(p,{from:'2026-Q1',to:'2025-Q1'}),/range/i);
});
test('an absent monthly period breaks the trend instead of implying continuous observations',()=>{
 const gap={...panel,series:[{...panel.series[0],points:[{period:'2025-01',value:1},{period:'2025-03',value:3}]}]};
 assert.equal(buildPanelGeometry(gap).lines[0].segments.length,2);
});
test('report cutoff is respected by the displayed latest observation label',()=>{
 const resolved={releaseId:'a',sourceEdition:'test',definition:{chartId:'cutoff',title:'Test',defaultRange:'all'},panels:[panel],sources:[]};
 const html=renderChartFigure(resolved,{mode:'report',range:{from:'2025-01',to:'2025-01'}});
 assert.ok(!html.includes('2025-03'));
});
test('figure escapes source text, provides a data table, and report has no range controls',()=>{
 const resolved={releaseId:'a',sourceEdition:'2026-09-11',definition:{chartId:'test',title:'<script>alert(1)</script>',note:'Test',defaultRange:'all'},panels:[panel],sources:[{label:'<img src=x>',locator:'Sheet A1:B4'}]};
 const html=renderChartFigure(resolved,{mode:'report',instanceId:'test',range:'all',detailHref:'/charts/labor/#test',caption:'safe',versionNote:'source edition'});
 assert.ok(!html.includes('<script>alert'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(html.includes('<table') && html.includes('<caption'));
 assert.ok(!html.includes('data-range='));
 assert.ok(html.includes('source edition'));
 assert.ok(html.includes('chart-svg-narrow'), 'server-rendered report must have a readable narrow-screen graph without JavaScript');
});
