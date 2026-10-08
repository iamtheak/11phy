const radians=x=>x*Math.PI/180;
export function thermalVisual(l,s,time=0){
 const temperature=l.id==='cooling'?animationFrame(l,s,time).temperature:20+(s.dt||0);
 const warmth=Math.min(1,Math.max(0,temperature/100));
 return {temperature,color:`hsl(${Math.round(210-195*warmth)} 55% 65%)`,boiling:l.id==='heat'&&s.c===4200&&temperature>=100};
}
export const studyAnimatedIds=new Set(['equilibrium','latent','expansion','volume','thermalstress','young','stress','doping']);
export const newAnimatedIds=new Set(['newton','incline','work','energy','collision','cooling','conduction','radiation','lens','diverging','mirror','convexmirror','snell','critical','transition',...studyAnimatedIds]);
export function animationPeriod(l,s){
  if(studyAnimatedIds.has(l.id))return 7;
  if(l.id==='incline'){const a=l.compute(s);return a>0?Math.sqrt(8/a)+.8:4}
  if(l.id==='energy')return s.t+.8;
  if(l.id==='newton')return 3.8;
  if(l.id==='collision')return 4;
  if(l.id==='work'||l.id==='cooling')return 6.8;
  if(l.id==='transition')return 4;
  if(['lens','mirror','snell'].includes(l.kind))return 3;
  if(l.kind==='projectile')return 2*s.u*Math.sin(radians(s.theta))/s.g+.8;
  if(l.kind==='spring')return 2*Math.PI*Math.sqrt(s.m/s.k);
  if(l.kind==='motion')return s.t+.8;
  if(l.kind==='circle')return 2*Math.PI/Math.max(.01,s.omega??s.v/s.r);
  if(l.kind==='orbit')return 2*Math.PI/.6;
  if(l.kind==='relative')return 5;
  if(l.kind==='measure')return 4;
  if(l.id==='redshift')return Math.PI;
  return 12;
}
export function animationFrame(l,s,time){
  const phase=Math.max(0,time)%animationPeriod(l,s),value=l.compute(s);
  if(studyAnimatedIds.has(l.id)){
    const fraction=Math.min(phase/5,1);
    if(l.id==='equilibrium')return {fraction,t1:s.t1+(value-s.t1)*fraction,t2:s.t2+(value-s.t2)*fraction,transferred:s.c1*(s.t1-value)*fraction};
    if(l.id==='latent')return {fraction,melted:s.fraction*fraction,heat:value*s.fraction*fraction};
    if(l.id==='doping')return {phase,travel:phase*26};
    return {fraction,current:value*fraction,drive:(s.f??s.dt)*fraction,strain:l.id==='stress'?value*fraction/(s.y*1000):0};
  }
  if(l.id==='newton'){const t=Math.min(phase,3);return {t,acceleration:value,position:.5*value*t*t,velocity:value*t}}
  if(l.id==='incline'){const t=Math.min(phase,value>0?Math.sqrt(8/value):3);return {t,distance:value>0?Math.min(4,.5*value*t*t):0,velocity:value*t,stationary:value===0}}
  if(l.id==='work'){const fraction=Math.min(phase/6,1);return {fraction,distance:s.s*fraction,work:value*fraction}}
  if(l.id==='energy'){const t=Math.min(phase,s.t),fraction=t/s.t,velocity=s.v*fraction;return {t,fraction,velocity,energy:.5*s.m*velocity*velocity}}
  if(l.id==='cooling'){const t=s.t*Math.min(phase/6,1);return {t,temperature:l.compute({...s,t})}}
  if(l.id==='collision'){
    // The initial order follows relative velocity, so either sign can approach.
    // Centre-of-mass coordinates keep common translation from leaving the frame.
    const relative=s.u1-s.u2,m=s.m1+s.m2,approaching=Math.abs(relative)>1e-12,t=Math.min(phase,3.5),contact=1.5;
    const separation=approaching?Math.abs(relative)*Math.max(0,contact-t):1;
    return {t,approaching,joined:approaching&&t>=contact,separation,side:relative>=0?1:-1,velocity:value,momentum:s.m1*s.u1+s.m2*s.u2,energyBefore:.5*s.m1*s.u1**2+.5*s.m2*s.u2**2,energyAfter:.5*m*value**2};
  }
  if(l.id==='transition'){
    const emitted=phase>=1.4,jumpProgress=Math.min(1,Math.max(0,(phase-1)/.4));
    // Progress is a visual cue only; level remains one of the two quantum states.
    return {phase,emitted,jumpProgress,level:emitted?s.lower:s.lower+s.gap,photonX:emitted?280+(phase-1.4)*75:null,wavelength:value};
  }
  return {phase};
}
export function animationReadout(l,s,time){
  const f=animationFrame(l,s,time),n=v=>Number(v.toPrecision(4)).toString();
  if(l.id==='equilibrium')return `Body 1: ${n(f.t1)} °C; body 2: ${n(f.t2)} °C. Energy transferred from body 1: ${n(f.transferred)} J (negative means it gains heat). Energy is conserved; the five-second approach is illustrative, not a predicted heat-transfer rate.`;
  if(l.id==='latent')return `${n(f.melted*100)}% melted; ${n(f.heat)} J absorbed. Temperature remains 0 °C. The replay ends at your selected melted fraction; its duration is illustrative.`;
  if(['expansion','volume','thermalstress'].includes(l.id))return `Temperature rise now ${n(f.drive)} K; ${l.result.toLowerCase()} now ${n(f.current)} ${l.unit}. Heating is ramped over five illustrative seconds; deformation is magnified. ${l.id==='thermalstress'?'The supports keep the rod length fixed.':''}`;
  if(['young','stress'].includes(l.id))return `Applied tension now ${n(f.drive)} N; ${l.result.toLowerCase()} now ${n(f.current)} ${l.unit}. Load increases over five illustrative seconds; deformation is exaggerated and assumes quasistatic elastic response.`;
  if(l.id==='doping')return `${s.type===0?'Electrons':'Holes'} are highlighted as majority carriers. Motion is schematic; no applied field, drift velocity, carrier density or conductivity is calculated from these markers.`;
  if(l.id==='newton')return `From rest: t = ${n(f.t)} s; displacement ${n(f.position)} m; velocity ${n(f.velocity)} m/s.`;
  if(l.id==='incline')return f.stationary?'The block stays at rest: static friction balances the slope.':`On a 4 m illustrative ramp: t = ${n(f.t)} s; distance ${n(f.distance)} m; downhill speed ${n(f.velocity)} m/s. Replay starts from rest.`;
  if(l.id==='work')return `Prescribed displacement ${n(f.distance)} of ${s.s} m; work so far ${n(f.work)} J. This motion illustrates the work integral, not acceleration caused by the force.`;
  if(l.id==='energy')return `Assumed uniform acceleration from rest: t = ${n(f.t)} of ${s.t} s; speed ${n(f.velocity)} m/s; kinetic energy ${n(f.energy)} J.`;
  if(l.id==='collision')return !f.approaching?'Equal initial velocities: the separated bodies do not approach. The formula below gives their hypothetical shared velocity.':`${f.joined?'Bodies have stuck together':'Bodies approaching'} in the centre-of-mass view. Total momentum ${n(f.momentum)} kg·m/s; final lab-frame velocity ${n(f.velocity)} m/s. Kinetic energy: ${n(f.energyBefore)} J before, ${n(f.energyAfter)} J after.`;
  if(l.id==='cooling')return `Replay time ${n(f.t)} of ${s.t} min; temperature now ${n(f.temperature)} °C. Six playback seconds show the chosen cooling interval; the selected-time answer remains below.`;
  if(l.id==='heat')return thermalVisual(l,s,time).boiling?'Water reaches 100 °C from a 20 °C reference. Bubbles are a standard-pressure boiling cue; Q = mcΔT does not calculate vaporization.':'The color shows the selected temperature rise from a 20 °C reference. Set water’s specific heat to 4200 J/(kg·K) and the rise to 80 K for the boiling cue.';
  if(l.id==='conduction')return s.dt===0?'Equal face temperatures: no net heat flow.':'Markers illustrate hot-to-cold energy transfer in a steady temperature gradient. Their speed is schematic, not a predicted particle velocity.';
  if(l.id==='radiation')return l.compute(s)===0?'Radiative equilibrium: no net energy exchange.':`Markers illustrate net energy ${l.compute(s)>0?'leaving':'entering'} the surface; their speed is schematic.`;
  if(l.id==='critical'&&!Number.isFinite(l.compute(s)))return 'No critical angle exists for these indices: the first medium must have a higher refractive index.';
  if(['lens','mirror','snell'].includes(l.kind))return 'Moving markers trace real ray segments at a slowed, illustrative speed. Dashed virtual extensions carry no light.';
  if(l.id==='transition')return `${f.emitted?'Photon emitted; electron shown at lower level':f.jumpProgress>0?'Jump cue: upper → lower level':'Electron shown at upper level'}. The moving marker illustrates the jump, not intermediate allowed energies or an electron trajectory. Timing is slowed and schematic.`;
  return '';
}
// Fold a straight trajectory at each wall rather than wrapping to the other side.
// Particle centres stay inset from the walls; collisions are schematic and elastic.
export function gasParticleFrame(s,index,time){
  const size=Math.min(300,Math.max(150,120+(s.v||20)*3)),width=size-16,height=214;
  const speed=Math.sqrt((s.t||300)/300);
  const reflect=(position,span)=>{const phase=((position%(2*span))+2*span)%(2*span);return phase<=span?phase:2*span-phase};
  return {x:78+reflect(index*67%width+time*25*speed*(index%2?1:-1),width),y:68+reflect(index*41%height+time*18*speed*(index%3?1:-1),height)};
}
