export const locales = ['zh', 'en'];
export function localePath(path = '', locale = 'zh', base = '/') {
 if (!locales.includes(locale)) throw new Error(`Unsupported locale: ${locale}`);
 return `${base.replace(/\/$/, '')}/${locale === 'zh' ? '' : locale + '/'}${path.replace(/^\//, '')}`;
}
export function counterpartPath(pathname, locale, base = '/') {
 const prefix = base.replace(/\/$/, '');
 let path = pathname.startsWith(prefix + '/') ? pathname.slice(prefix.length + 1) : pathname.replace(/^\//, '');
 path = path.replace(/^en(?:\/|$)/, '');
 if(path==='404/'||path==='404.html')path=locale==='zh'?'404.html':'404/';
 return localePath(path, locale, base);
}
export function textFor(locale, zh, en) { return locale === 'en' ? en : zh; }
/** @template {{data:{locale?:string}}} T
 * @param {T[]} entries
 * @param {string} locale
 * @returns {T[]}
 */
export function localeReports(entries, locale = 'zh') {
 return entries.filter(entry => (entry.data.locale ?? 'zh') === locale);
}
/** @template {{data:{locale?:string,date:string,draft?:boolean,charts?:Array<any>}}} T
 * @param {T[]} entries
 * @param {string} date
 * @param {string} locale
 * @returns {T|undefined}
 */
export function reportEdition(entries, date, locale) {
 return entries.find(entry => entry.data.date === date && (entry.data.locale ?? 'zh') === locale && !entry.data.draft);
}

/** @template {{data:{locale?:string,date:string,draft?:boolean,charts?:Array<any>}}} T
 * @param {T[]} entries
 * @returns {T[]}
 */
export function validateEditions(entries) {
 const keys=new Set();
 for(const entry of entries){
  const locale=entry.data.locale??'zh', key=`${locale}:${entry.data.date}`;
  if(!locales.includes(locale))throw new Error(`Unsupported report locale: ${locale}`);
  if(keys.has(key))throw new Error(`Duplicate report edition: ${key}`);
  keys.add(key);
 }
 for(const entry of entries){
  if((entry.data.locale??'zh')==='zh'||entry.data.draft)continue;
  const original=reportEdition(entries,entry.data.date,'zh');
  if(!original)throw new Error(`Translation has no published Chinese issue: ${entry.data.date}`);
  const pins=report=>(report.data.charts??[]).map(c=>({chartId:c.chartId,releaseId:c.releaseId,from:c.range?.from,to:c.range?.to,selectedPeriod:c.selectedPeriod??null}));
  if(JSON.stringify(pins(original))!==JSON.stringify(pins(entry)))throw new Error(`Translation chart pins differ: ${entry.data.date}`);
 }
 return entries;
}
