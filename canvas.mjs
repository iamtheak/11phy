import {prepareWithSegments,layoutNextLineRange,materializeLineRange,layoutWithLines} from '@chenglou/pretext';
import {extra} from './content.mjs';
import {animationFrame,newAnimatedIds} from './animation.mjs';
import {drawDC,dcIds} from './electricity.mjs';
import {lensOutline,mirrorPoints} from './optics.mjs';
import {opticalScale} from './interactions.mjs';
const rad=x=>x*Math.PI/180;
export const fmt=n=>!Number.isFinite(n)?(Number.isNaN(n)?'No transmitted ray':'∞'):Math.abs(n)<1e-12&&n!==0?n.toExponential(3):Math.abs(n)>=10000?n.toExponential(3):Math.abs(n)>0&&Math.abs(n)<.001?n.toExponential(3):Number(n.toPrecision(4)).toString();
const prepared=new Map();
function textBlock(ctx,text,x,y,w,maxRows=14,obstacle=null){
 const font='15px system-ui';ctx.font=font;ctx.fillStyle='#344f51';
 let key=font+text,pr=prepared.get(key);if(!pr){pr=prepareWithSegments(text,font);prepared.set(key,pr);if(prepared.size>100)prepared.delete(prepared.keys().next().value)}
 let cursor={segmentIndex:0,graphemeIndex:0};
 for(let row=0;row<maxRows;row++){
  const yy=y+row*22;let ww=w;
  if(obstacle){let dy=yy-7-obstacle.y;if(Math.abs(dy)<obstacle.r+10)ww=Math.max(80,obstacle.x-x-Math.sqrt(Math.max(0,(obstacle.r+10)**2-dy*dy)))}
  const range=layoutNextLineRange(pr,cursor,ww);if(!range)break;
  const line=materializeLineRange(pr,range);ctx.fillText(line.text,x,yy);cursor=range.end;
 }
}
function line(c,x,y,X,Y,color='#8dadaa',width=2,dash=[]){c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();c.setLineDash([])}
function arrow(c,x,y,X,Y,color='#117c72',label=''){line(c,x,y,X,Y,color,2.5);let a=Math.atan2(Y-y,X-x);c.fillStyle=color;c.beginPath();c.moveTo(X,Y);c.lineTo(X-11*Math.cos(a-.4),Y-11*Math.sin(a-.4));c.lineTo(X-11*Math.cos(a+.4),Y-11*Math.sin(a+.4));c.closePath();c.fill();if(label)tag(c,label,(x+X)/2+6,(y+Y)/2-9,color)}
function circle(c,x,y,r,color='#157d72',fill=true){c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2);if(fill){c.fillStyle=color;c.fill()}else{c.strokeStyle=color;c.lineWidth=2;c.stroke()}}
function tag(c,text,x,y,color='#506b6a'){c.font='13px system-ui';c.fillStyle=color;c.fillText(text,x,y)}
function box(c,x,y,w,h,color='#cfe4df'){c.fillStyle=color;c.fillRect(x,y,w,h)}
function axes(c,x=55,y=260,w=365,h=205){line(c,x,y,x+w,y);line(c,x,y,x,y-h);tag(c,'0',x-15,y+17)}
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export function liveSentence(l,s){let v=l.compute(s),description=`${l.result} is ${fmt(v)} ${l.unit}.`;
 if(l.id==='snell'||l.id==='prism')description=Number.isNaN(v)?'Total internal reflection: no ray emerges in this model.':`${l.result} is ${fmt(v)}°. The direction changes as the indices and angles change.`;
 if(['mirror','convexmirror','lens','diverging'].includes(l.id))description=!Number.isFinite(v)?'The object is at the focus. Parallel rays give an image at infinity.':`${v>0?'Real, inverted':'Virtual, upright'} image: distance ${fmt(v)} cm; magnification ${fmt(-v/s.u)}×.`;
 if(l.id==='incline')description=v===0?'The block remains at rest. Static friction balances the downhill component of weight.':`The block slides. Kinetic friction leaves a downhill acceleration of ${fmt(v)} m/s².`;
 if(['coulomb','medium'].includes(l.id))description=`The interaction is ${v<0?'attractive':v>0?'repulsive':'zero'}, with magnitude ${fmt(Math.abs(v))} N.`;
 if(l.id==='quarks')description=`${s.up} up and ${3-s.up} down quarks give charge ${fmt(v)}e. ${s.up===2?'This is a proton.':s.up===1?'This is a neutron.':'This valence combination is not a stable proton or neutron.'}`;
 if(l.id==='doping')description=`Dopant density is ${fmt(v)} m⁻³. ${s.type===0?'Donors make electrons the majority carriers (n-type).':'Acceptors make holes the majority carriers (p-type).'} Overall charge neutrality is preserved.`;
 if(l.id==='latent')description=`${fmt(s.fraction*100)}% has melted after absorbing ${fmt(s.fraction*s.m*334000)} J. While ice and water coexist, temperature stays at 0°C.`;
 if(l.id==='dimensions')description=`Your dimension is M^${s.a} L^${s.b} T^${s.c}. ${s.a===1&&s.b===1&&s.c===-2?'It matches force.':s.a===1&&s.b===2&&s.c===-2?'It matches energy.':s.a===1&&s.b===1&&s.c===-1?'It matches momentum.':'Compare the exponents with the definition of the quantity.'}`;
 if(l.id==='radiation')description=`Net power is ${fmt(v)} W: ${v<0?'energy enters the surface':v>0?'energy leaves the surface':'radiative equilibrium'}.`;
 return description;
}
export const isAnimated = l => newAnimatedIds.has(l.id) || ['projectile','circle','orbit','spring','motion','relative','gas','universe','measure'].includes(l.kind) || (l.kind==='circuit' && l.id!=='capseries') || l.id==='redshift';

function glassShape(c,convex,cx,cy,height){const points=lensOutline(convex,cx,cy,height);c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle='rgba(148,202,212,.4)';c.fill();c.strokeStyle='#527f7c';c.lineWidth=2;c.stroke()}
function curvedMirror(c,concave,cx,cy,height){const points=mirrorPoints(concave,cx,cy,height);for(const offset of [6,0]){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x+offset,y):c.moveTo(x+offset,y));c.strokeStyle=offset?'#bdcec6':'#527f7c';c.lineWidth=offset?4:3;c.stroke()}}
function traceRay(c,points,time,color='#d5a155'){
 let lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0),distance=(time%3)/3*total;
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){let f=lengths[i]?distance/lengths[i]:0;circle(c,points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f,6,color);break}distance-=lengths[i]}
}
export function drawScene(c,l,s,time=0,view3d=false,hide=false,electrical={}){
 const W=840,H=370;c.clearRect(0,0,W,H);c.fillStyle='#f2f7f4';c.fillRect(0,0,W,H);
 for(let x=20;x<520;x+=25)for(let y=20;y<H;y+=25)circle(c,x,y,.7,'#cfddda');
 c.save();c.beginPath();c.rect(0,0,520,370);c.clip();
 const x0=70,y0=245,mid=245,top=50,phase=time;let v=l.compute(s),kind=l.kind;
 if(kind==='projectile'){
  let T=2*s.u*Math.sin(rad(s.theta))/s.g,range=v,peak=s.u*s.u*Math.sin(rad(s.theta))**2/(2*s.g);axes(c,55,275,400,205);tag(c,'horizontal distance / m',275,305);tag(c,'height / m',60,40);
  const sx=380/Math.max(1,range),sy=Math.min(200/Math.max(1,peak),sx),point=t=>[55+s.u*Math.cos(rad(s.theta))*t*sx,275-(s.u*Math.sin(rad(s.theta))*t-.5*s.g*t*t)*sy];
  if(!hide){c.beginPath();for(let i=0;i<=100;i++){let [x,y]=point(T*i/100);i?c.lineTo(x,y):c.moveTo(x,y)}c.strokeStyle='#87b9aa';c.lineWidth=2;c.stroke()}
  arrow(c,55,275,55+s.u*Math.cos(rad(s.theta))*4,275-s.u*Math.sin(rad(s.theta))*4,'#d98d35','launch velocity');
  let t=phase%(T+.8);t=Math.min(t,T);let [x,y]=point(t);circle(c,x,y,8);tag(c,`t = ${fmt(t)} s`,60,330);if(!hide)tag(c,`range ${fmt(range)} m · peak ${fmt(peak)} m`,220,330);
 }else if(['vectors','components'].includes(kind)){
  axes(c,245,225,210,180);line(c,30,225,245,225);line(c,245,225,245,335);let scale=7,a=s.a,b=s.b||0,theta=rad(s.theta);
  arrow(c,245,225,245+a*scale,225,'#117c72','A');
  if(kind==='components'){let x=245+a*Math.cos(theta)*scale,y=225-a*Math.sin(theta)*scale;arrow(c,245,225,x,y,'#d98d35','vector');line(c,x,y,x,225,'#98abaa',1,[5,5]);line(c,x,y,245,y,'#98abaa',1,[5,5]);tag(c,`Aₓ ${fmt(v)} N`,80,320);tag(c,`Aᵧ ${fmt(a*Math.sin(theta))} N`,285,320)}
  else{let X=245+b*Math.cos(theta)*scale,Y=225-b*Math.sin(theta)*scale;arrow(c,245,225,X,Y,'#d98d35','B');line(c,245+a*scale,225,245+a*scale+b*Math.cos(theta)*scale,Y,'#b8c8c1',1,[5,5]);if(!hide)arrow(c,245,225,245+a*scale+b*Math.cos(theta)*scale,Y,'#8166b4','R')}
 }else if(['circle','orbit'].includes(kind)){
  let rr=kind==='orbit'?clamp(70+(s.h||0)/550,70,145):clamp((s.r||2)*14,55,145),cx=255,cy=185,omega=kind==='circle'?(s.omega||s.v/s.r):.6,a=time*omega;
  c.strokeStyle='#accfc0';c.lineWidth=2;c.beginPath();c.ellipse(cx,cy,rr,view3d?rr*.4:rr,0,0,Math.PI*2);c.stroke();
  circle(c,cx,cy,kind==='orbit'?32:4,kind==='orbit'?'#63929d':'#91aca4');
  let x=cx+rr*Math.cos(a),y=cy-(view3d?.4:1)*rr*Math.sin(a);circle(c,x,y,9);if(kind==='circle'){arrow(c,x,y,x-40*Math.sin(a),y-40*Math.cos(a)*(view3d?.4:1),'#d98d35','v');arrow(c,x,y,cx+(x-cx)*.5,cy+(y-cy)*.5,'#117c72','inward')}
  tag(c,kind==='orbit'?'Earth · circular orbit · time compressed':'Velocity is tangent; acceleration is inward',55,335);if(kind==='orbit')tag(c,`altitude ${fmt(s.h)} km`,60,40);
 }else if(kind==='spring'){
  let amp=s.x*150,y=140+amp*Math.cos(time*Math.sqrt(s.k/s.m));box(c,220,35,70,8,'#899f98');line(c,255,43,255,55);c.beginPath();c.moveTo(255,55);for(let i=0;i<20;i++)c.lineTo(255+(i%2?12:-12),55+(y-55)*i/20);c.lineTo(255,y);c.strokeStyle='#117c72';c.lineWidth=2;c.stroke();box(c,225,y,60,40,'#d4a14b');if(Math.abs(y-140)>1e-8)arrow(c,340,y+20,340,160,'#117c72','restoring');line(c,150,160,370,160,'#a7bfb3',1,[5,5]);tag(c,'Ideal oscillation about equilibrium',90,325);
 }else if(kind==='motion'){
  axes(c);let maxT=10,vs=[s.u,s.u+s.a*maxT],minV=Math.min(0,...vs),maxV=Math.max(1,...vs),span=maxV-minV;let yy=z=>260-(z-minV)/span*190;line(c,55,yy(s.u),420,yy(s.u+s.a*10),'#117c72',3);line(c,55,yy(0),420,yy(0),'#c5d6d0',1);let t=Math.min(time%(s.t+.8),s.t);circle(c,55+t/10*365,yy(s.u+s.a*t),7,'#d98d35');tag(c,`animation t = ${fmt(t)} s`,270,65);tag(c,'velocity / m/s',55,40);tag(c,'time / s',365,290);tag(c,`u ${fmt(s.u)} → v ${fmt(s.u+s.a*s.t)} m/s`,70,325);
 }else if(['force','work','torque','incline','relative','collision','energy'].includes(kind)){
  if(l.id==='incline'){let f=animationFrame(l,s,time),theta=rad(s.theta),length=280,tx=95+length*Math.cos(theta),ty=290-length*Math.sin(theta),fraction=f.distance/4;line(c,95,290,tx,ty,'#8fa89b',4);let bx=tx-fraction*length*Math.cos(theta)-18*Math.sin(theta),by=ty+fraction*length*Math.sin(theta)-18*Math.cos(theta);c.save();c.translate(bx,by);c.rotate(-theta);box(c,-23,-18,46,36,'#d9a955');c.restore();arrow(c,bx,by,bx,by+60,'#bd7352','mg');tag(c,f.stationary?'Static friction: block stays at rest':'Sliding down an illustrative 4 m ramp',55,35);if(!hide)tag(c,`distance ${fmt(f.distance)} m · speed ${fmt(f.velocity)} m/s`,55,335)}
  else if(kind==='incline'){let theta=rad(s.theta),x=120,y=260,xx=450,yy=260-300*Math.sin(theta);line(c,x,y,xx,yy,'#8fa89b',4);let bx=(x+xx)*.55,by=(y+yy)*.5-14;c.save();c.translate(bx,by);c.rotate(-theta);box(c,-23,-23,46,35,'#d9a955');c.restore();arrow(c,bx,by,bx,by+65,'#bd7352','mg');tag(c,l.id==='bank'?'banked road cross-section':v===0?'Static friction balances the slope':'Sliding with kinetic friction',60,330)}
  else if(kind==='torque'){circle(c,145,210,8);line(c,145,210,145+s.r*65,210,'#8ba39a',8);let end=145+s.r*65;arrow(c,end,210,end+65*Math.cos(rad(s.theta)),210-65*Math.sin(rad(s.theta)),'#117c72','F');tag(c,'pivot',120,240)}
  else if(kind==='collision'){
   let f=animationFrame(l,s,time),w1=25+s.m1*4,w2=25+s.m2*4,m=s.m1+s.m2,separation=f.approaching?f.separation*5:60,sign=f.side,c1=255-sign*(s.m2/m)*separation,c2=255+sign*(s.m1/m)*separation;
   let x1=sign>0?c1-w1:c1,x2=sign>0?c2:c2-w2;
   line(c,45,255,480,255,'#8fa89b',3);box(c,x1,210,w1,45,'#117c72');box(c,x2,210,w2,45,'#d9a955');tag(c,`m₁ ${s.m1} kg`,x1,285);tag(c,`m₂ ${s.m2} kg`,x2,305);
   if(!f.joined){arrow(c,x1+w1/2,195,x1+w1/2+(s.u1-f.velocity)*7,195,'#117c72');arrow(c,x2+w2/2,175,x2+w2/2+(s.u2-f.velocity)*7,175,'#d09d4c')}
   tag(c,!f.approaching?'Equal velocities: no approach':f.joined?'After contact: joined mass at rest in COM frame':'Before contact: bodies approach',45,45);tag(c,'Centre-of-mass view · positions compressed',45,335);
   if(!hide)tag(c,`Lab-frame final v = ${fmt(f.velocity)} m/s`,65,85);
  }
  else if(kind==='relative'){let t=time%5;box(c,250+s.v1*t*1.3,120,40,30,'#117c72');box(c,250+s.v2*t*1.3,220,40,30,'#d9a955');tag(c,'Object 1',45,140);tag(c,'Observer',45,240);tag(c,`relative velocity ${fmt(v)} m/s`,90,330)}
  else if(kind==='energy'){
   let f=animationFrame(l,s,time),x=75+340*Math.tanh(.5*s.v/s.t*f.t*f.t/20);circle(c,x,205,20+s.m,'#d5a45b');arrow(c,x,155,x+f.velocity*6,155,'#117c72','v');line(c,45,250,480,250);tag(c,'Uniform acceleration from rest · distance compressed',45,335);if(!hide){tag(c,`speed ${fmt(f.velocity)} m/s`,65,55);tag(c,`Eₖ now ${fmt(f.energy)} J`,65,85);box(c,75,285,340*f.fraction*f.fraction,10,'#117c72')}
  }
  else if(l.id==='newton'){
   let f=animationFrame(l,s,time),x=255+175*Math.tanh(f.position/35);line(c,45,255,480,255,'#829c91',3);box(c,x-30,195,60,60,'#d9a955');if(s.f!==0)arrow(c,x,170,x+clamp(s.f*2,-90,90),170,'#117c72','F net');tag(c,'Released from rest · compressed position scale',45,335);if(!hide){tag(c,`t ${fmt(f.t)} s · displacement ${fmt(f.position)} m`,45,55);tag(c,`velocity ${fmt(f.velocity)} m/s`,45,85)}
  }
  else if(l.id==='work'){
   let f=animationFrame(l,s,time),x=75+f.distance*17,angle=rad(s.theta);line(c,45,255,480,255,'#829c91',3);box(c,x-25,205,50,50,'#d9a955');if(s.f>0)arrow(c,x,185,x+Math.cos(angle)*75,185-Math.sin(angle)*75,'#117c72','F');tag(c,'Prescribed motion: demonstrates work, not acceleration',35,335);if(!hide){tag(c,`displacement ${fmt(f.distance)} / ${fmt(s.s)} m`,45,50);tag(c,`work so far ${fmt(f.work)} J`,45,80)}
  }
  else{line(c,50,255,470,255,'#829c91',3);box(c,190,190,70,65,'#d9a955');let angle=kind==='work'?rad(s.theta):0,force=s.f??s.v??10;arrow(c,225,185,225+clamp(force*2,-140,150)*Math.cos(angle),185-110*Math.sin(angle),'#117c72','F');tag(c,'Schematic · sizes and arrows are illustrative',65,330)}
 }else if(l.id==='thermalstress'){
  box(c,75,100,30,160,'#839c8d');box(c,415,100,30,160,'#839c8d');box(c,105,160,310,35,'#c7decf');arrow(c,150,145,250,145,'#ce9d56');arrow(c,370,145,270,145,'#ce9d56');tag(c,'Fixed supports prevent expansion',110,60);tag(c,`Compressive stress ${fmt(v)} MPa`,120,325);
 }else if(['wire','expansion'].includes(kind)){
  let delta=kind==='expansion'?clamp(Math.abs(v)*12,0,120):clamp(Math.abs(v)*.5,0,100);box(c,75,145,260,35,'#a7c6b7');box(c,335,145,delta,35,'#d9a955');line(c,335,125,335,210,'#7d9e8c',1,[5,5]);arrow(c,335+delta,160,440,160,'#117c72','load / expansion');tag(c,kind==='wire'?'Uniform wire · deformation exaggerated':'Original size + exaggerated expansion',55,320);tag(c,`change / stress ${fmt(v)} ${l.unit}`,80,90);
 }else if(['thermometer','mixing','heat','phase','cooling','conduction','radiation'].includes(kind)){
  if(kind==='conduction'){box(c,65,90,80,170,'#e1aa62');box(c,365,90,80,170,'#85b0bc');let gradient=c.createLinearGradient(150,0,360,0);gradient.addColorStop(0,'#eac999');gradient.addColorStop(1,'#adcfd4');box(c,150,90,210,170,gradient);if(s.dt>0)for(let y=120;y<260;y+=45)arrow(c,190,y,320,y,'#117c72');tag(c,s.dt>0?'HOT':'Equal T',75,70);tag(c,s.dt>0?'COLD':'Equal T',380,70);if(s.dt>0){let speed=20+Math.min(100,Math.log1p(v)*12);for(let i=0;i<8;i++)circle(c,155+((time*speed+i*23)%195),115+(i%4)*38,5,'#d5a155')}tag(c,'Steady heat flow · marker speed schematic',55,330)}
  else if(kind==='mixing'){for(let i=0;i<2;i++){let t=i?s.t2:s.t1;box(c,85+i*235,115,120,140,`hsl(${200-t*1.7} 38% 70%)`);tag(c,`${fmt(t)}°C`,105+i*235,100)}arrow(c,210,180,320,180);tag(c,`equilibrium ${fmt(v)}°C`,150,310)}
  else if(kind==='phase'){box(c,160,90,180,190,'#c8e0e3');for(let i=0;i<Math.round((1-s.fraction)*18);i++)box(c,170+(i%5)*31,250-Math.floor(i/5)*32,25,25,'#f4fbfc');tag(c,'Ice + water at 0°C',170,65);tag(c,`${fmt(s.fraction*100)}% melted`,180,315)}
  else if(kind==='radiation'){circle(c,255,180,60,'#d5a15b');for(let i=0;i<12;i++){let a=i*Math.PI/6,x=255+70*Math.cos(a),y=180+70*Math.sin(a),X=255+105*Math.cos(a),Y=180+105*Math.sin(a);v>=0?arrow(c,x,y,X,Y,'#d49a4d'):arrow(c,X,Y,x,y,'#d49a4d')}if(v!==0)for(let i=0;i<12;i++){let a=i*Math.PI/6,r=v>0?65+(time*30%80):145-(time*30%80);circle(c,255+r*Math.cos(a),180+r*Math.sin(a),4,'#d49a4d')}tag(c,'Net exchange · marker speed schematic',95,320)}
  else{let temp=kind==='thermometer'?(s.c??v):kind==='cooling'?animationFrame(l,s,time).temperature:20+(s.dt||0);box(c,226,60,35,230,'#dce9e2');let f=clamp((temp+50)/200,.02,1);box(c,233,285-f*210,21,f*210,'#d19a52');circle(c,244,295,24,'#d19a52');if(!hide)tag(c,`${fmt(temp)} °C`,300,140);if(kind==='cooling')tag(c,`replay ${fmt(animationFrame(l,s,time).t)} / ${fmt(s.t)} min`,65,35);tag(c,kind==='cooling'?'Cooling interval compressed into six playback seconds':kind==='heat'?'Energy raises temperature without phase change':'Scale / temperature is linked to the controls',70,345)}
 }else if(kind==='gas'){
  let volume=s.v||20,size=clamp(120+volume*3,150,300);box(c,70,60,size,230,'#e6eee7');c.strokeStyle='#87a995';c.strokeRect(70,60,size,230);let speed=Math.sqrt((s.t||300)/300);for(let i=0;i<30;i++){let xx=70+8+((i*67+time*25*speed*(i%2?1:-1))%(size-16)+(size-16))%(size-16),yy=68+((i*41+time*18*speed*(i%3?1:-1))%214+214)%214;circle(c,xx,yy,4,'#278c7d')}tag(c,'Particles are a qualitative illustration',75,330);tag(c,`T ${fmt(s.t)} K`,85,45);
 }else if(kind==='lens'&&['power','achromat'].includes(l.id)){
  let power=l.id==='power'?v:s.p1+v,cx=245,cy=185;line(c,30,cy,500,cy,'#a9bdae',1);glassShape(c,s.p1>=0,cx-18,cy,120);glassShape(c,(l.id==='power'?s.p2:v)>=0,cx+18,cy,120);tag(c,`Combined power ${fmt(power)} D`,120,40);
  for(let y of [125,185,245]){arrow(c,40,y,cx,y,'#d2a154');if(power===0)arrow(c,cx,y,480,y,'#117c72');else if(power>0)arrow(c,cx,y,420,cy,'#117c72');else{arrow(c,cx,y,475,y+(y-cy)*.8,'#117c72');line(c,cx,y,120,cy,'#117c72',1,[5,5])}}
  tag(c,'Schematic beam · numerical focal length below',65,340);
 }else if(['lens','mirror'].includes(kind)){
  let f=s.f??(s.r?s.r/2:s.p1?100/s.p1:15),u=s.u||30,iv=['mirror','convexmirror','lens','diverging'].includes(l.id)?v:f*30/(30-f),cx=255,cy=210,max=Math.max(Math.abs(u),Math.abs(f)*2,Number.isFinite(iv)?Math.min(Math.abs(iv),180):0,40),scale=opticalScale(l);
  line(c,25,cy,500,cy,'#93afa0',1);if(kind==='lens')glassShape(c,f>0,cx,cy,125);else curvedMirror(c,f>0,cx,cy,125);tag(c,kind==='lens'?(f>0?'convex lens':'concave lens'):(f>0?'concave mirror':'convex mirror'),cx-48,32);let ox=cx-u*scale,oy=cy-60;arrow(c,ox,cy,ox,oy,'#d69c49','object');
  for(let sign of kind==='mirror'?[f>0?-1:1]:[-1,1]){circle(c,cx+sign*Math.abs(f)*scale,cy,3,'#9baa90');tag(c,'F',cx+sign*Math.abs(f)*scale-4,cy+18)}
  if(!hide){
   let ix=kind==='lens'?cx+iv*scale:cx-iv*scale,iy=cy+iv/u*60;
   line(c,ox,oy,cx,oy,'#cf9e50',2);
   if(Number.isFinite(iv)){let real=iv>0,rayDir=kind==='lens'?1:-1;let endX=cx+rayDir*230, slope=(iy-oy)/(ix-cx);traceRay(c,[[ox,oy],[cx,oy],[endX,clamp(oy+(endX-cx)*slope,-500,700)]],time);line(c,cx,oy,endX,clamp(oy+(endX-cx)*slope,-500,700),'#cf9e50',2);if(!real)line(c,cx,oy,ix,iy,'#cf9e50',1,[5,5]);
    if(kind==='lens'){let slope0=(cy-oy)/(cx-ox);line(c,ox,oy,490,cy+(490-cx)*slope0,'#659dae',2);if(!real)line(c,cx,cy,ix,iy,'#659dae',1,[5,5])}
    else{let focusX=cx-f*scale,slope=(cy-oy)/(focusX-ox),hit=oy+(cx-ox)*slope;line(c,ox,oy,cx,hit,'#659dae',2);line(c,cx,hit,20,hit,'#659dae',2);if(!real)line(c,cx,hit,ix,iy,'#659dae',1,[5,5])}
    if(ix>20&&ix<500&&Math.abs(iy-cy)<155)arrow(c,ix,cy,ix,iy,'#8269af','image');else tag(c,'Image lies outside this drawing',55,310);
   }else{let slope=(kind==='lens'?60:-60)/(f*scale);traceRay(c,[[ox,oy],[cx,oy],[kind==='lens'?500:20,oy+(kind==='lens'?245:-235)*slope]],time);line(c,cx,oy,kind==='lens'?500:20,oy+(kind==='lens'?245:-235)*slope,'#cf9e50',2);tag(c,'Parallel rays · image at infinity',60,315)}
  }
  tag(c,'Paraxial construction · dashed rays are extensions',45,350);
 }else if(kind==='snell'){
  let n1=s.n1,n2=s.n2,i=s.i??v;if(l.id==='critical')i=Number.isFinite(v)?v:0;box(c,40,180,450,160,'#d6e6e2');line(c,40,180,490,180,'#79a499',2);line(c,255,35,255,335,'#8fac9e',1,[6,6]);arrow(c,255-120*Math.sin(rad(i)),180-120*Math.cos(rad(i)),255,180,'#d3a254','incident');
  if(l.id==='critical'&&!Number.isFinite(v)){tag(c,'No critical angle: n₁ must exceed n₂',55,310)}else if(Number.isFinite(i)){const start=[255-120*Math.sin(rad(i)),180-120*Math.cos(rad(i))];if(Number.isNaN(v)){arrow(c,255,180,255+120*Math.sin(rad(i)),180-120*Math.cos(rad(i)),'#d3a254','reflected');if(!hide)traceRay(c,[start,[255,180],[255+120*Math.sin(rad(i)),180-120*Math.cos(rad(i))]],time)}else{let r=l.id==='critical'?90:v;arrow(c,255,180,255+130*Math.sin(rad(r)),180+130*Math.cos(rad(r)),'#117c72','transmitted');if(!hide)traceRay(c,[start,[255,180],[255+130*Math.sin(rad(r)),180+130*Math.cos(rad(r))]],time)}}
  tag(c,`n₁ = ${fmt(n1)} · n₂ = ${fmt(n2)}`,60,45);tag(c,'Angles measured from the dashed normal',65,355);
 }else if(['prism','dispersion'].includes(kind)){
  if(kind==='dispersion'){
   c.beginPath();c.moveTo(145,275);c.lineTo(255,60);c.lineTo(370,275);c.closePath();c.fillStyle='#d7e7df';c.fill();c.strokeStyle='#94bbae';c.stroke();arrow(c,35,170,198,170,'#d3a354');
   let colors=['#c86b60','#d89450','#e0c361','#68a678','#5d96b4','#6f7eb6','#976db2'];colors.forEach((color,i)=>line(c,315,185,480,210+i*10*(1+(s.difference||.02)*10),color,3));tag(c,'Schematic colours · red bends less',100,325);
  }else{
   let A=s.a,n=s.n,half=rad(A/2),tangent=Math.tan(half),tipY=55,baseY=300,cx=255,halfwidth=(baseY-tipY)*tangent;
   c.beginPath();c.moveTo(cx-halfwidth,baseY);c.lineTo(cx,tipY);c.lineTo(cx+halfwidth,baseY);c.closePath();c.fillStyle='#d7e7df';c.fill();c.strokeStyle='#94bbae';c.stroke();
   let i=s.i??(Math.asin(n*Math.sin(half))*180/Math.PI),r1=Math.asin(Math.sin(rad(i))/n),r2=rad(A)-r1,alpha=half-rad(i),beta=half-r1,hitY=180,hitX=cx-(hitY-tipY)*tangent;
   arrow(c,hitX-130*Math.cos(alpha),hitY-130*Math.sin(alpha),hitX,hitY,'#d3a354','incident');
   let t=(cx+(hitY-tipY)*tangent-hitX)/(Math.cos(beta)-Math.sin(beta)*tangent),exitX=hitX+t*Math.cos(beta),exitY=hitY+t*Math.sin(beta);line(c,hitX,hitY,exitX,exitY,'#d3a354',3);
   let z=n*Math.sin(r2);if(Math.abs(z)<=1){let gamma=-half+Math.asin(z);arrow(c,exitX,exitY,exitX+130*Math.cos(gamma),exitY+130*Math.sin(gamma),'#117c72','emerging')}else{let reflected=Math.PI-2*half-beta;arrow(c,exitX,exitY,exitX+70*Math.cos(reflected),exitY+70*Math.sin(reflected),'#d3a354','TIR')}
   tag(c,`A ${fmt(A)}° · incidence ${fmt(i)}°`,75,35);tag(c,l.id==='thinprism'?'Exact ray path; result uses thin-prism approximation':'Ray directions follow Snell’s law',70,345);
  }
 }else if(kind==='depth'){
  box(c,40,160,450,160,'#dae9e7');line(c,40,160,490,160,'#779e98');circle(c,260,270,8,'#d5a155');circle(c,260,160+110/s.n,6,'#846cb0');tag(c,'actual object',280,274);tag(c,'apparent object',280,160+110/s.n);line(c,260,270,340,160,'#c4a06a',2);line(c,340,160,400,70,'#c4a06a',2);line(c,340,160,260,160+110/s.n,'#846cb0',1,[5,5]);tag(c,'Near-normal viewing from air',70,335);
 }else if(l.id==='quantized'){
  box(c,120,80,280,220,'#dce9e0');for(let i=0;i<Math.min(s.n,60);i++)circle(c,135+(i%10)*25,105+Math.floor(i/10)*31,5,'#6d96ae');tag(c,`${s.n} added electrons · net negative charge`,90,335);
 }else if(l.id==='gradient'){
  axes(c);let X=80,Y=s.v1>s.v2?90:s.v1<s.v2?260:175,xx=400,yy=s.v1>s.v2?260:s.v1<s.v2?90:175;line(c,X,Y,xx,yy,'#117c72',3);tag(c,`V₁ ${s.v1} V`,65,65);tag(c,`V₂ ${s.v2} V`,345,285);if(v!==0)arrow(c,v>=0?100:420,315,v>=0?420:100,315,'#d3a259','E direction');else tag(c,'E = 0',220,315);tag(c,'Potential varies linearly across distance d',70,350);
 }else if(l.id==='potentialenergy'){
  for(let r of [55,95,130])circle(c,250,185,r,'#b7cbb8',false);circle(c,250,185,16,s.q<0?'#799fb5':'#d4a258');tag(c,`q = ${s.q} μC`,205,165);tag(c,`potential V = ${s.v} V`,175,40);tag(c,`U = qV = ${fmt(v)} J`,150,345);
 }else if(['charges','gravity','field','potential'].includes(kind)){
  let q=s.q??s.q1??1,q2=s.q2??1;
  if(['field','potential'].includes(kind)){circle(c,250,185,22,q<0?'#6c94b0':'#d4a158');tag(c,q===0?'0':q<0?'−':'+',245,190,'#fff');for(let i=0;i<(q===0?0:16);i++){let a=i*Math.PI/8,x=250+50*Math.cos(a),y=185+50*Math.sin(a),X=250+120*Math.cos(a),Y=185+120*Math.sin(a);q>=0?arrow(c,x,y,X,Y,'#8aa99f'):arrow(c,X,Y,x,y,'#8aa99f')}for(let r of [70,115])circle(c,250,185,r,'#b8cfbc',false);tag(c,'Radial field · concentric equipotentials',70,335)}
  else{let xx=100,p=l.params.find(p=>p.key==='r'),XX=p?180+280*(s.r-p.min)/(p.max-p.min):390;circle(c,xx,180,25,q<0?'#739cbb':'#d4a158');circle(c,XX,180,25,q2<0?'#739cbb':'#d4a158');tag(c,kind==='gravity'?'m₁':q===0?'0':q>0?'+':'−',xx-6,185,'#fff');tag(c,kind==='gravity'?'m₂':q2===0?'0':q2>0?'+':'−',XX-6,185,'#fff');let attractive=kind==='gravity'||v<0;if(v!==0){arrow(c,xx+30,180,xx+(attractive?100:-50),180);arrow(c,XX-30,180,XX+(attractive?-100:50),180)};tag(c,'Equal force magnitudes · opposite directions',65,335);tag(c,`separation ${fmt(s.r||0)} m`,170,245)}
 }else if(kind==='capacitor'){
  let right=l.id==='capacitance'?205+s.d*20:335;box(c,175,80,12,210,'#82b19e');box(c,right,80,12,210,'#82b19e');for(let i=0;i<6;i++){tag(c,'+',150,105+i*31,'#c29545');tag(c,'−',right+25,105+i*31,'#658fa6');if((s.v??v)>0)arrow(c,195,98+i*31,right-10,98+i*31,'#a6c3b3')}tag(c,'Large plates · edge effects omitted',90,330);
 }else if(kind==='flux'){
  for(let y=100;y<=270&&s.e!==0;y+=40)arrow(c,70,y,440,y,'#88ac9e');c.save();c.translate(255,190);c.rotate(-rad(s.theta));box(c,-5,-90,10,180,'#d3a65f');arrow(c,0,0,90,0,'#876fae','normal');c.restore();tag(c,'Angle is measured to the surface normal',70,330);
 }else if(dcIds.has(l.id)){
  drawDC(c,l,s,time,electrical);
 }else if(kind==='circuit'){
  let parallel=l.id==='parallel';line(c,100,100,400,100,'#86a89a',3);line(c,400,100,400,280,'#86a89a',3);line(c,400,280,100,280,'#86a89a',3);line(c,100,280,100,100,'#86a89a',3);box(c,180,85,130,30,'#f2f7f4');c.strokeStyle='#d5a35b';c.lineWidth=3;if(l.id==='capseries'){for(let X of [210,280]){line(c,X-5,80,X-5,120,'#117c72',3);line(c,X+5,80,X+5,120,'#117c72',3)}line(c,180,100,205,100);line(c,215,100,275,100);line(c,285,100,310,100)}else c.strokeRect(180,85,130,30);tag(c,parallel?`R₁ ${s.r1} Ω`:`${l.id==='capseries'?'capacitor series':l.id==='cell'?'load '+s.load+' Ω':'R '+(s.r||'')+' Ω'}`,193,105);box(c,80,170,40,45,'#f2f7f4');line(c,75,185,125,185,'#117c72',3);line(c,85,200,115,200,'#117c72',5);tag(c,`${fmt(s.v??s.emf??0)} V`,45,240);
  if(parallel){line(c,100,210,400,210);box(c,180,195,130,30,'#f2f7f4');c.strokeStyle='#d5a35b';c.strokeRect(180,195,130,30);tag(c,`R₂ ${s.r2} Ω`,195,215)}
  if(l.id!=='capseries')for(let i=0;i<6;i++)circle(c,120+((time*35+i*45)%250),280,4,'#d6a14e');tag(c,'Ideal DC model · charge motion schematic',65,335);
 }else if(kind==='nucleus'){
  let n=Math.min(s.a||12,70);for(let i=0;i<n;i++){let a=i*2.39996,r=Math.sqrt(i)*10;circle(c,255+r*Math.cos(a),180+r*Math.sin(a),9,i%2?'#7d9daf':'#d3a05a')}tag(c,'Schematic nucleons · not a microscopic trajectory',45,335);
 }else if(kind==='levels'){
  for(let n=1;n<=6;n++){let e=-13.6/(n*n),y=70-e/13.6*235;line(c,105,y,425,y,n===(s.n||s.lower)?'#d3a45e':'#9dbbaa',n===(s.n||s.lower)?4:2);tag(c,`n=${n}  ${fmt(e)} eV`,40,y+4)}tag(c,'0 eV · ionization limit',270,45);if(l.id==='transition'){let f=animationFrame(l,s,time),low=s.lower,up=s.lower+s.gap;arrow(c,280,70+235/up**2,280,70+235/low**2,'#d6a253','transition');circle(c,280,70+235/f.level**2,7,'#117c72');if(f.emitted&&!hide){let x=f.photonX,y=70+235/low**2;circle(c,x,y,5,'#d6a253');tag(c,`λ = ${fmt(f.wavelength)} nm`,315,335)}tag(c,'Slowed state sequence · no electron trajectory',45,355)}
 }else if(kind==='bands'){
  box(c,70,65,390,70,'#dae6de');box(c,70,220,390,70,'#cadde5');tag(c,'Conduction band',80,55);tag(c,'Valence band',80,315);tag(c,'Forbidden band gap',175,180);for(let i=0;i<10;i++)circle(c,90+i*35,(s.type===0?100:255),6,s.type===0?'#117c72':'#fff',s.type===0);tag(c,s.type===0?'n-type: electron majority':'p-type: hole majority',145,350);
 }else if(kind==='quarks'){
  circle(c,255,185,95,'#dfebe1');for(let i=0;i<3;i++){let a=i*Math.PI*2/3-Math.PI/2,x=255+50*Math.cos(a),y=185+50*Math.sin(a);circle(c,x,y,24,i<s.up?'#d5a152':'#7c9cae');tag(c,i<s.up?'u':'d',x-4,y+4,'#fff');tag(c,i<s.up?'+2e/3':'−e/3',x-20,y+43)}tag(c,`Net charge ${fmt(v)}e`,190,330);
 }else if(kind==='universe'){
  let scale=1+.025*(time%12);for(let i=0;i<16;i++){let a=i*2.39996,r=Math.sqrt(i)*25*scale,x=255+r*Math.cos(a),y=185+r*Math.sin(a);circle(c,x,y,i===0?8:4,i===0?'#d4a158':'#799eb0');if(i>0)arrow(c,x,y,255+(x-255)*1.12,185+(y-185)*1.12,'#aec8bd')}tag(c,'Expansion analogy · no preferred centre',80,335);
 }else if(kind==='spectrum'){
  if(l.id==='redshift'){let wavelength=s.emitted*s.ratio;for(let j=0;j<2;j++){let lam=j?wavelength:s.emitted,cY=120+j*120;c.beginPath();for(let x=40;x<490;x++){let y=cY+25*Math.sin((x-40)/(lam/40)-time*2);x===40?c.moveTo(x,y):c.lineTo(x,y)}c.strokeStyle=j?'#c2914f':'#7498ad';c.lineWidth=2;c.stroke();tag(c,`${j?'observed':'emitted'} ${fmt(lam)} nm`,60,cY-40)}}else{axes(c);let peak=v,max=peak*3;let f=x=>x<=0?0:1/(x**5*Math.expm1(14.38776877/(x*(s.t/1000)))),norm=f(peak);c.beginPath();for(let i=1;i<=200;i++){let x=max*i/200,y=260-190*f(x)/norm;i===1?c.moveTo(55+x/max*365,y):c.lineTo(55+x/max*365,y)}c.strokeStyle='#c3924c';c.lineWidth=3;c.stroke();tag(c,'Relative radiance vs wavelength / μm',65,325);tag(c,`peak ${fmt(peak)} μm`,240,65)}
 }else if(kind==='area'){
  let sc=2;box(c,80,95,s.l*sc,s.b*sc,'#cde2d6');tag(c,`length ${s.l} ± ${s.dl} m`,100,65);tag(c,`breadth ${s.b} ± ${s.db} m`,85,325);
 }else if(kind==='dimensions'){
  ['M','L','T'].forEach((t,i)=>{box(c,60+i*150,120,110,100,'#dfebe1');tag(c,t,95+i*150,165,'#117c72');tag(c,`exponent ${s[['a','b','c'][i]]}`,70+i*150,195)});tag(c,'Multiply dimensions by adding exponents',80,315);
 }else{
  tag(c,'Same physical speed, two units',110,80);arrow(c,75,180,75+(s.v||0)*2,180,'#117c72');circle(c,75+((time%4)*(s.v||0)*.5),210,7,'#d5a155');tag(c,'Motion schematic · distance scale compressed',65,335);tag(c,`${fmt(s.v)} km/h = ${fmt(v)} m/s`,125,265);
 }
 c.restore();
 line(c,525,25,525,345,'#d2dfd5',1);tag(c,'LIVE EXPLANATION',552,40,'#117c72');
 let orb={x:792,y:175,r:24};circle(c,orb.x,orb.y,orb.r,'#d8a65b');
 const text=hide?'Make a prediction first. Use the controls to choose a scenario, then reveal the result to compare it with your reasoning.':`${dcIds.has(l.id)&&electrical.closed===false?'The switch is open. Current is zero in every branch. The source voltage remains across the open switch.':liveSentence(l,s)} ${l.explain}`;
 textBlock(c,text,552,75,263,12,orb);tag(c,'Schematic model · assumptions below',552,340,'#7c9289');
}
export function drawGraph(c,l,s,key,baseline=null,hide=false,width=840){
 c.clearRect(0,0,width,270);c.fillStyle='#fbfcfa';c.fillRect(0,0,width,270);let p=l.params.find(p=>p.key===key),points=[];
 for(let i=0;i<=180;i++){let x=p.min+(p.max-p.min)*i/180;if(p.step>=1)x=Math.round(x);let y=l.compute({...s,[key]:x});points.push({x,y})}
 let ys=points.filter(p=>Number.isFinite(p.y)).map(p=>p.y);if(!ys.length){graphTag('No finite transmitted solution across this range.',70,90);return}
 // Exclude enormous near-focus excursions from distorting the entire plot.
 let sorted=[...ys].sort((a,b)=>a-b),lo=Math.min(0,sorted[Math.floor(sorted.length*.02)]),hi=Math.max(0,sorted[Math.floor(sorted.length*.98)]);if(hi===lo){hi+=1;lo-=1}let pad=(hi-lo)*.1;lo-=pad;hi+=pad;
 function graphTag(text,x,y){c.font=(width<840?'16':'13')+'px system-ui';c.fillStyle='#506b6a';c.fillText(text,x,y)}
 let X=x=>65+(x-p.min)/(p.max-p.min)*(width-100),Y=y=>220-(y-lo)/(hi-lo)*170;
 for(let i=0;i<=4;i++){let y=lo+(hi-lo)*i/4;line(c,65,Y(y),width-35,Y(y),'#e3ebe1',1);graphTag(fmt(y),8,Y(y)+4)}
 line(c,65,220,width-35,220);graphTag(`${p.label} (${p.unit||'dimensionless'})`,Math.max(70,width/2-80),256);graphTag(`${l.result} (${l.unit||'dimensionless'})`,70,24);
 function curve(state,color,dash=[]){c.beginPath();let prev=null;for(let i=0;i<=180;i++){let x=p.min+(p.max-p.min)*i/180;if(p.step>=1)x=Math.round(x);let y=l.compute({...state,[key]:x});if(!Number.isFinite(y)||y<lo||y>hi){prev=null;continue}if(prev&&Math.abs(y-prev.y)<(hi-lo)*.65)c.lineTo(X(x),Y(y));else c.moveTo(X(x),Y(y));prev={x,y}}c.strokeStyle=color;c.lineWidth=2.5;c.setLineDash(dash);c.stroke();c.setLineDash([])}
 if(!hide){if(baseline)curve(baseline,'#d1a465',[5,5]);curve(s,'#167d72');let v=l.compute(s);if(Number.isFinite(v)&&v>=lo&&v<=hi)circle(c,X(s[key]),Y(v),6,'#d29b4a')}
 for(let i=0;i<=4;i++){let x=p.min+(p.max-p.min)*i/4;graphTag(fmt(x),X(x)-12,240)}
}
