import {useState,useEffect} from 'react';
export function usePhone(){
 const [phone,setPhone]=useState(()=>matchMedia('(max-width: 760px)').matches);
 useEffect(()=>{const query=matchMedia('(max-width: 760px)'),update=()=>setPhone(query.matches);query.addEventListener?.('change',update);update();return ()=>query.removeEventListener?.('change',update)},[]);
 return phone;
}
export function pointInView(rect,x,y,width=840,height=370){return {x:(x-rect.left)*width/rect.width,y:(y-rect.top)*height/rect.height}}
