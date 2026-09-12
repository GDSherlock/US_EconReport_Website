export function periodTime(period) {
 let date=period;
 if (/^\d{4}-Q[1-4]$/.test(period)) date=`${period.slice(0,4)}-${String((+period.at(-1)-1)*3+1).padStart(2,'0')}-01`;
 else if (/^\d{4}-\d{2}$/.test(period)) date+='-01';
 const time=Date.parse(date+'T00:00:00Z');
 if (!Number.isFinite(time)) throw new Error(`Invalid period ${period}`);
 return time;
}
export function selectRange(points, range='5y', endPeriod) {
 if (!points.length) return [];
 const end=endPeriod??points.at(-1).period;
 let to=periodTime(end), from=-Infinity;
 if (typeof range==='object') { from=periodTime(range.from); to=periodTime(range.to); }
 else if (range!=='all') { if (!['1y','3y','5y'].includes(range)) throw new Error('Invalid range'); const d=new Date(to); d.setUTCFullYear(d.getUTCFullYear()-parseInt(range)); from=+d; }
 if (from>to) throw new Error('Invalid range order');
 return points.filter(p=>periodTime(p.period)>=from && periodTime(p.period)<=to);
}
export function curveDates(panel) {
 const sets=panel.series.map(s=>new Set(s.points.filter(p=>p.value!==null).map(p=>p.period)));
 return [...sets[0]].filter(p=>sets.every(s=>s.has(p))).sort();
}
function missingPeriod(a,b,frequency) {
 if(frequency==='monthly')return (+b.slice(0,4)-+a.slice(0,4))*12+(+b.slice(5)-+a.slice(5))>1;
 if(frequency==='quarterly')return (+b.slice(0,4)-+a.slice(0,4))*4+(+b.at(-1)-+a.at(-1))>1;
 if(frequency==='weekly')return periodTime(b)-periodTime(a)>7*86400000;
 return false; // Daily market calendars include holidays; explicit nulls still break the line.
}
// Display-only reduction: preserve every gap plus the endpoints and extrema of each bucket.
function reduceSegment(points, limit=1200) {
 if (points.length<=limit) return points;
 const output=[]; const size=Math.ceil(points.length/(limit/4));
 for(let i=0;i<points.length;i+=size) {
  const bucket=points.slice(i,i+size);
  const selected=[bucket[0],bucket.at(-1),bucket.reduce((a,b)=>a.value<b.value?a:b),bucket.reduce((a,b)=>a.value>b.value?a:b)];
  output.push(...[...new Set(selected)].sort((a,b)=>a.x-b.x));
 }
 return output;
}
export function buildPanelGeometry(panel, viewport={width:720,height:260}) {
 const width=Math.max(280,viewport.width), height=viewport.height??260;
 const left=68,right=18,top=18,bottom=38,plotWidth=width-left-right,plotHeight=height-top-bottom;
 const periods=[...new Set(panel.series.flatMap(s=>s.points.map(p=>p.period)))].sort();
 const values=panel.series.flatMap(s=>s.points.map(p=>p.value)).filter(v=>v!==null);
 let yMin=Math.min(...values), yMax=Math.max(...values);
 if(!values.length) {yMin=0;yMax=1;}
 if(panel.type==='bar') {yMin=Math.min(0,yMin);yMax=Math.max(0,yMax);}
 const padding=(yMax-yMin || Math.abs(yMax)||1)*.08;
 yMin-=padding; yMax+=padding;
 const rawStep=(yMax-yMin)/4, magnitude=10**Math.floor(Math.log10(rawStep));
 const step=[1,2,2.5,5,10].find(n=>n*magnitude>=rawStep)*magnitude;
 yMin=Math.floor(yMin/step)*step;yMax=Math.ceil(yMax/step)*step;
 const xStart=periods.length?periodTime(periods[0]):0,xEnd=periods.length?periodTime(periods.at(-1)):1;
 const x=p=>left+(xEnd===xStart?.5:(periodTime(p)-xStart)/(xEnd-xStart))*plotWidth;
 const y=v=>top+(yMax-v)/(yMax-yMin)*plotHeight;
 const lines=panel.series.map(s=>{
  const segments=[]; let segment=[];
  for(const p of s.points) {
   if(segment.length && missingPeriod(segment.at(-1).period,p.period,s.frequency)){segments.push(reduceSegment(segment));segment=[];}
   if(p.value===null) {if(segment.length)segments.push(reduceSegment(segment));segment=[];} else segment.push({...p,x:x(p.period),y:y(p.value)});
  }
  if(segment.length)segments.push(reduceSegment(segment));
  return {name:s.name,segments};
 });
 const tickCount=width<450?3:5;
 const ticks=[...new Set(Array.from({length:Math.min(tickCount,periods.length)},(_,i)=>periods[Math.round(i*(periods.length-1)/Math.max(1,Math.min(tickCount,periods.length)-1))]))].map(period=>({period,x:x(period)}));
 return {width,height,left,top,plotWidth,plotHeight,yMin,yMax,zeroY:y(0),lines,ticks,yTicks:Array.from({length:Math.round((yMax-yMin)/step)+1},(_,i)=>{const value=yMin+step*i;return {value,y:y(value)};}),empty:!values.length};
}
