import * as THREE from 'three'
const {PI,sin,cos,atan2,hypot,min,max,exp}=Math
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z)
const rnd=(a,b)=>a+Math.random()*(b-a)
const cl=(v,a=0,b=1)=>min(b,max(a,v))
const wrap=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a}
const STR=.5,FOOT=.07
const gait=ph=>{ph=((ph%1)+1)%1;if(ph<.5)return{x:STR/2-STR*(ph/.5),y:0};const t=(ph-.5)/.5;return{x:-STR/2+STR*(1-cos(PI*t))/2,y:.09*sin(PI*t)}}
const FORCE={processing:'focus',loading:'focus',error:'trouble',success:'ack',empty:'tidy'},FORCED=new Set(['focus','trouble','ack','tidy'])
// Controlled behaviour state machine: guarded actions, explicit next-lists, cooldown for coffee, no immediate repeats.
export function makeBrain(rig,env,o={}){
 const stand=env.stance==='stand',calm=o.calm?1.45:1
 const S={pos:V(),yaw:0,W:0,ph:0,lean:0,crouch:0,nod:0,tilt:0}
 const sm=[{p:V(),w:0},{p:V(),w:0}],lk={p:V(0,1,2),w:0},hold=[null,null],tmp=V()
 let act=null,u=0,dur=3,time=0,state='idle',hist=[],lastCup=-99,walking=false
 Object.entries(env.actions).forEach(([k,a])=>{a.id=k})
 const c={A:env.A,rig,env,state,mem:{},h:[null,null],hw:[1,1],look:null,lean:0,tilt:0,nod:0,crouch:0,
  H(i,p,w=1){c.h[i]=p;c.hw[i]=w},see(p){c.look=p},
  grab(ob,i){if(ob.held>=0||hold[i])return;ob.held=i;hold[i]=ob},
  drop(ob,t){if(ob.held>=0)hold[ob.held]=null;ob.held=-1;ob.tiltV=0;if(t)ob.target.copy(t)},
  held:i=>hold[i],headP:(x,y,z)=>rig.head.localToWorld(V(x,y,z))}
 const ok=k=>{const a=env.actions[k];return a&&(!a.can||a.can(c))&&(k!=='coffee'||time-lastCup>30)}
 const start=id=>{env.carry.forEach(ob=>{ob.tiltV=0;if(ob.held>=0&&!ob.seq&&ob.owner!==id)c.drop(ob,ob.home)})
  act=env.actions[id];u=0;dur=rnd(act.dur[0],act.dur[1])*calm;c.mem={};hist.push(id);if(hist.length>12)hist.shift();if(id==='coffee')lastCup=time;walking=!!act.at}
 const pick=()=>{let id=FORCE[state]
  if(!id||!env.actions[id]){let cand=((act&&act.next&&!FORCED.has(act.id))?act.next:env.order).filter(ok)
   if(!cand.length)cand=env.order.filter(ok);if(!cand.length)cand=['ready']
   const recent=hist.slice(-2),fresh=cand.filter(k=>!recent.includes(k)),pool=fresh.length?fresh:cand
   const wt=pool.map(k=>env.actions[k].w||1);let r=Math.random()*wt.reduce((a,b)=>a+b,0),i=0;while(i<pool.length-1&&(r-=wt[i])>0)i++;id=pool[i]}
  start(id)}
 const setState=s=>{if(s===state)return;state=s;if(FORCE[s]&&env.actions[FORCE[s]])start(FORCE[s]);else if(act&&FORCED.has(act.id))pick()}
 const reset=()=>{S.pos.set((env.start||[0,0])[0],0,(env.start||[0,0])[1]);S.yaw=0;act=null;hist=[];hold[0]=hold[1]=null;sm[0].w=sm[1].w=0;env.carry.forEach(ob=>{ob.held=-1})}
 reset()
 const update=dt=>{dt=min(dt||.016,.05);time+=dt;const kk=r=>1-exp(-dt*r)
  c.h[0]=c.h[1]=null;c.look=null;c.lean=c.tilt=c.nod=c.crouch=0;c.state=state
  if(!act)pick()
  let moving=false,step=0
  if(act.at&&walking){const st=env.stations[act.at],dx=st.x-S.pos.x,dz=st.z-S.pos.z,d=hypot(dx,dz)
   if(d>.04){moving=true;step=min(d,min(1.15,.4+d*1.6)*dt);S.pos.x+=dx/d*step;S.pos.z+=dz/d*step
    if(d>.25)S.yaw+=wrap(atan2(dx,dz)-S.yaw)*kk(9);else S.yaw+=wrap(st.yaw-S.yaw)*kk(9)}else walking=false}
  if(!moving){if(act.at)S.yaw+=wrap(env.stations[act.at].yaw-S.yaw)*kk(8);u+=dt/dur;act.run(c,min(u,1),time);if(u>=1)pick()}
  S.W+=((moving?1:0)-S.W)*kk(10);S.ph+=step/(2*STR)
  const bob=stand?.018*S.W*cos(4*PI*(S.ph-.25)):0
  S.crouch+=(c.crouch-S.crouch)*kk(6)
  const Hh=stand?.59-S.crouch+bob:.45-S.crouch*.4
  rig.root.position.copy(S.pos);rig.root.rotation.y=S.yaw;rig.pelvis.position.y=Hh+.02
  const gL=gait(S.ph),gR=gait(S.ph+.5)
  if(stand){rig.legSolve(rig.legs[0],gL.x*S.W,FOOT+gL.y*S.W-Hh);rig.legSolve(rig.legs[1],gR.x*S.W,FOOT+gR.y*S.W-Hh)}
  else{rig.legSolve(rig.legs[0],env.footZ,FOOT-Hh);rig.legSolve(rig.legs[1],env.footZ,FOOT-Hh)}
  S.lean+=(c.lean-S.lean)*kk(5)
  rig.torso.rotation.x=(stand?.07*S.W:.05)+S.lean+.004*sin(time*1.7)
  rig.root.updateMatrixWorld(true)
  for(let i=0;i<2;i++){let T=c.h[i],w=T?c.hw[i]:0
   if(!T&&hold[i]){T=rig.torso.localToWorld(tmp.set(i?-.14:.14,.3,.32));w=1}
   if(T){if(sm[i].w<.04)rig.arms[i].hand.getWorldPosition(sm[i].p);sm[i].p.lerp(T,kk(10))}
   sm[i].w+=(w-sm[i].w)*kk(7)
   const g=i?gR:gL;rig.arm(rig.arms[i],.5*S.W*g.x/(STR/2),sm[i].p,sm[i].w)}
  if(c.look){if(lk.w<.05)lk.p.copy(c.look);lk.p.lerp(c.look,kk(7))}
  lk.w+=((c.look?1:0)-lk.w)*kk(5)
  let ty=0,tx=0
  if(lk.w>.01){const l=rig.torso.worldToLocal(tmp.copy(lk.p)).sub(rig.head.position);ty=cl(atan2(l.x,l.z),-1.1,1.1)*lk.w;tx=cl(-atan2(l.y,hypot(l.x,l.z)),-.5,.5)*lk.w}
  S.nod+=(c.nod-S.nod)*kk(10);S.tilt+=(c.tilt-S.tilt)*kk(5)
  const H=rig.head.rotation;H.y+=(ty-H.y)*kk(7);H.x+=(tx+S.nod-H.x)*kk(7);H.z+=(S.tilt-H.z)*kk(5)
  rig.eyes.forEach(e=>{e.scale.y=(time%3.6)>3.5?.1:1})
  rig.root.updateMatrixWorld(true)
  for(const ob of env.carry){if(ob.held>=0){rig.arms[ob.held].hand.getWorldPosition(tmp);ob.mesh.position.copy(tmp).add(ob.off);ob.mesh.rotation.x+=((ob.tiltV||0)-ob.mesh.rotation.x)*kk(10)}
   else{ob.mesh.position.lerp(ob.target,kk(7));ob.mesh.rotation.x+=(0-ob.mesh.rotation.x)*kk(8)}}}
 return{update,setState,reset}}
