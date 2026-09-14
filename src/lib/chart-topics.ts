export const topics = [
 {id:'liquidity',title:'流动性',description:'沿着美联储负债、财政账户与逆回购，观察金融流动性的规模、组成及周度变化。',coverage:'金融流动性 · TGA · 逆回购'},
 {id:'rates',title:'利率与收益率曲线',description:'从短端资金利率、国债期限结构到主要国家收益率利差，对照不同期限与市场的利率定价。',coverage:'SOFR / OIS · 国债曲线 · 实际利率 · 国际利差'},
 {id:'growth',title:'增长与需求',description:'结合季度产出、企业调查与周度活动，沿不同时间尺度观察经济增长。',coverage:'实际 GDP · ISM · 高频活动'},
 {id:'inflation',title:'通胀与成本',description:'对照消费价格、通胀预期和供应链压力，查阅研究判断背后的历史数据。',coverage:'CPI / PCE · 通胀预期 · 供应链'},
 {id:'labor',title:'就业与工资',description:'从新增就业、失业率、工资与失业金申请，观察劳动力市场的数量与价格变化。',coverage:'非农 · 失业率 · 工资 · 初请与续请'},
 {id:'housing',title:'房地产',description:'将住房成交、库存和按揭利率放在各自的历史背景中，观察需求与融资约束。',coverage:'成屋销售 · 库存 · 按揭利率'},
 {id:'financial-conditions',title:'金融条件',description:'查阅金融状况、市场波动、美元指数与主要货币汇率的历史序列，辅助理解研究中的风险环境。',coverage:'金融状况 · 金融压力 · MOVE / VIX · 美元与汇率'},
];
const english = [
 ['Liquidity','Follow Federal Reserve liabilities, Treasury cash and reverse repos to study the scale, composition and weekly changes in liquidity.','Liquidity · TGA · Reverse repos'],
 ['Rates & yield curves','Compare short-term funding, the Treasury term structure and international yield spreads across maturities and markets.','SOFR / OIS · Treasury curve · Real yields · International spreads'],
 ['Growth & demand','Combine quarterly output, business surveys and weekly activity to study growth across time horizons.','Real GDP · ISM · High-frequency activity'],
 ['Inflation & costs','Read consumer prices, inflation expectations and supply-chain pressure alongside the historical evidence.','CPI / PCE · Expectations · Supply chains'],
 ['Employment & wages','Examine payroll gains, unemployment, wages and benefit claims to understand labor-market quantities and prices.','Payrolls · Unemployment · Wages · Claims'],
 ['Housing','Put home sales, inventory and mortgage rates in historical context to study demand and financing constraints.','Existing-home sales · Inventory · Mortgages'],
 ['Financial conditions','Explore financial conditions, volatility, dollar indices and exchange rates as context for the research risk outlook.','Financial conditions · Stress · MOVE / VIX · Dollar & FX'],
];
export function getTopics(locale = 'zh') {return topics.map((topic,i)=>locale==='en'?{...topic,title:english[i][0],description:english[i][1],coverage:english[i][2]}:topic);}
