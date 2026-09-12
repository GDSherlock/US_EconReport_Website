# Chart Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Do not delegate unless the user requests it.

**Goal:** 为观澜增加 7 个宏观数据主题页、图表目录与可在报告正文引用的版本固定图表。

**Architecture:** 一次性从 Excel 导入首批指标，之后由 Agent 提交标准化更新批次。不可变数据发布清单供报告与主题页共享读取；Astro 在构建时输出 SVG、数据表和按需增强交互。保留现有 Markdown 与静态部署。

**Tech Stack:** 仓库现有 Astro/TypeScript、Node 内置文件/哈希/测试模块、原生 SVG/HTML。一次性 Excel 读取使用已可用的 bundled Python/openpyxl，只读原件，不将 Python 加入网站运行环境。

**Spec:** `docs/superpowers/specs/2026-09-12-chart-pages-design.md`。

**Status:** 用户已批准设计、实施和三处历史补图；功能已实现。以下保留原实施计划，实际维护接口见 `docs/macro-data-maintenance.md`。浏览器最终验收由用户执行，见 `docs/chart-pages-acceptance.md`。

**实施调整：** 当前 Astro 7 使用原生 Sätteri 处理器，因此用 `satteri-charts.mjs` 适配原 Markdown 标记转换函数，保留原处理器和目录规则。渲染代码指纹进入处理器配置，防止报告 Markdown 缓存保留旧 SVG。报告输出同时生成桌面/窄屏 SVG，无需 JavaScript 即可阅读。已有的 `@astrojs/markdown-satteri@0.4.1` 登记为直接依赖，没有迁移到 MDX 或引入图表框架。

## Global Constraints

- `/` 继续展示最新一期完整宏观周报；不增加行情概览、指标卡片墙或 Dashboard。
- 首期新增 7 个主题页及 1 个“数据图表”目录页。
- Excel 仅用于一次性初始化；之后主要由 Agent 手动新增指标、追加数据或修订历史数据。
- 报告图表固定使用该期引用的数据版本；主题页展示最新已发布的数据版本。
- 所有现有报告正文中的事实、数字与判断保持原样；数据冲突需要单独确认。
- 暂不增加在线数据库、后台管理、自动采集、账号或外部运行时 API。
- 本 Plan 不自动授权 push 或部署。未获用户要求不创建并行代理。

## 文件职责

| 文件/目录 | 职责 |
| --- | --- |
| `src/lib/chart-data.mjs` | 校验发布清单、解析指定版本、计算派生序列 |
| `src/lib/chart-geometry.mjs` | 期间坐标、范围选择、SVG 路径、刻度与缺失分段 |
| `src/lib/chart-render.mjs` | 统一生成 figure/SVG/图注/表格 HTML，转义所有输入 |
| `src/lib/remark-charts.mjs` | Markdown 标记转换与引用一致性校验 |
| `src/scripts/chart-controls.ts` | 主题页范围、期限日期和读数交互 |
| `src/components/MacroChart.astro` | 调用共享数据与渲染器的薄包装 |
| `src/layouts/ChartLayout.astro` | 主题页标题、目录、正文布局 |
| `src/pages/charts/index.astro` | 主题目录 |
| `src/pages/charts/[topic].astro` | 7 个静态主题路由 |
| `src/data/macro/current.json` | 最新已发布 releaseId |
| `src/data/macro/releases/` | 不可变完整引用清单 |
| `src/data/macro/series/` | 按内容哈希命名的完整序列与元数据版本 |
| `src/data/macro/charts/` | 按内容哈希命名的图表定义版本 |
| `scripts/import-macro-xlsx.py` | 一次性附件适配器，输出候选批次与检查报告 |
| `scripts/macro-bootstrap-map.json` | 首批指标的 Sheet、表头、日期列、值列、单位映射 |
| `scripts/update-macro-data.mjs` | Agent 更新批次预检/写入新版本 |
| `scripts/check-macro-data.mjs` | 所有发布版本、引用和数据质量校验 |
| `tests/chart-data.test.mjs` | 数据及版本契约 |
| `tests/chart-render.test.mjs` | 几何、转义、可访问性和数据一致性 |
| `tests/report-charts.test.mjs` | Markdown 集成及现有报告回归 |
| `tests/fixtures/macro/` | 明确标记为测试用途的小规模数据 |
| `docs/macro-data-maintenance.md` | Agent 增量更新和修订操作 |
| `docs/macro-data-initialization.md` | 初始化来源、排除项、冲突与核对记录 |

修改现有文件限于 `BaseLayout.astro` 导航、`global.css` 的必要通用焦点样式、`content.config.ts` 的可选字段、`astro.config.mjs` 的 Markdown 插件、`package.json` 校验命令、周报写作提示、README，以及批准的报告图表标记。首页与日期路由无需重写。

## Task 1: 数据契约与不可变发布解析

**Files:** 创建 `src/lib/chart-data.mjs`、`tests/chart-data.test.mjs`、`tests/fixtures/macro/`。

**Interfaces:** 消费磁盘 JSON；产出 `validateSeries(series)`、`validateRelease(release, root)`、`resolveChart(root, releaseId, chartId)`、`derivePoints(rule, inputs)`。`resolveChart` 返回 `{ releaseId, definition, panels, sources }`，panels 包含完整可用序列，浏览器与报告不另行计算派生值。

- [ ] 定义以下数据契约，采用 JSDoc 类型与显式运行时检查，适配现有 Node `.mjs` 测试习惯：

```ts
type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';
type Point = {
  period: string;
  value: number | null;
  status: 'observed' | 'missing' | 'provisional';
  sourceRef: string;
  sourcePublishedAt: string | null;
};
type Series = {
  seriesId: string; name: string; frequency: Frequency; unit: string;
  adjustment: 'sa' | 'nsa' | 'unknown'; measure: string;
  sources: Record<string, {
    label: string; locator: string; retrievedAt: string;
    fileSha256: string | null; url: string | null;
  }>;
  points: Point[];
};
type ChartDefinition = {
  chartId: string; version: number; topic: string; title: string;
  defaultRange: '1y' | '3y' | '5y' | 'all';
  panels: Array<{
    title: string; unit: string;
    type: 'line' | 'bar' | 'yield-curve';
    seriesIds: string[];
    derive: null | 'net-liquidity' | 'weekly-contribution' | 'spread-bp';
  }>;
};
type Release = {
  releaseId: string; importedAt: string; publishedAt: string;
  sourceEdition: string;
  series: Record<string, { path: string; sha256: string }>;
  charts: Record<string, { path: string; sha256: string }>;
};
```

- [ ] 写失败测试：同期间冲突、错误日期、非有限值、单位为空、来源缺失、路径穿越、哈希不匹配、未知图表都必须失败。以下为需要实现的数值断言：

```js
assert.equal(derivePoints('net-liquidity', [6692903, 883335, 349663]), 5459905);
assert.ok(Math.abs(derivePoints('spread-bp', [3.64, 3.87775]) + 23.775) < 1e-9);
assert.equal(derivePoints('net-liquidity', [6692903, null, 349663]), null);
```

- [ ] 运行 `node --test tests/chart-data.test.mjs`，确认失败原因是接口尚未实现。
- [ ] 实现契约校验与解析；仅允许数据根目录内的引用；验证哈希之后再读对象；未知规则失败而非回退到零。
- [ ] 用 A/B 两个测试发布版本验证：A 引用原始值，B 修订相同期间值；A 的解析结果保持不变。这里的测试值只存在 fixtures，不进入公开数据。
- [ ] 再运行上述测试并核对所有失败分支。此任务完成标准是可读取指定版本，尚不需要页面。

## Task 2: 初始化 24 个图表所需的历史序列

**Files:** 创建 `scripts/import-macro-xlsx.py`、`scripts/macro-bootstrap-map.json`、`docs/macro-data-initialization.md`，生成 `src/data/macro/`。

**Interfaces:** 消费设计第 5 节的映射与原始 Excel，产出符合 Task 1 的序列、定义、首个 release 和检查报告。后续更新不调用这个 Excel 适配器。

- [ ] 将设计第 5 节逐条展开成指标映射；表头和来源单位逐条核对，例：

```json
{
  "seriesId": "us-sofr-weekly",
  "sheet": "流动性SOFR-OIS",
  "dateColumn": "A",
  "valueColumn": "B",
  "startRow": 7,
  "headerCell": "B1",
  "expectedHeader": "SOFRRATE Index",
  "frequency": "weekly",
  "unit": "%",
  "adjustment": "unknown",
  "measure": "工作簿周度观测值"
}
```

- [ ] 使用 bundled Python 的 `openpyxl.load_workbook(path, read_only=True, data_only=True)` 读取缓存原始值；另用 `data_only=False` 辨识公式与错误来源。不保存工作簿，不尝试刷新 edb/外部链接。
- [ ] 给适配器添加 `--input`、`--edition`、`--out`；首先输出到临时目录。按独立日期列转换期间、升序整理；将冲突、错误公式、无法解释的期间、缺失元数据写入检查报告。
- [ ] 把 24 个图表定义转换成配置。净流动性、贡献及利差由明确原始项计算；原公式缓存仅用于抽查比较，不作为第二套生产计算。
- [ ] 核对以下证据，并在初始化文档记录来源范围、数值、单位与排除原因：

```text
流动性 A9:E10：5459905 - 5363811 = 96094 百万美元 = 960.94 亿美元。
SOFR/OIS A7:D8：9月4日 OIS 3.8092%，利差 -15.92bp；报告冲突未解决。
就业 BD37:BE38：2026-08 16.2、2026-07 2.1 万人。
成屋销售 A6:B7：2026-08 398、2026-07 406 万套，季调折年数。
周度数据 I6:K7：初请最新 9月4日，续请最新有效值 8月28日；不能补齐空值。
纽约联储 I4:K5：9月月末未完成期间及空值不可当作已完成 GSCPI 观测。
```

- [ ] 每条首批序列检查最早/最新有效期间、记录数、重复与缺失；每张图抽查最早、中间、最新有效值，避免只核对最新一行。
- [ ] 通过 Task 1 的校验后才保存 bootstrap 发布文件；真实导入/发布时间取实际执行时间，`sourceEdition` 写附件日期，不伪造历史发布日。

## Task 3: Agent 增量更新与版本保护

**Files:** 创建 `scripts/update-macro-data.mjs`、`scripts/check-macro-data.mjs`、`docs/macro-data-maintenance.md`；修改 `package.json`；扩展 `tests/chart-data.test.mjs`。

**Interfaces:** `prepareUpdate(root, batch)` 返回 `{ release, newFiles, diff }`；`writeUpdate(root, prepared)` 先写不可变文件和 release，最后原子替换 current。批次包含 `releaseId`、来源、新序列/图表定义及按 seriesId 分组的观测修订。

- [ ] 写失败测试：新期间追加、既有期间修订必须写原因、相同批次重复执行不重复观测、同 ID 不同内容失败、只读预检不改变文件、失败时 current 不变、旧版本不被覆盖。
- [ ] 定义批次结构并实现预检，示例（此处值为真实附件核对值，仅示范接口）：

```json
{
  "releaseId": "example-correction",
  "sourceEdition": "来源版本说明",
  "updates": [{
    "seriesId": "us-sofr-weekly",
    "reason": "依据明确的来源记录修订",
    "sources": {},
    "points": [{
      "period": "2026-09-11", "value": 3.64,
      "status": "observed", "sourceRef": "existing-source-ref",
      "sourcePublishedAt": null
    }]
  }],
  "newSeries": [],
  "chartDefinitions": []
}
```

示例 sourceRef 必须在目标序列现有 sources 或批次新增 sources 中存在；校验器应拒绝原样复制这个未提供来源的示例。

- [ ] 实现 CLI：

```sh
node scripts/update-macro-data.mjs --batch /tmp/macro-update.json --dry-run
node scripts/update-macro-data.mjs --batch /tmp/macro-update.json --apply
node scripts/check-macro-data.mjs
```

`--apply` 表示写入本地待构建版本，不表示 push 或部署。名称、频率、单位、measure 变化不能悄悄覆盖旧含义；原口径系列的含义变化要求新 seriesId。

- [ ] `check-macro-data` 遍历全部历史 release，检查定义引用完整、派生频率/单位相容、未来完整期间被拒绝、真实来源缺失被拒绝；所有报错包含 releaseId/seriesId/period。
- [ ] 在 package.json 加入 `data:check`；让 `prebuild` 执行数据校验，已有 CI 的 `npm run build` 因而自动包含校验。
- [ ] 运行 `node --test tests/chart-data.test.mjs` 与 `npm run data:check`。维护文档包含“新增指标 / 追加观测 / 修订历史 / 写新报告”四种完整流程。

## Task 4: 共享图表渲染与主题页交互

**Files:** 创建 `chart-geometry.mjs`、`chart-render.mjs`、`MacroChart.astro`、`chart-controls.ts`、`tests/chart-render.test.mjs`、`src/styles/charts.css`。

**Interfaces:** `selectRange(points, range, endPeriod)`；`buildPanelGeometry(panel, viewport)`；`renderChartFigure(resolved, options)` 返回转义后的 HTML。options 为 `{ mode: 'report'|'page', range, caption, versionNote, instanceId, detailHref }`。MacroChart 接受相同选项及 chartId/releaseId。

`range` 的统一类型为 `'1y' | '3y' | '5y' | 'all' | { from: string, to: string }`。显式区间的两个端点必须与该图各子图的频率兼容且 from ≤ to；首期复合图只组合相同频率的子图。期限曲线另传 `selectedPeriod`，默认最近共同完整日期；报告引用期限曲线时需在声明中固定此字段并扩展同一个 schema。

- [ ] 写失败测试：月/季度坐标正确、负值柱图零基线、null 断线、单点与全空序列、不同截止日、标题/来源/图注 HTML 转义，以及相同输入的稳定输出。
- [ ] 实现纯函数几何层。`range` 不足时展示已有历史；零范围坐标扩展为可见区间；全空时返回明确“暂无可用观测”而非空白轴或零值。
- [ ] 实现三种 SVG 图形。每个 panel 按自身量纲计算尺度；跨频率不默认重采样；期限曲线只取同一完整日期。
- [ ] 统一输出结构：

```html
<figure class="macro-chart" id="chart-payrolls" aria-labelledby="chart-payrolls-title">
  <figcaption id="chart-payrolls-title">新增非农就业</figcaption>
  <svg role="img" aria-labelledby="chart-payrolls-svg-title"></svg>
  <p class="chart-source">来源、统计期间、单位及数据版本</p>
  <details><summary>查看数据表</summary><table></table></details>
  <a href="/charts/labor/#payrolls">查看最新数据</a>
</figure>
```

真实输出必须含 SVG title/desc、表格 caption/列标题；href 使用传入已处理 BASE_URL 的链接，不硬编码示例路径。instanceId 防止多张 SVG 的 aria ID 冲突。

- [ ] 主题页启用范围按钮、期限日期控件和鼠标/触屏读数；脚本读取当前 figure 的安全编码数据，不能加载其他主题。无 JS 保留默认 SVG 与完整表格。
- [ ] report 模式固定区间，隐藏范围/期限切换，保留来源、图注、数据版本及主题链接；两种模式调用同一个渲染器。
- [ ] 运行 `node --test tests/chart-render.test.mjs`。测试报告/主题传入同一版本与范围时，其数值和路径相同，外围控件允许不同。

## Task 5: 7 个主题路由与目录导航

**Files:** 创建 `ChartLayout.astro`、`src/pages/charts/index.astro`、`src/pages/charts/[topic].astro`；修改 `BaseLayout.astro`。

**Interfaces:** `getStaticPaths()` 只生成设计第 4 节的 7 个 topic。主题图表来自 current release 的主 topic 分组，通过 MacroChart 渲染；不另存复制数据。

- [ ] 扩展 BaseLayout active 类型为 `latest | archive | charts`，在研究归档后增加“数据图表”。链接使用 `href('charts/')`。
- [ ] 建立静态主题配置，顺序与设计一致：

```js
const topics = [
  ['liquidity', '流动性'], ['rates', '利率与收益率曲线'],
  ['growth', '增长与需求'], ['inflation', '通胀与成本'],
  ['labor', '就业与工资'], ['housing', '房地产'],
  ['financial-conditions', '金融条件'],
];
```

- [ ] 目录只展示主题说明和文字入口；主题页分组图表目录的锚点等于 chartId。主题介绍不得加入未经提供的新经济结论。
- [ ] 页面保持纸色、宋体标题、单列图表、细线分隔和正文尺度；将专用样式限制在 charts/figure，避免全局 `.prose` 规则污染 SVG 或数据表。
- [ ] 运行 `npm run check` 与 `npm run build`；检查 dist 中 8 个路径、每个首批图表锚点及导航 current 状态。

## Task 6: Markdown 插图和受控历史补图

**Files:** 创建 `src/lib/remark-charts.mjs`、`tests/report-charts.test.mjs`；修改 `src/content.config.ts`、`astro.config.mjs`、`src/content/reports/2026-09-11.md`、`docs/weekly-report-prompt.md`。

**Interfaces:** frontmatter 新增可选 charts 数组；Markdown 插件消费文件 frontmatter 和独立 HTML 注释节点，使用 resolveChart 与 renderChartFigure。继续保留原有 `Content`、headings 和 TOC 渲染。

- [ ] 添加以下可选 schema（range 为显式期间上下界，与 Task 4 的 range 解析器共用）：

```ts
charts: z.array(z.object({
  chartId: z.string().min(1), releaseId: z.string().min(1),
  range: z.object({ from: z.string(), to: z.string() }),
  caption: z.string().min(1), versionNote: z.string().min(1),
})).optional()
```

- [ ] 测试 Markdown 标记识别：仅匹配独立 HTML 节点 `<!-- chart: payrolls -->`；代码块中的同样文本不被替换；无标记旧报告输出不变；h2/h3 slug 不变。
- [ ] 用 Astro 的 remark 插件入口实现构建时 figure 注入；从 `file.data.astro.frontmatter` 读取声明。先做最小临时报告集成测试，验证当前安装版本传入数据真实可用；若接口不同，查当前 Astro 官方文档后修正适配，不迁移报告格式。
- [ ] 明确标记/声明一一对应校验，调用共享渲染器；来源、图注、标题作为文本转义，不把数据字符串直接当作任意 HTML 执行。
- [ ] 新增三个补图声明和标记：金融流动性章节原表及说明之后、8月就业数据与分析之后、8月成屋销售数据与分析之后。使用 bootstrap 版本，区间截止于各自最后有效观测；全部带“根据 2026-09-11 数据库版本补充；非原始发布快照”。
- [ ] 保存原报告事实文本基线，比对去除新增声明和 figure 后正文完全一致。9月5日报告不增加图；OIS 冲突不修改、不嵌图。
- [ ] 修改周报提示：允许已注册 chart 标记及声明；Agent 必须核对 releaseId/正文数字/单位/期间，不能发明 chartId 或从自然语言自动生成数据。
- [ ] 运行 `node --test tests/report-charts.test.mjs`、原有 `npm test`、`npm run check` 和 `npm run build`；首页和永久报告应显示相同三幅图。

## Task 7: 完整验收与交付

**Files:** 必要时增加构建验收脚本 `scripts/check-chart-routes.mjs`；更新 README 与 `docs/macro-data-maintenance.md` 的实际命令结果。

- [ ] 执行全部单元测试、数据校验、类型检查及默认构建：

```sh
npm test
npm run data:check
npm run check
npm run build
```

- [ ] 用临时数据目录创建修订 release：主题最新值变化，原报告引用及定义哈希保持不变；临时 fixtures 不写入生产 current。
- [ ] 执行子路径构建，检查 href、SVG 资源、脚本与报告深链接没有遗漏前缀：

```sh
PAGES_SITE=https://example.org PAGES_BASE_PATH=/research npm run build
node scripts/check-chart-routes.mjs --dist dist --base /research/
```

检查脚本只解析本地生成页面，确认 charts 8 条路由、每张图的锚点、内部链接目标和无裸 `/charts/` 链接。随后恢复默认构建。

- [ ] 启动本地预览，使用浏览器检查 1440px、390px、320px：首页阅读顺序、三处插图、主题页、目录、数据表、范围选择、期限曲线日期及图表→数据页链接。
- [ ] 检查仅键盘操作、无 JavaScript 默认图、打印图注和来源；检查图表不横向溢出、不遮住中文坐标标签或 TOC。
- [ ] 检查报告只携带三个引用图表的数据，主题页只携带自己的数据；实际记录资源大小。先使用完整历史；若日频路径过大，再对显示路径做极值保留抽稀，原始读数/表格仍完整。
- [ ] 初始化核对记录列出首批有效指标/图数、排除数据和未解决 OIS 冲突；任何未能交付的图表明确标记为验收未完成。
- [ ] 最终交付页面路由、更新命令、已运行检查、浏览器实测范围及剩余限制；不把本地验证表述为线上部署。

## 需求覆盖自查

| 需求 | 任务 |
| --- | --- |
| Research-first 与首页保持原定位 | 5、6、7 |
| 7 个独立主题页与目录 | 2、5 |
| Excel 初始化与后续 Agent 更新 | 1、2、3 |
| 历史积累、新增指标和数据修订 | 1、3 |
| 报告版本固定且共用组件 | 1、4、6 |
| 报告章节内插图、跳转长期趋势 | 5、6 |
| 历史版本真实边界与冲突处理 | 2、6、7 |
| 现有视觉、移动阅读与静态部署 | 4、5、7 |

执行顺序为 1 → 2 → 3 → 4 → 5 → 6 → 7。先取得设计与本 Plan 的最终审阅，再在当前任务按顺序实现。
