import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {makeAgent} from './Scene3D.jsx'
import {getEnv} from './Robot3D.jsx'
const C={lime:0xb6ff5c,vio:0x7c5cff,cy:0x22d3ee,pink:0xff4fa3,amb:0xffb020}
const M=(c,e=0,m=.5,r=.4)=>new THREE.MeshPhysicalMaterial({color:c,emissive:e?c:0,emissiveIntensity:e,metalness:m,roughness:Math.min(r,.3),clearcoat:1,clearcoatRoughness:.08,envMap:getEnv(),envMapIntensity:1.3})
const DK=()=>M(0x1b1b30,0,.6,.3),DESK=()=>M(0x24243f,0,.4,.5)
const bx=(w,h,d,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);return m}
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=p=>1-Math.pow(1-cl(p),3)
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.userData={x,w,h,draw,last:-1};return t}
const paint=(t,time,fps=15)=>{const u=t.userData,k=Math.floor(time*fps);if(k===u.last)return;u.last=k;u.draw(u.x,u.w,u.h,time);t.needsUpdate=true}
const screen=(g,t,w,h,x,y,z)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.position.set(x,y,z);g.add(m);return m}
const monitor=(g,dk)=>{g.add(bx(3.9,2.5,.16,dk,0,.1,0),bx(.28,.9,.2,dk,0,-1.35,-.05),bx(1.3,.08,.7,dk,0,-1.82,0))}
const B={
computer:g=>{const dk=DK();g.add(bx(6.2,.16,2.8,DESK(),0,-1.95,.2));[-2.8,2.8].forEach(x=>g.add(bx(.18,1.4,2.4,dk,x,-2.7,.2)));monitor(g,dk)
const T=tex(512,320,(x,w,h,t)=>{x.fillStyle='#0a0a18';x.fillRect(0,0,w,h);x.fillStyle='#16162c';x.fillRect(0,0,w,34);['#ff5d7a','#ffb020','#b6ff5c'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(20+i*22,17,6,0,7);x.fill()})
const o=(t*28)%24,k=Math.floor(t*28/24),cs=['#b6ff5c','#22d3ee','#7c5cff','#ff4fa3'];for(let i=0;i<12;i++){const y=48+i*24-o;if(y<38)continue;const n=i+k;x.fillStyle=cs[n%4];x.fillRect(24+(n%3)*22,y,60+((n*47)%230),10)}
if(Math.floor(t*2)%2){x.fillStyle='#fff';x.fillRect(24,h-24,9,14)}})
screen(g,T,3.6,2.2,0,.1,.09)
const keys=[];for(let r=0;r<3;r++)for(let c=0;c<11;c++){const m=new THREE.Mesh(new THREE.BoxGeometry(.17,.06,.17),new THREE.MeshStandardMaterial({color:0x2a2a48,emissive:0x22d3ee,emissiveIntensity:.1}));m.position.set(-1+c*.2,-1.82,1+r*.2);g.add(m);keys.push(m)}
const R=makeAgent(C.lime,9);R.g.scale.setScalar(.5);R.g.position.set(3.7,-.7,.4);R.g.rotation.y=-.7;g.add(R.g)
return t=>{paint(T,t);keys.forEach(k=>k.material.emissiveIntensity=Math.max(.1,k.material.emissiveIntensity*.9));keys[(Math.floor(t*9)*7)%keys.length].material.emissiveIntensity=1.6
R.hands.forEach((h,i)=>h.position.y=-1.3+Math.abs(Math.sin(t*9+i*1.5))*.18);R.ring.rotation.z=t;R.eyes.forEach(e=>e.scale.y=(t%3.3)>3.2?.1:1)}},
audit:g=>{const dk=DK();monitor(g,dk);g.add(bx(6.2,.16,2.4,DESK(),0,-1.95,.2))
const T=tex(512,320,(x,w,h)=>{x.fillStyle='#f4f6ff';x.fillRect(0,0,w,h);x.fillStyle='#7c5cff';x.fillRect(0,0,w,38);x.fillStyle='#fff';[0,1,2,3].forEach(i=>x.fillRect(180+i*70,16,48,8));x.fillStyle='#dfe3f7';x.fillRect(24,64,w-48,100);x.fillStyle='#b6c0ff';x.fillRect(48,86,200,16);x.fillRect(48,114,140,10);[0,1,2].forEach(i=>{x.fillStyle='#e6e9fb';x.fillRect(24+i*160,184,148,90)});x.fillStyle='#cfd5f5';x.fillRect(0,292,w,28)})
screen(g,T,3.6,2.2,0,.1,.09)
const beam=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.07),new THREE.MeshBasicMaterial({color:C.cy}));beam.position.z=.11;g.add(beam)
const gl=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.5),new THREE.MeshBasicMaterial({color:C.cy,transparent:true,opacity:.18}));gl.position.z=.1;g.add(gl)
const it=[['✓ HTTPS secure','#b6ff5c'],['✓ Mobile friendly','#b6ff5c'],['✗ No chatbot','#ff5d7a'],['✗ No online booking','#ff5d7a']].map(([s,c],i)=>{const t=tex(512,100,(x,w,h)=>{x.fillStyle='rgba(13,13,24,.95)';x.fillRect(0,0,w,h);x.strokeStyle=c;x.lineWidth=5;x.strokeRect(3,3,w-6,h-6);x.fillStyle=c;x.font='bold 44px sans-serif';x.textBaseline='middle';x.fillText(s,24,h/2)});return screen(g,t,2.5,.49,3.6,1.1-i*.72,.4)})
return tt=>{const ph=(tt%8)/8,y=1.2-cl(ph/.6)*2.2;beam.position.y=y;gl.position.y=y;beam.visible=gl.visible=ph<.65
it.forEach((m,i)=>{const s=ease((ph-.1-i*.13)*7);m.scale.setScalar(Math.max(.001,s*(ph>.93?1-(ph-.93)/.07:1)))})}},
build:g=>{g.add(bx(7,.16,2.6,DESK(),0,-1.95,0))
const R=makeAgent(C.vio,9);R.g.scale.setScalar(.62);R.g.position.set(-3.1,-.8,0);g.add(R.g)
const S=[[.4,-1.5],[1.4,-1.5],[2.4,-1.5],[.9,-.55],[1.9,-.55],[1.4,.4]],cs=[C.lime,C.cy,C.vio,C.pink,C.amb,C.lime]
const bl=S.map(([x,y],i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.9),M(cs[i],.7,.4,.3));g.add(m);m.userData={x,y,sx:i%2?6:-1.5,sy:3.4};return m})
const bar=bx(3,.1,.1,M(C.lime,1.5),0,-2.4,.3);bar.geometry.translate(1.5,0,0);bar.position.x=-.1;g.add(bar)
return t=>{const T=t%9;bl.forEach((m,i)=>{const u=m.userData,p=cl((T-i*.9)/1.1),e=ease(p);m.position.set(u.sx+(u.x-u.sx)*e,u.sy+(u.y-u.sy)*e+Math.sin(p*Math.PI)*.9,0);m.rotation.set((1-e)*3,(1-e)*3,0);m.scale.setScalar(p<=0?.001:T>8.3?Math.max(.001,(9-T)/.7):1)})
bar.scale.x=Math.max(.001,cl(T/6.5));R.hands.forEach((h,i)=>{h.position.y=-1.3+Math.sin(t*3+i)*.15});R.ring.rotation.z=t;R.g.rotation.y=.5+Math.sin(t*.8)*.15}},
growth:g=>{g.add(bx(6.4,.14,2.2,DESK(),0,-1.95,0))
const H=[1,1.5,2.05,2.7,3.4,4.2],bars=H.map((h,i)=>{const geo=new THREE.BoxGeometry(.7,1,.7);geo.translate(0,.5,0);const m=new THREE.Mesh(geo,M(i%2?C.cy:C.lime,.8,.4,.3));m.position.set(-2.6+i*1.04,-1.88,0);g.add(m);return m})
const ar=new THREE.Group(),sh=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1.1,10),M(C.amb,1.6)),hd=new THREE.Mesh(new THREE.ConeGeometry(.28,.6,14),M(C.amb,1.6));sh.rotation.z=-Math.PI/4;hd.rotation.z=-Math.PI/4;hd.position.set(.5,.5,0);ar.add(sh,hd);g.add(ar)
const co=[0,1,2,3].map(()=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.07,24),M(C.amb,.9,.8,.2));m.rotation.x=Math.PI/2;g.add(m);return m})
return t=>{const T=t%7.5;bars.forEach((m,i)=>{m.scale.y=Math.max(.001,H[i]*ease((T-i*.35)/1.3))});const k=cl(T/3.2);ar.position.set(-2.6+k*5.2,-1.2+Math.pow(k,1.2)*5,.9);ar.visible=T>.2
co.forEach((m,i)=>{m.position.set(1.6+i*.6,1+Math.sin(t*2+i)*.35+i*.25,.6);m.rotation.y=t*3+i})}},
chat:g=>{const dk=DK();monitor(g,dk);g.add(bx(6.2,.16,2.4,DESK(),0,-1.95,.2))
const MS=[['u','Hi, I need a quote'],['a','Sure! What do you need?'],['u','An AI lead agent'],['a','Quote sent. Approve to start']]
const T=tex(512,320,(x,w,h,t)=>{x.fillStyle='#0a0a18';x.fillRect(0,0,w,h);x.fillStyle='#16162c';x.fillRect(0,0,w,40);x.fillStyle='#b6ff5c';x.font='bold 22px sans-serif';x.fillText('Kelvora Support',16,27)
const n=Math.floor((t%9)/1.7)+1;MS.slice(0,Math.min(n,4)).forEach(([r,s],i)=>{const y=56+i*60,u=r==='u',bw=Math.min(440,s.length*14+32),x0=u?24:w-24-bw;x.fillStyle=u?'#2a2a48':'#7c5cff';x.fillRect(x0,y,bw,44);x.fillStyle='#fff';x.font='20px sans-serif';x.fillText(s,x0+14,y+28)})
if(n<4){x.fillStyle='#8a87aa';for(let i=0;i<3;i++){x.beginPath();x.arc(32+i*16,296,4+((Math.floor(t*4)+i)%3),0,7);x.fill()}}})
screen(g,T,3.6,2.2,0,.1,.09)
const R=makeAgent(C.cy,9);R.g.scale.setScalar(.55);R.g.position.set(3.6,-.8,.3);R.g.rotation.y=-.6;g.add(R.g)
const bb=[0,1,2].map(i=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),M([C.lime,C.vio,C.pink][i],1.2));g.add(m);return m})
return t=>{paint(T,t,6);R.hands[1].position.set(.95,-.55+Math.sin(t*5)*.25,.1);R.ring.rotation.z=t;bb.forEach((m,i)=>{const a=t*.9+i*2.1;m.position.set(Math.cos(a)*2.6,1.9+Math.sin(a*1.3)*.4,Math.sin(a)*1.2+.6)})}},
network:g=>{const hub=new THREE.Mesh(new THREE.OctahedronGeometry(.8,0),M(C.lime,1.1,.3,.3));g.add(hub);const nodes=[],pulses=[]
for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=Math.cos(a)*3.2,z=Math.sin(a)*1.6,h=.7+((i*37)%10)/10*1.2,top=-1.9+h;const b=new THREE.Mesh(new THREE.BoxGeometry(.7,h,.7),M([C.cy,C.vio,C.pink,C.amb][i%4],.6,.4,.3));b.position.set(x,-1.9+h/2,z);g.add(b);nodes.push(b)
g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.3,0),new THREE.Vector3(x,top,z)]),new THREE.LineBasicMaterial({color:C.cy,transparent:true,opacity:.35})))
const p=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:C.lime}));g.add(p);pulses.push([p,x,top,z,i])}
return t=>{hub.rotation.y=t*.8;hub.rotation.x=Math.sin(t)*.2;hub.position.y=.3;pulses.forEach(([p,x,y,z,i])=>{const f=(t*.35+i*.13)%1,e=f<.5?f*2:2-f*2;p.position.set(x*e,.3+(y-.3)*e,z*e);nodes[i].material.emissiveIntensity=.5+Math.max(0,Math.sin(f*Math.PI))*.9})}},
servers:g=>{const dk=DK(),leds=[];[-3,0,3].forEach((x,ri)=>{g.add(bx(1.7,3.6,1.3,dk,x,-.1,0));for(let r=0;r<7;r++){g.add(bx(1.5,.2,.05,M(0x2a2a48,0,.5,.4),x,-1.5+r*.5,.68));const l=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:[C.lime,C.cy,C.pink][(r+ri)%3]}));l.position.set(x+.6,-1.5+r*.5,.72);g.add(l);leds.push(l)}})
const pk=[0,1,2,3,4,5].map(i=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:i%2?C.lime:C.cy}));g.add(m);return m})
return t=>{leds.forEach((l,i)=>l.visible=Math.sin(t*5+i*1.7)>-.3);pk.forEach((m,i)=>{const f=(t*.4+i/6)%1,seg=Math.floor(f*2),u=(f*2)%1,x0=[-3,0][seg],x1=[0,3][seg];m.position.set(x0+(x1-x0)*u,2.1+Math.sin(u*Math.PI)*.8,.2)})}}}

export default function Stage3D({kind}){const ref=useRef();const[on,setOn]=useState(false)
useEffect(()=>{const el=ref.current;if(!el)return;const io=new IntersectionObserver(([e])=>setOn(e.isIntersecting),{rootMargin:'160px'});io.observe(el);return()=>io.disconnect()},[])
useEffect(()=>{if(!on)return;try{if(localStorage.getItem('kv_3d')==='off')return}catch{}
const el=ref.current;let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch{return}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));el.appendChild(renderer.domElement)
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1,.1,100)
scene.add(new THREE.AmbientLight(0xffffff,.95));const p1=new THREE.PointLight(0xb6ff5c,70,40);p1.position.set(-4,4,6);const p2=new THREE.PointLight(0x7c5cff,90,40);p2.position.set(5,3,5);scene.add(p1,p2)
const fl=new THREE.Mesh(new THREE.RingGeometry(3.4,5,64),new THREE.MeshBasicMaterial({color:0x7c5cff,transparent:true,opacity:.14,side:THREE.DoubleSide}));fl.rotation.x=-Math.PI/2;fl.position.y=-2.05;scene.add(fl)
const g=new THREE.Group();scene.add(g);const upd=B[kind]?B[kind](g):()=>{}
let mx=0,my=0,raf=0;const rm=matchMedia('(prefers-reduced-motion:reduce)').matches,clock=new THREE.Clock()
const draw=t=>{upd(t);g.rotation.y+=((Math.sin(t*.35)*.25+mx*.35)-g.rotation.y)*.06;cam.position.y=1-my*.5;cam.lookAt(0,-.2,0);renderer.render(scene,cam)}
const size=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;renderer.setSize(w,h,false);cam.aspect=w/h;cam.position.z=Math.max(9.5,14.8/(w/h));cam.updateProjectionMatrix();if(rm)draw(2)}
const mv=e=>{const r=el.getBoundingClientRect();mx=cl(((e.clientX-r.left)/r.width-.5)*2,-1,1);my=cl(((e.clientY-r.top)/r.height-.5)*2,-1,1)}
const ro=new ResizeObserver(size);ro.observe(el);size();addEventListener('pointermove',mv,{passive:true})
const tick=()=>{raf=requestAnimationFrame(tick);if(!document.hidden)draw(clock.getElapsedTime())};if(!rm)tick()
return()=>{cancelAnimationFrame(raf);ro.disconnect();removeEventListener('pointermove',mv);scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>{x.map?.dispose?.();x.dispose()})});renderer.dispose();renderer.forceContextLoss?.();renderer.domElement.remove()}},[on,kind])
return <div className="stage" ref={ref} aria-hidden="true"/>}
