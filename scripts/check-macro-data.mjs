import fs from 'node:fs';
import path from 'node:path';
import { DATA_ROOT, readRelease, readObject, validateRelease } from '../src/lib/chart-data.mjs';
import {getIndicatorGuide,validateIndicatorGuide} from '../src/lib/indicator-guides.mjs';
const files=fs.readdirSync(path.join(DATA_ROOT,'releases')).filter(f=>f.endsWith('.json'));
for (const file of files) validateRelease(readRelease(DATA_ROOT,file.slice(0,-5)));
const current=readRelease();
for(const ref of Object.values(current.charts)) {
 const chart=readObject(DATA_ROOT,ref);
 validateIndicatorGuide(chart,getIndicatorGuide(chart.chartId));
}
console.log(`Validated ${files.length} releases; current ${current.releaseId}: ${Object.keys(current.series).length} series, ${Object.keys(current.charts).length} charts.`);
