/** @param {string} value */
export function isISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

/** @template {{ data: { date: string, draft?: boolean } }} T
 * @param {T[]} entries
 * @returns {T[]}
 */
export function publishedReports(entries) {
  const dates = new Set();
  const published = entries.filter(entry => !entry.data.draft);
  for (const { data } of published) {
    if (!isISODate(data.date)) throw new Error(`Invalid report date: ${data.date}`);
    if (dates.has(data.date)) throw new Error(`Duplicate report date: ${data.date}`);
    dates.add(data.date);
  }
  return published.sort((a, b) => b.data.date.localeCompare(a.data.date));
}
