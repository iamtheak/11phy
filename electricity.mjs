// Exact lumped-circuit models; marker travel is a schematic, not electron drift speed.
export const dcIds = new Set(['ohm','parallel','cell']);
export function dcState(l,s,closed=true){
 const voltage=s.v??s.emf, resistance=l.id==='parallel'?s.r1*s.r2/(s.r1+s.r2):l.id==='cell'?s.load+s.r:s.r;
 const current=closed?voltage/resistance:0;
 const terminal=l.id==='cell'?voltage-current*s.r:voltage;
 return {current,voltage:closed?terminal:0,sourceVoltage:terminal,branch1:l.id==='parallel'&&closed?voltage/s.r1:current,branch2:l.id==='parallel'&&closed?voltage/s.r2:0,power:current*terminal,internalPower:l.id==='cell'?current**2*s.r:0};
}
export function pathLength(points){return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0)}
export function pathPoint(points,distance){
 const total=pathLength(points);let d=((distance%total)+total)%total;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=len)return [a[0]+(b[0]-a[0])*d/len,a[1]+(b[1]-a[1])*d/len];d-=len}
 return points[0];
}
export function rcState(s,t,mode='charge'){
 const resistance=s.r*1000,capacitance=s.c*1e-6,tau=resistance*capacitance;
 const time=Math.max(0,t),decay=Math.exp(-time/tau),fraction=mode==='discharge'?decay:1-decay;
 const voltage=s.v*fraction,current=(mode==='discharge'?-1:1)*s.v/resistance*decay;
 return {time,tau,fraction,voltage,current,charge:capacitance*voltage,energy:.5*capacitance*voltage**2,power:current**2*resistance,decay};
}
export function drawDC(c,l,s,time,options={}){
 const closed=options.closed!==false,electrons=options.carrier==='electrons',f=dcState(l,s,closed);
 const wire=points=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle='#86a89a';c.lineWidth=3;c.stroke()};
 const text=(str,x,y,color='#506b6a')=>{c.font='13px system-ui';c.fillStyle=color;c.fillText(str,x,y)};
 const dot=(x,y,r,color)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill()};
 const resistor=(x,y,label,power)=>{c.fillStyle=`rgba(213,161,85,${.1+.25*power/(power+10)})`;c.fillRect(x,y-15,130,30);c.strokeStyle='#b48444';c.lineWidth=2;c.strokeRect(x,y-15,130,30);text(label,x+8,y+5)};
 wire([[100,185],[100,90],[420,90],[420,290],[100,290],[100,245]]);
 wire([[100,185],[closed?100:125,closed?215:208]]);dot(100,185,4,'#117c72');dot(100,215,4,'#117c72');
 resistor(220,90,`${l.id==='parallel'?'R₁':l.id==='cell'?'Load':'R'} ${s.r1??s.load??s.r} Ω`,f.branch1**2*(s.r1??s.load??s.r));
 // Battery positive terminal is above negative; both parallel branches join above it.
 wire([[100,215],[100,222]]);wire([[100,238],[100,245]]);wire([[75,222],[125,222]]);wire([[87,238],[113,238]]);text('+',60,226);text('−',65,244);text(`${s.v??s.emf} V`,40,275);
 if(l.id==='parallel'){wire([[100,160],[420,160]]);resistor(220,160,`R₂ ${s.r2} Ω`,f.branch2**2*s.r2)}
 function markers(path,current){if(!closed||current===0)return;const length=pathLength(path),count=Math.max(1,Math.round(length/65));for(let i=0;i<count;i++){let [x,y]=pathPoint(path,i*length/count+(electrons?-1:1)*time*current*40);dot(x,y,4,electrons?'#6d98b5':'#d5a155')}}
 // Shared leads carry the sum, individual branches their own current.
 markers([[100,215],[100,160]],f.current);markers([[420,160],[420,290],[100,290],[100,245]],f.current);
 markers([[100,160],[100,90],[420,90],[420,160]],f.branch1);
 if(l.id==='parallel')markers([[100,160],[420,160]],f.branch2);
 const x=electrons?245:300,X=electrons?300:245;
 if(f.current>0){wire([[x,310],[X,310]]);wire([[X+(electrons?-8:8),304],[X,310],[X+(electrons?-8:8),316]])}
 text(closed?'SWITCH CLOSED':'SWITCH OPEN',115,42,'#117c72');text(electrons?'Blue: electron drift (opposite current)':'Gold: conventional current (+ → −)',65,345);text('Marker speed ∝ current · schematic scale',65,365);
 if(l.id==='cell')text(`Internal r = ${s.r} Ω`,215,260);
}
