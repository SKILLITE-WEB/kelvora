import {useEffect} from 'react'
import * as THREE from 'three'
import {getEnv} from './Robot3D.jsx'
const C=[0xb6ff5c,0x7c5cff,0x22d3ee,0xff4fa3,0xffb020],PI=Math.PI,sin=Math.sin,cos=Math.cos
const MC={},GE={}
const km=(k,o)=>MC[k]||(MC[k]=new THREE.MeshPhysicalMaterial({envMap:getEnv(),envMapIntensity:1.4,clearcoat:1,clearcoatRoughness:.06,side:THREE.DoubleSide,...o}))
const mt=c=>km('c'+c,{color:c,emissive:c,emissiveIntensity:.28,metalness:.5,roughness:.18})
const DK=()=>km('dk',{color:0x1b1b30,metalness:.8,roughness:.25})
const WH=()=>km('wh',{color:0xeef1fa,metalness:.15,roughness:.2})
const GL=c=>MC['g'+c]||(MC['g'+c]=new THREE.MeshBasicMaterial({color:c}))
const GS={box:()=>new THREE.BoxGeometry(1,1,1),sph:()=>new THREE.SphereGeometry(1,24,16),cyl:()=>new THREE.CylinderGeometry(1,1,1,28),cone:()=>new THREE.ConeGeometry(1,1,28),tor:()=>new THREE.TorusGeometry(1,.08,10,44),tri:()=>new THREE.CylinderGeometry(1,1,1,3),oct:()=>new THREE.OctahedronGeometry(1),knot:()=>new THREE.TorusKnotGeometry(.6,.2,96,12),arc:()=>new THREE.TorusGeometry(1,.2,12,32,PI*1.5),
bell:()=>new THREE.LatheGeometry([[.8,-.38],[.62,-.2],[.5,.1],[.38,.5],[.18,.72],[.001,.75]].map(([x,y])=>new THREE.Vector2(x,y)),28),
star:()=>{const s=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.42:1,a=PI/2+i*PI/5;i?s.lineTo(cos(a)*r,sin(a)*r):s.moveTo(cos(a)*r,sin(a)*r)}s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.25,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:2});g.center();return g}}
const me=(k,m,s,p,par,r)=>{const o=new THREE.Mesh(GE[k]||(GE[k]=GS[k]()),m);o.scale.set(...(typeof s==='number'?[s,s,s]:s));o.position.set(...p);if(r)o.rotation.set(...r);par.add(o);return o}
const gr=(par,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);par.add(g);return g}
const F={
s:[
(g,c)=>{me('box',DK(),[1.7,1.2,.14],[0,0,0],g);me('box',mt(c),[1.7,.22,.16],[0,.49,0],g)
const b=[0,1,2].map(k=>me('box',mt(C[(k+2)%5]),[.4,.4,.16],[-.5+k*.5,-.1,.06],g))
return t=>{b.forEach((m,k)=>{const s=.4*(1+Math.max(0,sin(t*3-k*1.3))*.4);m.scale.set(s,s,.16)});g.rotation.y=sin(t*.9)*.5;g.rotation.x=-.1}},
(g,c)=>{me('box',DK(),[.8,1.5,.14],[0,0,0],g);me('box',mt(c),[.66,1.3,.03],[0,0,.08],g)
const d=[0,1,2].map(k=>me('box',WH(),[.18,.18,.04],[-.2+k*.2,.3,.11],g)),n=me('sph',mt(C[3]),.12,[.38,.72,.12],g)
return t=>{d.forEach((m,k)=>{const s=.18*(1+Math.max(0,sin(t*4-k*1.1))*.6);m.scale.set(s,s,.04)});n.position.y=.72+Math.abs(sin(t*4))*.14;g.rotation.y=t*1.2}},
(g,c)=>{me('sph',mt(c),.28,[0,0,0],g);me('tor',DK(),.78,[0,0,0],g,[PI/2.3,0,0])
const s=[0,1,2].map(k=>me('box',mt(C[(k+1)%5]),.34,[0,0,0],g))
return t=>{s.forEach((m,k)=>{const a=t*1.6+k*2.094;m.position.set(cos(a)*.78,sin(t+k)*.2,sin(a)*.78);m.rotation.set(t*2,t*1.5,0)});g.rotation.x=.3}},
(g,c)=>{const bag=me('box',mt(c),[.95,.8,.55],[0,-.25,0],g);me('tor',DK(),.3,[0,.25,0],g)
const cg=gr(g,0,1,0);me('cyl',mt(C[4]),[.24,.06,.24],[0,0,0],cg,[PI/2,0,0])
return t=>{const u=(t*.9)%1;cg.position.y=1-u*u*.9;cg.rotation.y=t*8;cg.visible=u<.92;bag.scale.y=.8-(u>.88?.07:0);g.rotation.y=sin(t*.8)*.4}},
(g,c)=>{me('box',WH(),[1.7,1.5,.12],[0,0,0],g);me('box',mt(c),[1.7,.3,.14],[0,.6,0],g)
const P=[];for(let r=0;r<3;r++)for(let k=0;k<4;k++){const x=-.57+k*.38,y=.2-r*.38;P.push([x,y]);me('box',DK(),[.3,.28,.04],[x,y,.08],g)}
const h=me('box',mt(C[3]),[.34,.32,.06],[0,0,.1],g)
return t=>{const i=Math.floor(t*2.5)%12,f=(t*2.5)%1;h.position.set(P[i][0],P[i][1],.1+sin(f*PI)*.35);g.rotation.y=sin(t*.7)*.45;g.rotation.x=-.15}},
(g,c)=>{[0,1].forEach(k=>me('box',WH(),[1.2,.04,1.5],[0,-.3+k*.08,0],g))
const sh=gr(g,0,-.14,0);me('box',WH(),[1.2,.04,1.5],[0,0,0],sh);[0,1,2].forEach(k=>me('box',mt(c),[.8-k*.15,.03,.08],[0,.03,-.35+k*.3],sh))
me('tor',mt(C[2]),.28,[0,.5,0],g,[PI/2,0,0])
return t=>{const u=(t*.7)%1;sh.position.set(u*1.7,-.14+sin(u*PI)*.5,0);sh.rotation.z=-u*.7;sh.visible=u<.95;g.rotation.x=.5;g.rotation.y=t*.4}},
(g,c)=>{me('box',DK(),[1.8,.08,.8],[0,-.75,0],g)
const b=[0,1,2,3].map(k=>me('box',mt(C[k]),[.34,1,.34],[-.6+k*.4,-.2,0],g))
return t=>{b.forEach((m,k)=>{const h=.35+(sin(t*2+k*1.7)+1)*.45;m.scale.y=h;m.position.y=-.71+h/2});g.rotation.y=sin(t*.6)*.5+.4}},
(g,c)=>{const cd=gr(g,-.15,.1,0);me('box',mt(c),[1.4,.9,.06],[0,0,0],cd);me('box',DK(),[1.4,.18,.07],[0,.18,0],cd);me('box',mt(C[4]),[.26,.2,.075],[-.4,-.15,0],cd)
const cg=gr(g,.6,-.35,.35);me('cyl',mt(C[4]),[.3,.06,.3],[0,0,0],cg,[PI/2,0,0])
return t=>{cd.rotation.y=sin(t*1.2)*.9;cd.rotation.x=.3;cg.rotation.y=t*7;g.position.y=sin(t*2)*.08}}],
a:[
(g,c)=>{const A=me('sph',mt(c),[.7,.45,.3],[-.35,.35,0],g),B=me('sph',mt(C[3]),[.7,.45,.3],[.4,-.3,0],g)
const d=[0,1,2].map(k=>me('sph',WH(),.07,[-.2+k*.2,-.78,.1],g))
return t=>{A.position.x=-.35+sin(t*2)*.12;B.position.x=.4-sin(t*2)*.12;A.scale.set(.7*(1+.1*sin(t*3)),.45,.3);B.scale.set(.7*(1+.1*sin(t*3+3.1)),.45,.3);d.forEach((m,k)=>m.position.y=-.78+Math.max(0,sin(t*6-k*.9))*.12);g.rotation.y=sin(t)*.35}},
(g,c)=>{me('arc',mt(c),.45,[0,.4,0],g,[0,0,-PI/2]);me('cyl',mt(c),[.085,.3,.085],[0,-.2,0],g);const d=me('sph',mt(c),.14,[0,-.65,0],g)
return t=>{d.position.y=-.65+Math.abs(sin(t*3))*.14;g.rotation.y=t*1.1;g.rotation.z=sin(t*2)*.15}},
(g,c)=>{me('tor',mt(c),.8,[0,0,0],g);me('cyl',WH(),[.78,.05,.78],[0,0,-.01],g,[PI/2,0,0])
for(let k=0;k<12;k++){const a=k*PI/6;me('box',DK(),[.04,k%3?.08:.14,.03],[sin(a)*.62,cos(a)*.62,.04],g,[0,0,-a])}
const mh=gr(g,0,0,.07),hh=gr(g,0,0,.06);me('box',DK(),[.07,.6,.04],[0,.3,0],mh);me('box',mt(C[3]),[.09,.4,.04],[0,.2,0],hh);me('sph',DK(),.08,[0,0,.08],g)
const ring=me('tor',mt(C[3]),1,[0,0,0],g)
return t=>{mh.rotation.z=-t*2.5;hh.rotation.z=-t*.4;const p=(t*.8)%1;ring.scale.setScalar(.8+p*.35);ring.visible=p<.9;g.rotation.y=sin(t*.7)*.5}},
(g,c)=>{const pv=gr(g,0,.5,0);me('bell',mt(c),1,[0,-.4,0],pv);const cl=me('sph',DK(),.15,[0,-.8,0],pv),bd=me('sph',mt(C[3]),.14,[.55,.6,.25],g)
return t=>{pv.rotation.z=sin(t*7)*(.25+.2*sin(t*1.5));cl.position.x=sin(t*7+1.2)*.14;bd.scale.setScalar(.14*(1+.3*Math.abs(sin(t*3))))}},
(g,c)=>{me('box',WH(),[1.1,1.5,.05],[0,0,0],g);[0,1,2,3].forEach(k=>me('box',DK(),[.8-(k%2)*.2,.07,.02],[0,.5-k*.25,.04],g))
const bm=me('box',GL(C[0]),[1.3,.06,.1],[0,0,.1],g),cs=[0,1,2].map(k=>me('box',mt(C[k+1]),.2,[0,0,0],g))
return t=>{bm.position.y=sin(t*2)*.7;cs.forEach((m,k)=>{const u=(t*.8+k*.33)%1;m.position.set(.5+u*1,.5-k*.4,.1);m.scale.setScalar(.2*(1-u)+.001)});g.rotation.y=-.5+sin(t*.5)*.2}},
(g,c)=>{const r=[.9,.7,.5].map((s,k)=>me('tor',mt(C[k]),s,[0,0,0],g)),o=me('sph',mt(C[4]),.2,[0,0,0],g)
return t=>{r[0].rotation.x=t*1.1;r[1].rotation.y=t*1.5;r[2].rotation.z=t*1.9;o.scale.setScalar(.2*(1+.15*sin(t*3)));g.rotation.y=.4}},
(g,c)=>{const s=me('star',mt(C[4]),.85,[0,0,0],g),sp=[0,1,2].map(k=>me('sph',mt(C[k]),.07,[0,0,0],g))
return t=>{g.rotation.y=t*2;s.scale.setScalar(.85*(1+.1*sin(t*4)));sp.forEach((m,k)=>{const a=t*1.5+k*2.1;m.position.set(cos(a)*1,sin(a*1.3)*.7,sin(a)*.5);m.scale.setScalar(.07*(1+sin(t*6+k*2)*.8)+.001)})}},
(g,c)=>{me('box',WH(),[1.5,1.1,.04],[0,-.1,-.1],g);[0,1,2].forEach(k=>me('box',mt(c),[1-k*.2,.05,.02],[-.1,-.15-k*.2,-.07],g))
const pc=gr(g,0,0,.15);me('cyl',mt(C[4]),[.09,.8,.09],[0,.5,0],pc);me('cone',WH(),[.09,.28,.09],[0,-.04,0],pc,[PI,0,0]);me('cyl',mt(C[3]),[.09,.12,.09],[0,.96,0],pc);pc.rotation.z=.5
return t=>{pc.position.set(sin(t*2)*.5,sin(t*4)*.18-.1,.15);g.rotation.y=sin(t*.6)*.3}},
(g,c)=>{me('box',mt(c),[1.4,.9,.2],[0,-.1,0],g)
const sh=me('box',WH(),[1,.7,.03],[0,-.1,0],g),fp=gr(g,0,.35,.11);me('box',DK(),[1.4,.5,.04],[0,-.25,0],fp)
return t=>{const o=(sin(t*1.8)+1)/2;fp.rotation.x=o*PI*.9;sh.position.y=-.1+o*.55;g.rotation.y=sin(t*.6)*.4;g.rotation.x=-.2}},
(g,c)=>{const Q=[[-.6,-.4],[.55,-.5],[.1,.6]],T=Q.map(([x,y],k)=>me('sph',mt(C[k+2]),.14,[x,y,0],g)),L=gr(g,0,0,.2);me('tor',mt(c),.42,[0,0,0],L);me('cyl',DK(),[.07,.55,.07],[.4,-.4,0],L,[0,0,PI/4])
return t=>{const x=cos(t*1.5)*.6,y=sin(t*1.5)*.45;L.position.set(x,y,.2);Q.forEach(([px,py],k)=>{T[k].scale.setScalar(.14*(Math.hypot(px-x,py-y)<.5?1.9:1))});g.rotation.y=sin(t*.5)*.3}}],
m:[
(g,c)=>{const h=gr(g,0,0,0),m=mt(C[3]);me('box',m,[1,1,.9],[0,0,0],h,[0,0,PI/4]);me('sph',m,[.5,.5,.45],[-.354,.354,0],h);me('sph',m,[.5,.5,.45],[.354,.354,0],h)
const b=[0,1,2].map(k=>me('sph',mt(C[k+1]),.1,[0,0,0],g))
return t=>{h.scale.setScalar(1+.18*Math.max(0,sin(t*6)));b.forEach((m,k)=>{const u=(t*.5+k*.33)%1;m.position.set((k-1)*.55+sin(t*2+k)*.1,-.2+u*1.4,.2);m.scale.setScalar(.12*(1-u)+.001)});g.rotation.y=sin(t*.8)*.6}},
(g,c)=>{me('cyl',DK(),[.7,.12,.7],[0,.1,0],g,[PI/2,0,0]);const pg=gr(g,.03,.1,.1);pg.rotation.z=PI/2;const tr=me('tri',mt(c),[.32,.06,.32],[0,0,0],pg,[PI/2,0,0])
const f=[0,1,2,3,4].map(k=>me('box',mt(C[k]),[.34,.4,.05],[0,-.85,0],g))
return t=>{const s=.32*(1+.12*sin(t*5));tr.scale.set(s,.06,s);f.forEach((m,k)=>{const x=((t*.7+k*.4)%2)-1,e=Math.min(1,(1-Math.abs(x))*3)+.001;m.position.x=x;m.scale.set(.34*e,.4*e,.05)});g.rotation.y=sin(t*.7)*.4}},
(g,c)=>{const k=me('knot',mt(c),1,[0,0,0],g),o=[0,1].map(i=>me('sph',mt(C[i+3]),.09,[0,0,0],g))
return t=>{k.rotation.set(t*1.3,t*1.7,0);k.scale.setScalar(1+.12*sin(t*3));o.forEach((m,i)=>{const a=t*2.2+i*PI;m.position.set(cos(a)*1.3,sin(a*.7)*.6,sin(a)*.8)})}},
(g,c)=>{const gm=me('oct',mt(c),[.7,.95,.7],[0,0,0],g),r=me('tor',mt(C[3]),1,[0,0,0],g,[PI/2.5,0,0])
return t=>{const u=(t*.6)%1,e=1-Math.pow(1-Math.min(1,u*1.6),3);gm.rotation.y=Math.floor(t*.6)*2*PI+e*2*PI;g.position.y=sin(t*2)*.1;r.rotation.y=t*1.2}},
(g,c)=>{[[.9,c],[.6,C[3]],[.3,C[4]]].forEach(([r,col],k)=>me('tor',mt(col),r,[0,0,k*.01],g));me('cyl',mt(C[1]),[.12,.08,.12],[0,0,.03],g,[PI/2,0,0])
const dt=gr(g,.12,.08,0);me('cone',WH(),[.1,.4,.1],[0,0,-.2],dt,[-PI/2,0,0]);me('cyl',DK(),[.04,.6,.04],[0,0,.3],dt,[PI/2,0,0]);me('box',mt(c),[.3,.02,.14],[0,0,.55],dt)
return t=>{const u=(t*.7)%1,k=Math.min(1,u*1.5),e=1-Math.pow(1-k,2);dt.position.z=.15+(1-e)*2.4;dt.visible=u<.95;g.rotation.set(-.15,.35,0);g.scale.setScalar(u>.65&&u<.78?1.06:1)}},
(g,c)=>{const H=[.3,.6,.9,1.2];H.forEach((h,k)=>me('box',mt(C[k===3?0:2]),[.5,h,.6],[-.75+k*.5,-.7+h/2,0],g))
const b=me('sph',mt(C[3]),.17,[0,0,.1],g)
return t=>{const i=Math.floor(t*1.6)%5,f=(t*1.6)%1,a=Math.min(i,3),n=Math.min(i+1,3),ya=-.7+H[a]+.17,yn=-.7+H[n]+.17;b.position.set(-.75+(a+(n-a)*f)*.5,ya+(yn-ya)*f+sin(f*PI)*.3,.15);g.rotation.y=sin(t*.6)*.4}},
(g,c)=>{const p=[0,1,2].map(k=>{const q=gr(g);me('cone',mt(C[k]),[.25,.6,.06],[0,0,0],q,[0,0,-PI/2]);return q})
return t=>{p.forEach((q,k)=>{const u=(t*.45+k*.33)%1;q.position.set(-1+u*2,-.4+sin(u*PI)*.8+(k-1)*.3,k*.1);q.rotation.z=Math.atan2(cos(u*PI)*.8*PI,2);q.scale.setScalar(Math.max(.05,sin(u*PI)))});g.rotation.y=.3}}]}
function make(kind,i){const g=new THREE.Group(),u=F[kind][i%10](g,C[i%5]);return{o:g,u}}
export default function IconHost(){
useEffect(()=>{try{if(localStorage.getItem('kv_3d')==='off')return}catch{}
const S=Math.round(156*Math.min(devicePixelRatio||1,1.5))
let r;try{r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})}catch{return}
r.setPixelRatio(1);r.setSize(S,S,false);r.setClearColor(0x000000,0)
const sc=new THREE.Scene();sc.add(new THREE.AmbientLight(0xffffff,.9))
const p1=new THREE.PointLight(0xb6ff5c,70,40);p1.position.set(-4,4,6);const p2=new THREE.PointLight(0x7c5cff,90,40);p2.position.set(5,3,5);sc.add(p1,p2)
const cam=new THREE.PerspectiveCamera(35,1,.1,50);cam.position.set(0,.2,5.6);cam.lookAt(0,0,0)
const objs=new Map(),vis=new Set(),seen=new WeakSet();let raf=0,dead=false,last=0
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target)),{rootMargin:'80px'})
const scan=()=>document.querySelectorAll('.ic3').forEach(el=>{if(seen.has(el))return;seen.add(el)
const c=document.createElement('canvas');c.className='i3x';c.width=c.height=S;el.appendChild(c);el._x=c.getContext('2d');io.observe(el)})
scan();const iv=setInterval(scan,500)
const tick=now=>{if(dead)return;raf=requestAnimationFrame(tick);if(document.hidden||now-last<33)return;last=now
const t=now/1000;let made=0
for(const el of vis){if(!el.isConnected){vis.delete(el);continue}
const k=el.dataset.k;let o=objs.get(k)
if(!o){if(made)continue;made=1;o=make(el.dataset.t,+el.dataset.i);o.o.visible=false;sc.add(o.o);objs.set(k,o)}
o.u(t+(+el.dataset.i)*.37);o.o.visible=true;r.render(sc,cam);o.o.visible=false
el._x.clearRect(0,0,S,S);el._x.drawImage(r.domElement,0,0)
if(!el.classList.contains('on')){el.classList.add('on');document.body.classList.add('k3d')}}}
const to=setTimeout(()=>{raf=requestAnimationFrame(tick)},250)
return()=>{dead=true;clearTimeout(to);clearInterval(iv);io.disconnect();cancelAnimationFrame(raf);document.body.classList.remove('k3d');r.dispose();r.forceContextLoss?.()}},[])
return null}
