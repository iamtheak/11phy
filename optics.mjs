export const imageOpticsIds=new Set(['lens','diverging','mirror','convexmirror','depth']);
// Silhouettes are schematic: curvature is not a lens-maker calculation.
export function lensOutline(convex=true,cx=400,cy=190,height=130){
 const half=t=>convex?3+22*(1-t*t):7+17*t*t;
 const points=[];for(let i=0;i<=40;i++){let t=-1+i/20;points.push([cx-half(t),cy+t*height])}for(let i=40;i>=0;i--){let t=-1+i/20;points.push([cx+half(t),cy+t*height])}return points;
}
export const svgPath=points=>points.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')+' Z';
export function opticalImage(l,s){
 if(l.id==='plane')return {v:-s.u,m:1,real:false,mirror:true,infinite:false};
 const v=l.compute(s);return {v,m:-v/s.u,real:v>0,mirror:l.kind==='mirror',infinite:!Number.isFinite(v)};
}
export function mirrorPoints(concave=true,cx=400,cy=190,height=130){return Array.from({length:41},(_,i)=>{let t=-1+i/20;return [cx+(concave?-1:1)*28*t*t,cy+t*height]})}
