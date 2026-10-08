import assert from 'node:assert/strict';
import {chapters,initial} from './content.mjs';
import {handlesFor,normalizedPatch,scenePoint,freeFall,quarkPosition} from './interactions.mjs';
const labs=chapters.flatMap(c=>c.labs),by=id=>labs.find(l=>l.id===id);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let supported=0,checks=0;
for(const [x,y] of [[255,180],[1000,1000],[-100,-100],[255,125]]){
 const p=quarkPosition(x,y);assert.ok(Math.hypot(p.x-255,p.y-180)<=65+1e-8);
}
for(const l of labs){const s=initial(l);for(const h of handlesFor(l,s)){
  supported++;const p=normalizedPatch(l,h.patch(h.x,h.y));for(const key of h.keys)near(p[key],s[key]);
  for(const [x,y] of [[-100,-100],[840,370],[10000,10000]]){const patch=normalizedPatch(l,h.patch(x,y));for(const [key,value] of Object.entries(patch)){let p=l.params.find(p=>p.key===key);assert.ok(value>=p.min&&value<=p.max);assert.ok(Number.isFinite(value));checks++}}
}}
const vec=by('vector'),tip=handlesFor(vec,initial(vec))[1];let v=normalizedPatch(vec,tip.patch(245,155));assert.equal(v.b,10);assert.equal(v.theta,90);near(vec.compute({...initial(vec),...v}),Math.sqrt(164));
const spring=by('spring'),mass=handlesFor(spring,initial(spring))[0];assert.equal(normalizedPatch(spring,mass.patch(255,205)).x,.3);
assert.deepEqual(scenePoint({left:10,top:20,width:420,height:185},220,112.5),{x:420,y:185});
for(let h of [.1,1,6,10])for(let g of [1,1.6,9.8,20])for(let m of [.5,1,10]){
  let T=Math.sqrt(2*h/g);for(let t of [0,T/4,T/2,T,T+10]){const f=freeFall(h,g,t,m);near(f.pe+f.ke,m*g*h);assert.ok(f.height>=0);assert.ok(f.time<=T);if(t>=T){assert.equal(f.landed,true);near(f.height,0);near(f.speed,Math.sqrt(2*g*h))}checks++}
  near(freeFall(h,g,T/2,.5).height,freeFall(h,g,T/2,10).height);
}
console.log(`PASS: ${supported} draggable handles, coordinate scaling, snapping and bounds; ${checks} direct-manipulation/free-fall checks including conserved energy and mass-independent acceleration.`);
