import * as THREE from 'three'
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {getEnv} from './Robot3D.jsx'
import {TL,U,E} from './journeyTL.js'
const ACC=0xb9f45c
const {PI,sin,cos,atan2,sqrt,min,max,abs,acos,hypot,floor,exp}=Math
const cl=(v,a=0,b=1)=>min(b,max(a,v))
const sg=i=>i%2?-1:1
const ss=(a,b,v)=>{const t=cl((v-a)/(b-a));return t*t*(3-2*t)}
const lerp=(a,b,t)=>a+(b-a)*t
const wrap=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a}
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z)
const PTS=[[0,0,0],[5,0,10],[-4,.3,20],[-8,.6,32],[2,.9,42],[10,.7,52],[6,.4,62],[-3,.6,72],[-6,1,82],[1,1.2,92],[4,1,102]]
const HW=1.4,DEV_LAT=1.8,ROB_LAT=1.4,STR=.5,LU=.3,LF=.28,T1=.3,T2=.3,FOOT=.07
const gait=ph=>{ph=((ph%1)+1)%1;if(ph<.5)return{x:STR/2-STR*(ph/.5),y:0};const t=(ph-.5)/.5;return{x:-STR/2+STR*(1-cos(PI*t))/2,y:.09*sin(PI*t)}}
const _e=new THREE.Euler(),_q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_a=V(),_b=V(),_c=V(),_p=V(),_dn=V(0,-1,0)

export function createJourney(host,api){
const {getP,visible,onStation,onFail,reduced}=api
let renderer
try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch{return null}
const geos=[],mats=[],texs=[]
const mob=()=>host.clientWidth<760
let dpr=min(devicePixelRatio||1,mob()?1.5:2),lost=false
renderer.setPixelRatio(dpr);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05
host.appendChild(renderer.domElement)
const onLost=e=>{e.preventDefault();lost=true;if(onFail)onFail()}
renderer.domElement.addEventListener('webglcontextlost',onLost)
const BG=0x090b11,scene=new THREE.Scene();scene.background=new THREE.Color(BG);scene.fog=new THREE.Fog(BG,14,mob()?46:68)
const cam=new THREE.PerspectiveCamera(40,1,.1,120),env=getEnv()
scene.add(new THREE.HemisphereLight(0xbfc8ff,0x0a0b10,.9))
const sun=new THREE.DirectionalLight(0xffffff,2.1);scene.add(sun,sun.target)

// ---------- helpers ----------
const mk=o=>{const m=new THREE.MeshPhysicalMaterial({envMap:env,envMapIntensity:1,side:THREE.DoubleSide,...o});mats.push(m);return m}
const GL=()=>{const m=new THREE.MeshStandardMaterial({color:ACC,emissive:ACC,emissiveIntensity:1.6,roughness:.4});mats.push(m);return m}
const SH=mk({color:0xf1f3fa,metalness:.2,roughness:.22,clearcoat:1,clearcoatRoughness:.08})
const DK=mk({color:0x1b1e29,metalness:.8,roughness:.32,clearcoat:.5})
const MID=mk({color:0x2b3040,metalness:.6,roughness:.4})
const add=(g,m,x,y,z,par)=>{geos.push(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);par.add(o);return o}
const rb=(w,h,d,r,m,x,y,z,par)=>add(new RoundedBoxGeometry(w,h,d,3,min(r,min(w,h,d)/2)),m,x,y,z,par)
const cy=(a,b,h,m,x,y,z,par)=>add(new THREE.CylinderGeometry(a,b,h,22),m,x,y,z,par)
const sp=(r,m,x,y,z,par)=>add(new THREE.SphereGeometry(r,18,14),m,x,y,z,par)
const bx=(w,h,d,m,x,y,z,par)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,par)
const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;texs.push(t);return{t,redraw:(...a)=>{draw(x,w,h,...a);t.needsUpdate=true}}}

// ---------- road path (arc-length parametrised) ----------
const curve=new THREE.CatmullRomCurve3(PTS.map(p=>V(...p)),false,'centripetal');curve.arcLengthDivisions=1500
const L=curve.getLength()
const pt=u=>curve.getPointAt(cl(u))
const fr=u=>{const p=pt(u),t=curve.getTangentAt(cl(u)),h=V(t.x,0,t.z).normalize();return{p,h,yaw:atan2(h.x,h.z),l:V(h.z,0,-h.x),r:V(-h.z,0,h.x)}}
const N=mob()?260:420,samp=[];for(let i=0;i<=N;i++)samp.push(fr(i/N))
const sweep=(segs,m)=>{const pos=[],idx=[];segs.forEach(s=>{const base=pos.length/3
 for(let i=0;i<=N;i++){const f=samp[i];for(let j=0;j<2;j++){const[lat,y]=s[j];pos.push(f.p.x+f.l.x*lat,f.p.y+y,f.p.z+f.l.z*lat)}}
 for(let i=0;i<N;i++){const a=base+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}})
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();geos.push(g);const o=new THREE.Mesh(g,m);scene.add(o);return o}
const roadM=mk({color:0x20242f,metalness:.25,roughness:.55}),curbM=mk({color:0x12141c,metalness:.5,roughness:.5})
const lineM=new THREE.MeshBasicMaterial({color:ACC,side:THREE.DoubleSide});mats.push(lineM)
sweep([[[HW,0],[-HW,0]]],roadM)
sweep([[[HW,0],[HW-.04,-.3]],[[-HW+.04,-.3],[-HW,0]]],curbM)
sweep([[[HW-.06,.012],[HW-.14,.012]],[[-HW+.14,.012],[-HW+.06,.012]]],lineM)

// ---------- world ----------
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),mk({color:0x0b0d14,metalness:0,roughness:1}));geos.push(ground.geometry);ground.rotation.x=-PI/2;ground.position.set(0,-.72,50);scene.add(ground)
const grid=new THREE.GridHelper(300,150,0x2a3140,0x2a3140);grid.material.transparent=true;grid.material.opacity=.4;grid.position.set(0,-.71,50);scene.add(grid);geos.push(grid.geometry);mats.push(grid.material)
const dm=new THREE.Object3D()
const lampN=mob()?10:18
const poleG=new THREE.CylinderGeometry(.03,.03,1.5,8),headG=new THREE.SphereGeometry(.09,10,8);geos.push(poleG,headG)
const poles=new THREE.InstancedMesh(poleG,DK,lampN),heads=new THREE.InstancedMesh(headG,lineM,lampN);scene.add(poles,heads)
for(let i=0;i<lampN;i++){const f=fr(.03+.95*i/(lampN-1));dm.position.copy(f.p).addScaledVector(f.l,HW+.35);dm.position.y+=.75;dm.updateMatrix();poles.setMatrixAt(i,dm.matrix);dm.position.y+=.8;dm.updateMatrix();heads.setMatrixAt(i,dm.matrix)}
const NB=mob()?36:72,bg=new THREE.BoxGeometry(1,1,1);geos.push(bg)
const boxes=new THREE.InstancedMesh(bg,mk({color:0x151a26,metalness:.35,roughness:.6,envMapIntensity:.5}),NB);scene.add(boxes)
let placed=0,guard=0
while(placed<NB&&guard++<3000){const x=(Math.random()-.5)*90,z=-12+Math.random()*130;let dmin=1e9
 for(let i=0;i<samp.length;i+=8)dmin=min(dmin,hypot(samp[i].p.x-x,samp[i].p.z-z))
 if(dmin<8)continue
 const w=1.5+Math.random()*3.5,h=1+Math.random()*8,d=1.5+Math.random()*3.5
 dm.position.set(x,-.72+h/2,z);dm.scale.set(w,h,d);dm.updateMatrix();boxes.setMatrixAt(placed++,dm.matrix)}
boxes.count=placed;dm.scale.set(1,1,1)

// ---------- stations (each with its own purposeful action) ----------
const d0=D=>{
 rb(.9,.7,.5,.04,DK,0,.38,0,D);const top=rb(.9,.06,.5,.025,SH,0,.76,.02,D);top.rotation.x=-.18
 const bm=GL(),btn=cy(.1,.1,.05,bm,0,.82,.08,D),gm=GL()
 const bars=[-.3,0,.3].map(x=>rb(.1,1.5,.1,.04,gm,x,1,-.25,D))
 const sg=tex(512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#b9f45c';x.font='bold 88px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('KELVORA',w/2,h/2)})
 const sm=new THREE.MeshBasicMaterial({map:sg.t,transparent:true,opacity:.2,depthWrite:false});mats.push(sm)
 add(new THREE.PlaneGeometry(1.8,.45),sm,0,2.55,-.25,D)
 return w=>{const reach=ss(.08,.26,w)*(1-ss(.74,.9,w)),press=ss(.36,.43,w)*(1-ss(.5,.57,w)),res=ss(.46,.72,w)
  btn.position.y=.82-.03*press;bm.emissiveIntensity=1.2+2*press+res
  bars.forEach((b,i)=>{const k=max(.03,ss(.46+i*.04,.68+i*.04,w));b.scale.y=k;b.position.y=.8+.75*k});gm.emissiveIntensity=.25+1.6*res;sm.opacity=.15+.85*res
  return{rT:D.localToWorld(V(0,lerp(.98,.88,press),.12)),rW:reach,look:D.localToWorld(V(0,lerp(.9,2.3,res),lerp(.1,-.25,res))),lookW:ss(.3,.45,w)*(1-ss(.9,1,w)),lean:.1*reach}}}

const d1=D=>{
 bx(.8,.05,.5,MID,.25,.03,0,D);cy(.05,.06,.75,DK,.25,.42,-.1,D);rb(1.5,.95,.07,.03,DK,.25,1.2,-.1,D)
 const T=tex(512,320,(x,w,h,scan=0,res=0)=>{x.fillStyle='#0b0d14';x.fillRect(0,0,w,h);x.fillStyle='#161a26';x.fillRect(0,0,w,44);x.fillStyle='#b9f45c';x.font='bold 22px sans-serif';x.textAlign='left';x.textBaseline='middle';x.fillText('AUDIT',18,23)
  ;[['HTTPS secure',1],['Mobile friendly',1],['Chatbot',0],['Online booking',0]].forEach(([n,ok],i)=>{const y=80+i*52;x.fillStyle='#2a2f40';x.fillRect(18,y-20,w-36,40);x.fillStyle='#e7e9f3';x.font='20px sans-serif';x.fillText(n,32,y);if(scan>(i+.6)/5){x.fillStyle=ok?'#b9f45c':'#ff6b82';x.fillText(ok?'OK':'MISSING',w-130,y)}})
  x.fillStyle='rgba(185,244,92,.9)';x.fillRect(0,50+scan*230,w,3)
  if(res>.5){x.fillStyle='#b9f45c';x.font='bold 28px sans-serif';x.fillText('Gaps found: 2',18,h-30)}})
 const sm=new THREE.MeshBasicMaterial({map:T.t});mats.push(sm);add(new THREE.PlaneGeometry(1.4,.86),sm,.25,1.2,-.06,D)
 let lastK=-1
 return w=>{const reach=ss(.1,.26,w)*(1-ss(.84,.95,w)),scan=ss(.22,.68,w),res=ss(.66,.8,w),k=floor(scan*28)+floor(res*6)*100
  if(k!==lastK){lastK=k;T.redraw(scan,res)}
  return{rT:D.localToWorld(V(.25+.2*sin(scan*PI*3),lerp(1.4,1,scan),.14)),rW:reach,look:D.localToWorld(V(.25,1.2,-.06)),lookW:reach,lean:.12*reach}}}

const d2=D=>{
 const gm=GL(),cm=GL();cm.emissiveIntensity=.8
 rb(.7,.95,.46,.04,SH,-.15,.52,-.04,D);rb(.34,.05,.26,.02,DK,-.05,1.02,0,D);bx(.5,.04,.02,gm,-.15,.9,.2,D)
 const gg=new THREE.Group();gg.position.set(-.15,.65,.2);D.add(gg);const gc=cy(.17,.17,.04,DK,0,0,0,gg);gc.rotation.x=PI/2
 for(let i=0;i<6;i++){const a=i*PI/3;bx(.05,.06,.04,gm,cos(a)*.19,sin(a)*.19,0,gg)}
 rb(.4,.62,.34,.03,DK,.55,.35,.05,D);rb(.34,.04,.28,.02,MID,.55,.68,.05,D)
 rb(.1,.1,.1,.03,cm,.45,.75,.05,D);rb(.1,.1,.1,.03,cm,.65,.75,.05,D)
 const cube=rb(.1,.1,.1,.03,cm,.55,.76,.05,D),orb=sp(.09,gm,-.05,1.3,.05,D)
 const binP=V(.55,.76,.05),slotH=V(-.05,1.25,.05),slotIn=V(-.05,1.04,.05)
 return w=>{const drop=ss(.56,.64,w),vanish=ss(.6,.68,w),on=ss(.62,.78,w),ob=ss(.74,.95,w)
  const hand=new THREE.Vector3(),cp=new THREE.Vector3()
  if(w<.28){hand.copy(binP);hand.y+=lerp(.4,.1,ss(.08,.2,w))}
  else if(w<.56){const t=ss(.28,.5,w);hand.copy(binP).lerp(slotH,t);hand.y+=.1+sin(t*PI)*.2-.1*ss(.5,.56,w)}
  else{hand.copy(slotH)}
  if(w<.28)cp.copy(binP);else if(w<.56){cp.copy(hand);cp.y-=.1}else{cp.set(slotH.x,slotH.y-.1,slotH.z);cp.lerp(slotIn,drop)}
  cube.position.copy(cp);cube.scale.setScalar(max(.001,1-vanish))
  gg.rotation.z=-8*ss(.6,1,w);gm.emissiveIntensity=.3+1.7*on
  orb.visible=ob>.01;orb.scale.setScalar(max(.01,ob));orb.position.set(-.05,1.3+.55*ob,.05)
  const c=ss(.06,.16,w)*(1-ss(.3,.4,w))
  return{rT:D.localToWorld(hand),rW:ss(.04,.14,w)*(1-ss(.62,.82,w)),look:D.localToWorld(w<.56?cp.clone():V(-.05,1.3+.55*ob,.05)),lookW:ss(.04,.14,w)*(1-ss(.9,1,w)),crouch:.2*c,lean:.16*c}}}

const d3=D=>{
 const gm=GL()
 rb(.9,.7,.44,.04,SH,.15,.39,0,D);cy(.14,.15,.04,DK,.45,.76,.1,D)
 const kg=new THREE.Group();kg.position.set(.45,.8,.1);D.add(kg);cy(.11,.11,.08,SH,0,0,0,kg);bx(.02,.012,.09,gm,0,.045,.03,kg)
 const HH=[.25,.4,.6,.8,1.05],bars=HH.map((h,i)=>rb(.09,1,.09,.03,gm,-.2+.1*i,.74+h/2,-.12,D))
 const arrow=add(new THREE.ConeGeometry(.06,.15,12),gm,.2,2,-.12,D)
 return w=>{const turn=ss(.22,.72,w),ang=turn*PI*1.5,res=ss(.7,.9,w)
  kg.rotation.y=-ang
  bars.forEach((b,i)=>{const k=max(.03,ss(.24+.06*i,.62+.05*i,w));b.scale.y=HH[i]*k;b.position.y=.74+HH[i]*k/2})
  const k4=ss(.48,.86,w);arrow.visible=k4>.95;arrow.position.y=.74+HH[4]*k4+.14;gm.emissiveIntensity=.4+1.4*ss(.3,.8,w)
  return{rT:D.localToWorld(V(.45+cos(ang)*.07,.93,.1+sin(ang)*.07)),rW:ss(.08,.2,w)*(1-ss(.8,.92,w)),lT:D.localToWorld(V(-.45,1.45,.15)),lW:res*(1-ss(.94,1,w)),look:D.localToWorld(V(-.05,1.2,-.1)),lookW:ss(.3,.5,w)*(1-ss(.92,1,w)),lean:.06}}}

const d4=D=>{
 const rm=GL(),dm2=new THREE.MeshBasicMaterial({color:ACC,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});mats.push(dm2)
 add(new THREE.TorusGeometry(.95,.05,14,64),rm,.2,1.3,-.15,D);add(new THREE.CircleGeometry(.9,40),dm2,.2,1.3,-.16,D)
 rb(.14,.5,.14,.04,DK,-.85,.3,-.15,D);rb(.14,.5,.14,.04,DK,1.25,.3,-.15,D)
 return w=>{const k=ss(.38,.62,w);rm.emissiveIntensity=.4+1.9*k;dm2.opacity=.5*k
  return{rT:D.localToWorld(V(lerp(.05,.65,ss(.2,.5,w)),1.22+.03*sin(w*9),.12)),rW:ss(.1,.24,w),lookCam:true,lookW:ss(.62,.8,w),faceCam:ss(.66,.85,w)*.7,lean:.03}}}

const builders=[d0,d1,d2,d3,d4]
const devs=U.map((u,i)=>{const f=fr(u),sd=sg(i),D=new THREE.Group();D.position.copy(f.p).addScaledVector(f.r,DEV_LAT*sd);D.rotation.y=f.yaw+sd*PI/2;scene.add(D)
 rb(1.7,.08,.9,.03,MID,0,0,0,D);const fn=builders[i](D);D.updateMatrixWorld(true);return fn})

// ---------- Chimpuk (articulated, procedural) ----------
const RG=GL()
const root=new THREE.Group(),pelvis=new THREE.Group();root.add(pelvis);scene.add(root)
rb(.34,.14,.22,.05,DK,0,0,0,pelvis)
const torso=new THREE.Group();torso.position.y=.08;pelvis.add(torso)
rb(.4,.42,.27,.1,SH,0,.23,0,torso);rb(.2,.05,.02,.01,RG,0,.27,.14,torso);rb(.3,.08,.2,.04,DK,0,.44,0,torso)
const head=new THREE.Group();head.position.y=.57;torso.add(head)
rb(.44,.33,.36,.13,SH,0,0,0,head);rb(.36,.2,.05,.02,DK,0,.01,.175,head)
const eyes=[-1,1].map(s=>{const e=add(new THREE.CapsuleGeometry(.025,.07,4,8),RG,s*.085,.015,.205,head);e.rotation.z=PI/2;return e})
cy(.012,.012,.14,DK,0,.23,0,head);sp(.03,RG,0,.31,0,head)
const mkArm=sx=>{const sh=new THREE.Group();sh.position.set(sx*.25,.37,0);torso.add(sh);sp(.07,DK,0,0,0,sh);rb(.09,.32,.09,.04,SH,0,-.15,0,sh)
 const el=new THREE.Group();el.position.y=-.3;sh.add(el);sp(.05,DK,0,0,0,el);rb(.08,.3,.08,.035,SH,0,-.14,0,el)
 const hand=new THREE.Group();hand.position.y=-.28;el.add(hand);sp(.065,DK,0,0,0,hand);sp(.025,RG,0,-.03,.04,hand);return{sh,el,hand,sx}}
const arms=[mkArm(1),mkArm(-1)]
const mkLeg=sx=>{const hip=new THREE.Group();hip.position.set(sx*.1,-.02,0);pelvis.add(hip);sp(.06,DK,0,0,0,hip);rb(.1,.32,.1,.045,SH,0,-.15,0,hip)
 const knee=new THREE.Group();knee.position.y=-T1;hip.add(knee);sp(.05,DK,0,0,0,knee);rb(.09,.32,.09,.04,SH,0,-.15,0,knee)
 const ankle=new THREE.Group();ankle.position.y=-T2;knee.add(ankle);const foot=new THREE.Group();ankle.add(foot);rb(.14,.07,.26,.03,DK,0,-.035,.05,foot);bx(.1,.012,.1,RG,0,-.068,.1,foot)
 return{hip,knee,foot}}
const legs=[mkLeg(1),mkLeg(-1)]
const sc=document.createElement('canvas');sc.width=sc.height=128
{const x=sc.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128)}
const shT=new THREE.CanvasTexture(sc);texs.push(shT)
const blobM=new THREE.MeshBasicMaterial({map:shT,transparent:true,depthWrite:false});mats.push(blobM)
const blob=add(new THREE.PlaneGeometry(.9,.9),blobM,0,0,0,scene);blob.rotation.x=-PI/2

const legSolve=(lg,tz,ty)=>{const dist=hypot(tz,ty),d=min(max(dist,.15),T1+T2-.003),k=dist>0?d/dist:1;tz*=k;ty*=k
 const th=atan2(tz,-ty),A=acos(cl((T1*T1+d*d-T2*T2)/(2*T1*d),-1,1)),t1=th+A
 const kz=T1*sin(t1),ky=-T1*cos(t1),t2=atan2(tz-kz,-(ty-ky))
 lg.hip.rotation.x=-t1;lg.knee.rotation.x=t1-t2;lg.foot.rotation.x=t2}
const arm=(a,swing,T,w)=>{const sh=a.sh,el=a.el
 _q.setFromEuler(_e.set(swing,0,a.sx*.09));_q2.setFromEuler(_e.set(-.3,0,0))
 if(!T||w<.001){sh.quaternion.copy(_q);el.quaternion.copy(_q2);return}
 const d=_b.copy(torso.worldToLocal(_a.copy(T))).sub(sh.position);let D=d.length();const R=LU+LF-.01
 if(D>R){d.multiplyScalar(R/D);D=R}
 if(D<.15){d.copy(_dn).multiplyScalar(.15);D=.15}
 const dir=_c.copy(d).normalize(),aa=(LU*LU-LF*LF+D*D)/(2*D),hh=sqrt(max(0,LU*LU-aa*aa))
 _p.set(a.sx*.8,-.5,-.35);_p.addScaledVector(dir,-_p.dot(dir)).normalize()
 const e=V().copy(dir).multiplyScalar(aa).addScaledVector(_p,hh)
 const qs=new THREE.Quaternion().setFromUnitVectors(_dn,e.clone().normalize())
 const f=d.clone().sub(e).applyQuaternion(qs.clone().invert()).normalize()
 const qe=new THREE.Quaternion().setFromUnitVectors(_dn,f)
 sh.quaternion.copy(_q).slerp(qs,w);el.quaternion.copy(_q2).slerp(qe,w)}

// ---------- journey state: pose is a pure function of scroll progress ----------
const sideOf=u=>{if(u>=U[4])return sg(4);let i=0;while(i<3&&u>=U[i+1])i++;const t=cl((u-U[i])/(U[i+1]-U[i]));return lerp(sg(i),sg(i+1),ss(.35,.65,t))}
const state=q=>{const g=TL.s;let u=U[0]-E,pres=0,act=q<g[0].a?0:-1,sd=1
 for(const x of g){if(q<x.a||q>x.b)continue;const t=(q-x.a)/(x.b-x.a),e=t*t*(3-2*t)
  if(x.k!=='t')sd=sg(x.i)
  if(x.k==='w'){u=U[x.i];pres=1;act=x.i}
  else{u=lerp(x.u0,x.u1,e);if(x.k==='t'){pres=0;act=-1}else if(x.k==='a'){pres=e;act=(e>.5||x.i===0)?x.i:-1}else{pres=1-e;act=e<.5?x.i:-1}}}
 if(q>g[g.length-1].b){u=U[4];pres=1;act=4;sd=sg(4)}
 return{u,pres,act,sd}}

let ps=0,first=true,lastAct=-2,lastDist=0,lastYaw=0,ph=0,W=0,yaw=0,roll=0
const camP=V(),camL=V()
const frame=(dt,t)=>{
 const kk=r=>1-exp(-dt*r)
 let p=getP()
 if(reduced){let bi=0,bd=9;TL.w.forEach((g,i)=>{const d=abs(p*TL.total-(g.a+g.b)/2);if(d<bd){bd=d;bi=i}});const g=TL.w[bi];p=(g.a+.85*(g.b-g.a))/TL.total;ps=p}
 else ps=first?p:ps+(p-ps)*kk(9)
 const q=ps*TL.total,s=state(q)
 if(s.act!==lastAct){lastAct=s.act;if(onStation)onStation(s.act)}
 const outs=devs.map((fn,i)=>fn(cl((q-TL.w[i].a)/(TL.w[i].b-TL.w[i].a))))
 const out=(s.act>=0&&outs[s.act])||{}
 const f=fr(s.u),pres=s.pres,sd=s.sd
 root.position.copy(f.p).addScaledVector(f.r,ROB_LAT*pres*sd)
 const dist=s.u*L,dd=first?0:dist-lastDist;lastDist=dist
 W+=((reduced?0:(abs(dd)/max(dt,.001)>.12?1:0))-W)*kk(10)
 ph+=cl(dd,-1.5,1.5)/(2*STR)
 let yt=f.yaw-PI/2*pres*sd
 if(out.faceCam){const cyaw=atan2(camP.x-root.position.x,camP.z-root.position.z);yt+=wrap(cyaw-yt)*out.faceCam}
 yaw=first?yt:yaw+wrap(yt-yaw)*kk(9);root.rotation.y=yaw
 const yr=first?0:wrap(f.yaw-lastYaw)/max(dt,.001);lastYaw=f.yaw
 roll+=(cl(-yr*.08,-.12,.12)*W-roll)*kk(6);pelvis.rotation.z=roll
 const gL=gait(ph),gR=gait(ph+.5),cr=out.crouch||0
 const Hh=.59-cr+.018*W*cos(4*PI*(ph-.25));pelvis.position.y=Hh+.02
 legSolve(legs[0],gL.x*W,FOOT+gL.y*W-Hh);legSolve(legs[1],gR.x*W,FOOT+gR.y*W-Hh)
 torso.rotation.x=.07*W+(out.lean||0)
 root.updateMatrixWorld(true)
 arm(arms[0],.5*W*gL.x/(STR/2),out.lT,out.lW||0);arm(arms[1],.5*W*gR.x/(STR/2),out.rT,out.rW||0)
 let ty=0,tx=0;const lk=out.lookCam?camP:out.look
 if(lk&&out.lookW>.01){const l=torso.worldToLocal(_a.copy(lk)).sub(head.position);ty=cl(atan2(l.x,l.z),-1.1,1.1)*out.lookW;tx=cl(-atan2(l.y,hypot(l.x,l.z)),-.5,.5)*out.lookW}
 else{const f2=fr(min(1,s.u+.04));ty=cl(wrap(f2.yaw-f.yaw)*.8,-.6,.6)*(1-pres)}
 head.rotation.y+=(ty-head.rotation.y)*kk(7);head.rotation.x+=(tx-head.rotation.x)*kk(7)
 eyes.forEach(e=>{e.scale.y=(t%3.6)>3.5?.1:1})
 // camera: tracks the road behind Chimpuk, eases into a profile view at stations
 const rp=root.position,M=cam.aspect<1?1.3:1,du=3.5*M/L
 const uc=s.u-du;let cb;if(uc<0){const f0=fr(0);cb=f0.p.clone().addScaledVector(f0.h,uc*L)}else cb=pt(uc)
 const camA=cb.clone();camA.y+=1.95*M
 const ahead=pt(min(1,s.u+.03));ahead.y+=.5
 const lookA=V(rp.x,rp.y+.75,rp.z).lerp(ahead,.4)
 const camB=V(rp.x,rp.y+1.55*M,rp.z).addScaledVector(f.h,-3*M).addScaledVector(f.r,.3*sd)
 const lookB=V(rp.x,rp.y+.95,rp.z).addScaledVector(f.r,.55*sd)
 const camT=camA.lerp(camB,pres),lookT=lookA.lerp(lookB,pres);camT.y=max(camT.y,f.p.y+.9)
 const dv=V().subVectors(lookT,camT),lf=V(dv.z,0,-dv.x).normalize()
 if(cam.aspect>1.15)lookT.addScaledVector(lf,1.25*M*sideOf(s.u));else lookT.y-=1.1
 if(first){camP.copy(camT);camL.copy(lookT)}else{camP.lerp(camT,kk(6));camL.lerp(lookT,kk(7))}
 cam.position.copy(camP);cam.lookAt(camL)
 sun.position.set(rp.x-5,rp.y+10,rp.z+4);sun.target.position.copy(rp);blob.position.set(rp.x,f.p.y+.015,rp.z)
 first=false}

const size=()=>{const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();needs=true}
let raf=0,last=performance.now(),acc=0,n=0,warm=true,needs=true
const loop=now=>{raf=requestAnimationFrame(loop);const raw=(now-last)/1000;last=now
 if(document.hidden||lost)return
 if(!visible()){first=true;return}
 if(reduced&&!needs)return
 needs=false;frame(reduced?10:min(.05,raw),now/1000);renderer.render(scene,cam)
 if(!reduced){acc+=raw;n++;if(n===90){if(!warm&&acc/90>.026&&dpr>1){dpr=1;renderer.setPixelRatio(1);size()}warm=false;acc=0;n=0}}}
const onScroll=()=>{needs=true}
const ro=new ResizeObserver(size);ro.observe(host);size()
addEventListener('scroll',onScroll,{passive:true})
raf=requestAnimationFrame(loop)
return{dispose(){cancelAnimationFrame(raf);ro.disconnect();removeEventListener('scroll',onScroll);renderer.domElement.removeEventListener('webglcontextlost',onLost)
 geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());texs.forEach(t=>t.dispose());boxes.dispose();poles.dispose();heads.dispose();renderer.dispose();renderer.domElement.remove()}}}
