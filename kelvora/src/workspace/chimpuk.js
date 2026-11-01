import * as THREE from 'three'
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {getEnv} from '../Robot3D.jsx'
const {PI,sin,cos,atan2,sqrt,min,max,hypot,acos}=Math
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z)
const cl=(v,a=0,b=1)=>min(b,max(a,v))
const M={}
export const mat=(k,o)=>M[k]||(M[k]=new THREE.MeshPhysicalMaterial({envMap:getEnv(),envMapIntensity:1,side:THREE.DoubleSide,...o}))
export const SH=()=>mat('sh',{color:0xf1f3fa,metalness:.2,roughness:.22,clearcoat:1,clearcoatRoughness:.08})
export const DK=()=>mat('dk',{color:0x1b1e29,metalness:.8,roughness:.32,clearcoat:.5})
export const MID=()=>mat('mid',{color:0x2b3040,metalness:.6,roughness:.4})
export const glow=(c=0xb9f45c,i=1.4)=>M['g'+c+'_'+i]||(M['g'+c+'_'+i]=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i,roughness:.4}))
export const disposeMats=()=>{for(const k in M){M[k].dispose();delete M[k]}}
let BM
export const blobMat=()=>{if(!BM){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);BM=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false})}return BM}
const _e=new THREE.Euler(),_q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_a=V(),_b=V(),_c=V(),_p=V(),_dn=V(0,-1,0)
export function makeChimpuk(){
 const geos=[],LU=.3,LF=.28,T1=.3,T2=.3
 const add=(g,m,x,y,z,p)=>{geos.push(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o}
 const rb=(w,h,d,r,m,x,y,z,p)=>add(new RoundedBoxGeometry(w,h,d,3,min(r,min(w,h,d)/2.01)),m,x,y,z,p)
 const cy=(a,b,h,m,x,y,z,p)=>add(new THREE.CylinderGeometry(a,b,h,22),m,x,y,z,p)
 const sp=(r,m,x,y,z,p)=>add(new THREE.SphereGeometry(r,18,14),m,x,y,z,p)
 const bx=(w,h,d,m,x,y,z,p)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,p)
 const SHm=SH(),DKm=DK(),RG=glow(0xb9f45c,1.6)
 const root=new THREE.Group(),pelvis=new THREE.Group();root.add(pelvis)
 const bl=add(new THREE.PlaneGeometry(.9,.9),blobMat(),0,.006,0,root);bl.rotation.x=-PI/2
 rb(.34,.14,.22,.05,DKm,0,0,0,pelvis)
 const torso=new THREE.Group();torso.position.y=.08;pelvis.add(torso)
 rb(.4,.42,.27,.1,SHm,0,.23,0,torso);rb(.2,.05,.02,.01,RG,0,.27,.14,torso);rb(.3,.08,.2,.04,DKm,0,.44,0,torso)
 const head=new THREE.Group();head.position.y=.57;torso.add(head)
 rb(.44,.33,.36,.13,SHm,0,0,0,head);rb(.36,.2,.05,.02,DKm,0,.01,.175,head)
 const eyes=[-1,1].map(s=>{const e=add(new THREE.CapsuleGeometry(.025,.07,4,8),RG,s*.085,.015,.205,head);e.rotation.z=PI/2;return e})
 cy(.012,.012,.14,DKm,0,.23,0,head);sp(.03,RG,0,.31,0,head)
 const mkArm=sx=>{const sh=new THREE.Group();sh.position.set(sx*.25,.37,0);torso.add(sh);sp(.07,DKm,0,0,0,sh);rb(.09,.32,.09,.04,SHm,0,-.15,0,sh)
  const el=new THREE.Group();el.position.y=-.3;sh.add(el);sp(.05,DKm,0,0,0,el);rb(.08,.3,.08,.035,SHm,0,-.14,0,el)
  const hand=new THREE.Group();hand.position.y=-.28;el.add(hand);sp(.065,DKm,0,0,0,hand);sp(.025,RG,0,-.03,.04,hand);return{sh,el,hand,sx}}
 const arms=[mkArm(1),mkArm(-1)]
 const mkLeg=sx=>{const hip=new THREE.Group();hip.position.set(sx*.1,-.02,0);pelvis.add(hip);sp(.06,DKm,0,0,0,hip);rb(.1,.32,.1,.045,SHm,0,-.15,0,hip)
  const knee=new THREE.Group();knee.position.y=-T1;hip.add(knee);sp(.05,DKm,0,0,0,knee);rb(.09,.32,.09,.04,SHm,0,-.15,0,knee)
  const ankle=new THREE.Group();ankle.position.y=-T2;knee.add(ankle);const foot=new THREE.Group();ankle.add(foot);rb(.14,.07,.26,.03,DKm,0,-.035,.05,foot);bx(.1,.012,.1,RG,0,-.068,.1,foot)
  return{hip,knee,foot}}
 const legs=[mkLeg(1),mkLeg(-1)]
 const legSolve=(lg,tz,ty)=>{const dist=hypot(tz,ty),d=min(max(dist,.15),T1+T2-.003),k=dist>0?d/dist:1;tz*=k;ty*=k
  const th=atan2(tz,-ty),A=acos(cl((T1*T1+d*d-T2*T2)/(2*T1*d),-1,1)),t1=th+A
  const kz=T1*sin(t1),ky=-T1*cos(t1),t2=atan2(tz-kz,-(ty-ky))
  lg.hip.rotation.x=-t1;lg.knee.rotation.x=t1-t2;lg.foot.rotation.x=t2}
 const _E=new THREE.Euler(),_Q1=new THREE.Quaternion(),_Q2=new THREE.Quaternion(),_Qs=new THREE.Quaternion(),_Qe=new THREE.Quaternion(),_Qi=new THREE.Quaternion(),_d=V(),_dir=V(),_pole=V(),_el=V(),_f=V(),_w=V()
 const arm=(a,swing,T,w)=>{const sh=a.sh,el=a.el
  _Q1.setFromEuler(_E.set(swing,0,a.sx*.09));_Q2.setFromEuler(_E.set(-.3,0,0))
  if(!T||w<.001){sh.quaternion.copy(_Q1);el.quaternion.copy(_Q2);return}
  _w.copy(T);torso.worldToLocal(_w);_d.copy(_w).sub(sh.position);let D=_d.length();const R=LU+LF-.01
  if(D>R){_d.multiplyScalar(R/D);D=R}
  if(D<.15){_d.copy(_dn).multiplyScalar(.15);D=.15}
  _dir.copy(_d).normalize();const aa=(LU*LU-LF*LF+D*D)/(2*D),hh=sqrt(max(0,LU*LU-aa*aa))
  _pole.set(a.sx*.8,-.5,-.35);_pole.addScaledVector(_dir,-_pole.dot(_dir)).normalize()
  _el.copy(_dir).multiplyScalar(aa).addScaledVector(_pole,hh)
  _Qs.setFromUnitVectors(_dn,_f.copy(_el).normalize())
  _f.copy(_d).sub(_el).applyQuaternion(_Qi.copy(_Qs).invert()).normalize()
  _Qe.setFromUnitVectors(_dn,_f)
  sh.quaternion.copy(_Q1).slerp(_Qs,w);el.quaternion.copy(_Q2).slerp(_Qe,w)}
 return{root,pelvis,torso,head,eyes,arms,legs,legSolve,arm,dispose:()=>geos.forEach(g=>g.dispose())}}
