# 宏观图表数据维护

网站是 Astro 静态研究站。首页仍展示最新完整周报，`/charts/` 为数据目录。图表数据存放在 `src/data/macro/`，不在浏览器中读取 Excel 或调用外部 API。

## 运行环境

使用 Node >=22.19.0（24 LTS 也可）。执行命令前进入仓库根目录。若本机 Astro 遥测目录不可写，设置 `ASTRO_TELEMETRY_DISABLED=1`。

```sh
npm ci
npm test
npm run data:check
npm run check
npm run build
```

`npm run build` 的 prebuild 自动执行数据校验。构建失败不能发布。本地 `--apply` 仅写入待构建的数据版本，不会提交 Git、推送或部署。

## 数据组织

- `current.json`：主题页当前使用的 releaseId。
- `releases/<releaseId>.json`：该版所有指标和图表的完整引用清单，含真实导入/发布时间、来源版本、修订摘要及批次哈希。
- `series/<sha256>.json`：不可变的序列元数据、来源和完整历史点。
- `charts/<sha256>.json`：不可变的图表定义，含主主题、子图、指标引用和派生规则。

新发布版本只新增变化的对象；未变的对象沿用引用。不要直接编辑已发布的对象或清单。图表的逻辑含义发生变化时保留旧派生规则，实现新规则并提升定义版本；不要改变旧规则的计算语义。

来源文件日期写在 sourceEdition，实际导入和发布时间由命令记录。bootstrap-20260911 表示附件版本，不表示网站在 9 月 11 日已经拥有这些数据。

## 追加观测或修订历史

1. 从明确的来源取得期间、数值、单位及证据。不要从模型记忆补值。
2. 准备 JSON 批次，包含 releaseId、sourceEdition、updates。每个 update 指定 seriesId、sources、points；修订既有期间时必须填写 reason。
3. 新来源使用新的 sourceRef，记录来源 label、定位信息 locator、提取日期 retrievedAt、证据文件 SHA-256 或 URL。不知道发布日时 sourcePublishedAt 为 null。
4. 先预检，再写本地版本，最后进行测试和构建。

```sh
node scripts/update-macro-data.mjs --batch /tmp/macro-update.json --dry-run
node scripts/update-macro-data.mjs --batch /tmp/macro-update.json --apply
npm test
npm run check
npm run build
```

批次格式：

```json
{
  "releaseId": "research-data-20260912",
  "sourceEdition": "2026-09-11 附件核对",
  "updates": [{
    "seriesId": "sofr",
    "reason": "对照附件核对原记录",
    "sources": {},
    "points": [{
      "period": "2026-09-11",
      "value": 3.64,
      "status": "observed",
      "sourceRef": "workbook",
      "sourcePublishedAt": null
    }]
  }],
  "newSeries": [],
  "chartDefinitions": []
}
```

这个示例引用已存在的附件来源，并重复同一记录，仅适合演示 dry-run；不代表新增了真实数据。实际更新需要真实新证据。命令展示新增/修订点数；重复执行同一个已写入批次是幂等操作，不把 current 回退到旧版本。同一个 releaseId 不接受不同内容。

数据约定：

- 日/周：`YYYY-MM-DD`；月：`YYYY-MM`；季：`YYYY-Qn`。
- 百分数 3.64 表示 3.64%，不是 0.0364。bp 与百分点不可混用。
- 缺失写 `value: null, status: missing`；正常记录为 observed。已取得明确来源的当前月初步数据可用 provisional，并在图表中显示“初步”；不能把未来完整月份当 observed。
- sourcePublishedAt 不能用统计期末或提取时间代替。
- 不前向填充、不插值、不补零。不同序列保留自己的截止期。
- 单位、频率、季调状态或统计含义变化时创建新 seriesId，不更新旧系列的含义。

## 新增指标

在批次 newSeries 中写入完整 Series 对象：seriesId、name、frequency、unit、adjustment、measure、sources、points。adjustment 只能为 sa/nsa/unknown。所有 points 必须升序、无重复期间，并引用本对象的 sources。

在 chartDefinitions 中新增图表，或提交版本号更大的同 chartId 定义。首期支持 line、bar、yield-curve；已有主题中的同类型新指标通常不需要改动页面代码。

每个 panel 包含 title、unit、type、seriesIds、derive。非派生图 derive 为 null；不同单位或需独立量纲的指标放在不同 panel。派生规则只有 net-liquidity、spread-bp 和 weekly-contribution，新增规则必须补对应计算与测试。

收益率曲线额外包含与 seriesIds 一一对应的 tenors（label、months），只允许选择所有期限均有观测的同一日期。图表有唯一主 topic；可用 topic 为 liquidity、rates、growth、inflation、labor、housing、financial-conditions。

## 在报告中引用

继续用普通 Markdown。在 frontmatter 声明固定版本与期间，在正文中插入独立标记：

```yaml
charts:
  - chartId: payrolls
    releaseId: bootstrap-20260911
    range: {from: '2021-08', to: '2026-08'}
    caption: '新增非农就业的历史变化。'
    versionNote: '根据 2026-09-11 数据库版本补充；非原始发布快照。'
```

```md
<!-- chart: payrolls -->
```

标记与声明必须一一对应，一篇报告同一 chartId 只嵌入一次。代码块内示范标记不会被替换。范围端点必须与指标频率一致。引用期限曲线时还需填写 selectedPeriod，固定实际曲线日期。

新报告应写实际引用版本及说明，不沿用示例中的“补充”措辞。先核对正文数字、日期、单位和图表，再发布报告。系统校验引用有效性，不会自动理解或改写研究结论。

## 首次导入与已知冲突

Excel 适配器只是初始化工具，后续常规更新无需使用。来源映射保存在 `scripts/macro-bootstrap-map.json`。

```sh
python3 scripts/import-macro-xlsx.py --input /path/to/美国数据库20260911.xlsx --edition 2026-09-11 --out /tmp/bootstrap.json
node scripts/update-macro-data.mjs --batch /tmp/bootstrap.json --dry-run
```

需要 Python openpyxl；原件只读，不执行 Wind/彭博刷新，不保存 Excel。已有 bootstrap 版本不得覆盖。详见 `docs/macro-data-initialization.md`。

2026-09-11 报告与附件中的 9 月 4 日 OIS 不一致，目前未修改正文，也未在该章节插图。附件值仅在对应主题页展示并附说明。未来解决冲突需要明确证据和用户对正文更正的授权。
