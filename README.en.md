# Guanlan · US Macro Weekly

[中文](./README.md) · **EN**

**Observing the economy. Understanding change.**

Guanlan is a bilingual macroeconomic research site covering the US economy, liquidity, monetary policy and key developments. Each weekly report follows a research argument supported by data and analysis, helping readers understand what changed and what to watch next.

## Research-first reading

The homepage presents the latest complete report, moving from the title and summary through key takeaways, evidence and analysis to what to watch. Reports include a publication date, estimated reading time and table of contents. The research archive groups earlier issues by year in reverse chronological order.

The visual system uses a warm off-white background, serif headings, restrained accent colors, fine rules and generous spacing. Desktop pages pair the article with a sidebar contents list; mobile pages use a single column and collapsible contents. Chinese navigation reads “最新周报 / 研究归档 / 数据图表”; English navigation reads “Latest report / Archive / Charts”. A lightweight “中文 · EN” text selector identifies the current language.

Charts form the research evidence layer. Dedicated chart pages provide historical trends and methodology, while charts embedded in reports support the surrounding analysis. The research narrative remains central.

## Pages and language switching

| Page | Chinese URL | English URL |
| --- | --- | --- |
| Latest report | `/` | `/en/` |
| Research archive | `/archive/` | `/en/archive/` |
| Individual report | `/report/YYYY-MM-DD/` | `/en/report/YYYY-MM-DD/` |
| Chart index | `/charts/` | `/en/charts/` |
| Chart topic | `/charts/{topic}/` | `/en/charts/{topic}/` |
| About and contact | `/contact/` | `/en/contact/` |

Switching languages opens the same report or chart topic. Chart anchors are preserved; report sections map to their counterparts by their matching order in the two editions.

Both homepages select the issue dated most recently among published Chinese reports. If its English edition is missing or still a draft, the English homepage and issue page show a publication-pending notice and link to that issue in Chinese. The English archive retains the issue and marks its translation as pending. The site neither substitutes an older English issue nor generates a translation when a reader visits.

## Charts and indicator explanations

| Topic | Main measures |
| --- | --- |
| Liquidity | Financial liquidity proxy, Fed liabilities, TGA, reverse repos and weekly contributions |
| Rates and yield curves | SOFR / OIS, Treasury term structure, real yields and international 10-year sovereign spreads |
| Growth and demand | Real GDP, ISM, high-frequency retail sales and economic activity |
| Inflation and costs | CPI / PCE, consumer inflation expectations and supply-chain pressure |
| Employment and wages | Payrolls, unemployment, average hourly earnings, initial and continued claims |
| Housing | Existing-home sales, inventory, months supply and mortgage rates |
| Financial conditions | Financial conditions and stress, MOVE / VIX, dollar indices and major currencies |

Charts offer historical range controls, accessible data tables and observation-date selection for the yield curve. “Understanding this indicator” provides a short introduction beneath each chart, with expandable definitions, research uses, interpretation and limitations. Site-constructed or processed measures also explain their calculations and boundaries.

Both languages share chart components, historical observations and data releases. Report charts retain their declared release and date range. “View latest data and full history” opens the corresponding topic in the current language.

After initialization, an Agent adds or revises observations through standardized batches, retaining releases referenced by earlier reports. Public data sources are labeled Wind and Bloomberg. Data update dates remain distinct from each series’ latest reference period. Definition and methodology links in the indicator explanations describe the concepts separately from the historical data sources.

## Content and component structure

| Content | Maintenance location |
| --- | --- |
| Chinese reports | `src/content/reports/YYYY-MM-DD.md`, with `locale: zh` (the default for earlier reports) |
| English reports | `src/content/reports/en/YYYY-MM-DD.md`, with `locale: en` |
| Chinese indicator explanations | `src/data/indicator-guides.mjs` |
| English indicator explanations | `src/data/indicator-guides.en.mjs` |
| English chart display copy | `src/data/chart-copy.en.mjs` |
| Shared historical data and releases | `src/data/macro/` |
| Shared pages and layouts | `src/components/pages/`, `src/layouts/` |
| Language and URL helpers | `src/lib/i18n.mjs` |

Astro generates the site statically. Language-specific routes provide entry points into shared pages, layouts, chart rendering and interaction. Report prose and indicator explanations are edited separately. Publication dates associate report editions, and new reports require no manual route creation.

When updating a Chinese report, prepare a complete English edition and verify every number, unit conversion, comparison period and qualification. Preserve section hierarchy and order. Both editions must retain the same `chartId`, `releaseId`, `range`, `selectedPeriod` and chart order; translate only `caption` and `versionNote`. If the English edition cannot be completed, keep its missing-translation status explicit.

When adding charts or changing their associated indicators, update explanations and display copy in both languages. Validation checks explanation coverage, English chart copy and pinned chart references across report editions to prevent content or release mismatches.

Agent prompts for report formatting, English translation and data maintenance are kept locally in `docs/Agent_workbook/`; the report workflow starts with `01_周报正文更新_Prompt.md`. This directory remains ignored and is not included in repository commits. Browser acceptance follows the scope agreed for each task.

## Local development and validation

Requires Node.js **>= 22.19.0**.

```sh
npm install
npm run dev
```

```sh
npm run data:inventory
npm test
npm run check
npm run build
node scripts/check-chart-routes.mjs
node scripts/check-i18n-routes.mjs
npm run preview
```

`data:inventory` lists the maintained indicators, latest valid periods and values, charts and their relationships. Builds automatically run data validation first; run the route checks after building.

For deployment under a subpath, configure `PAGES_BASE_PATH` and set the site URL with `PAGES_SITE`. Pass the corresponding `--base /subpath/` argument to both route-checking scripts. Local data updates, builds and previews do not automatically push or deploy the site.

Content is provided for research and discussion only and does not constitute investment advice. Contact details and the full disclaimer are available on the site’s “About & contact” page.
