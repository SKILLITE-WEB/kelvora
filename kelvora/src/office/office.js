import * as THREE from 'three'
import {buildRooms} from './rooms.js'
import {makeAgent,AGENTS,disposeAgentAssets} from './agents.js'
import {DK} from '../workspace/chimpuk.js'
const {PI,sin,cos,atan2,min,max,exp,floor}=Math
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z)
const cl=(v,a=0,b=1)=>min(b,max(a,v))
const ss=(a,b,v)=>{const t=cl((v-a)/(b-a));return t*t*(3-2*t)}
const wrap=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a}
const END=13.6
const holdIntro=()=>!!document.querySelector('.intro:not(.out)')

// One owner for the opening + office: Journey calls pose() once per frame and applies the returned overrides.
export function createOffice(c){
 const {scene,fr,pt,U,L,E,hemi,sun,torso,root,camP,getP,mob,reduced,onPhase}=c
 const M=mob(),SP=M?1.9:1.6
 const defs=AGENTS.filter(d=>!M||d.primary),slots={}
 defs.forEach(d=>(slots[d.room]=slots[d.room]||[]).push(d.slot))
 const B=buildRooms({scene,fr,U,slots,mob:M}),rooms=B.rooms,corr=B.corr
 const agents=defs.map(d=>{const a=makeAgent(d,rooms[d.room],scene);rooms[d.room].members.push(a);return a})
 const focus={pos:V(),head:V(),on:false};agents.forEach(a=>{a.focus=focus})
 const fls=agents.map((a,i)=>({a,at:7.2+floor(i/3)*1.5+(i%3)*.25,lane:((i%3)-1)*.55,ph:i*1.7,t0:-1,done:false,u:0,u0:U[0]-E,uTo:U[a.def.room],yaw:0,last:V(),s0:V(),n:V(),home:a.sl.pos,dur:2}))
 // ---- deployment bay on Chimpuk's torso (door + glowing aperture)
 const hgm=new THREE.MeshStandardMaterial({color:0x38d4ee,emissive:0x38d4ee,emissiveIntensity:.15,roughness:.4})
 const rimM=new THREE.MeshStandardMaterial({color:0xb9f45c,emissive:0xb9f45c,emissiveIntensity:1.1,roughness:.4})
 const hg=new THREE.Group();hg.position.set(0,.1,.138);torso.add(hg)
 const bayG=new THREE.PlaneGeometry(.2,.17),doorG=new THREE.BoxGeometry(.22,.19,.014),rimG=new THREE.BoxGeometry(.235,.012,.012)
 const bay=new THREE.Mesh(bayG,hgm);bay.position.z=.002;hg.add(bay)
 const pv=new THREE.Group();pv.position.set(0,.095,.008);hg.add(pv)
 const door=new THREE.Mesh(doorG,DK());door.position.y=-.095;pv.add(door)
 ;[-.097,.097].forEach(y=>{const r=new THREE.Mesh(rimG,rimM);r.position.set(0,y,.016);hg.add(r)})
 const hatchPos=()=>torso.localToWorld(V(0,.1,.22))
 const hatchNrm=()=>torso.localToWorld(V(0,.1,1)).sub(torso.localToWorld(V(0,.1,0))).normalize()
 // ---- restrained energy field (beam, halo rings, a few particles, one light)
 const fx=new THREE.Group();fx.visible=false;scene.add(fx)
 const addM=o=>new THREE.MeshBasicMaterial({color:0x38d4ee,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,...o})
 const beamG=new THREE.CylinderGeometry(.7,.7,1,32,1,true),beamM=addM(),beam=new THREE.Mesh(beamG,beamM);fx.add(beam)
 const ringG=new THREE.RingGeometry(.55,.64,48),ringM=addM({color:0xb9f45c}),ring=new THREE.Mesh(ringG,ringM),ring2=new THREE.Mesh(ringG,ringM)
 ring.rotation.x=ring2.rotation.x=-PI/2;fx.add(ring,ring2)
 const NP=M?18:56,pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NP*3),3))
 const pm=new THREE.PointsMaterial({color:0x9ff0ff,size:.05,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}),pts=new THREE.Points(pg,pm);pts.frustumCulled=false;fx.add(pts)
 const pl=new THREE.PointLight(0x38d4ee,0,9);scene.add(pl)
 // ---- state model: play(greeting→wave→ascent→deploy→landing) | settle (fast-forward) | ready (exploration)
 let st='play',T=0,clk=0,mood=0,liftV=0,curLift=0,hv=0,phase='',gAct=-2,gT=-9
 const setPhase=p=>{if(p!==phase){phase=p;onPhase&&onPhase(p)}}
 const placeAll=()=>{fls.forEach(f=>{f.done=true});agents.forEach(a=>{a.flight=null;a.placeHome()});rooms.forEach(r=>{r.t0=-99});corr.set(1)}
 const finish=()=>{st='ready';mood=0;hv=0;try{sessionStorage.setItem('kv_open','1')}catch{}setPhase('ready')}
 const toSettle=()=>{if(st!=='play')return;st='settle';liftV=curLift;placeAll()}
 const seen=(()=>{try{return sessionStorage.getItem('kv_open')==='1'}catch{return false}})()
 if(reduced||seen||getP()>.015){placeAll();st='ready';setPhase('ready')}else setPhase('greeting')
 const startFlight=fl=>{const a=fl.a;fl.t0=clk;fl.s0=hatchPos();fl.n=hatchNrm();fl.last.copy(fl.s0);fl.yaw=atan2(fl.n.x,fl.n.z)
  fl.dur=max(1.6,Math.abs(fl.uTo-fl.u0)*L/(M?20:26)+.8);fl.u=fl.u0;a.flight=fl}
 const flyAgent=fl=>{const a=fl.a,s=cl((clk-fl.t0)/fl.dur),e=s<.5?2*s*s:1-2*(1-s)*(1-s)
  const u=fl.u0+(fl.uTo-fl.u0)*e,F=fr(u);fl.u=u
  const p=F.p.clone().addScaledVector(F.r,fl.lane*(1-ss(.7,1,s))).add(V(0,1.7+.25*sin(clk*5+fl.ph),0))
  p.lerp(fl.s0.clone().addScaledVector(fl.n,.9*ss(0,.2,s)),1-ss(0,.22,s))
  p.lerp(fl.home,ss(.78,1,s))
  const d=p.clone().sub(fl.last);fl.last.copy(p);if(d.lengthSq()>1e-6)fl.yaw+=wrap(atan2(d.x,d.z)-fl.yaw)*.25
  a.fly(p,fl.yaw+wrap(a.sl.yaw-fl.yaw)*ss(.9,1,s),.15+.85*ss(0,.14,s),.16*(1-ss(.85,1,s)),.45*(1-ss(.8,1,s)))
  if(s>=1){a.placeHome();a.flight=null;fl.done=true;const r=rooms[a.def.room];if(r.t0==null)r.t0=clk}}
 const playPose=info=>{const A=(a,b)=>ss(a,b,T),rY=info.f.yaw,cy=camP.lengthSq()>1?atan2(camP.x-root.position.x,camP.z-root.position.z):rY+PI/*face-cam*/
  let y=cy;y+=wrap(rY-y)*A(11.8,13.2)
  const rise=A(5.5,7)*(1-A(11.8,13)),lift=1.5*rise+.035*sin(T*2.2)*rise*A(6.8,7.2);curLift=lift
  const cr=.07*sin(PI*cl((T-4.8)/.8))+.08*sin(PI*cl((T-12.9)/.7))
  const lw=A(.8,1.4)*(1-A(4.3,4.9)),ww=A(2,2.4)*(1-A(3.7,4.1)),sp=A(6,6.8)*(1-A(11.4,12.2))
  const arms=[null,null]
  if(ww>.01)arms[1]=[-.42+.06*sin(T*10),1.5+.05*sin(T*7.3),.18,ww]
  if(sp>.01){arms[0]=[.55,.98,.2,sp];arms[1]=[-.55,.98,.2,sp]}
  const cm=A(5,7)*(1-A(11.8,13.4))*(M?.8:1),k=lift/1.5
  mood=A(5.4,7.2)*(1-A(11.5,13.2));hv=A(7,7.6)*(1-A(10.9,11.5))
  setPhase(T<2?'greeting':T<4.4?'wave':T<7?'ascent':T<11.6?'deploy':'landing')
  return{yaw:y,lift,tuck:.14*k,arms,out:{lookCam:true,lookW:lw,crouch:cr,lean:.08*k},cam:{back:2.4*cm,up:1.3*cm,look:.35*cm,ahead:1.2*cm}}}
 const pose=(dt,tm,info)=>{
  dt=min(dt||.016,.05);clk+=dt
  if(st==='play'&&!holdIntro()){if(info.p>.012)toSettle();else{T+=dt*SP;if(T>=END)finish()}}
  let ov=null,lift=0
  if(st==='play'){ov=playPose(info);lift=ov.lift}
  else if(st==='settle'){liftV*=exp(-dt*3.5);mood*=exp(-dt*3);hv=0;if(liftV<.004){liftV=0;finish()}else{ov={lift:liftV,tuck:.14*liftV/1.5};lift=liftV}}
  else{mood=0;hv=0}
  if(st==='ready'){if(info.s.act!==gAct){gAct=info.s.act;if(gAct>=0)gT=clk}
   if(!ov&&gAct>=0&&clk-gT<4.2){const r=rooms[gAct],e=clk-gT,arms=[null,null];/*g-point*/if(e<2.4&&gAct===0)arms[1]=[-.42+.06*sin(clk*10),1.5+.05*sin(clk*7.3),.18,ss(.1,.5,e)*(1-ss(1.9,2.4,e))];if(e<2.4&&gAct>0)arms[0]=[.45,1.2,.5,ss(.1,.5,e)*(1-ss(1.9,2.4,e))];ov={arms,out:{look:r.shared,lookW:.9*ss(.1,.5,e)*(1-ss(3.3,4.2,e))}}}}
  if(!ov&&st==='ready'&&info.s.act<0){let b=null,bd=5.5
   agents.forEach(a=>{if(!a.isReady()||!a.root.visible)return;const d=a.S.pos.distanceTo(root.position);if(d<bd){bd=d;b=a}})
   if(b)ov={out:{look:b.head(),lookW:ss(5.5,3.6,bd)*.85}}}
  focus.pos.copy(root.position);focus.head.set(root.position.x,root.position.y+1.3,root.position.z);focus.on=st!=='play'
  let wv=0,all=true
  fls.forEach(f=>{if(f.done){wv=max(wv,U[f.a.def.room]);return}all=false
   if(f.t0<0){if(st==='play'&&T>=f.at)startFlight(f)}
   if(f.t0>=0){flyAgent(f);if(!f.done)wv=max(wv,f.u)}})
  corr.set(all?1:wv+.004)
  rooms.forEach(r=>{r.setA(r.t0==null?.1:ss(0,1.6,clk-r.t0));const cp=r.cup;if(cp&&!cp.holder){cp.mesh.position.lerp(cp.target,1-exp(-dt*8));cp.mesh.rotation.x*=.85}})
  agents.forEach(a=>{if(a.flight||!a.isReady())return;const near=a.S.pos.distanceTo(camP)<(M?34:46);a.setVisible(near);if(near)a.update(dt,clk)})
  pv.rotation.x=-1.35*hv;hgm.emissiveIntensity=.15+2.2*hv
  hemi.intensity=.9*(1-.45*mood);sun.intensity=2.1*(1-.4*mood)
  const on=mood>.004;fx.visible=on
  if(on){const gy=info.f.p.y,rx=root.position.x,rz=root.position.z,k=lift/1.5
   beam.position.set(rx,gy+lift/2+.01,rz);beam.scale.set(1,max(.02,lift),1);beamM.opacity=.14*mood*ss(.15,1,k)
   ring.position.set(rx,gy+.02,rz);ring.scale.setScalar(1+.2*sin(clk*2));ring2.position.set(rx,gy+.03,rz);ring2.scale.setScalar(1.5+.3*sin(clk*2+1));ringM.opacity=.55*mood
   const a=pg.attributes.position.array
   for(let i=0;i<NP;i++){const an=clk*1.6+i*6.2832*3/NP,r=.55+.22*sin(i*1.7),h=((clk*.35+i/NP)%1)*(lift+1.3);a[i*3]=rx+cos(an)*r;a[i*3+1]=gy+h;a[i*3+2]=rz+sin(an)*r}
   pg.attributes.position.needsUpdate=true;pm.opacity=.85*mood;pl.position.set(rx,gy+lift+.7,rz)}
  pl.intensity=22*mood
  if(st==='ready'&&info.p<.004){const fy=camP.lengthSq()>1?atan2(camP.x-root.position.x,camP.z-root.position.z):info.f.yaw+PI;ov=Object.assign(ov||{},{yaw:fy})}
  return ov}
 const replay=()=>{if(reduced)return
  st='play';T=0;liftV=0;mood=0;hv=0
  fls.forEach(f=>{f.done=false;f.t0=-1});agents.forEach(a=>{a.flight=null;a.reset()})
  rooms.forEach(r=>{r.t0=null;const cp=r.cup;if(cp){cp.holder=null;cp.busy=null;cp.mesh.position.copy(cp.home);cp.target.copy(cp.home);cp.tilt=0;cp.mesh.rotation.x=0}})
  corr.set(0);phase='';setPhase('greeting')}
 const dispose=()=>{hemi.intensity=.9;sun.intensity=2.1;agents.forEach(a=>a.dispose());B.dispose();torso.remove(hg)
  ;[bayG,doorG,rimG,beamG,ringG,pg].forEach(g=>g.dispose());[hgm,rimM,beamM,ringM,pm].forEach(m=>m.dispose());scene.remove(fx);scene.remove(pl);disposeAgentAssets()}
 return{pose,replay,skip:toSettle,dispose}}
