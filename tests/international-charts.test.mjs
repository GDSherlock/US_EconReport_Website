import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA_ROOT,readRelease,resolveChart} from '../src/lib/chart-data.mjs';
test('international spreads preserve subtraction direction and basis point units',()=>{
 const result=resolveChart(DATA_ROOT,'international-20260911','international-yield-spreads');
 const values=result.panels.map(p=>p.series[0].points.find(p=>p.period==='2026-09-10').value);
 for(const [i,value] of [-327.03,150,203].entries())assert.ok(Math.abs(values[i]-value)<1e-8);
 assert.ok(result.panels.every(p=>p.unit==='bp'));
 assert.equal(Object.keys(readRelease(DATA_ROOT,'bootstrap-20260911').series).length,45);
});
test('currency quotes remain foreign-currency units per US dollar, with all source groups available',()=>{
 const result=resolveChart(DATA_ROOT,'international-20260911','fx-major');
 const euro=result.panels.find(p=>p.seriesIds.includes('usd-eur'));
 assert.equal(euro.unit,'欧元/美元');
 assert.equal(euro.series[0].points.at(-1).value,0.86102979163079);
 assert.equal(result.panels.find(p=>p.seriesIds.includes('usd-cny')).series[0].points.at(-1).value,6.7108);
 for(const id of ['dollar-indices','fx-europe','fx-asia-americas'])assert.ok(resolveChart(DATA_ROOT,'international-20260911',id).panels.length>=3);
});
