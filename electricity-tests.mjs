import assert from 'node:assert/strict';
import {chapters,initial} from './content.mjs';
import {dcState,drawDC,rcState,pathPoint,pathLength} from './electricity.mjs';
const by=id=>chapters.flatMap(c=>c.labs).find(l=>l.id===id),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a)),`${a} != ${b}`);
let checks=0;
for(const id of ['ohm','parallel','cell']){const l=by(id),s=initial(l),f=dcState(l,s);near(f.current,id==='parallel'?s.v/s.r1+s.v/s.r2:l.compute(s));near(f.power,f.current*f.voltage);if(id==='parallel')near(f.current,f.branch1+f.branch2);if(id==='cell'){near(f.sourceVoltage,s.emf-f.current*s.r);near(f.current*s.emf,f.power+f.internalPower)}const open=dcState(l,s,false);for(const k of ['current','branch1','branch2','power','internalPower','voltage'])near(open[k],0);checks++}
for(const v of [0,.5,12,24])for(const r of [1,10,100])for(const c of [10,100,1000])for(const mode of ['charge','discharge']){
 const s={v,r,c},tau=r*c*.001,a=rcState(s,0,mode),b=rcState(s,tau,mode),end=rcState(s,5*tau,mode);
 near(a.voltage,mode==='charge'?0:v);near(Math.abs(a.current),v/(r*1000));near(b.fraction,mode==='charge'?1-Math.exp(-1):Math.exp(-1));near(end.fraction,mode==='charge'?1-Math.exp(-5):Math.exp(-5));near(b.charge,c*1e-6*b.voltage);near(b.energy,.5*c*1e-6*b.voltage**2);
 // Energy balance: source input = resistor heat + rate of stored capacitor energy.
 const dt=tau*1e-5,derivative=(rcState(s,tau+dt,mode).energy-rcState(s,tau-dt,mode).energy)/(2*dt);
 near(derivative,mode==='charge'?v*b.current-b.power:-b.power);assert.ok(Math.abs(end.current)<=Math.abs(b.current));checks++;
}
const s={v:12,r:10,c:100};near(rcState({...s,r:20},2).voltage,rcState(s,1).voltage);near(rcState({...s,c:200},2).voltage,rcState(s,1).voltage);
const path=[[0,0],[100,0],[100,50]];near(pathLength(path),150);assert.deepEqual(pathPoint(path,120),[100,20]);assert.deepEqual(pathPoint(path,-30),[100,20]);
class Ctx{constructor(){this.dots=[]}beginPath(){}moveTo(){}lineTo(){}stroke(){}fill(){}fillRect(){}strokeRect(){}fillText(){}arc(x,y,r){if(r===4)this.dots.push([x,y])}}
const dots=(params,t,options)=>{let c=new Ctx;drawDC(c,by('ohm'),params,t,options);return c.dots.slice(2)};
const defaults=initial(by('ohm')),start=dots(defaults,0),later=dots(defaults,.1),slow=dots({...defaults,r:defaults.r*2},.1),reverse=dots(defaults,.1,{carrier:'electrons'});
assert.notDeepEqual(start,later);near(Math.hypot(later[0][0]-start[0][0],later[0][1]-start[0][1]),2*Math.hypot(slow[0][0]-start[0][0],slow[0][1]-start[0][1]));assert.ok(later[0][1]<start[0][1]);assert.ok(dots(defaults,.2,{carrier:'electrons'})[0][1]>reverse[0][1]);assert.deepEqual(dots(defaults,0,{closed:false}),dots(defaults,2,{closed:false}));assert.deepEqual(dots({...defaults,v:0},0),dots({...defaults,v:0},2));
console.log(`PASS: ${checks} DC/RC physical states; parallel branch sum, cell energy balance, exponential response, RC energy balance, current-dependent marker speed, reverse electron direction and stopped flow.`);
