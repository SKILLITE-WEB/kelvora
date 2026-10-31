import * as THREE from 'three'
let ENV
export function getEnv(){
if(ENV)return ENV
const w=1024,h=512,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d')
const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#34345c');g.addColorStop(.5,'#12121f');g.addColorStop(1,'#06060d');x.fillStyle=g;x.fillRect(0,0,w,h)
const cs=['#ffffff','#b6ff5c','#ffffff','#7c5cff','#ffffff','#22d3ee','#ffffff','#ff4fa3']
for(let k=0;k<8;k++){const px=k*128+14;x.fillStyle=cs[k];x.fillRect(px,34+(k%2)*18,92,k%2?46:70);x.fillStyle=cs[(k+3)%8];x.fillRect(px+20,190+(k%3)*30,34,150)}
x.fillStyle='#ffffff';x.fillRect(0,0,w,14)
const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace
return ENV=t}
const P=o=>new THREE.MeshPhysicalMaterial({envMap:getEnv(),envMapIntensity:1.5,...o})
export function makeRobot(color){
const g=new THREE.Group()
const shell=P({color:0xeef1fa,metalness:.18,roughness:.2,clearcoat:1,clearcoatRoughness:.05})
const graph=P({color:0x16171f,metalness:.9,roughness:.26,clearcoat:.8,clearcoatRoughness:.1})
const glass=P({color:0x03030a,metalness:1,roughness:.03,clearcoat:1,clearcoatRoughness:.02})
const glow=P({color,emissive:color,emissiveIntensity:2.2,roughness:.3,metalness:0,envMapIntensity:.4})
const add=(geo,mat,x=0,y=0,z=0,p=g)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);return m}
const sp=(r,a,b,c)=>new THREE.SphereGeometry(r,48,32).scale(a,b,c)
const body=new THREE.Group();g.add(body)
add(sp(.8,1,1.15,.62),shell,0,.15,0,body)
add(sp(.5,1,.75,.35),graph,0,.45,.4,body)
const ring=add(new THREE.TorusGeometry(.21,.03,12,48,Math.PI*1.5),glow,0,.45,.6,body)
add(new THREE.TorusGeometry(.29,.012,8,64),glow,0,.45,.59,body)
add(new THREE.CircleGeometry(.1,32),glow,0,.45,.595,body)
add(new THREE.BoxGeometry(.56,.025,.02),glow,0,.02,.5,body)
add(new THREE.CylinderGeometry(.4,.32,.3,36),graph,0,-.85,0,body)
add(new THREE.CylinderGeometry(.42,.16,.8,40),shell,0,-1.35,0,body)
add(new THREE.CylinderGeometry(.2,.2,.04,32),glow,0,-1.78,0,body)
add(new THREE.TorusGeometry(.3,.014,8,48).rotateX(Math.PI/2),glow,0,-1.74,0,body)
add(new THREE.ConeGeometry(.28,.5,32,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}),0,-2.05,0,body).rotation.x=Math.PI
add(new THREE.CylinderGeometry(.18,.22,.3,24),graph,0,1.12,0,body)
const head=new THREE.Group();head.position.set(0,1.55,0);g.add(head)
const skull=add(sp(.62,1,.88,.92),shell,0,0,0,head)
add(sp(.5,1.05,.62,.5),glass,0,.02,.4,head)
const eyes=[-.2,.2].map(x=>add(new THREE.CapsuleGeometry(.03,.11,4,12).rotateZ(Math.PI/2),glow,x,.02,.64,head))
;[-1,1].forEach(s=>{add(new THREE.CylinderGeometry(.16,.16,.12,28).rotateZ(Math.PI/2),graph,s*.62,0,0,head);add(new THREE.TorusGeometry(.1,.014,8,32).rotateY(Math.PI/2),glow,s*.69,0,0,head)})
add(new THREE.TorusGeometry(.3,.012,8,48,Math.PI).rotateZ(0),glow,0,.5,.12,head).rotation.x=-.5
skull.onBeforeRender=()=>{const t=performance.now()/1000;head.rotation.y=Math.sin(t*.8)*.22;head.rotation.x=Math.sin(t*.6)*.04}
const hands=[-1,1].map(s=>{
add(sp(.27,1,1,1),graph,s*1,.8,0)
add(new THREE.TorusGeometry(.2,.018,8,32).rotateY(Math.PI/2),glow,s*1.1,.8,0)
add(new THREE.CapsuleGeometry(.15,.8,8,24),shell,s*1,.28,0)
add(new THREE.CylinderGeometry(.17,.17,.1,24),graph,s*1,-.2,0)
const h=new THREE.Group();h.position.set(s*1,-1.3,.1);g.add(h)
add(new THREE.CapsuleGeometry(.13,.8,8,24),shell,0,.62,0,h)
add(new THREE.TorusGeometry(.14,.015,8,32).rotateX(Math.PI/2),glow,0,.14,0,h)
add(sp(.16,1,1.2,.75),graph,0,-.02,0,h)
;[-.07,0,.07].forEach(x=>add(new THREE.CapsuleGeometry(.032,.12,4,10),shell,x,-.2,0,h))
add(new THREE.CapsuleGeometry(.03,.1,4,10),shell,s*.14,-.05,.04,h).rotation.z=-s*.6
return h})
return {g,hands,ring,eyes,head,body}}
