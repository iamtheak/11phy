import assert from 'node:assert/strict';
import {chapters,initial} from './content.mjs';
import {animationFrame,animationPeriod,newAnimatedIds} from './animation.mjs';
import {drawScene,isAnimated} from './canvas.mjs';
const labs=chapters.flatMap(c=>c.labs),by=id=>labs.find(l=>l.id===id),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let checks=0;
for(const id of newAnimatedIds){const l=by(id),s=initial(l);assert.equal(isAnimated(l),true);assert.ok(animationPeriod(l,s)>0);for(const t of [0,.2,1,2,3,100]){for(const value of Object.values(animationFrame(l,s,t)))if(typeof value==='number')assert.ok(Number.isFinite(value),id);checks++}}
let l=by('newton'),s=initial(l);let f=animationFrame(l,s,2);near(f.position,8);near(f.velocity,8);f=animationFrame(l,{...s,f:-12},2);near(f.position,-8);near(f.velocity,-8);
l=by('incline');s=initial(l);assert.equal(animationFrame(l,s,2).distance,0);s={...s,theta:45,mus:0};f=animationFrame(l,s,Math.sqrt(8/l.compute(s)));near(f.distance,4);near(f.velocity,Math.sqrt(8*l.compute(s)));
l=by('work');s={...initial(l),theta:180};f=animationFrame(l,s,3);near(f.distance,s.s/2);near(f.work,l.compute(s)/2);assert.ok(f.work<0);
l=by('cooling');s=initial(l);near(animationFrame(l,s,0).temperature,s.t0);near(animationFrame(l,s,6).temperature,l.compute(s));assert.ok(animationFrame(l,s,3).temperature>animationFrame(l,s,6).temperature);
l=by('energy');s=initial(l);near(animationFrame(l,s,s.t/2).energy,l.compute(s)/4);near(animationFrame(l,s,s.t).energy,l.compute(s));
l=by('collision');for(let m1 of [1,2,10])for(let m2 of [1,3,10])for(let u1 of [-10,-3,0,7,10])for(let u2 of [-10,0,3,10]){s={m1,m2,u1,u2};f=animationFrame(l,s,2);near(f.velocity*(m1+m2),f.momentum);assert.ok(f.energyAfter<=f.energyBefore+1e-8);assert.equal(f.joined,u1!==u2);if(f.joined)near(f.separation,0);checks++}
l=by('transition');s=initial(l);assert.equal(animationFrame(l,s,0).level,s.lower+s.gap);assert.equal(animationFrame(l,s,2).level,s.lower);assert.ok(animationFrame(l,s,2).photonX>280);
class Context{constructor(){this.calls=[]}measureText(t){return {width:t.length*7}}createLinearGradient(){return {addColorStop(){}}}}
for(let method of ['setLineDash','fillText','clearRect','fillRect','strokeRect','beginPath','closePath','moveTo','lineTo','arc','ellipse','rect','clip','fill','stroke','save','restore','translate','rotate','setTransform'])Context.prototype[method]=function(...args){for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),method);this.calls.push([method,...args])};
globalThis.OffscreenCanvas=class{getContext(){return new Context}};
// Compare real render commands: newly advertised animations must alter the model,
// not only a decorative clock or a label. The incline needs values above static friction.
for(const id of newAnimatedIds){l=by(id);s=initial(l);if(id==='incline')s={...s,theta:45,mus:0};let a=new Context,b=new Context;drawScene(a,l,s,0);drawScene(b,l,s,2);const geometry=c=>c.calls.filter(([method])=>['arc','fillRect','moveTo','lineTo'].includes(method));assert.notDeepEqual(geometry(a),geometry(b),id+' must change geometry');checks++}
l=by('critical');s={...initial(l),n1:1,n2:1.5};drawScene(new Context,l,s,1);checks++;
for(const [id,patch] of [['incline',{}],['conduction',{dt:0}],['radiation',{t:300,ta:300}]]){l=by(id);s={...initial(l),...patch};let a=new Context,b=new Context;drawScene(a,l,s,0);drawScene(b,l,s,2);assert.deepEqual(a.calls,b.calls,id+' zero-driving case remains stationary');checks++}
console.log(`PASS: ${newAnimatedIds.size} new animated labs; ${checks} replay, sign, cooling, collision momentum/energy and real Canvas geometry checks.`);
