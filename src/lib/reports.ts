import { getCollection } from 'astro:content';
import { localeReports, reportEdition, validateEditions } from './i18n.mjs';
import { publishedReports } from './report-utils.mjs';

export async function getReports(locale = 'zh') {
  return publishedReports(localeReports(validateEditions(await getCollection('reports')), locale));
}
export async function getEdition(date: string, locale: string) {
  return reportEdition(validateEditions(await getCollection('reports')), date, locale);
}
export function href(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
export function formatDate(date: string, locale = 'zh') {
  if (locale === 'en') return new Intl.DateTimeFormat('en-US', {month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
  const [year, month, day] = date.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}
export function readingMinutes(body: string) {
  const chinese = body.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const words = body.match(/[a-zA-Z0-9]+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(chinese / 350 + words / 200));
}
