import {makeRobot} from './Robot3D.jsx'
import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
const OFF=()=>{try{return localStorage.getItem('kv_3d')==='off'}catch{return false}}
const COL=[0xb6ff5c,0x7c5cff,0x22d3ee]
const ROLES=[['🤖 Lead Agent',['Replying to a new lead…','Following up with Ravi…','Lead qualified 🔥']],['📊 Report Agent',['Collecting sales data…','Building weekly report…','Report sent ✓']],['📅 Booking Agent',['Checking free slots…','Booked: Tue 4 PM ✓','Reminder sent ✓']]]
function makeAgentOld(color,i){const g=new THREE.Group()
const dark=new THREE.MeshStandardMaterial({color:0x1b1b30,metalness:.65,roughness:.28})
const glow=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.8,roughness:.4})
const soft=new THREE.MeshStandardMaterial({color:0x2a2a48,emissive:color,emissiveIntensity:.3,metalness:.3,roughness:.5})
const head=new THREE.Mesh(new THREE.SphereGeometry(.9,48,32),dark);head.scale.set(1,.88,.95);g.add(head)
const visor=new THREE.Mesh(new THREE.SphereGeometry(.62,32,24),new THREE.MeshStandardMaterial({color:0x04040a,metalness:.9,roughness:.12}));visor.scale.set(1.12,.56,.5);visor.position.set(0,.04,.62);g.add(visor)
const eyes=[-1,1].map(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),glow);e.position.set(s*.25,.06,.93);g.add(e);return e})
const ant=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.45,8),dark);ant.position.y=1.08;g.add(ant)
const tip=new THREE.Mesh(new THREE.SphereGeometry(.1,16,12),glow);tip.position.y=1.35;g.add(tip)
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.45,8,20),dark);body.position.y=-1.4;g.add(body)
const core=new THREE.Mesh(new THREE.SphereGeometry(.12,16,12),glow);core.position.set(0,-1.35,.38);g.add(core)
const hands=[-1,1].map(s=>{const h=new THREE.Mesh(new THREE.SphereGeometry(.18,16,12),dark);h.position.set(s*.85,-1.3,.1);g.add(h);return h})
const ring=new THREE.Mesh(new THREE.TorusGeometry(1.45,.022,10,96),glow);ring.rotation.x=Math.PI/2.4;g.add(ring)
const st={}
if(i===0){st.b=[0,1,2].map(k=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.8,4,10),k%2?glow:soft);m.rotation.z=Math.PI/2;m.position.set(2.1+(k%2?.25:-.1),1.1-k*.6,.2);g.add(m);return m})
st.d=[0,1,2].map(k=>{const d=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),glow);d.position.set(1.7+k*.22,-1.2,.3);g.add(d);return d})}
if(i===1){const base=new THREE.Mesh(new THREE.BoxGeometry(2,.06,.6),soft);base.position.set(2.3,-1.6,.2);g.add(base)
st.c=[0,1,2,3,4].map(k=>{const geo=new THREE.BoxGeometry(.28,1,.28);geo.translate(0,.5,0);const m=new THREE.Mesh(geo,glow);m.position.set(1.65+k*.33,-1.57,.2);g.add(m);return m})}
if(i===2){st.cells=[];for(let r=0;r<3;r++)for(let c=0;c<3;c++){const m=new THREE.Mesh(new THREE.BoxGeometry(.34,.34,.08),new THREE.MeshStandardMaterial({color:0x2a2a48,emissive:color,emissiveIntensity:.15}));m.position.set(1.9+c*.42,.6-r*.42,.2);g.add(m);st.cells.push(m)}}
return{g,ring,eyes,hands,tip,st,bx:0,by:0}}

export default function Scene3D(){const ref=useRef();const L=useRef([]);const[ti,setTi]=useState(0)
useEffect(()=>{const id=setInterval(()=>setTi(x=>x+1),2200);return()=>clearInterval(id)},[])
useEffect(()=>{const el=ref.current;if(!el)return;try{if(localStorage.getItem('kv_3d')==='off')return}catch{}
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})}catch{return}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));el.insertBefore(renderer.domElement,el.firstChild)
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,100);cam.position.set(0,0,11.5)
scene.add(new THREE.AmbientLight(0xffffff,.8))
const l1=new THREE.PointLight(0xb6ff5c,70,50);l1.position.set(-5,4,6);const l2=new THREE.PointLight(0x7c5cff,90,50);l2.position.set(7,-3,5);const l3=new THREE.PointLight(0x22d3ee,60,50);l3.position.set(1,6,-2);scene.add(l1,l2,l3)
const root=new THREE.Group();scene.add(root)
const agents=COL.map((c,i)=>{const a=makeAgent(c,i);root.add(a.g);return a})
const N=220,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*22;pos[i*3+1]=(Math.random()-.5)*12;pos[i*3+2]=-6+Math.random()*10}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3))
const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0x9fb7ff,size:.045,transparent:true,opacity:.7,depthWrite:false}));scene.add(pts)
const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(18),3))
root.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x22d3ee,transparent:true,opacity:.4})))
const dots=[0,1,2].map(()=>{const d=new THREE.Mesh(new THREE.SphereGeometry(.07,12,10),new THREE.MeshBasicMaterial({color:0xb6ff5c}));root.add(d);return d})
const E=[[0,1],[1,2],[2,0]]
const place=a=>{const mob=innerWidth<800,H=4.19*a;let P;if(mob){const s=Math.min(.58,H*.1);P=[[-.9*H,.4,0,s],[-.1*H,.6,0,s],[.62*H,.3,0,s]]}else{const s=Math.min(.68,H*.088);P=[[.24*H,1.9,0,s],[.64*H,1.7,0,s],[.46*H,-1.9,0,s]]}
agents.forEach((ag,i)=>{ag.g.scale.setScalar(P[i][3]);ag.bx=P[i][0];ag.by=P[i][1];ag.g.position.set(P[i][0],P[i][1],P[i][2])})}
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches
let mx=0,my=0,sy=0,vis=true,raf=0,w=1,h=1;const v=new THREE.Vector3()
const draw=()=>{agents.forEach((a,i)=>{const lab=L.current[i];if(!lab)return;v.copy(a.g.position);v.y-=2.5*a.g.scale.x;v.project(cam);lab.style.transform=`translate(${(v.x*.5+.5)*w}px,${(-v.y*.5+.5)*h}px) translate(-50%,0)`});renderer.render(scene,cam)}
const size=()=>{w=el.clientWidth||1;h=el.clientHeight||1;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();place(w/h);if(rm)draw()}
const mv=e=>{const p=e.touches?e.touches[0]:e;mx=(p.clientX/innerWidth-.5)*2;my=(p.clientY/innerHeight-.5)*2}
const sc=()=>{sy=scrollY}
const clock=new THREE.Clock()
const tick=()=>{raf=requestAnimationFrame(tick);if(!vis||document.hidden)return;const t=clock.getElapsedTime()
agents.forEach((a,i)=>{a.g.position.y=a.by+Math.sin(t*1.1+i*2.1)*.2;a.g.rotation.y+=((-.3+mx*.5)-a.g.rotation.y)*.05;a.g.rotation.x+=((my*.15)-a.g.rotation.x)*.05
a.ring.rotation.z=t*.8+i;a.tip.scale.setScalar(1+Math.sin(t*3+i)*.25);const b=((t+i*1.3)%3.6)>3.45?.1:1;a.eyes.forEach(e=>e.scale.y=b);a.hands.forEach((hh,k)=>hh.position.y=-1.3+Math.sin(t*2+k+i)*.08)})
const s0=agents[0].st;s0.b.forEach((m,k)=>{const ph=(t*.7+k*.55)%3;const s=Math.min(1,ph*2.2)*(ph>2.6?Math.max(0,(3-ph)/.4):1);m.scale.setScalar(Math.max(.001,s))});s0.d.forEach((d,k)=>d.position.y=-1.2+Math.max(0,Math.sin(t*6+k*.8))*.12)
agents[1].st.c.forEach((c,k)=>c.scale.y=.25+Math.abs(Math.sin(t*1.1+k*.9))*1.1)
const act=Math.floor(t*2.2)%9;agents[2].st.cells.forEach((c,k)=>c.material.emissiveIntensity=k===act?2.4:k<act?.9:.15)
const a=lg.attributes.position.array;E.forEach(([p,q],k)=>{const A=agents[p].g.position,B=agents[q].g.position;a.set([A.x,A.y,A.z,B.x,B.y,B.z],k*6)});lg.attributes.position.needsUpdate=true
dots.forEach((d,k)=>{const[p,q]=E[k],A=agents[p].g.position,B=agents[q].g.position,f=(t*.3+k/3)%1;d.position.set(A.x+(B.x-A.x)*f,A.y+(B.y-A.y)*f,A.z+(B.z-A.z)*f)})
pts.rotation.y=t*.02+sy*.0004;root.rotation.y=Math.sin(t*.25)*.05+sy*.0007
cam.position.x+=((mx*.6)-cam.position.x)*.03;cam.position.y+=((-my*.4)-cam.position.y)*.03;cam.lookAt(0,0,0);draw()}
const ro=new ResizeObserver(size);ro.observe(el);size()
const io=new IntersectionObserver(([e])=>{vis=e.isIntersecting},{threshold:0});io.observe(el)
addEventListener('pointermove',mv,{passive:true});addEventListener('scroll',sc,{passive:true})
if(!rm)tick()
return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();removeEventListener('pointermove',mv);removeEventListener('scroll',sc)
scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>x.dispose())});renderer.dispose();renderer.domElement.remove()}},[])
return <div className="s3d" ref={ref} aria-hidden="true">{!OFF()&&ROLES.map(([n,t],i)=><div key={i} className="alabel" ref={e=>{L.current[i]=e}} style={{'--c':'#'+COL[i].toString(16).padStart(6,'0')}}><b>{n}</b><span key={(ti+i)%3}>{t[(ti+i)%3]}</span></div>)}</div>}

export function makeAgent(color,i){const o=makeAgentOld(color,i),R=makeRobot(color);o.g.children.forEach(c=>{c.visible=false});o.g.add(R.g);Object.assign(o,{hands:R.hands,ring:R.ring,eyes:R.eyes,head:R.head,body:R.body});return o}
