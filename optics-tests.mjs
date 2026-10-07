import assert from 'node:assert/strict';
import {chapters,initial} from './content.mjs';
import {lensOutline,mirrorPoints,opticalImage} from './optics.mjs';
const by=id=>chapters.flatMap(c=>c.labs).find(l=>l.id===id),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const convex of [true,false]){const p=lensOutline(convex,0,0,100),centre=Math.abs(p[20][0]),edge=Math.abs(p[0][0]);assert.equal(centre>edge,convex);for(const [x,y] of p)assert.ok(Number.isFinite(x)&&Number.isFinite(y));near(p[20][0],-p[61][0]);}
assert.ok(mirrorPoints(true)[0][0]<400);assert.ok(mirrorPoints(false)[0][0]>400);
let checks=0;
for(const id of ['lens','diverging','mirror','convexmirror']){const l=by(id);for(const u of [5,10,15,30,70,100])for(const f of id==='diverging'||id==='convexmirror'?[-5,-15,-40]:[5,15,40]){let m=opticalImage(l,{u,f});if(u===f){assert.equal(m.infinite,true);continue}near(1/f,1/u+1/m.v);near(m.m,-m.v/u);assert.equal(m.real,m.v>0);if(f<0){assert.equal(m.real,false);assert.ok(m.m>0&&m.m<1)}else if(u>f)assert.ok(m.m<0);else assert.ok(m.m>1);checks++}}
const plane=opticalImage({id:'plane'},{u:30});near(plane.v,-30);near(plane.m,1);assert.equal(plane.real,false);
for(const n of [1,1.33,1.5,2])for(const d of [.1,1,5])near(by('depth').compute({n,d})*n,d);
console.log(`PASS: ${checks} image models, real/virtual orientation, thin-lens identity, concave/convex silhouettes, plane mirror symmetry and apparent depth.`);
