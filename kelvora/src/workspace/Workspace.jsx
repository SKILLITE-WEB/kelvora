import {useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import * as THREE from 'three'
import {makeChimpuk,disposeMats} from './chimpuk.js'
import {ENVS} from './envs.js'
import {makeBrain} from './brain.js'
import {getWs} from './state.js'
const TITLES={control:['Control room','Overview'],ops:['Operations desk','Requests and orders'],workshop:['Workshop','Build and configure'],comms:['Communication station','Messages and collaboration'],analysis:['Analysis workstation','Reports and audits'],desk:['Personal desk','Profile and account']}
const ICON={control:'🛰',ops:'🧾',workshop:'🛠',comms:'💬',analysis:'📊',desk:'🪑'}
const SAY={idle:'ambient animation',loading:'loading…',processing:'working on your request…',success:'done',error:'something went wrong, see the message on the page',empty:'nothing here yet'}
export default function Workspace({kind='control'}){
 const host=useRef(),api=useRef(null),kr=useRef(kind),sref=useRef(getWs()||'idle');kr.current=kind
 const[fb,setFb]=useState(false),[st,setSt]=useState(sref.current)
 useEffect(()=>{let ov=null,base=getWs()||'idle',tm=0
  const apply=()=>{const s=ov||base;sref.current=s;setSt(s);api.current&&api.current.setState(s)}
  const timed=(s,ms)=>{ov=s;apply();clearTimeout(tm);tm=setTimeout(()=>{ov=null;apply()},ms)}
  const onWs=e=>{if(e.detail==='success')timed('success',3000);else{base=e.detail||'idle';apply()}}
  const onToast=e=>{const t=e.detail&&e.detail.t;timed(t==='err'?'error':'success',t==='err'?4500:3000)}
  addEventListener('ws-state',onWs);addEventListener('toast',onToast);apply()
  return()=>{clearTimeout(tm);removeEventListener('ws-state',onWs);removeEventListener('toast',onToast)}},[])
 useEffect(()=>{const el=host.current;if(!el)return
  let off=false;try{off=localStorage.getItem('kv_3d')==='off'}catch{}
  if(off){setFb(true);return}
  let r;try{r=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch{setFb(true);return}
  const mob=innerWidth<800,rm=matchMedia('(prefers-reduced-motion:reduce)').matches
  let dpr=Math.min(devicePixelRatio||1,mob?1.25:1.75);r.setPixelRatio(dpr);r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05
  el.appendChild(r.domElement);document.body.classList.add('wsp')
  const BG=0x090b11,scene=new THREE.Scene();scene.background=new THREE.Color(BG);scene.fog=new THREE.Fog(BG,9,22)
  const cam=new THREE.PerspectiveCamera(32,1,.1,60)
  scene.add(new THREE.HemisphereLight(0xbfc8ff,0x0a0b10,.9))
  const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(-3,6,-3);scene.add(sun)
  const p1=new THREE.PointLight(0xb9f45c,25,12);p1.position.set(2,2.2,-1);const p2=new THREE.PointLight(0x7c5cff,35,12);p2.position.set(-2.5,2,1.5);scene.add(p1,p2)
  const rig=makeChimpuk();scene.add(rig.root)
  const PN=mob?50:110,pg=new THREE.BufferGeometry(),pp=new Float32Array(PN*3)
  for(let i=0;i<PN;i++){pp[i*3]=(Math.random()-.5)*14;pp[i*3+1]=Math.random()*4;pp[i*3+2]=Math.random()*7-1}
  pg.setAttribute('position',new THREE.BufferAttribute(pp,3))
  const pm=new THREE.PointsMaterial({color:0xb9f45c,size:.028,transparent:true,opacity:.55,depthWrite:false}),pts=new THREE.Points(pg,pm);scene.add(pts)
  const drift=dt=>{for(let i=0;i<PN;i++){pp[i*3+1]+=dt*(.08+(i%5)*.03);if(pp[i*3+1]>4)pp[i*3+1]=0}pg.attributes.position.needsUpdate=true;p1.position.x=2+Math.sin(T*.4)*3;p2.position.x=-2.5+Math.cos(T*.35)*3}
  let env=null,brain=null,state=sref.current,raf=0,vis=true,lost=false,last=performance.now(),acc=0,n=0,warm=true,w=1,h=1,T=0
  const F=new THREE.Vector3()
  const view=()=>{const a=w/h,por=a<.9,fit=por?3.2:(a<1.4?5.2:5.6),d=Math.min(15,Math.max(3.4,fit/(.573*a))),x=rig.root.position.x*.6,dr=T*.2
  F.set(x,por?.2:.7,.6);cam.position.set(x-1.25+Math.sin(dr)*.7,1.5+(d-3.4)*.05+Math.sin(dr*.7)*.12,F.z-d);cam.lookAt(F);scene.fog.near=d+2;scene.fog.far=d+15}
  const draw=()=>{view();r.render(scene,cam)}
  const still=()=>{if(!brain)return;for(let i=0;i<24;i++)brain.update(.05);env.update(1.2,state,.05);draw()}
  const setKind=k=>{if(env&&env.kind===k)return;if(env){scene.remove(env.group);env.dispose()}
   env=(ENVS[k]||ENVS.control)();env.kind=k;T=0;scene.add(env.group);brain=makeBrain(rig,env,{calm:k==='desk'});brain.setState(state);if(rm)still()}
  const size=()=>{w=el.clientWidth||1;h=el.clientHeight||1;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();if(rm)still()}
  const tick=now=>{raf=requestAnimationFrame(tick);const raw=(now-last)/1000;last=now;if(document.hidden||!vis||lost||!env)return
   const dt=Math.min(.05,raw);T+=dt;brain.update(dt);env.update(T,state,dt);drift(dt);draw()
   n++;acc+=raw;if(n===90){if(!warm&&acc/90>.03&&dpr>1){dpr=1;r.setPixelRatio(1);size()}warm=false;acc=0;n=0}}
  const onLost=e=>{e.preventDefault();lost=true;setFb(true)};r.domElement.addEventListener('webglcontextlost',onLost)
  const ro=new ResizeObserver(size);ro.observe(el);size()
  const io=new IntersectionObserver(([e])=>{vis=e.isIntersecting},{rootMargin:'60px'});io.observe(el)
  api.current={setKind,setState:s=>{state=s;if(brain){brain.setState(s);if(rm)still()}}}
  setKind(kr.current);if(!rm)raf=requestAnimationFrame(tick)
  return()=>{api.current=null;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();r.domElement.removeEventListener('webglcontextlost',onLost)
   if(env)env.dispose();pg.dispose();pm.dispose();rig.dispose();disposeMats();r.dispose();r.forceContextLoss&&r.forceContextLoss();r.domElement.remove();document.body.classList.remove('wsp')}},[])
 useEffect(()=>{api.current&&api.current.setKind(kind)},[kind])
 const t=TITLES[kind]||TITLES.control
 return createPortal(<section className="wsx" aria-label={t[0]}><div className="wsx-cv" ref={host} aria-hidden="true"/>{fb&&<div className="wsx-fb" aria-hidden="true">{ICON[kind]}</div>}
 <div className="wsx-cap"><b>{t[0]}</b><small role="status" aria-live="polite">{t[1]} · {SAY[st]||SAY.idle}</small></div></section>,document.body)}
