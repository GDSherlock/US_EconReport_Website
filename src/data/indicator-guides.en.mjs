// Independently editable English research copy, keyed by the same stable chart IDs.
import {indicatorGuides as zh} from './indicator-guides.mjs';
const coverage={
  "net-liquidity": [
    "fed-liabilities",
    "tga",
    "reverse-repo"
  ],
  "liquidity-components": [
    "fed-liabilities",
    "tga",
    "reverse-repo"
  ],
  "liquidity-weekly-change": [
    "fed-liabilities",
    "tga",
    "reverse-repo"
  ],
  "sofr-ois": [
    "sofr",
    "ois"
  ],
  "treasury-yields": [
    "treasury-2y",
    "treasury-10y",
    "treasury-30y"
  ],
  "yield-curve": [
    "treasury-1m",
    "treasury-2m",
    "treasury-3m",
    "treasury-6m",
    "treasury-1y",
    "treasury-2y",
    "treasury-3y",
    "treasury-5y",
    "treasury-7y",
    "treasury-10y",
    "treasury-20y",
    "treasury-30y"
  ],
  "real-yield": [
    "tips-10y"
  ],
  "real-gdp": [
    "real-gdp-growth"
  ],
  "ism-activity": [
    "ism-manufacturing",
    "ism-services"
  ],
  "weekly-activity": [
    "redbook",
    "weekly-economic-index"
  ],
  "cpi-inflation": [
    "cpi",
    "core-cpi"
  ],
  "pce-inflation": [
    "pce",
    "core-pce"
  ],
  "inflation-expectations": [
    "inflation-expectation-1y",
    "inflation-expectation-3y",
    "inflation-expectation-5y"
  ],
  "supply-chain-pressure": [
    "gscpi"
  ],
  "payrolls": [
    "payroll-change"
  ],
  "unemployment": [
    "unemployment-rate"
  ],
  "wage-growth": [
    "wage-yoy",
    "wage-mom"
  ],
  "jobless-claims": [
    "initial-claims",
    "continued-claims"
  ],
  "existing-home-sales": [
    "home-sales"
  ],
  "housing-inventory": [
    "home-inventory",
    "home-months-supply"
  ],
  "mortgage-rate": [
    "mortgage-30y"
  ],
  "financial-conditions": [
    "nfci"
  ],
  "financial-stress": [
    "stl-stress"
  ],
  "market-volatility": [
    "move",
    "vix"
  ],
  "international-yield-spreads": [
    "international-cn-10y",
    "international-us-10y",
    "international-de-10y",
    "international-jp-10y"
  ],
  "dollar-indices": [
    "dollar-index",
    "broad-dollar-index",
    "advanced-dollar-index",
    "emerging-dollar-index"
  ],
  "fx-major": [
    "usd-eur",
    "usd-gbp",
    "usd-jpy",
    "usd-aud",
    "usd-cny",
    "usd-cad"
  ],
  "fx-europe": [
    "usd-dkk",
    "usd-chf",
    "usd-sek"
  ],
  "fx-asia-americas": [
    "usd-inr",
    "usd-mxn",
    "usd-krw",
    "usd-thb"
  ]
};
const rows={
 'net-liquidity':[
 'Trace balance-sheet and Treasury cash flows without treating the result as money flowing into equities.',
 'A site-constructed liquidity proxy: Federal Reserve liabilities less the Treasury General Account (TGA) and source reverse repo balances. It is neither an official monetary aggregate nor bank reserves.',
 'Identify whether changes in the funding backdrop originate in Treasury cash management or the composition of central bank liabilities.',
 'An increase may reflect liability growth, Treasury spending or lower reverse repos. A decline requires distinguishing Treasury cash rebuilding from central bank contraction. Check funding rates, reserves and credit alongside the decomposition.',
 'Liabilities include currency and other items. Counterparty and instrument coverage matter. The residual is not investable cash, bank lending capacity or proof of a causal effect on asset prices.',
 'Lₜ = Bₜ − Tₜ − Rₜ, with B = Fed liabilities, T = TGA and R = source reverse repos. Match the same date; any missing input gives no result. Source USD millions are divided by 100 for display in USD 100 millions.'],
 'liquidity-components':[
 'The same net change can result from very different balance-sheet processes.',
 'The three balances are Federal Reserve liabilities, Treasury cash at the Fed and reverse repo liabilities.',
 'Separate persistent central bank operations from fiscal payment timing and shifts between money-market instruments.',
 'Read liability growth alongside assets. A rising TGA may reflect taxes or debt issuance, while a decline may reflect spending. Falling reverse repos may indicate movement into Treasury bills or other instruments; the formula assigns different signs to these balances.',
 'No balance alone measures financial conditions. Lower reverse repos do not guarantee an equal increase in reserves, and settlement arrangements affect TGA transmission. Separate panel scales cannot be compared by line height.'],
 'liquidity-weekly-change':[
 'Explain the sources of the weekly proxy change, rather than forecast returns.',
 'An accounting decomposition of weekly liquidity changes into liabilities, TGA and reverse repo contributions, together with the net change.',
 'Distinguish one-off Treasury cash movements from a persistent easing trend.',
 'Positive bars add to the proxy. Declines in TGA and reverse repos therefore contribute positively. Large offsetting components can leave a small net change while revealing substantial internal shifts.',
 'This is an accounting identity, not attribution of asset returns. Holidays, observation dates and fiscal settlement can affect weekly comparisons; the result cannot establish a monetary policy pivot.',
 'ΔL = ΔB − ΔT − ΔR. Contributions are ΔB, −ΔT and −ΔR. Only valid observations exactly seven days apart are compared; multiweek changes do not replace missing weeks. The total requires all three components.'],
 'sofr-ois':[
 'Compare overnight secured funding with swap pricing only after identifying instrument conventions.',
 'SOFR measures overnight funding secured by US Treasuries. OIS is the fixed rate on an overnight index swap, reflecting pricing of floating overnight rates over its term and potentially risk and liquidity premia.',
 'Distinguish spot funding changes from swap-market repricing when studying funding pressure and policy expectations.',
 'Rising SOFR with stable OIS warrants examining settlement, collateral and funding demand. Rising OIS with stable SOFR may reflect higher expected overnight rates. A wider negative spread does not automatically mean tighter spot funding.',
 'The source identifies OIS only as USSOC BGN Curncy. Its tenor and floating-leg convention have not been independently confirmed, so the spread is not a pure credit measure, a meeting-specific hike probability or an exact policy path.',
 'Spread in bp = [SOFR(%) − OIS(%)] × 100. Match source weekly dates without filling gaps; do not assume the dates denote weekly averages or week-end closes.'],
 'treasury-yields':[
 'Separate outright yield moves from changes between maturities.',
 'Nominal Treasury yields at 2, 10 and 30 years; the 10-year minus 2-year spread describes the slope between those maturities.',
 'The 2-year yield is sensitive to the policy path. Longer yields also reflect growth, inflation, term premia and supply-demand conditions, informing financing costs and discount rates.',
 'A wider spread can result from rising long yields or falling short yields, with different implications. Inversion means short yields exceed long yields; interpret it alongside employment and credit.',
 'Yield is not holding-period return. Higher yields generally lower existing fixed-coupon bond prices, while total return also depends on duration, coupons and purchase price. The curve is not a recession timetable.',
 '10Y−2Y in bp = [10-year yield(%) − 2-year yield(%)] × 100. Both observations must exist on the same date.'],
 'yield-curve':[
 'A same-date view of policy expectations and long-term financing conditions across maturities.',
 'Nominal Treasury yields from one month to 30 years. Bills are closer to near-term policy and cash demand; intermediate maturities reflect medium-term rates, while longer maturities also price long-run expectations and term risk.',
 'Identify parallel shifts, steepening and flattening to understand why borrowing costs across maturities diverge.',
 'Steepening led by lower short yields may reflect expected cuts; steepening led by higher long yields may reflect inflation, supply or term premia. Local kinks may arise from maturity-specific demand.',
 'Liquidity and supply differ by instrument. The curve is not a year-by-year policy forecast. Labels are equally spaced, so its geometric angle is not a slope measured per calendar year.',
 'Arrange all tenor yields from one complete observation date. No fitting, interpolation or combination of different dates. The reader selects the date.'],
 'real-yield':[
 'Observe market real yields through inflation-protected bonds, not nominal yields less current CPI.',
 'The 10-year TIPS yield comes from Treasuries whose principal adjusts with inflation.',
 'Study real financing conditions and discount rates alongside nominal yields and inflation compensation.',
 'An increase may reflect higher expected real rates or real term premia. A decline may reflect weaker growth expectations, policy repricing or safe-haven demand.',
 'Term and liquidity effects remain. It is not an unbiased forecast of future real short rates; a negative yield does not imply an inevitable holding-period loss. Price changes and inflation adjustments affect realized returns.'],
 'real-gdp':[
 'Measure real quarterly output growth while recognizing the amplification from annualization.',
 'Real GDP measures final economic output after price adjustment. This chart shows seasonally adjusted quarter-on-quarter annualized growth, not year-on-year or full-year growth.',
 'Provide an aggregate reference for employment, consumption and production, and examine the composition of demand.',
 'Higher growth means faster expansion relative to the prior quarter. Decompose consumption, investment, inventories and net exports: inventory accumulation or lower imports can lift GDP without stronger final demand.',
 'Quarterly estimates lag and are revised. One negative quarter does not establish recession. Slower positive growth is not falling output, and annualization is not a forecast for the next four quarters.',
 'Source convention: [(current-quarter real GDP / previous-quarter real GDP)⁴ − 1] × 100%. The site displays the published annualized rate rather than estimating GDP from incomplete components.'],
 'ism-activity':[
 'Survey breadth is not the same as output growth.',
 'Manufacturing and non-manufacturing PMIs are diffusion measures compiled from purchasing managers’ surveys.',
 'Timely survey evidence helps identify sector divergence and can be checked against activity data.',
 'Above 50 generally indicates sector expansion and below 50 contraction. A fall that remains above 50 may indicate narrower expansion. Examine new orders, employment and deliveries.',
 'Surveys do not measure actual production volumes, and PMI levels cannot directly determine GDP. Slower deliveries may reflect strong demand or supply disruption. Different sector compositions limit point-for-point comparison.'],
 'weekly-activity':[
 'Use retail sample sales and broader real activity as complementary high-frequency perspectives.',
 'Redbook tracks year-on-year same-store sales at sampled retailers. The Weekly Economic Index combines high-frequency real activity signals and is scaled to four-quarter GDP growth.',
 'Look for turning points before monthly and quarterly releases and assess whether a single consumption signal is representative.',
 'Redbook can rise because of prices as well as quantities. Higher WEI indicates stronger composite activity. Divergence warrants examining services, industrial activity and sample coverage.',
 'Redbook is neither total retail sales nor real consumption growth; holidays and base effects matter. WEI is an estimate subject to revision, not published GDP or a precise forecast for one quarter.'],
 'cpi-inflation':[
 'Distinguish headline price pressure from core inflation and consider year-on-year base effects.',
 'CPI tracks a household consumption basket; core CPI excludes food and energy. Both lines show year-on-year inflation.',
 'Headline CPI more directly captures the broad price pressures households face; core helps assess persistence. They are complementary.',
 'Lower annual inflation may reflect slower recent price increases or last year’s high base. Positive inflation still generally means prices exceed year-earlier levels. Assess housing, goods and services within core.',
 'An average basket cannot represent every household. Core is not volatility-free. One annual reading cannot establish a durable return to target or determine a policy decision.'],
 'pce-inflation':[
 'Compare consumption price measures with attention to coverage and weights.',
 'The PCE price index measures prices of personal consumption expenditures. Core excludes food and energy. The chart shows annual growth.',
 'Assess the consumption inflation measure central to US monetary policy and the distribution of price pressures.',
 'The headline-core gap helps identify food and energy effects. Check recent monthly rates and components when judging disinflation. Differences from CPI can reflect weights, scope and calculation methods.',
 'PCE and CPI are not competing tests of which measure is true. National-account revisions can change PCE history. Core is not total household living costs, and one reading cannot establish the timing of a rate cut.'],
 'inflation-expectations':[
 'Household expectations concern future prices, not inflation already realized.',
 'New York Fed consumer survey median expectations at one-, three- and five-year-ahead horizons. Horizons are not data frequencies.',
 'Study price perceptions and the stability of medium- and longer-term expectations alongside wages, spending and actual inflation.',
 'Short-term expectations often react to energy and visible everyday prices. Persistent longer-term increases warrant closer attention to anchoring. Do not subtract horizons to infer an actual inflation path.',
 'Medians are not market probabilities and omit much of the distribution of disagreement. Expectations need not be realized and cannot by themselves establish a wage-price spiral.'],
 'supply-chain-pressure':[
 'Measure supply-chain strain relative to history, not the rate of goods-price inflation.',
 'GSCPI combines transport costs and manufacturing survey supply-chain information, expressed in standard deviations from its historical average.',
 'Study how logistics and supply constraints may affect deliveries, inventories and goods inflation.',
 'Positive values mean above-average pressure and negative values below-average pressure. A decline from a high positive value signals relief, but not necessarily below-normal conditions.',
 'Zero does not mean no bottlenecks. Weak demand can also ease transport pressure. A global composite cannot quantify shortages in one industry or country.'],
 'payrolls':[
 'Assess net job creation and persistence instead of treating one strong month as the whole labor market.',
 'Seasonally adjusted monthly changes in nonfarm payroll jobs from the establishment survey. Multiple jobs held by one person can count separately.',
 'Study labor demand, income generation and cyclical momentum alongside industry composition and unemployment.',
 'Positive values mean job gains. A lower positive reading means slower growth, while a negative reading means net losses. Several months and revisions matter more than an isolated release.',
 'Jobs are not people or labor-force growth, and coverage is incomplete. Initial estimates can be revised substantially. Strong payrolls can coexist with higher unemployment because household survey measures also reflect labor supply.'],
 'unemployment':[
 'Read unemployment together with participation to distinguish hiring from labor-force exit.',
 'The household survey share of the labor force that is unemployed; the denominator includes employed people and those meeting the unemployment definition.',
 'Assess labor-market slack and whether cooling is becoming broader deterioration.',
 'A rise can reflect layoffs or more entrants seeking work. A decline can reflect job gains or labor-force exit. Read it with payrolls, participation and hours.',
 'It does not fully capture discouraged workers, involuntary part-time work or job quality. Small monthly changes contain sampling noise and cannot alone establish a turning point.'],
 'wage-growth':[
 'Average nominal pay reflects income, employer costs and changes in the mix of jobs.',
 'Year-on-year and month-on-month growth in private nonfarm average hourly earnings, retaining source seasonal adjustment.',
 'Assess labor-market tightness, purchasing power and service-sector cost pressures.',
 'Monthly changes are more responsive; annual rates are smoother but affected by base effects. Higher averages can reflect raises or fewer low-paid jobs. Purchasing power requires prices; unit labor costs also require productivity.',
 'This excludes some benefits and non-wage costs and does not track the same worker over time. Faster wages alone do not establish faster inflation. Multiplying monthly growth by 12 does not give realized annual growth.'],
 'jobless-claims':[
 'Initial claims capture new insured unemployment; continued claims also reflect re-employment conditions.',
 'Initial applications for unemployment insurance and continued benefit claims for subsequent covered weeks. Their reporting periods may differ.',
 'Provide early weekly evidence of layoffs and job-finding conditions alongside monthly surveys.',
 'Persistent initial-claim increases warrant checking whether layoffs are spreading. Stable initial claims with rising continued claims may indicate slower re-employment. Eligibility, benefit expiration and administration also matter.',
 'Not all unemployed people are covered. Weather, holidays, strikes and seasonal adjustment can distort one week. Fewer continued claims do not prove an equal number found jobs, and claims cannot directly produce an unemployment rate.'],
 'existing-home-sales':[
 'Separate completed transactions, prices and the annualized reporting convention.',
 'Completed sales of existing homes, reported at a seasonally adjusted annual rate that scales the current month’s adjusted pace to a year.',
 'Study mortgage costs, affordability and mobility, with implications for brokerage, renovation and durable-goods demand.',
 'Lower sales may reflect weak demand or insufficient listings. Judge recovery with inventory and prices. Closings lag the financing conditions prevailing when contracts were signed.',
 'SAAR is neither the actual monthly count nor a full-year forecast. Ownership transfers are not new residential production. Lower sales alone do not establish falling prices.'],
 'housing-inventory':[
 'Read inventory and months supply together to separate additional supply from slower sales.',
 'Inventory counts existing homes for sale. Months supply estimates how long they would take to sell at the prevailing sales pace.',
 'Study bargaining conditions, listing constraints and changes in demand alongside transactions.',
 'Rising inventory with stable sales may signal improved supply. Rising months supply with little inventory change may mainly reflect slower sales. Lower months supply can also result from fewer listings.',
 'National totals conceal regional, price-tier and property-type differences. No fixed threshold predicts all markets. Seasonal conventions can differ, so the displayed series should not be mechanically divided.',
 'Conceptually, months supply is inventory divided by the monthly sales pace. The site uses published months supply rather than dividing inventory by annualized adjusted sales, avoiding inconsistent time scales and seasonal conventions.'],
 'mortgage-rate':[
 'Connect market rates to housing payments without treating the average as an individual loan quote.',
 'A weekly average 30-year fixed mortgage rate for the source loan and borrower sample.',
 'Assess affordability, refinancing incentives and the lock-in effect from existing low-rate mortgages.',
 'Higher rates increase principal-and-interest payments for the same loan. Lower rates may support purchases or refinancing, but incomes, down payments and prices also matter. Mortgage security spreads influence rates.',
 'It is not the central bank policy rate or every borrower’s all-in cost. Credit, fees, points and other housing expenses differ. Historical methodology changes and sample coverage limit comparisons.'],
 'financial-conditions':[
 'Distinguish the level of financial tightness from its marginal change.',
 'The Chicago Fed NFCI combines weekly information from money, bond, equity and banking markets.',
 'Assess whether policy rates are accompanied by broader market and credit constraints.',
 'Positive values indicate tighter-than-average conditions; negative values indicate looser conditions. A rise from a negative value toward zero is tightening, but not necessarily above-average tightness.',
 'It is not a policy score or growth forecast. Economic and financial developments both influence it. NFCI is not ANFCI, which adjusts for economic conditions; causal conclusions cannot be drawn directly.'],
 'financial-stress':[
 'Track common movements in financial stress; zero is a statistical reference.',
 'The St. Louis Financial Stress Index combines rates, spreads and other financial variables; zero is near average stress in its construction sample.',
 'Identify simultaneous increases in market and funding risk and compare them with liquidity and activity.',
 'Rising values indicate greater composite stress. Positive readings exceed the historical average. Further declines below zero imply less relative stress, not an absence of risk.',
 'It is not a default probability. Calm aggregate readings can conceal institution-specific problems. Methodology has changed across versions; the source version is not confirmed and should not be spliced with another version.'],
 'market-volatility':[
 'Implied uncertainty in bond and equity options is not a forecast of price direction.',
 'MOVE reflects option-implied US Treasury yield volatility. VIX uses S&P 500 options to measure expected volatility over approximately 30 days.',
 'Compare the pricing of uncertainty across rates and equities to locate risk repricing.',
 'Higher MOVE may reflect greater disagreement over rates; higher VIX may reflect demand for equity tail protection. Joint increases warrant attention, but volatility can also rise during sharp rallies.',
 'Implied volatility includes risk premia and differs from realized volatility or returns. The indices have different units and construction, so levels cannot be compared directly. Weekly observations can miss intraday extremes.'],
 'international-yield-spreads':[
 'Compare relative nominal rate environments without interpreting spreads as risk-free arbitrage returns.',
 'Local-currency 10-year sovereign yields for China, the US, Germany and Japan, shown as China minus US, US minus Germany and US minus Japan.',
 'Study differences in growth, inflation, policy and bond supply-demand, and provide context for currency analysis.',
 'A China–US spread rising toward zero means Chinese yields increase relative to US yields. Wider US–Germany or US–Japan spreads mean higher relative US yields. Decompose both legs rather than assigning every move to one country.',
 'Currencies, inflation, tax, liquidity, capital restrictions and hedging costs differ. Nominal spreads are not currency-hedged returns or standalone FX forecasts. Same dates can correspond to different local closing times.',
 'China–US = (China 10Y − US 10Y) × 100; US–Germany = (US 10Y − Germany 10Y) × 100; US–Japan = (US 10Y − Japan 10Y) × 100. Inputs are percent, outputs bp. Match dates; omit results with a missing leg and do not fill holidays.'],
 'dollar-indices':[
 'Different currency baskets can show different degrees of dollar strength.',
 'DXY uses six currencies. The broad nominal dollar index covers more trading partners, with advanced- and emerging-economy subindices.',
 'DXY describes the trading environment against major developed currencies; broad and grouped indices help assess the breadth of dollar moves across partners.',
 'A rise means dollar appreciation against the relevant basket. Divergence warrants examining weights, especially the euro, and whether emerging-market currencies move together.',
 'Different bases, baskets and weights prevent direct level comparisons. Nominal indices do not adjust for relative prices and cannot alone measure real competitiveness. Historical methodology changes matter.'],
};
const fxNotes={
 'fx-major':[['Euro','Compare US–euro-area rate expectations and growth, including energy effects on Europe’s terms of trade.'],['Sterling','Read UK inflation, relative rate paths and external financing; broad dollar moves are not solely UK news.'],['Yen','Rate differentials and carry trades matter, but safe-haven demand, intervention and position unwinds can break historical relationships.'],['Australian dollar','Commodity demand, Asia and relative rates provide context; AUD is not a pure proxy for China or commodities.'],['Renminbi','Consider rate differentials, trade and exchange-rate management. The source CNY quote should not be relabeled offshore CNH.'],['Canadian dollar','Compare US–Canada cycles, rates and energy trade; oil is only one driver.']],
 'fx-europe':[['Danish krone','Denmark’s fixed exchange-rate policy against the euro means USD moves should first be compared with EUR; they need not originate in Denmark.'],['Swiss franc','Consider Swiss rates and safe-haven demand together; CHF need not appreciate in every risk event.'],['Swedish krona','Study rates, external demand and domestic financing. Liquidity in a smaller market can amplify moves.']],
 'fx-asia-americas':[['Indian rupee','Energy import costs, capital flows and policy matter; FX moves alone do not identify economic growth.'],['Mexican peso','Consider US–Mexico trade, rates and cross-border flows. High carry does not guarantee returns after depreciation and risk.'],['Korean won','Exports and global manufacturing provide context, but capital flows and dollar conditions may dominate short-term moves.'],['Thai baht','Consider tourism receipts, trade and capital flows. An improving current account does not guarantee immediate appreciation.']],
};
for(const id of Object.keys(fxNotes)) rows[id]=[
 'Establish quote direction before considering rates, trade and capital flows.',
 'All series are foreign currency units per US dollar: bilateral nominal exchange rates, with independent panel scales.',
 'Study dollar movements, import costs, translated export revenues and foreign-currency financing burdens. Currency-specific context is listed below.',
 'A higher value means a stronger dollar and weaker counterpart currency; a lower value means the reverse. Dollar debtors and dollar revenue earners can face opposite effects from the same move.',
 'Spot changes exclude interest, forward points and transaction costs, so they are not total returns. Bilateral nominal FX is not the real effective exchange rate. Historical driver relationships can change; the research cues below are not causal findings.',
 'Preserve the source per-dollar quotes. EUR, GBP and AUD source observations are already reciprocals of common market quotes; do not invert again. A reverse quote requires 1/x for nonzero values, and percentage changes cannot simply be negated. The site creates no extra inverse series.'
];
const refTitles={};
for(const guide of Object.values(zh))for(const ref of guide.references??[])refTitles[ref.url]=new URL(ref.url).hostname.replace('www.','')+' — methodology';
export const indicatorGuidesEn=Object.fromEntries(Object.entries(rows).map(([id,row])=>[id,{
 covers:coverage[id],summary:row[0],definition:row[1],purpose:row[2],reading:row[3],limits:row[4],
 ...(row[5]?{calculation:row[5]}:{}),
 ...(fxNotes[id]?{nuances:fxNotes[id].map(([title,text])=>({title,text}))}:{}),
 references:(zh[id].references??[]).map(ref=>({...ref,title:refTitles[ref.url]})),
}]));
