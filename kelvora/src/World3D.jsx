import {useEffect,useRef} from 'react'
import {useLocation} from 'react-router-dom'
import * as THREE from 'three'
const PAL={'/':0xb6ff5c,'/network':0x22d3ee,'/agents':0xff4fa3,'/audit':0xb6ff5c,'/store':0xffb020,'/admin':0x7c5cff,'/dashboard':0x22d3ee}
const pal=p=>PAL['/'+(p.split('/')[1]||'')]||0x7c5cff
export default function World3D(){const ref=useRef();const{pathname}=useLocation();const P=useRef(pal(pathname))
useEffect(()=>{P.current=pal(pathname)},[pathname])
useEffect(()=>{const el=ref.current;if(!el)return;try{if(localStorage.getItem('kv_3d')==='off')return}catch{}
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:false,alpha:true})}catch{return}
const mob=innerWidth<800;renderer.setPixelRatio(mob?1:Math.min(devicePixelRatio||1,1.5));el.appendChild(renderer.domElement)
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x07070d,8,mob?40:60);const cam=new THREE.PerspectiveCamera(60,1,.1,120);cam.position.set(0,3,8)
const grid=new THREE.GridHelper(160,80,0xffffff,0xffffff);grid.position.y=-3;grid.material.transparent=true;grid.material.opacity=.16;scene.add(grid)
const N=mob?150:320,pp=new Float32Array(N*3);for(let i=0;i<N;i++){pp[i*3]=(Math.random()-.5)*60;pp[i*3+1]=-2+Math.random()*14;pp[i*3+2]=-Math.random()*60+6}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));scene.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xaab8ff,size:.05,transparent:true,opacity:.55,depthWrite:false})))
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;let mx=0,raf=0;const clock=new THREE.Clock(),col=new THREE.Color(P.current)
const frame=t=>{col.lerp(new THREE.Color(P.current),.04);grid.material.color.copy(col);grid.position.z=(t*.6)%2;cam.position.x+=((mx*1.2)-cam.position.x)*.03;cam.lookAt(0,1,-12);renderer.render(scene,cam)}
const tick=()=>{raf=requestAnimationFrame(tick);if(!document.hidden)frame(clock.getElapsedTime())}
const size=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();if(rm)frame(0)}
const mv=e=>{mx=((e.touches?e.touches[0].clientX:e.clientX)/innerWidth-.5)*2}
const ro=new ResizeObserver(size);ro.observe(el);size();addEventListener('pointermove',mv,{passive:true});if(!rm)tick()
return()=>{cancelAnimationFrame(raf);ro.disconnect();removeEventListener('pointermove',mv);scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>x.dispose())});renderer.dispose();renderer.domElement.remove()}},[])
return <div className="w3d" ref={ref} aria-hidden="true"/>}
