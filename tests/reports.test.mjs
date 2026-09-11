import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedReports, isISODate } from '../src/lib/report-utils.mjs';
const report = (date, draft = false) => ({ id: date, data: { date, draft } });

test('latest report is selected by date across years, independently of input order', () => {
  const list = [report('2025-12-26'), report('2026-01-09'), report('2026-01-02')];
  assert.deepEqual(publishedReports(list).map(r => r.data.date), ['2026-01-09', '2026-01-02', '2025-12-26']);
  assert.equal(list[0].data.date, '2025-12-26');
});
test('drafts never become home or archive entries', () => {
  assert.deepEqual(publishedReports([report('2026-09-11'), report('2026-09-18', true)]).map(r => r.data.date), ['2026-09-11']);
});
test('backfilling older research preserves the homepage and adds archive entries', () => {
  const latest = report('2026-09-11');
  const backfill = { ...report('2026-09-05'), id: 'uploaded-last', modifiedAt: '2026-09-20' };
  for (const entries of [[latest, backfill], [backfill, latest]]) {
    const published = publishedReports(entries);
    assert.equal(published[0], latest);
    assert.deepEqual(published.map(r => r.data.date), ['2026-09-11', '2026-09-05']);
  }
});
test('date must be a real ISO calendar date', () => {
  for (const date of ['2026-02-29', '2026-02-31', '2026-13-01', '09/11/2026', '2026-9-11']) assert.equal(isISODate(date), false);
  assert.equal(isISODate('2024-02-29'), true);
});
test('duplicate publication dates cannot overwrite a route', () => {
  assert.throws(() => publishedReports([report('2026-09-11'), report('2026-09-11')]), /Duplicate/);
});
test('invalid dates fail clearly even outside the collection schema', () => {
  assert.throws(() => publishedReports([report('2026-02-31')]), /Invalid/);
});
