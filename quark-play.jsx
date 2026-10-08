import React,{useState,useRef} from 'react';
import {usePhone,pointInView} from './responsive.jsx';
import {quarkPosition} from './interactions.mjs';
const initialPositions=()=>[{x:255,y:125},{x:307,y:215},{x:203,y:215}];
export function QuarkPlay({up}){
 const [positions,setPositions]=useState(initialPositions),active=useRef(null),svg=useRef(null),phone=usePhone();
 const move=(i,x,y)=>setPositions(points=>points.map((p,j)=>j===i?quarkPosition(x,y):p));
 const finish=e=>{if(active.current?.pointerId!==e.pointerId)return;active.current=null;svg.current.releasePointerCapture?.(e.pointerId)};
 return <svg ref={svg} className="drag-layer quark-play" viewBox={`0 0 ${phone?530:840} 370`} aria-label="Explore three valence quarks. Drag a particle or use its arrow keys. Positions are schematic."
  onPointerMove={e=>{if(active.current?.pointerId!==e.pointerId)return;const p=pointInView(svg.current.getBoundingClientRect(),e.clientX,e.clientY,phone?530:840);move(active.current.index,p.x,p.y)}} onPointerUp={finish} onPointerCancel={finish}>
  <rect width="520" height="370" fill="#f2f7f4"/>
  <circle cx="255" cy="180" r="110" fill="#e3ece2" stroke="#b4c8b7"/>
  <path d={`M${positions.map(p=>`${p.x} ${p.y}`).join(' L')} Z`} fill="none" stroke="#b4c8b7" strokeDasharray="4 5"/>
  {positions.map((p,i)=><g key={i} data-quark={i} className="drag-handle" role="button" tabIndex={0} aria-label={`${i<up?'Up':'Down'} quark ${i+1}. Drag or use arrow keys to move.`}
   onPointerDown={e=>{if(active.current||(e.button!==undefined&&e.button!==0))return;e.preventDefault();active.current={index:i,pointerId:e.pointerId};svg.current.setPointerCapture?.(e.pointerId)}}
   onKeyDown={e=>{if(e.key==='Home'){e.preventDefault();setPositions(initialPositions());return}if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();move(i,p.x+(e.key==='ArrowRight'?8:e.key==='ArrowLeft'?-8:0),p.y+(e.key==='ArrowDown'?8:e.key==='ArrowUp'?-8:0))}}>
   <circle cx={p.x} cy={p.y} r="32" fill="transparent"/>
   <circle cx={p.x} cy={p.y} r="23" fill={i<up?'#d5a152':'#7c9cae'} stroke="#526b60"/>
   <text x={p.x} y={p.y+5} textAnchor="middle" fill="#173f37" fontSize="18">{i<up?'u':'d'}</text>
   <text x={p.x} y={p.y+41} textAnchor="middle" fill="#365747" fontSize="13">{i<up?'+2e/3':'−e/3'}</text>
  </g>)}
  <text x="255" y="320" textAnchor="middle" fill="#173f37" fontSize="16">Net charge: {up-1}e</text>
  <text x="255" y="348" textAnchor="middle" fill="#506b6a" fontSize="13">Drag quarks · arrows move · Home resets</text>
 </svg>;
}
