import assert from 'node:assert/strict';
import {chapters,initial} from './content.mjs';
import {animationFrame,animationPeriod,newAnimatedIds,gasParticleFrame,thermalVisual} from './animation.mjs';
import {drawScene,isAnimated} from './canvas.mjs';
const labs=chapters.flatMap(c=>c.labs),by=id=>labs.find(l=>l.id===id),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let checks=0;
assert.equal(thermalVisual(by('heat'),{c:4200,dt:80}).boiling,true);
assert.equal(thermalVisual(by('heat'),{c:4200,dt:79}).boiling,false);
assert.equal(thermalVisual(by('heat'),{c:1000,dt:80}).boiling,false);
assert.notEqual(thermalVisual(by('cooling'),initial(by('cooling')),0).color,thermalVisual(by('cooling'),initial(by('cooling')),6).color);
// Illustrative ramps retain physical endpoints and conserve heat at every frame.
for(const c1 of [100,500,1000])for(const c2 of [100,1000])for(const [t1,t2] of [[80,20],[10,90],[40,40]]){
 const lab=by('equilibrium'),state={c1,c2,t1,t2};
 for(const time of [0,1,3,5,6.9]){const f=animationFrame(lab,state,time);near(c1*f.t1+c2*f.t2,c1*t1+c2*t2);near(c1*(t1-f.t1),f.transferred);checks++}
 const end=animationFrame(lab,state,5);near(end.t1,lab.compute(state));near(end.t2,end.t1);
}
for(const id of ['young','stress','expansion','volume','thermalstress']){
 const lab=by(id),state=initial(lab);near(animationFrame(lab,state,0).current,0);near(animationFrame(lab,state,5).current,lab.compute(state));
 const zero={...state,[id==='young'||id==='stress'?'f':'dt']:0};near(animationFrame(lab,zero,3).current,0);
}
for(const fraction of [0,.5,1]){const lab=by('latent'),state={m:2,fraction};const f=animationFrame(lab,state,5);near(f.melted,fraction);near(f.heat,2*334000*fraction)}
// Wall collisions reverse the normal velocity continuously, with no wrap/teleport.
for(const v of [1,20,50])for(const t of [100,300,1000]){
 const state={v,t},width=Math.min(300,Math.max(150,120+v*3))-16,speed=Math.sqrt(t/300),epsilon=1e-5;
 for(let i=0;i<30;i++)for(const time of [0,.1,1,10,10000]){
  const p=gasParticleFrame(state,i,time);
  assert.ok(p.x>=78&&p.x<=78+width);assert.ok(p.y>=68&&p.y<=282);checks++;
 }
 const hitX=(width-67)/(25*speed),hitY=(214-41)/(18*speed);
 const xBefore=gasParticleFrame(state,1,hitX-epsilon),xAt=gasParticleFrame(state,1,hitX),xAfter=gasParticleFrame(state,1,hitX+epsilon);
 near(xAt.x,78+width);near(xBefore.x,xAfter.x);near((xAt.x-xBefore.x)/epsilon,25*speed);
 const yBefore=gasParticleFrame(state,1,hitY-epsilon),yAt=gasParticleFrame(state,1,hitY),yAfter=gasParticleFrame(state,1,hitY+epsilon);
 near(yAt.y,282);near(yBefore.y,yAfter.y);near((yAt.y-yBefore.y)/epsilon,18*speed);
}
for(const id of newAnimatedIds){const l=by(id),s=initial(l);assert.equal(isAnimated(l),true);assert.ok(animationPeriod(l,s)>0);for(const t of [0,.2,1,2,3,100]){for(const value of Object.values(animationFrame(l,s,t)))if(typeof value==='number')assert.ok(Number.isFinite(value),id);checks++}}
let l=by('newton'),s=initial(l);let f=animationFrame(l,s,2);near(f.position,8);near(f.velocity,8);f=animationFrame(l,{...s,f:-12},2);near(f.position,-8);near(f.velocity,-8);
l=by('incline');s=initial(l);assert.equal(animationFrame(l,s,2).distance,0);s={...s,theta:45,mus:0};f=animationFrame(l,s,Math.sqrt(8/l.compute(s)));near(f.distance,4);near(f.velocity,Math.sqrt(8*l.compute(s)));
l=by('work');s={...initial(l),theta:180};f=animationFrame(l,s,3);near(f.distance,s.s/2);near(f.work,l.compute(s)/2);assert.ok(f.work<0);
l=by('cooling');s=initial(l);near(animationFrame(l,s,0).temperature,s.t0);near(animationFrame(l,s,6).temperature,l.compute(s));assert.ok(animationFrame(l,s,3).temperature>animationFrame(l,s,6).temperature);
l=by('energy');s=initial(l);near(animationFrame(l,s,s.t/2).energy,l.compute(s)/4);near(animationFrame(l,s,s.t).energy,l.compute(s));
l=by('collision');for(let m1 of [1,2,10])for(let m2 of [1,3,10])for(let u1 of [-10,-3,0,7,10])for(let u2 of [-10,0,3,10]){s={m1,m2,u1,u2};f=animationFrame(l,s,2);near(f.velocity*(m1+m2),f.momentum);assert.ok(f.energyAfter<=f.energyBefore+1e-8);assert.equal(f.joined,u1!==u2);if(f.joined)near(f.separation,0);checks++}
l=by('transition');s=initial(l);assert.equal(animationFrame(l,s,0).level,s.lower+s.gap);assert.equal(animationFrame(l,s,2).level,s.lower);assert.ok(animationFrame(l,s,2).photonX>280);
near(animationFrame(l,s,1).jumpProgress,0);near(animationFrame(l,s,1.2).jumpProgress,.5);near(animationFrame(l,s,1.4).jumpProgress,1);
assert.equal(animationFrame(l,s,1.2).emitted,false);assert.equal(animationFrame(l,s,1.2).level,s.lower+s.gap);assert.equal(animationFrame(l,s,1.4).emitted,true);
class Context{constructor(){this.calls=[]}measureText(t){return {width:t.length*7}}createLinearGradient(){return {addColorStop(){}}}}
for(let method of ['setLineDash','fillText','clearRect','fillRect','strokeRect','beginPath','closePath','moveTo','lineTo','arc','ellipse','rect','clip','fill','stroke','save','restore','translate','rotate','setTransform'])Context.prototype[method]=function(...args){for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),method);this.calls.push([method,...args])};
globalThis.OffscreenCanvas=class{getContext(){return new Context}};
// The visible jump travels between the selected rows, then emits the photon.
{
 const lab=by('transition'),params=initial(lab),positions=[];
 for(const time of [1,1.2,1.4]){
  const c=new Context;drawScene(c,lab,params,time);
  positions.push(c.calls.find(([method,,,r])=>method==='arc'&&r===7)[2]);
 }
 assert.ok(positions[0]<positions[1]&&positions[1]<positions[2]);near(positions[1],(positions[0]+positions[2])/2);
}
// Amount changes the actual drawn population even while playback is paused.
l=by('gas');s=initial(l);
for(const n of [.1,.5,1,2]){
 const c=new Context;drawScene(c,l,{...s,n},0);
 const particles=c.calls.filter(([method,,,radius])=>method==='arc'&&radius===4);
 assert.equal(particles.length,Math.round(30*n));
 near(l.compute({...s,n}),l.compute(s)*n/s.n);
 checks++;
}
// Adding gas retains existing trajectories; temperature and volume are unchanged.
assert.deepEqual(gasParticleFrame({...s,n:.1},0,2),gasParticleFrame({...s,n:2},0,2));
// Level labels have distinct rows, and transitions include upper levels 7 and 8.
for(const [id,params] of [['levels',{n:6}],['transition',{lower:4,gap:4}]]){
 const c=new Context;drawScene(c,by(id),params,0);
 const labels=c.calls.filter(([method,text])=>method==='fillText'&&text.startsWith('n = '));
 assert.equal(labels.length,id==='levels'?6:8);
 const rows=labels.map(([, , ,y])=>y).sort((a,b)=>a-b);
 for(let i=1;i<rows.length;i++)assert.ok(rows[i]-rows[i-1]>=30,'energy labels do not overlap');
 assert.ok(c.calls.some(([method,text])=>method==='fillText'&&text.includes('not to scale')));
 checks++;
}
// Compare real render commands: newly advertised animations must alter the model,
// not only a decorative clock or a label. The incline needs values above static friction.
for(const id of newAnimatedIds){l=by(id);s=initial(l);if(id==='incline')s={...s,theta:45,mus:0};let a=new Context,b=new Context;drawScene(a,l,s,0);drawScene(b,l,s,2);const geometry=c=>c.calls.filter(([method])=>['arc','fillRect','moveTo','lineTo'].includes(method));assert.notDeepEqual(geometry(a),geometry(b),id+' must change geometry');checks++}
l=by('critical');s={...initial(l),n1:1,n2:1.5};drawScene(new Context,l,s,1);checks++;
for(const [id,patch] of [['incline',{}],['conduction',{dt:0}],['radiation',{t:300,ta:300}]]){l=by(id);s={...initial(l),...patch};let a=new Context,b=new Context;drawScene(a,l,s,0);drawScene(b,l,s,2);assert.deepEqual(a.calls,b.calls,id+' zero-driving case remains stationary');checks++}
console.log(`PASS: ${newAnimatedIds.size} new animated labs; ${checks} replay, sign, cooling, collision momentum/energy and real Canvas geometry checks.`);
