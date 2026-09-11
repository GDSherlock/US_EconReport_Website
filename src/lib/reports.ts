import { getCollection } from 'astro:content';
import { publishedReports } from './report-utils.mjs';

export async function getReports() {
  return publishedReports(await getCollection('reports'));
}
export function href(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
export function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}
export function readingMinutes(body: string) {
  const chinese = body.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const words = body.match(/[a-zA-Z0-9]+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(chinese / 350 + words / 200));
}
