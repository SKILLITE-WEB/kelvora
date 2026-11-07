import * as THREE from 'three'
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {SH,DK,MID} from '../workspace/chimpuk.js'
const {atan2,min,max}=Math
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z)
const cl=(v,a=0,b=1)=>min(b,max(a,v))
const ss=(a,b,v)=>{const t=cl((v-a)/(b-a));return t*t*(3-2*t)}
export const NAMES=['Welcome','Audit','Automate','Grow','Start']
const COL=[0xb9f45c,0x38d4ee,0x8a74ff,0xffc24a,0xb9f45c]
export const SLOT={A:[3.0,-2.1],B:[3.0,2.1],C:[4.2,0]}
const sg=i=>i%2?-1:1
const hex=c=>'#'+c.toString(16).padStart(6,'0')

export function buildRooms({scene,fr,U,slots,mob}){
 const geos=new Map(),mats=[],texs=[],extra=[]
 const gb=(w,h,d,r)=>{const k=[w,h,d,r].join();let g=geos.get(k);if(!g){g=new RoundedBoxGeometry(w,h,d,2,min(r,min(w,h,d)/2.05));geos.set(k,g)}return g}
 const mm=o=>{const m=new THREE.MeshStandardMaterial(o);mats.push(m);return m}
 const rooms=U.map((u,i)=>{
  const F=fr(u),sd=sg(i),col=COL[i],used=slots[i]||[],G=new THREE.Group()
  G.position.copy(F.p);G.rotation.y=F.yaw;scene.add(G)
  // lat = distance from road centre toward the room side, al = distance along the road
  const at=(lat,al,y=0)=>V(F.p.x+F.r.x*sd*lat+F.h.x*al,F.p.y+y,F.p.z+F.r.z*sd*lat+F.h.z*al)
  const acc=mm({color:col,emissive:col,emissiveIntensity:.1,roughness:.4})
  const scr=mm({color:0x0a0d16,emissive:col,emissiveIntensity:.08,roughness:.5})
  const wh=mm({color:0xe9ecf6,roughness:.5})
  const add=(w,h,d,m,lat,y,al,r=.03)=>{const o=new THREE.Mesh(gb(w,h,d,r),m);o.position.set(-sd*lat,y,al);G.add(o);return o}
  // architecture: open-sided floor, low back wall, doorway pillars
  add(3.9,.6,6.6,mm({color:0xc8ab82,roughness:.55}),3.35,-.32,0,.06)
  add(.06,.02,6.6,acc,1.43,-.01,0,.005)
  add(.12,3,6.6,mm({color:0xf4f1ea,roughness:.6}),5.25,1.2,0)
  add(.14,.05,6.6,acc,5.25,2.72,0,.01);add(.14,.05,6.6,acc,5.25,.06,0,.01)
  ;const gl=mm({color:0xcfe6ee,transparent:true,opacity:.2,roughness:.1,depthWrite:false}),pot=mm({color:0x8a6a4a,roughness:.8}),leaf=mm({color:0x4f8f3a,roughness:.9})
  ;[3.3,-3.3].forEach(a=>{add(3.7,2.3,.04,gl,3.35,1.15,a,.01);add(3.7,.05,.06,acc,3.35,2.32,a,.01)})
  ;[[4.85,2.9],[1.9,-3.0]].forEach(([l,a])=>{add(.3,.28,.3,pot,l,.14,a,.04);add(.42,.55,.42,leaf,l,.55,a,.16)})
  // shared display on a stand
  add(.04,.8,1.5,scr,5.16,1.45,0,.012);add(.03,.84,1.54,acc,5.2,1.45,0,.01)
  // room label (existing journey stop names only)
  const cv=document.createElement('canvas');cv.width=512;cv.height=128;const x=cv.getContext('2d')
  x.fillStyle='rgba(9,11,17,.85)';x.fillRect(0,0,512,128);x.strokeStyle=hex(col);x.lineWidth=6;x.strokeRect(3,3,506,122)
  x.fillStyle='#eef0f7';x.font='700 58px Sora,Inter,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(NAMES[i],256,68)
  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;texs.push(tx)
  const spm=new THREE.SpriteMaterial({map:tx,transparent:true,opacity:.3,depthWrite:false});mats.push(spm)
  const sp=new THREE.Sprite(spm);sp.scale.set(2.2,.55,1);sp.position.set(-sd*4.0,2.55,0);G.add(sp)
  // ceiling with flat light panels
  const cl_=mm({color:0xf7f5f0,transparent:true,opacity:.55,roughness:.9,depthWrite:false}),pan=mm({color:0xffffff,emissive:0xfff4dc,emissiveIntensity:.6,roughness:.5})
  add(3.9,.04,6.6,cl_,3.35,3.2,0,.01);[-2,0,2].forEach(a=>add(1.4,.03,.5,pan,3.35,3.17,a,.01))
  // small round meeting table
  const tb=mm({color:0xb99b74,roughness:.6}),ch=mm({color:0x6b7280,roughness:.8})
  add(.7,.04,.7,tb,4.3,.62,2.4,.3);add(.06,.6,.06,DK(),4.3,.3,2.4,.01);add(.34,.05,.34,ch,4.3,.4,1.9,.05);add(.34,.05,.34,ch,4.3,.4,2.9,.05)
  // desks + agent slots (agent faces the road)
  const f=V(-F.r.x*sd,0,-F.r.z*sd),fy=atan2(f.x,f.z),S={}
  const dg=new THREE.CylinderGeometry(.028,.032,.025,18);extra.push(dg)
  used.forEach(k=>{const[lat,al]=SLOT[k]
   add(.3,.04,.7,wh,lat-.38,.42,al,.012);add(.26,.4,.04,DK(),lat-.38,.2,al-.3);add(.26,.4,.04,DK(),lat-.38,.2,al+.3)
   add(.03,.03,.7,acc,lat-.54,.43,al,.006);add(.04,.3,.5,scr,lat-.5,.62,al,.012);add(.05,.1,.12,DK(),lat-.48,.5,al)
   add(.1,.006,.13,wh,lat-.27,.443,al-.25,.002)
   ;[[-.3,-.12],[-.3,.12],[-.4,0]].forEach(([a,b],j)=>add(.06,.03,.045,j%2?DK():acc,lat+a,.455,al+b,.008))
   const dial=new THREE.Mesh(dg,SH());dial.position.set(-sd*(lat-.27),.455,al+.25);G.add(dial)
   S[k]={pos:at(lat,al),yaw:fy,f:f.clone(),h:V(F.h.x,0,F.h.z),keys:at(lat-.25,al,.462),screenP:at(lat-.5,al,.66),notes:at(lat-.27,al-.25,.46),dial:at(lat-.27,al+.25,.47),dialM:dial,paperP:at(lat-.36,al,.448),drop:at(lat-.36,al,.455),tidy:[at(lat-.3,al-.12,.47),at(lat-.3,al+.12,.47),at(lat-.4,al,.47)]}})
  // coffee counter (only rooms with a slot that can reach it)
  let cup=null,counterStand=null
  if(used.some(k=>k!=='B')){
   add(.5,.4,1.0,SH(),4.7,.2,-2.7);add(.26,.3,.26,DK(),4.9,.55,-2.95);add(.09,.03,.03,acc,4.76,.58,-2.95,.01)
   const cg=new THREE.CylinderGeometry(.026,.021,.06,14);extra.push(cg)
   const cm=new THREE.Mesh(cg,SH()),home=at(4.54,-2.62,.43);cm.position.copy(home);scene.add(cm)
   cup={mesh:cm,off:V(0,-.04,0),home,target:home.clone(),holder:null,busy:null,tilt:0}
   counterStand=at(4.3,-2.62)}
  const room={i,G,F,sd,name:NAMES[i],slots:S,cup,counterStand,shared:at(5.1,0,1.45),signPos:at(4.6,0,2.5),members:[],t0:null,
   setA(a){acc.emissiveIntensity=.1+1.5*a;scr.emissiveIntensity=.08+.9*a;spm.opacity=.3+.7*a}}
  room.setA(.1);return room})
 // corridor floor lights: the old road becomes an office walkway that lights up as agents pass
 const NC=mob?40:72,u0=U[0]-.02,u1=U[U.length-1]+.02,cu=[]
 const cg=new THREE.BoxGeometry(.36,.012,.1),cmat=new THREE.MeshBasicMaterial({color:0xffffff})
 const inst=new THREE.InstancedMesh(cg,cmat,NC),d=new THREE.Object3D(),c1=new THREE.Color(0xcfc9bd),c2=new THREE.Color(0xb9f45c),tc=new THREE.Color()
 for(let i=0;i<NC;i++){const uu=u0+(u1-u0)*i/(NC-1),f=fr(uu);cu.push(uu);d.position.set(f.p.x,f.p.y+.012,f.p.z);d.rotation.y=f.yaw;d.updateMatrix();inst.setMatrixAt(i,d.matrix);inst.setColorAt(i,c1)}
 inst.frustumCulled=false;scene.add(inst)
 let lastW=-9
 const corr={set(w){if(Math.abs(w-lastW)<.0006)return;lastW=w;for(let i=0;i<NC;i++){tc.copy(c1).lerp(c2,ss(0,.012,w-cu[i]));inst.setColorAt(i,tc)}inst.instanceColor.needsUpdate=true}}
 const dispose=()=>{rooms.forEach(r=>{scene.remove(r.G);if(r.cup)scene.remove(r.cup.mesh)});scene.remove(inst);inst.dispose();cg.dispose();cmat.dispose()
  geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());texs.forEach(t=>t.dispose());extra.forEach(g=>g.dispose())}
 return{rooms,corr,dispose}}
