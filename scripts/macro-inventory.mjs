import {pathToFileURL} from 'node:url';
import {DATA_ROOT,readRelease,readObject,validateRelease} from '../src/lib/chart-data.mjs';

const cell=value=>String(value??'—').replaceAll('|','\\|').replaceAll('\n',' ');
export function buildInventory(root=DATA_ROOT) {
 const release=readRelease(root);
 const series=validateRelease(release,root);
 const charts=Object.values(release.charts).map(ref=>readObject(root,ref));
 const lines=[
  '# 本站数据与图表清单', '',
  `数据更新日期：${release.sourceEdition}；当前 releaseId：${release.releaseId}。`,
  `共 ${Object.keys(series).length} 条序列、${charts.length} 幅图表。此清单从当前数据文件生成；统计截止期以每条序列为准。`, '',
  '## 图表', '', '| chartId | 标题 | 主题路径 | 指标 seriesId |', '| --- | --- | --- | --- |',
  ...charts.map(d=>`| ${cell(d.chartId)} | ${cell(d.title)} | /charts/${d.topic}/#${d.chartId} | ${[...new Set(d.panels.flatMap(p=>p.seriesIds))].join(', ')} |`), '',
  '## 数据序列', '', '| seriesId | 指标 | 频率 | 原始存储单位 | 最早有效期 | 最新有效期 | 最新值 | 关联 chartId |', '| --- | --- | --- | --- | --- | --- | ---: | --- |',
 ];
 for(const s of Object.values(series)) {
  const valid=s.points.filter(p=>p.value!==null),first=valid[0],last=valid.at(-1);
  const linked=charts.filter(d=>d.panels.some(p=>p.seriesIds.includes(s.seriesId))).map(d=>d.chartId);
  lines.push('| '+[s.seriesId,s.name,s.frequency,s.unit,first?.period,last?.period,last?.value,linked.join(', ')||'尚无图表'].map(cell).join(' | ')+' |');
 }
 lines.push('', '数值为原始存储值：百万美元在页面换算为亿美元；百分数3.64表示3.64%；派生利差使用bp。旧报告固定引用其releaseId，不随current改变。','');
 return lines.join('\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 try{process.stdout.write(buildInventory());}catch(error){console.error(error.message);process.exitCode=1;}
}
