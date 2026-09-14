import test from 'node:test';
import assert from 'node:assert/strict';
import remarkCharts from '../src/lib/remark-charts.mjs';
const file=charts=>({data:{astro:{frontmatter:{charts}}}});
const declaration={chartId:'payrolls',releaseId:'bootstrap-20260911',range:{from:'2021-08',to:'2026-08'},caption:'就业历史',versionNote:'附件补充'};
test('explicit chart markers produce an embedded pinned chart, leaving headings untouched',()=>{
 const heading={type:'heading',depth:3,children:[{type:'text',value:'就业'}]};
 const tree={type:'root',children:[heading,{type:'html',value:'<!-- chart: payrolls -->'}]};
 remarkCharts({base:'/research/'})(tree,file([declaration]));
 assert.equal(tree.children[0],heading);
 assert.ok(tree.children[1].value.includes('data-release="bootstrap-20260911"'));
 assert.ok(tree.children[1].value.includes('/research/charts/labor/#payrolls'));
 assert.ok(!tree.children[1].value.includes('data-range='));
});
test('unmatched or duplicate declarations fail and code blocks are never replaced',()=>{
 assert.throws(()=>remarkCharts()({children:[{type:'html',value:'<!-- chart: payrolls -->'}]},file(undefined)),/declaration/i);
 assert.throws(()=>remarkCharts()({children:[]},file([declaration])),/marker/i);
 assert.throws(()=>remarkCharts()({children:[]},file([declaration,declaration])),/duplicate/i);
 const tree={children:[{type:'code',value:'<!-- chart: payrolls -->'}]};const before=JSON.stringify(tree);remarkCharts()(tree,file(undefined));assert.equal(JSON.stringify(tree),before);
});
