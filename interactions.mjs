const rad = x => x * Math.PI / 180;
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function normalize(lab, key, value) {
  const p = lab.params.find(p => p.key === key);
  if (!p || !Number.isFinite(value)) return null;
  return Number(clamp(p.min + Math.round((clamp(value, p.min, p.max) - p.min) / p.step) * p.step, p.min, p.max).toFixed(9));
}
export function normalizedPatch(lab, patch) {
  return Object.fromEntries(Object.entries(patch).map(([k,v]) => [k,normalize(lab,k,v)]).filter(([,v]) => v !== null));
}
export function scenePoint(rect, clientX, clientY) {
  return {x:(clientX-rect.left)*840/rect.width,y:(clientY-rect.top)*370/rect.height};
}
export function opticalScale(lab) {
  return 190 / Math.max(lab.params.find(p=>p.key==='u')?.max || 40, (lab.params.find(p=>p.key==='f')?.max || 15)*2, 40);
}
export function handlesFor(l,s,time=0) {
  const h=(id,label,x,y,patch,keys,release=false)=>({id,label,x,y,patch,keys,release});
  const polar=(x,y,cx,cy)=>({length:Math.hypot(x-cx,cy-y),angle:Math.atan2(cy-y,x-cx)*180/Math.PI});
  if(l.kind==='vectors')return [
    h('a','Drag vector A',245+s.a*7,225,(x)=>({a:(x-245)/7}),['a']),
    h('b','Drag vector B',245+s.b*Math.cos(rad(s.theta))*7,225-s.b*Math.sin(rad(s.theta))*7,(x,y)=>{const p=polar(x,y,245,225);return {b:p.length/7,theta:p.angle}},['b','theta'])
  ];
  if(l.kind==='components')return [h('tip','Drag vector tip',245+s.a*Math.cos(rad(s.theta))*7,225-s.a*Math.sin(rad(s.theta))*7,(x,y)=>{const p=polar(x,y,245,225);return {a:p.length/7,theta:p.angle}},['a','theta'])];
  if(l.kind==='projectile')return [h('launch','Drag launch velocity',55+s.u*Math.cos(rad(s.theta))*4,275-s.u*Math.sin(rad(s.theta))*4,(x,y)=>{const p=polar(x,y,55,275);return {u:p.length/4,theta:p.angle}},['u','theta'],true)];
  if(l.kind==='spring')return [h('mass','Pull and release the spring mass',255,160+s.x*150*Math.cos(time*Math.sqrt(s.k/s.m)),(x,y)=>({x:Math.abs(y-160)/150}),['x'],true)];
  if(['lens','mirror'].includes(l.kind)&&s.u!==undefined)return [h('object','Drag the object',255-s.u*opticalScale(l),150,(x)=>({u:(255-x)/opticalScale(l)}),['u'])];
  if(l.id==='snell')return [h('ray','Drag incident ray',255-120*Math.sin(rad(s.i)),180-120*Math.cos(rad(s.i)),(x,y)=>({i:Math.atan2(255-x,180-y)*180/Math.PI}),['i'])];
  if(['charges','gravity'].includes(l.kind)&&s.r!==undefined)return [h('charge','Drag separation',180+280*(s.r-l.params.find(p=>p.key==='r').min)/(l.params.find(p=>p.key==='r').max-l.params.find(p=>p.key==='r').min),180,(x)=>{let p=l.params.find(p=>p.key==='r');return {r:p.min+(x-180)/280*(p.max-p.min)}},['r'])];
  if(l.kind==='torque')return [h('lever','Drag lever end',145+s.r*65,210,(x)=>({r:(x-145)/65}),['r'])];
  if(l.id==='capacitance')return [h('plate','Drag capacitor plate',205+s.d*20,185,(x)=>({d:(x-205)/20}),['d'])];
  if(l.kind==='flux')return [h('normal','Drag surface normal',255+90*Math.cos(rad(s.theta)),190-90*Math.sin(rad(s.theta)),(x,y)=>({theta:Math.atan2(190-y,x-255)*180/Math.PI}),['theta'])];
  return [];
}
export function freeFall(height, gravity, elapsed, mass=1) {
  const duration=Math.sqrt(2*Math.max(0,height)/gravity),time=clamp(elapsed,0,duration);
  const y=elapsed>=duration?0:Math.max(0,height-.5*gravity*time*time),speed=gravity*time;
  return {height:y,speed,time,duration,landed:elapsed>=duration,pe:mass*gravity*y,ke:.5*mass*speed*speed};
}
