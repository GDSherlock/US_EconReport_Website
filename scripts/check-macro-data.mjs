import fs from 'node:fs';
import path from 'node:path';
import { DATA_ROOT, readRelease, validateRelease } from '../src/lib/chart-data.mjs';
const files=fs.readdirSync(path.join(DATA_ROOT,'releases')).filter(f=>f.endsWith('.json'));
for (const file of files) validateRelease(readRelease(DATA_ROOT,file.slice(0,-5)));
const current=readRelease();
console.log(`Validated ${files.length} releases; current ${current.releaseId}: ${Object.keys(current.series).length} series, ${Object.keys(current.charts).length} charts.`);
