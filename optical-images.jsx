import React,{useState,useId,createContext,useContext} from 'react';
import {usePhone} from './responsive.jsx';
import {chapters,initial} from './content.mjs';
import {fmt} from './canvas.mjs';
import {lensOutline,mirrorPoints,svgPath,opticalImage} from './optics.mjs';
const sample='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100"><rect width="80" height="100" rx="5" fill="#eef3df"/><circle cx="61" cy="18" r="9" fill="#deb368"/><path d="M0 74 Q18 65 35 74 T80 74 V100 H0Z" fill="#92bdc6"/><path d="M15 70 H65 L54 83 H26Z" fill="#31554a"/><path d="M39 23 V69 H18Z" fill="#e2b268"/><path d="M44 35 L65 67 H44Z" fill="#fdfbf1"/><path d="M42 20 V74" stroke="#31554a" stroke-width="3"/><text x="8" y="20" fill="#31554a" font-size="14" font-family="sans-serif" font-weight="bold">R</text></svg>`);
const OpticsPictureContext=createContext(null);
export function OpticsPictureProvider({children}){
 const picture=useState(sample);
 return <OpticsPictureContext.Provider value={picture}>{children}</OpticsPictureContext.Provider>;
}
function Picture({src,x,y,height=70,sx=1,sy=1,virtual=false,id}){return <g data-testid={id} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} opacity={virtual?.68:1}><image href={src} x={-height*.4} y={-height} width={height*.8} height={height} preserveAspectRatio="xMidYMid meet"/>{virtual&&<rect x={-height*.4} y={-height} width={height*.8} height={height} fill="none" stroke="#876daf" strokeWidth={1/Math.max(.05,Math.abs(sy))} strokeDasharray="4 3"/>}</g>}
export function OpticsImagePanel({lab,params,hide=false}){
 const [src,setSrc]=useContext(OpticsPictureContext),[error,setError]=useState(''),[rays,setRays]=useState(true);const clip='optics-'+useId().replace(/:/g,'');
 const depth=lab.id==='depth',plane=lab.id==='plane',f=params.f??15,model=depth?null:opticalImage(lab,params);
 const phone=usePhone(),width=phone?430:840,cx=phone?215:400,reach=phone?130:300;
 const outside=model&&!model.infinite&&Math.abs(model.v)>10000;
 const scale=depth?1:reach/Math.max(params.u,Math.abs(f)*2,model.infinite||outside?0:Math.abs(model.v),40);
 const cy=200,ox=cx-(params.u||30)*scale,ix=model?(model.mirror?cx-model.v*scale:cx+model.v*scale):0;
 const h=model&&!model.infinite?Math.min(75,145/Math.max(1,Math.abs(model.m))):75;
 const iy=model&&!model.infinite?cy-model.m*h:cy;
 async function upload(event){const file=event.target.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Choose a PNG, JPEG or WebP image up to 5 MB.');event.target.value='';return}setError('');const reader=new FileReader;reader.onload=()=>setSrc(String(reader.result));reader.onerror=()=>setError('This image could not be read. Please choose another file.');reader.readAsDataURL(file)}
 return <section className="lab-card optics-card"><header className="lab-header"><h3>{depth?'An image beneath the surface':'From object to image'}</h3><span className="status">{depth?'APPARENT DEPTH':plane?'PLANE MIRROR':lab.kind==='mirror'?(f>0?'CONCAVE MIRROR':'CONVEX MIRROR'):(f>0?'CONVEX LENS':'CONCAVE LENS')}</span></header>
 <div className="circuit-controls"><label className="image-upload">Use your own picture<input id="optics-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload}/></label><button id="optics-sample" onClick={()=>{setSrc(sample);setError('');document.getElementById('optics-upload').value=''}}>Sample picture</button>{!depth&&<label><input id="optics-rays" type="checkbox" checked={rays} onChange={e=>setRays(e.target.checked)}/> Show rays</label>}<span className="helper">Your picture stays in this browser.</span></div>{error&&<p className="storage-warning" role="alert">{error}</p>}
 <div className="drop-stage"><svg id="optics-image-scene" viewBox={`0 0 ${width} ${depth&&phone?780:390}`} role="img" aria-label={depth?'Actual and near-normal apparent positions of a submerged image':`Picture viewed with a ${plane?'plane mirror':lab.title}. ${model.infinite?'Image is at infinity.':model.real?'Real, inverted image.':'Virtual, upright image.'}`}>
 <defs><clipPath id={clip}><rect x="20" y="30" width={width-40} height="325"/></clipPath></defs><rect width={width} height={depth&&phone?780:390} fill="#f2f7f4"/>
 {depth?<>
 {[0,1].map(i=><g key={i} data-testid={i?'depth-apparent-panel':'depth-actual-panel'} transform={`translate(${phone?0:i*375} ${phone?i*390:0})`}>
 <rect x="55" y="100" width="310" height="240" fill="#d5e7e8"/><line x1="55" y1="100" x2="365" y2="100" stroke="#739f9c" strokeWidth="2"/><text x="55" y="48" fill="#173f37" fontSize="16">{i?'Near-normal view from air':'Actual position in the medium'}</text><text x="55" y="80" fill="#506b6a" fontSize="14">Air above · n = 1</text>
 {i===0?<Picture src={src} x={210} y={300} height={65} id="optics-object"/>:!hide&&<><Picture src={src} x={210} y={300} height={65} virtual/><Picture src={src} x={210} y={100+200/params.n} height={65} sy={1/params.n} virtual id="optics-formed-image"/><path d={`M270 100 V${100+200/params.n}`} stroke="#876daf" strokeWidth="2" strokeDasharray="5 4"/></>}
 <text x="55" y="365" fill={i?'#876daf':'#506b6a'} fontSize="14">{i?hide?'Reveal the apparent depth':`Apparent depth: ${fmt(lab.compute(params))} m`:`Actual depth: ${fmt(params.d)} m · n = ${fmt(params.n)}`}</text>
 </g>)}
 </>:<>
 <g clipPath={`url(#${clip})`}><line x1="25" y1={cy} x2={width-25} y2={cy} stroke="#95afa2" strokeDasharray="5 4"/>
 {plane?<path d={`M${cx} 45 V335 M${cx+5} 45 V335`} stroke="#6c9497" strokeWidth="4"/>:model.mirror?<><path d={mirrorPoints(f>0,cx,cy,145).map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')} fill="none" stroke="#527f7c" strokeWidth="5"/><path d={mirrorPoints(f>0,cx+7,cy,145).map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')} fill="none" stroke="#bdcec6" strokeWidth="4"/></>:<path data-testid="lens-silhouette" d={svgPath(lensOutline(f>0,cx,cy,145))} fill="#b7dfe2" fillOpacity=".65" stroke="#527f7c" strokeWidth="2"/>}
 {!plane&&(model.mirror?[f>0?-1:1]:[-1,1]).map(sign=><g key={sign}><circle cx={cx+sign*Math.abs(f)*scale} cy={cy} r="3" fill="#7f9990"/><text x={cx+sign*Math.abs(f)*scale-4} y={cy+20} fill="#506b6a" fontSize="12">F</text></g>)}
 <Picture src={src} x={ox} y={cy} height={h} id="optics-object"/>
 {!hide&&!model.infinite&&!outside&&<Picture src={src} x={ix} y={cy} height={h} sx={model.mirror?-model.m:model.m} sy={model.m} virtual={!model.real} id="optics-formed-image"/>}
 {rays&&!hide&&!outside&&<g fill="none" strokeWidth="1.8">
 {plane?<><path d={`M${ox} ${cy-h} L${cx} ${cy-h/2} L${ox} ${cy}`} stroke="#bd8e49"/><path d={`M${cx} ${cy-h/2} L${ix} ${cy-h}`} stroke="#876daf" strokeDasharray="5 4"/></>:<><path d={`M${ox} ${cy-h} H${cx}`} stroke="#bd8e49"/>{model.infinite?<path d={`M${cx} ${cy-h} L${model.mirror?25:width-25} ${cy-h+(model.mirror?cx-25:width-25-cx)*h/(f*scale)}`} stroke="#bd8e49"/>:<><path d={`M${cx} ${cy-h} L${cx+(model.mirror?-1:1)*(width/2-20)} ${cy-h+((model.mirror?-1:1)*(width/2-20))*(iy-(cy-h))/(ix-cx)}`} stroke="#bd8e49"/>{!model.real&&<path d={`M${cx} ${cy-h} L${ix} ${iy}`} stroke="#876daf" strokeDasharray="5 4"/>}</>}</>}
 </g>}
 </g><text x={ox} y="365" textAnchor="middle" fill="#946a2f" fontSize="13">Object</text>{!hide&&!model.infinite&&!outside&&<text x={ix} y="365" textAnchor="middle" fill="#876daf" fontSize="13">{model.real?'Real image':'Virtual image'}</text>}
 </>}
 </svg></div>
 <p className="live-text" id="optics-image-caption">{hide?'Reveal the outcome to see the formed image.':depth?`The reference point appears at ${fmt(params.d/params.n)} m rather than ${fmt(params.d)} m. The ghost marks its actual depth. Near-normal refraction makes the picture appear raised and vertically compressed.`:model.infinite?'The object is at the focus. Outgoing rays are parallel, so there is no finite image to draw.':outside?'The image is too far away for this view. Move the object away from the focal point.':`${model.real?'Real, inverted':'Virtual, upright'} image · ${fmt(Math.abs(model.m))}× size${plane?' · mirror-reversed':''}. Change object distance${plane?'':' or focal length'} to see the picture respond.`}</p>
 <p className="graph-caption">{depth?'Near-normal viewing approximation, n observer = 1. The two panels use the same depth scale; the shaded medium rescales to keep the selected actual depth in view.':`Common spatial scale for object and image; it adjusts to fit them. ${plane?'Dashed rays locate the virtual image behind the mirror.':'Glass and mirror outlines show shape; the image position and magnification use the thin, paraxial model. Dashed rays are backward extensions.'}`} Images are ideal projections; blur, aberrations and reflection brightness are omitted.</p>
 </section>;
}
const plane={id:'plane',title:'Plane mirror',kind:'mirror',params:[{key:'u',label:'Object distance',unit:'cm',min:5,max:100,step:1,value:30}],compute:s=>-s.u};
export function OpticsSandbox({Parameter}){
 const choices=[['lens','Convex lens'],['diverging','Concave lens'],['plane','Plane mirror'],['mirror','Concave mirror'],['convexmirror','Convex mirror'],['depth','Underwater refraction']];
 const [mode,setMode]=useState('lens'),[params,setParams]=useState({u:30,f:15});const lab=mode==='plane'?plane:chapters.flatMap(c=>c.labs).find(l=>l.id===mode);
 return <><h1>Shape the light.<br/><em>Watch the image change.</em></h1><p>Choose a lens, mirror or water surface. Use the sample picture or upload your own, then change the physical values.</p><div className="lab-tabs">{choices.map(([id,title])=><button data-optics-mode={id} className={id===mode?'active':''} key={id} onClick={()=>{const next=id==='plane'?plane:chapters.flatMap(c=>c.labs).find(l=>l.id===id);setMode(id);setParams(id==='plane'?{u:30}:initial(next))}}>{title}</button>)}</div><OpticsImagePanel key={mode} lab={lab} params={params}/><div className="card control-panel">{lab.params.map(p=><Parameter key={p.key} param={p} value={params[p.key]} onChange={v=>setParams(s=>({...s,[p.key]:Math.max(p.min,Math.min(p.max,v))}))}/>)}</div><div className="card assumption"><h3>The picture follows the physics</h3><p>Convex lenses are thicker at the centre and can make real inverted or virtual upright images. Concave lenses are thinner at the centre and form diminished upright virtual images. Mirrors reflect light; lenses transmit and refract it. A plane mirror places an equally sized virtual image the same distance behind the mirror. Water shifts the apparent position through refraction.</p></div></>;
}
