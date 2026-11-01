import {useEffect,useRef} from 'react'
import {useLocation} from 'react-router-dom'
import * as THREE from 'three'
const PAL={'/':0xb6ff5c,'/network':0x22d3ee,'/agents':0xff4fa3,'/audit':0xb6ff5c,'/store':0xffb020,'/admin':0x7c5cff,'/dashboard':0x22d3ee,'/portfolio':0xff4fa3,'/register':0x7c5cff,'/business':0x22d3ee,'/profile':0x7c5cff}
const pal=p=>PAL['/'+(p.split('/')[1]||'')]||0x7c5cff
const rnd=(a,b)=>a+Math.random()*(b-a)
export default function World3D(){const ref=useRef();const{pathname}=useLocation();const P=useRef(pal(pathname))
useEffect(()=>{P.current=pal(pathname)},[pathname])
useEffect(()=>{const el=ref.current;if(!el)return;try{if(localStorage.getItem('kv_3d')==='off')return}catch{}
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:false,alpha:true})}catch{return}
const mob=innerWidth<800;renderer.setPixelRatio(mob?1:Math.min(devicePixelRatio||1,1.5));el.appendChild(renderer.domElement)
const root=document.documentElement,isLight=()=>root.dataset.theme==='light'
const scene=new THREE.Scene();scene.fog=new THREE.Fog(isLight()?0xf5f6fb:0x07070d,10,mob?70:110)
const cam=new THREE.PerspectiveCamera(65,1,.1,300);cam.position.set(0,0,8)
const N=mob?26:56,L=4.5,D=N*L+60,col=new THREE.Color(P.current),mats=[],items=[],grp=new THREE.Group();scene.add(grp)
const add=(o,line)=>{const m=line?new THREE.LineBasicMaterial({color:col,transparent:true,opacity:o}):new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:o,side:THREE.DoubleSide,depthWrite:false});m.userData.o=o;mats.push(m);return m}
const SH=[()=>new THREE.IcosahedronGeometry(1,0),()=>new THREE.OctahedronGeometry(1,0),()=>new THREE.BoxGeometry(1.3,1.3,1.3),()=>new THREE.TorusKnotGeometry(.7,.2,64,8),()=>new THREE.TetrahedronGeometry(1.1),()=>new THREE.TorusGeometry(.8,.25,8,20)]
for(let i=0;i<N;i++){const s=rnd(.8,3),geo=SH[i%SH.length]().scale(s,s*rnd(.6,1.4),s),g=new THREE.Group()
g.position.set((i%2?1:-1)*rnd(3.5,13),rnd(-6.5,6.5),-i*L-rnd(0,3))
g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),add(.6,true)));g.add(new THREE.Mesh(geo,add(.08)))
g.userData={rx:rnd(-.5,.5),ry:rnd(-.6,.6),f:rnd(.5,1.5),y:g.position.y};grp.add(g);items.push(g)}
const rings=[];for(let k=0;k<12;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(rnd(7,9.5),.035,6,72),add(.5));r.position.z=-k*(D/12)-14;grp.add(r);rings.push(r)}
const mkGrid=y=>{const g=new THREE.GridHelper(D*2,mob?40:80,0xffffff,0xffffff);g.position.set(0,y,-D/2);g.material.transparent=true;g.material.opacity=.22;g.material.userData.o=.22;mats.push(g.material);grp.add(g);return g}
const floor=mkGrid(-9),ceil=mkGrid(9)
const globe=new THREE.Mesh(new THREE.SphereGeometry(16,24,16),add(.14,false));globe.material.wireframe=true;globe.position.set(16,2,-D*.55);grp.add(globe)
const globe2=new THREE.Mesh(new THREE.IcosahedronGeometry(10,1),add(.12,false));globe2.material.wireframe=true;globe2.position.set(-18,-2,-D*.8);grp.add(globe2)
const NP=mob?220:520,pp=new Float32Array(NP*3);for(let i=0;i<NP;i++){pp[i*3]=rnd(-32,32);pp[i*3+1]=rnd(-15,15);pp[i*3+2]=-rnd(0,D)}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3))
const pm=new THREE.PointsMaterial({color:0xaab8ff,size:.08,transparent:true,opacity:.6,depthWrite:false});scene.add(new THREE.Points(pg,pm))
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches
let mx=0,my=0,sp=0,raf=0,wasLight=null
const clock=new THREE.Clock(),target=new THREE.Color()
const frame=t=>{const light=isLight()
if(light!==wasLight){wasLight=light;scene.fog.color.set(light?0xf5f6fb:0x07070d);pm.color.set(light?0x4a56a8:0xaab8ff);pm.opacity=light?.5:.6
mats.forEach(m=>{m.opacity=Math.min(1,m.userData.o*(light?1.5:1))})}
target.set(P.current);if(light)target.offsetHSL(0,0,-.22);col.lerp(target,.04)
mats.forEach(m=>{if(m!==floor.material)m.color.copy(col)});floor.material.color.copy(col);
const mxs=Math.max(1,root.scrollHeight-innerHeight),tg=Math.min(1,scrollY/mxs),vel=tg-sp;sp+=vel*.06
cam.position.z=8-sp*(D-40)-((t*.6)%2)*0;cam.position.x+=((mx*1.8)-cam.position.x)*.04;cam.position.y+=((-my*1.2)-cam.position.y)*.04
cam.rotation.z=Math.max(-.25,Math.min(.25,vel*-8))+mx*-.03
cam.fov=65+Math.min(Math.abs(vel)*500,22);cam.updateProjectionMatrix()
items.forEach(g=>{const u=g.userData;g.rotation.x=t*u.rx;g.rotation.y=t*u.ry;g.position.y=u.y+Math.sin(t*u.f)*.45})
rings.forEach((r,i)=>{r.rotation.z=t*.15*(i%2?1:-1)})
globe.rotation.y=t*.05;globe.rotation.x=t*.02;globe2.rotation.y=-t*.07;globe2.rotation.z=t*.03
renderer.render(scene,cam)}
const tick=()=>{raf=requestAnimationFrame(tick);if(!document.body.classList.contains('home3d')&&!document.body.classList.contains('wsp')&&!document.hidden)frame(clock.getElapsedTime())}
const size=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();if(rm)frame(0)}
const mv=e=>{const p=e.touches?e.touches[0]:e;mx=(p.clientX/innerWidth-.5)*2;my=(p.clientY/innerHeight-.5)*2}
const ro=new ResizeObserver(size);ro.observe(el);size();addEventListener('pointermove',mv,{passive:true});if(!rm)tick()
return()=>{cancelAnimationFrame(raf);ro.disconnect();removeEventListener('pointermove',mv);scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>x.dispose())});renderer.dispose();renderer.domElement.remove()}},[])
return <div className="w3d" ref={ref} aria-hidden="true"/>}
