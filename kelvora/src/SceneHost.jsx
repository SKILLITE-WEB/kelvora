import {useEffect,useRef} from 'react'
import {createPortal} from 'react-dom'
import bus from './sceneBus.js'
export default function SceneHost(){
 const host=useRef()
 useEffect(()=>{let dead=false,j=null,started=false,off=false
  try{off=localStorage.getItem('kv_3d')==='off'}catch{}
  const rm=matchMedia('(prefers-reduced-motion:reduce)').matches
  bus.el=host.current;if(bus.on)host.current.style.display='block'
  const start=()=>{if(started)return;started=true
   if(off){bus.setMode('fb');return}
   import('./JourneyScene.js').then(m=>{if(dead)return
    j=m.createJourney(host.current,{getP:()=>bus.getP(),visible:()=>bus.on,onStation:i=>bus.onStation(i),onPhase:p=>bus.onPhase(p),onFail:()=>bus.setMode('fb'),reduced:rm})
    bus.j=j;bus.setMode(j?'3d':'fb')}).catch(()=>bus.setMode('fb'))}
  if(bus.on)start()
  const un=bus.sub(v=>{if(v)start()})
  return()=>{dead=true;un();bus.j=null;bus.el=null;if(j)j.dispose()}},[])
 return createPortal(<div className="jny-fx" ref={host} aria-hidden="true" style={{display:'none'}}/>,document.body)}
