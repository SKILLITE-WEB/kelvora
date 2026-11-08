import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import bus from './sceneBus.js'
import {areaP} from './routeAreas.js'
export default function RouteScene(){
 const{pathname}=useLocation()
 useEffect(()=>{const p=areaP(pathname);if(p==null)return
  document.body.classList.add('office-page')
  const h=bus.attach({getP:()=>p,onStation:()=>{},onPhase:()=>{},onMode:md=>document.body.classList.toggle('wsp',md==='3d')})
  return()=>{document.body.classList.remove('wsp','office-page');h.detach()}},[pathname])
 return null}
