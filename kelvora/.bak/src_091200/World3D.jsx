import {useEffect,useRef} from 'react'
import {useLocation} from 'react-router-dom'
import * as THREE from 'three'
const PAL={'/':0xb6ff5c,'/network':0x22d3ee,'/agents':0xff4fa3,'/audit':0xb6ff5c,'/store':0xffb020,'/admin':0x7c5cff,'/dashboard':0x22d3ee}
const pal=p=>PAL['/'+(p.split('/')[1]||'')]||0x7c5cff
const rnd=(a,b)=>a+Math.random()*(b-a)
export default function World3D(){const ref=useRef();const{pathname}=useLocation();const P=useRef(pal(pathname))
useEffect(()=>{P.current=pal(pathname)},[pathname])
useEffect(()=>{const el=ref.current;if(!el)return;try{if(localStorage.getItem('kv_3d')==='off')return}catch{}
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:false,alpha:true})}catch{return}
const mob=innerWidth<800;renderer.setPixelRatio(mob?1:Math.min(devicePixelRatio||1,1.5));el.appendChild(renderer.domElement)
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x07070d,10,mob?60:95)
const cam=new THREE.PerspectiveCamera(65,1,.1,260);cam.position.set(0,0,8)
const N=mob?30:60,L=4.5,D=N*L+60,col=new THREE.Color(P.current),mats=[],items=[],root=new THREE.Group();scene.add(root)
const add=(o,lineOnly)=>{const m=lineOnly?new THREE.LineBasicMaterial({color:col,transparent:true,opacity:o}):new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:o,side:THREE.DoubleSide,depthWrite:false});mats.push(m);return m}
for(let i=0;i<N;i++){const s=rnd(.8,3.2),geo=new THREE.BoxGeometry(s,s*rnd(.5,1.6),s*rnd(.5,1.2)),g=new THREE.Group()
g.position.set((i%2?1:-1)*rnd(3.5,12),rnd(-6,6),-i*L-rnd(0,3))
g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),add(.55,true)));g.add(new THREE.Mesh(geo,add(.07)))
g.userData={rx:rnd(-.4,.4),ry:rnd(-.5,.5),f:rnd(.5,1.5),y:g.position.y};root.add(g);items.push(g)}
const rings=[];for(let k=0;k<12;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(rnd(7,9),.03,6,72),add(.5));r.position.z=-k*(D/12)-14;root.add(r);rings.push(r)}
const NP=mob?200:500,pp=new Float32Array(NP*3);for(let i=0;i<NP;i++){pp[i*3]=rnd(-30,30);pp[i*3+1]=rnd(-14,14);pp[i*3+2]=-rnd(0,D)}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3))
scene.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xaab8ff,size:.07,transparent:true,opacity:.6,depthWrite:false})))
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches
let mx=0,my=0,sp=0,raf=0,light=document.documentElement.dataset.theme==='light'
const mo=new MutationObserver(()=>{light=document.documentElement.dataset.theme==='light'});mo.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})
const clock=new THREE.Clock(),target=new THREE.Color()
const frame=t=>{target.set(P.current);col.lerp(target,.04);mats.forEach(m=>m.color.copy(col))
const mxs=Math.max(1,document.documentElement.scrollHeight-innerHeight),tg=Math.min(1,scrollY/mxs),vel=tg-sp;sp+=vel*.06
cam.position.z=8-sp*(D-40);cam.position.x+=((mx*1.6)-cam.position.x)*.04;cam.position.y+=((-my*1.1)-cam.position.y)*.04
cam.rotation.z=Math.max(-.25,Math.min(.25,vel*-8))+mx*-.03
cam.fov=65+Math.min(Math.abs(vel)*500,20);cam.updateProjectionMatrix()
items.forEach(g=>{const u=g.userData;g.rotation.x=t*u.rx;g.rotation.y=t*u.ry;g.position.y=u.y+Math.sin(t*u.f)*.4})
rings.forEach((r,i)=>{r.rotation.z=t*.15*(i%2?1:-1)})
renderer.render(scene,cam)}
const tick=()=>{raf=requestAnimationFrame(tick);if(!document.hidden&&!light)frame(clock.getElapsedTime())}
const size=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();if(rm)frame(0)}
const mv=e=>{const p=e.touches?e.touches[0]:e;mx=(p.clientX/innerWidth-.5)*2;my=(p.clientY/innerHeight-.5)*2}
const ro=new ResizeObserver(size);ro.observe(el);size();addEventListener('pointermove',mv,{passive:true});if(!rm)tick()
return()=>{cancelAnimationFrame(raf);mo.disconnect();ro.disconnect();removeEventListener('pointermove',mv);scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>x.dispose())});renderer.dispose();renderer.domElement.remove()}},[])
return <div className="w3d" ref={ref} aria-hidden="true"/>}
