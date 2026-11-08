import * as THREE from 'three'
import {makeChimpuk,blobMat} from '../workspace/chimpuk.js'
const {PI,sin,cos,atan2,hypot,min,max,floor}=Math
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z)
const cl=(v,a=0,b=1)=>min(b,max(a,v))
const ss=(a,b,v)=>{const t=cl((v-a)/(b-a));return t*t*(3-2*t)}
const wrap=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a}
const lv=(a,b,t)=>a.clone().lerp(b,t)
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
export const K=.6,STR=.5,FOOT=.07
const gait=ph=>{ph=((ph%1)+1)%1;if(ph<.5)return{x:STR/2-STR*(ph/.5),y:0};const t=(ph-.5)/.5;return{x:-STR/2+STR*(1-cos(PI*t))/2,y:.09*sin(PI*t)}}
// stable identities + deterministic assignments (room index = journey stop). primary = kept on mobile.
export const AGENTS=[
{id:'a0',room:0,slot:'A',accent:0xb9f45c,role:'greeter',seed:11,primary:1},
{id:'a1',room:1,slot:'A',accent:0x38d4ee,role:'auditor',seed:23,primary:1},
{id:'a2',room:1,slot:'C',accent:0xffc24a,role:'reviewer',seed:37},
{id:'a3',room:2,slot:'B',accent:0x8a74ff,role:'builder',seed:41},
{id:'a4',room:2,slot:'C',accent:0xff7ab8,role:'operator',seed:53,primary:1},
{id:'a5',room:3,slot:'A',accent:0xb9f45c,role:'designer',seed:67,primary:1},
{id:'a6',room:3,slot:'C',accent:0x38d4ee,role:'editor',seed:79},
{id:'a7',room:4,slot:'A',accent:0xffc24a,role:'host',seed:83,primary:1},
{id:'a8',room:4,slot:'B',accent:0x8a74ff,role:'helper',seed:97}]
const WT={work:4,read:2,note:1.4,review:1.2,adjust:1,check:1,think:.9,stretch:.5,organize:.9,sat:.4,tilt:.7,coffee:.6,collab:1.7,deliver:1.5,greet:7,call:.7}
const ROLE={greeter:{greet:2,tilt:2,work:.6},auditor:{read:2,check:2,review:1.5},reviewer:{note:2,read:1.5,review:2.5},builder:{adjust:2.2,work:1.4},operator:{deliver:2,check:1.4},designer:{organize:2,sat:1.5},editor:{note:1.6,think:1.3},host:{coffee:2,organize:1.4,tilt:1.4,call:1.6},helper:{deliver:2,tilt:1.4}}
const AM={},AG={}
const accentMat=c=>AM[c]||(AM[c]=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.9,roughness:.35,metalness:.2}))
const white=()=>AM.w||(AM.w=new THREE.MeshStandardMaterial({color:0xf4f6ff,roughness:.6}))
const geo=(k,f)=>AG[k]||(AG[k]=f())
export const disposeAgentAssets=()=>{Object.values(AM).forEach(m=>m.dispose());Object.values(AG).forEach(g=>g.dispose());for(const k in AM)delete AM[k];for(const k in AG)delete AG[k]}

export function makeAgent(def,room,scene){
 const rig=makeChimpuk(),R=rig.root,rnd=rng(def.seed),rr=(a,b)=>a+rnd()*(b-a)
 R.scale.setScalar(K);R.visible=false;scene.add(R)
 const blob=R.children.find(o=>o.material===blobMat())
 const am=accentMat(def.accent)
 const b1=new THREE.Mesh(geo('band',()=>new THREE.BoxGeometry(.43,.055,.285)),am);b1.position.set(0,.1,0);rig.torso.add(b1)
 const b2=new THREE.Mesh(geo('hband',()=>new THREE.BoxGeometry(.455,.04,.375)),am);b2.position.set(0,.11,0);rig.head.add(b2)
 const sl=room.slots[def.slot],S={pos:sl.pos.clone(),yaw:sl.yaw,W:0,ph:0,lean:0,tilt:0,nod:0}
 const own={tempo:.86+((def.seed*37)%100)/100*.3,sway:.6+((def.seed*53)%100)/100*.9,ph:def.seed*.91}
 const sm=[{p:V(),w:0},{p:V(),w:0}],hold=[null,null],lk={p:V(),w:0},tmp=V()
 const c={h:[null,null],hw:[1,1],look:null,lean:0,tilt:0,nod:0,yawT:null}
 const paper={mesh:new THREE.Mesh(geo('paper',()=>new THREE.BoxGeometry(.075,.004,.1)),white()),off:V(0,-.012,.02),target:sl.paperP.clone(),sc:1,timer:0,grow:0}
 paper.mesh.position.copy(sl.paperP);paper.mesh.visible=false;scene.add(paper.mesh)
 let steps=[],si=0,wi=0,u=0,endFn=null,mode='hidden',cur='',listen=null,listenUntil=0,listenShared=false,walking=false,force=null
 let hist=[],time=0,lastCoffee=-99,lastCollab=-99,lastDeliver=-99,lastGreet=-99
 const blink=rr(0,3),A={def,root:R,rig,sl,S,focus:null,flight:null}
 const H=(i,p,w=1)=>{c.h[i]=p;c.hw[i]=w}
 const lp=(x,y,z)=>R.localToWorld(V(x,y,z))
 const head=()=>rig.head.getWorldPosition(V())
 const mouth=()=>rig.head.localToWorld(V(0,-.1,.26))
 const carry=()=>rig.torso.localToWorld(V(.14,.3,.32))
 const faceTo=p=>atan2(p.x-S.pos.x,p.z-S.pos.z)
 const P=()=>room.members.find(m=>m!==A&&m.isReady())||null
 const othersWalking=()=>room.members.some(m=>m!==A&&m.isWalking())
 const T_=(t,run,on)=>({t,run,on})
 const typeH=(t,k=1)=>{k*=own.tempo;const q=sl.keys,a=sin(t*5*k)*.012
  H(0,V(q.x+sl.h.x*.09+sl.f.x*a,q.y+.012*max(0,sin(t*13*k)),q.z+sl.h.z*.09+sl.f.z*a))
  H(1,V(q.x-sl.h.x*.09-sl.f.x*a,q.y+.012*max(0,sin(t*11*k+1)),q.z-sl.h.z*.09-sl.f.z*a))}
 const rest=w=>{const q=sl.keys;H(0,V(q.x+sl.h.x*.12,q.y,q.z+sl.h.z*.12),w);H(1,V(q.x-sl.h.x*.12,q.y,q.z-sl.h.z*.12),w)}
 const ACT={
  work:()=>[T_(rr(4,8),(u,t)=>{typeH(t);c.look=sl.screenP;c.lean=.03})],
  /*a-call*/call:()=>[T_(rr(3,4.5),(u,t)=>{H(1,rig.head.localToWorld(V(-.3,-.04,.06)),ss(0,.25,u)*(1-ss(.85,1,u)));c.tilt=.1;c.look=lp(0,1.3,2.5);c.nod=.03*sin(t*3)})],
  review:()=>[T_(rr(3,4.5),(u,t)=>{const n=sl.notes;c.look=u<.6?n:sl.screenP;c.lean=.06;H(0,V(n.x+sl.h.x*.1,n.y+.012,n.z+sl.h.z*.1),.8);c.nod=.07*sin(u*PI*4)*u})],
  read:()=>[T_(rr(2.6,4),u=>{c.look=u<.5?sl.screenP:sl.notes;c.lean=.05;rest(.7)})],
  check:()=>{const p=P(),tg=p?p.sl.screenP:room.shared;return[T_(rr(2.4,3.4),u=>{c.look=u<.35?sl.screenP:tg;c.lean=.04;rest(.6)})]},
  adjust:()=>{const b=sl.dialM?sl.dialM.rotation.y:0
   return[T_(rr(3,4),(u,t)=>{const k=ss(0,.25,u)*(1-ss(.8,1,u));c.look=(u<.2||u>.85)?sl.screenP:sl.dial;H(1,V(sl.dial.x+.01*sin(t*3),sl.dial.y+.03,sl.dial.z),k);if(sl.dialM)sl.dialM.rotation.y=b+ss(.25,.75,u)*2.2;c.lean=.06})]},
  note:()=>[T_(rr(4,6),(u,t)=>{const n=sl.notes;c.look=n;c.lean=.08;H(1,V(n.x+.03*sin(t*5),n.y+.012,n.z+.015*sin(t*9)));H(0,V(n.x+sl.h.x*.1,n.y+.01,n.z+sl.h.z*.1),.8)})],
  think:()=>[T_(rr(2.4,3.2),u=>{c.look=u<.5?sl.notes:sl.screenP;c.lean=.03;rest(.5)}),
   T_(1.8,u=>{H(1,mouth().add(V(0,-.03,.05)),ss(0,.3,u)*(1-ss(.85,1,u)));c.tilt=.12;c.look=lp(0,1.2,2)}),
   T_(1.4,u=>{c.lean=-.07*sin(PI*u);c.look=room.shared})],
  stretch:()=>[T_(rr(3,4),u=>{const k=ss(0,.3,u)*(1-ss(.75,1,u));H(0,lp(.32,1.5,.12),k);H(1,lp(-.32,1.5,.12),k);c.look=lp(0,2.4,1.2);c.lean=-.07*k})],
  organize:()=>[T_(rr(4,6),(u,t)=>{const td=sl.tidy,k=min(td.length-1,floor(u*td.length)),p=td[k];H(k%2,V(p.x,p.y+.03+.015*sin(t*6),p.z));c.look=p;c.lean=.06})],
  sat:()=>[T_(2,u=>{H(0,lp(.35,1.35,.25),ss(0,.3,u)*(1-ss(.7,1,u)));c.nod=.15*sin(u*PI*3)*(1-u);c.look=sl.screenP})],
  tilt:()=>[T_(1.8,u=>{c.tilt=.2*sin(PI*u);const p=P();c.look=p?p.head():room.shared})],
  greet:()=>[T_(2.6,(u,t)=>{const f=A.focus;if(f){c.yawT=faceTo(f.pos);c.look=f.head}H(1,lp(-.4+.06*sin(t*10),1.45,.2),ss(0,.2,u)*(1-ss(.8,1,u)));c.nod=.08*sin(t*4)*(1-u)},()=>{lastGreet=time})],
  coffee:()=>{const cup=room.cup,cp=cup.home,st=room.counterStand,look=()=>{c.yawT=atan2(cp.x-S.pos.x,cp.z-S.pos.z);c.look=cp}
   return Object.assign([
    {walk:[st],on:()=>{cup.busy=A;lastCoffee=time}},
    T_(.5,()=>look()),
    T_(1.2,u=>{look();H(0,V(cp.x,cp.y+.05,cp.z),ss(0,.4,u));c.lean=.08;if(u>.5&&!cup.holder){cup.holder=A;hold[0]=cup}}),
    T_(1.8,u=>{const k=ss(0,.35,u)*(1-ss(.7,1,u));H(0,lv(carry(),mouth().add(V(0,-.03,.05)),k));c.look=k>.5?lp(0,1.1,2.5):cp;cup.tilt=-.5*k}),
    T_(.9,()=>{H(0,carry());c.look=lp(0,1.1,2.5)}),
    T_(1.1,u=>{look();H(0,V(cp.x,cp.y+.05,cp.z),ss(0,.35,u));if(u>.6&&cup.holder===A){cup.holder=null;hold[0]=null;cup.tilt=0;cup.target.copy(cp)}}),
    {walk:[sl.pos]},T_(.5,()=>{})],
    {end:()=>{cup.busy=null;if(cup.holder===A){cup.holder=null;hold[0]=null;cup.tilt=0;cup.target.copy(cp)}}})},
  deliver:()=>{const p=P(),dir=p.S.pos.clone().sub(S.pos).setY(0).normalize(),stand=p.S.pos.clone().addScaledVector(dir,-.5);stand.y=S.pos.y
   return Object.assign([
    T_(.9,u=>{c.look=sl.paperP;c.lean=.07;H(0,V(sl.paperP.x,sl.paperP.y+.04,sl.paperP.z),ss(0,.3,u));if(u>.55&&hold[0]!==paper){hold[0]=paper;paper.timer=0;paper.grow=0}},()=>{lastDeliver=time}),
    {walk:[stand]},
    T_(.6,()=>{c.yawT=faceTo(p.S.pos);c.look=p.head()}),
    T_(1.3,u=>{c.yawT=faceTo(p.S.pos);c.look=p.head();const q=p.S.pos;H(0,lv(carry(),V(q.x-dir.x*.12,S.pos.y+.5,q.z-dir.z*.12),ss(0,.5,u)));if(u>.62&&hold[0]===paper){hold[0]=null;paper.target.copy(p.sl.drop);paper.timer=time+5}},()=>p.setListen(A,time+2.6,false)),
    {walk:[sl.pos]},T_(.4,()=>{})],
    {end:()=>{if(hold[0]===paper){hold[0]=null;paper.target.copy(sl.paperP)}}})},
  collab:()=>{const p=P()
   return Object.assign([
    T_(.8,()=>{c.yawT=faceTo(p.S.pos);c.look=p.head()},()=>{lastCollab=time;p.setListen(A,time+9,false)}),
    T_(rr(3,4.5),(u,t)=>{c.yawT=faceTo(p.S.pos);c.look=p.head();H(1,lp(-.3+.05*sin(t*2.2),1.1+.06*sin(t*3),.35),ss(0,.2,u)*(1-ss(.8,1,u)));c.nod=.04*sin(t*3)}),
    T_(1.6,()=>{c.look=room.shared;c.lean=.03},()=>p.setListen(A,time+4,true)),
    T_(.8,u=>{c.yawT=faceTo(p.S.pos);c.look=p.head();c.nod=.14*sin(u*PI*3)*(1-u)})],
    {end:()=>p.endListen()})}}
 const can=k=>{const p=P(),f=A.focus
  if(k==='coffee')return def.slot!=='B'&&!!room.cup&&!room.cup.holder&&!room.cup.busy&&time-lastCoffee>45&&!othersWalking()
  if(k==='collab')return !!p&&!p.isBusy()&&!p.hasListen()&&time-lastCollab>28&&p.S.pos.distanceTo(S.pos)<4.8
  if(k==='deliver')return !!p&&!p.isBusy()&&!hold[0]&&time-lastDeliver>24&&p.S.pos.distanceTo(S.pos)<4.4&&!othersWalking()
  if(k==='greet')return !!f&&f.on&&f.pos.distanceTo(S.pos)<3.8&&time-lastGreet>25
  return true}
 const pick=()=>{endFn&&endFn();endFn=null
  let id=force;force=null
  if(!id||!can(id)){let pool=Object.keys(WT).filter(can);const rec=hist.slice(-2),fresh=pool.filter(k=>!rec.includes(k));if(fresh.length)pool=fresh
   const rm=ROLE[def.role]||{},w=pool.map(k=>WT[k]*(rm[k]||1));let r=rnd()*w.reduce((a,b)=>a+b,0),i=0;while(i<pool.length-1&&(r-=w[i])>0)i++;id=pool[i]}
  cur=id;hist.push(id);if(hist.length>8)hist.shift()
  if(id==='coffee'||id==='deliver'||id==='collab')force='work'
  steps=ACT[id]();si=0;wi=0;u=0;endFn=steps.end||null;if(steps[0].on)steps[0].on()}
 const adv=()=>{si++;u=0;wi=0;if(si>=steps.length){endFn&&endFn();endFn=null;steps=[];si=0;cur=''}else if(steps[si].on)steps[si].on()}
 A.update=(dt,t)=>{if(mode!=='ready')return
  dt=min(dt,.05);time=t;const kk=r=>1-Math.exp(-dt*r)
  c.h[0]=c.h[1]=null;c.look=null;c.lean=c.tilt=c.nod=0;c.yawT=null
  let moving=false,stepD=0
  const lis=listen&&time<listenUntil
  if(lis){c.yawT=faceTo(listen.S.pos);c.look=listenShared?room.shared:listen.head();c.nod=.05*sin(time*3)}
  else{
   if(!steps.length)pick()
   const st=steps[si]
   if(st.walk){const tg=st.walk[wi],dx=tg.x-S.pos.x,dz=tg.z-S.pos.z,d=hypot(dx,dz)
    if(d>.02){moving=true;stepD=min(d,min(.7,.2+d*1.6)*own.tempo*dt);S.pos.x+=dx/d*stepD;S.pos.z+=dz/d*stepD;c.yawT=d>.12?atan2(dx,dz):null}
    else if(++wi>=st.walk.length)adv()}
   else{u+=dt/st.t;st.run(min(u,1),time);if(u>=1)adv()}}
  walking=!!(steps[si]&&steps[si].walk)&&!lis
  S.yaw+=wrap((c.yawT==null?sl.yaw:c.yawT)-S.yaw)*kk(moving?10:7)
  S.W+=((moving?1:0)-S.W)*kk(10);S.ph+=stepD/(2*STR*K)
  const Hh=.59+.018*S.W*cos(4*PI*(S.ph-.25))
  R.position.copy(S.pos);R.rotation.y=S.yaw;rig.pelvis.position.y=Hh+.02
  const gL=gait(S.ph),gR=gait(S.ph+.5)
  rig.legSolve(rig.legs[0],gL.x*S.W,FOOT+gL.y*S.W-Hh);rig.legSolve(rig.legs[1],gR.x*S.W,FOOT+gR.y*S.W-Hh)
  S.lean+=(c.lean-S.lean)*kk(5);{const id=1-S.W;rig.torso.rotation.x=.07*S.W+S.lean+.012*sin(time*1.5*own.tempo+own.ph)*id;rig.torso.rotation.z=.03*own.sway*sin(time*.65*own.tempo+own.ph)*id}
  R.updateMatrixWorld(true)
  for(let i=0;i<2;i++){let T=c.h[i],w=T?c.hw[i]:0
   if(!T&&hold[i]){T=rig.torso.localToWorld(tmp.set(i?-.14:.14,.3,.32));w=1}
   if(T){if(sm[i].w<.04)rig.arms[i].hand.getWorldPosition(sm[i].p);sm[i].p.lerp(T,kk(10))}
   sm[i].w+=(w-sm[i].w)*kk(7)
   const g=i?gR:gL;rig.arm(rig.arms[i],.5*S.W*g.x/(STR/2),sm[i].p,sm[i].w)}
  if(c.look){if(lk.w<.05)lk.p.copy(c.look);lk.p.lerp(c.look,kk(7))}
  lk.w+=((c.look?1:0)-lk.w)*kk(5)
  let ty=0,tx=0
  if(lk.w>.01){const l=rig.torso.worldToLocal(tmp.copy(lk.p)).sub(rig.head.position);ty=cl(atan2(l.x,l.z),-1.1,1.1)*lk.w;tx=cl(-atan2(l.y,hypot(l.x,l.z)),-.5,.5)*lk.w}
  ty+=.09*own.sway*sin(time*.55*own.tempo+own.ph)*(1-lk.w)*(1-S.W)
  S.nod+=(c.nod-S.nod)*kk(10);S.tilt+=(c.tilt-S.tilt)*kk(5)
  const Hd=rig.head.rotation;Hd.y+=(ty-Hd.y)*kk(7);Hd.x+=(tx+S.nod-Hd.x)*kk(7);Hd.z+=(S.tilt-Hd.z)*kk(5)
  rig.eyes.forEach(e=>{e.scale.y=((time+blink)%3.6)>3.5?.1:1})
  R.updateMatrixWorld(true)
  if(hold[0]){rig.arms[0].hand.getWorldPosition(tmp);hold[0].mesh.position.copy(tmp).add(hold[0].off);if(hold[0]===paper)paper.mesh.rotation.y=S.yaw;else hold[0].mesh.rotation.x=hold[0].tilt||0}
  if(hold[0]!==paper)paper.mesh.position.lerp(paper.target,kk(8))
  if(paper.timer&&time>paper.timer){paper.sc-=dt*2.5;if(paper.sc<=0){paper.sc=0;paper.timer=0;paper.mesh.position.copy(sl.paperP);paper.target.copy(sl.paperP);paper.grow=1}}
  else if(paper.grow){paper.sc=min(1,paper.sc+dt*2.5);if(paper.sc>=1)paper.grow=0}
  paper.mesh.scale.setScalar(max(.001,paper.sc))}
 A.isReady=()=>mode==='ready';A.isWalking=()=>walking;A.isBusy=()=>cur==='coffee'||cur==='deliver'||cur==='collab'||walking
 A.hasListen=()=>!!listen&&time<listenUntil;A.setListen=(f,untl,sh)=>{listen=f;listenUntil=untl;listenShared=sh};A.endListen=()=>{listenUntil=0};A.head=head
 A.setVisible=v=>{R.visible=v;paper.mesh.visible=v&&mode==='ready'}
 A.fly=(pos,yaw,sc,tuck,lean)=>{mode='flying';R.visible=true;paper.mesh.visible=false;if(blob)blob.visible=false
  R.position.copy(pos);R.rotation.y=yaw;R.scale.setScalar(K*sc);rig.pelvis.position.y=.61
  rig.legSolve(rig.legs[0],0,FOOT-.59+tuck);rig.legSolve(rig.legs[1],-.06,FOOT-.59+tuck*1.3)
  rig.torso.rotation.x=lean;R.updateMatrixWorld(true);rig.arm(rig.arms[0],-.5,null,0);rig.arm(rig.arms[1],-.5,null,0)}
 A.placeHome=()=>{mode='ready';if(blob)blob.visible=true;R.visible=true;R.scale.setScalar(K);S.pos.copy(sl.pos);S.yaw=sl.yaw;S.W=0;S.lean=0
  hold[0]=hold[1]=null;sm[0].w=sm[1].w=0;listen=null;endFn=null;force=null;cur='';walking=false;rig.torso.rotation.x=0
  paper.mesh.visible=true;paper.mesh.position.copy(sl.paperP);paper.target.copy(sl.paperP);paper.sc=1;paper.timer=0;paper.grow=0;paper.mesh.scale.setScalar(1)
  steps=[T_(rr(.3,2.8),()=>{c.look=sl.screenP;rest(.5)})];si=0;wi=0;u=0}
 A.reset=()=>{mode='hidden';R.visible=false;paper.mesh.visible=false;hold[0]=hold[1]=null;listen=null;steps=[];endFn=null;cur='';walking=false;if(room.cup&&room.cup.holder===A)room.cup.holder=null}
 A.dispose=()=>{scene.remove(R);scene.remove(paper.mesh);rig.dispose()}
 return A}
