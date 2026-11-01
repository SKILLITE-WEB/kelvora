import * as THREE from 'three'
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {SH,DK,MID,glow} from './chimpuk.js'
const {PI,sin,max,min,floor}=Math
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z)
const cl=(v,a=0,b=1)=>min(b,max(a,v))
const ss=(a,b,v)=>{const t=cl((v-a)/(b-a));return t*t*(3-2*t)}
const lv=(a,b,t)=>a.clone().lerp(b,t)
import {blobMat} from './chimpuk.js'
// ---------- 3D screens (no tiny text; ambient unless the real app state says otherwise) ----------
const COL={processing:'#38d4ee',error:'#ff5d7a',success:'#b9f45c'}
const mark=(x,w,h,t,s)=>{if(s==='processing'){x.fillStyle='rgba(56,212,238,.85)';x.fillRect(0,((t*.8)%1)*h,w,4)}
 if(s==='error'){x.strokeStyle='#ff5d7a';x.lineWidth=6;x.strokeRect(3,3,w-6,h-6);x.fillStyle='#ff5d7a';x.font='bold '+Math.round(h*.5)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('!',w/2,h/2)}
 if(s==='success'){x.strokeStyle='#b9f45c';x.lineWidth=h*.06;x.beginPath();x.moveTo(w*.38,h*.52);x.lineTo(w*.47,h*.64);x.lineTo(w*.64,h*.36);x.stroke()}}
const hd=(x,w,h,s)=>{x.fillStyle='#0a0d16';x.fillRect(0,0,w,h);x.fillStyle='#151a2a';x.fillRect(0,0,w,h*.12);x.fillStyle=COL[s]||'#6b7390';x.fillRect(8,h*.04,w*.14,h*.04)}
const SC={
 dash:(x,w,h,t,s,k)=>{hd(x,w,h,s);const sp=s==='processing'?3:.5;for(let i=0;i<6;i++){const v=.25+.6*(.5+.5*sin(t*sp+i*1.3+k));x.fillStyle=i%2?'#38d4ee':'#8a74ff';x.fillRect(w*.06+i*w*.15,h-12-v*h*.7,w*.1,v*h*.7)};mark(x,w,h,t,s)},
 chat:(x,w,h,t,s,k)=>{hd(x,w,h,s);for(let i=0;i<5;i++){const r=(i+k)%2,bw=w*(.35+.25*((i*37+k*11)%10)/10);x.fillStyle=r?'#7c5cff':'#2a3042';x.fillRect(r?w-bw-12:12,h*.2+i*h*.15,bw,h*.1)};mark(x,w,h,t,s)},
 chart:(x,w,h,t,s,k)=>{hd(x,w,h,s);x.strokeStyle='#b9f45c';x.lineWidth=3;x.beginPath();for(let i=0;i<=20;i++){const px=w*.06+i*(w*.88/20),py=h*.72-h*.45*(.5+.5*sin(i*.45+k+(s==='processing'?t*3:0)));i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();x.fillStyle='rgba(56,212,238,.35)';for(let i=0;i<8;i++)x.fillRect(w*.06+i*w*.11,h*.92,w*.07,-(6+h*.1*(1+sin(i+k))/2));mark(x,w,h,t,s)},
 queue:(x,w,h,t,s,k)=>{hd(x,w,h,s);for(let i=0;i<5;i++){x.fillStyle='#2a3042';x.fillRect(w*.06,h*.2+i*h*.15,w*.88,h*.09);x.fillStyle=i%2?'#38d4ee':'#b9f45c';x.fillRect(w*.06,h*.2+i*h*.15,w*.88*(s==='processing'?.3+.6*((t*.4+i*.2)%1):.25+.5*((i*29+k*7)%10)/10),h*.09)};mark(x,w,h,t,s)},
 doc:(x,w,h,t,s,k)=>{hd(x,w,h,s);for(let i=0;i<7;i++){x.fillStyle=i%3?'#2a3042':'#3b4260';x.fillRect(w*.08,h*.22+i*h*.1,w*(.84-((i*17+k*5)%5)*.1),h*.05)};mark(x,w,h,t,s)}}
// ---------- builder ----------
function builder(){const g=new THREE.Group(),geo=[],texs=[],scr=[];let ls=-1
 const own=(o,x,y,z,p)=>{o.position.set(x,y,z);(p||g).add(o);return o}
 const bx=(w,h,d,m,x,y,z,p,r=.025)=>{const G=new RoundedBoxGeometry(w,h,d,2,min(r,min(w,h,d)/2.05));geo.push(G);return own(new THREE.Mesh(G,m),x,y,z,p)}
 const cy=(a,b,h,m,x,y,z,p)=>{const G=new THREE.CylinderGeometry(a,b,h,20);geo.push(G);return own(new THREE.Mesh(G,m),x,y,z,p)}
 const blob=(x,z,r)=>{const G=new THREE.PlaneGeometry(r*2,r*2);geo.push(G);const o=own(new THREE.Mesh(G,blobMat()),x,.004,z);o.rotation.x=-PI/2;return o}
 const screen=(w,h,x,y,z,ry,draw,seed=0,base=.72)=>{const m=new THREE.Group();m.position.set(x,y,z);m.rotation.y=ry;g.add(m)
  const c=document.createElement('canvas');c.width=256;c.height=Math.round(256*h/w);const cx=c.getContext('2d'),T=new THREE.CanvasTexture(c);T.colorSpace=THREE.SRGBColorSpace;texs.push(T)
  const G=new THREE.PlaneGeometry(w,h);geo.push(G);const MM=new THREE.MeshBasicMaterial({map:T});texs.push(MM)
  const p=new THREE.Mesh(G,MM);p.rotation.y=PI;m.add(p)
  bx(w+.07,h+.07,.05,DK(),0,0,.04,m,.02)
  const hg=y-h/2-.04-base;if(hg>.03)cy(.03,.045,hg,DK(),0,-(h/2+.04)-hg/2,.05,m)
  scr.push({draw:(t,s)=>{draw(cx,c.width,c.height,t,s,seed);T.needsUpdate=true}})}
 const tick=(t,s)=>{if(t-ls<.12)return;ls=t;scr.forEach(x=>x.draw(t,s))}
 return{g,bx,cy,blob,screen,geo,texs,tick}}
const room=b=>{const{g,bx}=b
 bx(26,.1,12,MID(),0,-.05,1.5,g,.03)
 const gr=new THREE.GridHelper(26,52,0x39425a,0x39425a);gr.position.set(0,.003,1.5);gr.material.transparent=true;gr.material.opacity=.3;g.add(gr);b.geo.push(gr.geometry);b.texs.push(gr.material)
 bx(26,7,.12,DK(),0,3.4,5.2,g,.02);bx(26,.05,.06,glow(0x38d4ee,1.5),0,2.45,5.12,g,.01);bx(26,.05,.06,glow(0x7c5cff,1.3),0,.35,5.12,g,.01);bx(26,.05,.06,glow(0xb9f45c,.9),0,3.6,5.12,g,.01)}
const desk=(b,w,x,z,d=.62)=>{const{g,bx}=b;bx(w,.06,d,SH(),x,.69,z,g,.03);[-1,1].forEach(s=>bx(.06,.66,d-.06,DK(),x+s*(w/2-.1),.33,z,g,.02));bx(w-.3,.4,.03,DK(),x,.5,z+d/2-.03,g,.01)}
const chair=(b,x,z)=>{const{g,bx,cy,blob}=b;bx(.5,.05,.46,DK(),x,.375,z,g,.05);bx(.46,.34,.05,DK(),x,.62,z-.25,g,.04);cy(.03,.03,.34,MID(),x,.2,z);bx(.5,.04,.06,MID(),x,.05,z,g,.015);bx(.06,.04,.5,MID(),x,.05,z,g,.015);blob(x,z,.5)}
const typing=(c,t,k=1)=>{const A=c.A;c.H(0,V(A.work0.x+.05*sin(t*7*k),A.work0.y+.012*max(0,sin(t*13*k)),A.work0.z+.02*sin(t*5)));c.H(1,V(A.work1.x+.05*sin(t*6.1*k+1),A.work1.y+.012*max(0,sin(t*11*k)),A.work1.z+.02*sin(t*4.3)))}
const forced=env=>{const A=env.A,at=env.main
 return{
 focus:{at,dur:[4,6],run:(c,u,t)=>{typing(c,t,1.4);c.see(A.main);c.lean=.07}},
 trouble:{at,dur:[5,7],run:(c,u,t)=>{c.see(u<.55?A.main:A.work0);c.H(1,c.headP(0,-.17,.27),ss(.05,.3,u)*(1-ss(.9,1,u)));c.lean=.04;c.tilt=.12*sin(u*PI)}},
 ack:{at,dur:[2.6,3],run:(c,u)=>{c.see(A.main);c.lean=-.05*sin(u*PI);c.nod=.16*sin(u*PI*4)*(1-u)}},
 tidy:{at:env.tidyAt||at,dur:[5,7],run:(c,u,t)=>{const P=A.tidy,k=min(P.length-1,floor(u*P.length));c.H(k%2,V(P[k].x,P[k].y+.04+.02*sin(t*6),P[k].z));c.see(P[k]);c.lean=.06}}}}
const finish=env=>{env.actions={...env.actions,...forced(env)};env.dispose=()=>{env.b.geo.forEach(x=>x.dispose());env.b.texs.forEach(x=>x.dispose())};return env}
const AP_T=V(0,.1,0),AP_W=V(0,0,-.18)
const grabAt=(c,u,k,p,ap)=>{const h=V(p.x,p.y+.03,p.z-.05).addScaledVector(ap,(1-ss(0,.35,u))+1.5*ss(.55,.95,u));c.H(0,h,ss(0,.2,u));c.see(p);c.lean=.06*(1-ss(.8,1,u));if(u>.42&&k.held<0){c.grab(k,0);return k.held===0}return false}
const placeAt=(c,u,k,S,ap)=>{const h=V(S.x,S.y+.03,S.z-.05).addScaledVector(ap,(1-ss(0,.45,u))+1.5*ss(.5,.8,u));c.H(0,h,1-ss(.6,.9,u));c.see(S);if(u>.5&&k.held>=0){c.drop(k,S);return true}return false}
// ---------- seated workspaces: control / comms / analysis / desk ----------
function seated(kind){const b=builder(),{g,bx,cy,blob,screen}=b;room(b);blob(0,0,.55)
 const W={control:2.6,comms:2.4,analysis:2.8,desk:1.8}[kind];desk(b,W,0,.6);chair(b,0,-.02)
 bx(.5,.03,.18,DK(),0,.735,.46,g,.012);bx(.38,.006,.02,glow(0x38d4ee,1.2),0,.752,.55,g,.003)
 const cx={control:.62,comms:.62,analysis:.95,desk:.7}[kind],dx={control:-.62,comms:-.62,analysis:.5,desk:-.7}[kind],dh={control:1,comms:1,analysis:0,desk:1}[kind]
 const tidy=[V(.45,.75,.58),V(-.45,.75,.64),V(.1,.75,.68),V(.95,.75,.52)]
 const A={cup:V(cx,.765,.5),main:V(0,1.28,1),sL:V(1.3,1.2,.9),sR:V(-1.3,1.2,.9),work0:V(.14,.775,.46),work1:V(-.14,.775,.46),rest0:V(.3,.76,.34),rest1:V(-.3,.76,.34),dial:V(dx,.8,.46),dh,tidy,note:V(-.35,.76,.5),bars:V(-1.05,.95,.62)}
 tidy.forEach((p,i)=>bx(.1,.04,.07,i%2?DK():glow(0xb9f45c,.5),p.x,.735,p.z,g,.01))
 const dial=new THREE.Group();dial.position.set(dx,.77,.46);g.add(dial);cy(.075,.08,.03,DK(),0,-.02,0,dial);cy(.05,.05,.04,SH(),0,.01,0,dial);bx(.01,.045,.01,glow(0xb9f45c,1.5),0,.032,.025,dial,.002)
 const cupG=new THREE.Group();cy(.042,.036,.09,SH(),0,0,0,cupG);const hg=new THREE.TorusGeometry(.03,.007,8,14);b.geo.push(hg);const hh=new THREE.Mesh(hg,SH());hh.position.x=.05;cupG.add(hh);cupG.position.copy(A.cup);g.add(cupG)
 const cup={mesh:cupG,held:-1,target:A.cup.clone(),home:A.cup.clone(),off:V(0,0,.06),seq:false,owner:'coffee',tiltV:0}
 let bars=null
 if(kind==='control'){screen(1.5,.84,0,1.3,1.05,0,SC.dash,0);screen(1,.56,1.3,1.22,.9,.4,SC.queue,1);screen(1,.56,-1.3,1.22,.9,-.4,SC.chart,2)
  ;[-1,1].forEach(s=>{bx(.8,1.9,.6,DK(),s*3.2,.95,1.7,g,.03);for(let i=0;i<6;i++)bx(.5,.03,.02,glow(i%2?0x38d4ee:0xb9f45c,.8),s*3.2,.4+i*.28,1.39,g,.005)})}
 if(kind==='comms'){screen(1.3,.76,0,1.3,1.02,0,SC.chat,0);screen(.9,.5,1.25,1.15,.92,.4,SC.chat,3);screen(.9,.5,-1.25,1.15,.92,-.4,SC.doc,1)
  ;[-1,1].forEach(s=>bx(.2,.32,.2,DK(),s*1.9,.88,.7,g,.03));cy(.015,.015,.3,MID(),-.95,.87,.7);bx(.18,.04,.12,SH(),-.95,1.04,.7,g,.02)}
 if(kind==='analysis'){screen(1.5,.84,-.2,1.3,1.05,0,SC.chart,0);screen(1,.56,1.2,1.2,.95,.4,SC.queue,1)
  bx(.9,.05,.5,DK(),-1.05,.745,.62,g,.01);bars=[0,1,2,3,4].map(i=>{const m=bx(.1,1,.1,glow(i%2?0x38d4ee:0xb9f45c,1),-1.35+i*.15,.9,.62,g,.01);return m})}
 if(kind==='desk'){screen(1.2,.7,0,1.22,.95,0,SC.doc,0);cy(.015,.015,.5,MID(),-.75,.97,.78);bx(.22,.04,.12,glow(0xffd27a,1),-.75,1.24,.72,g,.01)
  bx(.3,.015,.22,SH(),-.35,.735,.5,g,.004);cy(.08,.06,.12,SH(),.78,.78,.78);const sg=new THREE.SphereGeometry(.12,14,10);b.geo.push(sg);const pl=new THREE.Mesh(sg,glow(0x5cc860,.4));pl.position.set(.78,.93,.78);g.add(pl)}
 const common={
  ready:{dur:[1.8,3.2],w:1,run:(c,u)=>{c.see(u<.5?A.main:A.sL);c.H(0,A.rest0,.7);c.H(1,A.rest1,.7)}},
  type:{dur:[4,8],w:3,run:(c,u,t)=>{typing(c,t);c.see(A.main);c.lean=.03}},
  look:{dur:[2.5,4],w:2,run:(c,u)=>{c.see(u<.5?A.sL:A.sR);c.lean=.05;c.H(0,A.rest0,.6);c.H(1,A.rest1,.6)}},
  scan:{dur:[3.5,5],w:1.5,run:(c,u)=>{c.see(lv(A.sL,A.sR,ss(.1,.9,u)));c.lean=.03}},
  adjust:{dur:[3,4.5],w:1.5,run:(c,u,t)=>{c.see(u<.2||u>.85?A.main:A.dial);c.H(A.dh,V(A.dial.x+.015*sin(t*3),A.dial.y,A.dial.z-.03),ss(0,.25,u)*(1-ss(.8,1,u)));env.turn=ss(.25,.75,u);c.lean=.06}},
  stretch:{dur:[3,4.5],w:.8,run:(c,u)=>{const k=ss(0,.3,u)*(1-ss(.75,1,u));c.H(0,V(.32,1.28,.12),k);c.H(1,V(-.32,1.28,.12),k);c.see(V(0,2.2,1.2));c.lean=-.07*k}},
  think:{dur:[3,5],w:1,run:(c,u)=>{c.see(u<.5?A.sL:A.main);c.H(1,c.headP(0,-.17,.27),ss(0,.3,u)*(1-ss(.85,1,u)));c.tilt=.1;c.lean=.02}},
  coffee:{dur:[7,9],w:.6,run:(c,u)=>{const P=A.cup,pre=V(P.x,P.y,P.z-.06),mo=c.headP(0,-.13,.27);let tg,w=1
   if(u<.3){tg=pre;w=ss(0,.2,u)}else if(u<.52)tg=lv(pre,mo,ss(.3,.52,u));else if(u<.64)tg=mo;else if(u<.88)tg=lv(mo,pre,ss(.64,.88,u));else{tg=pre;w=1-ss(.9,1,u)}
   c.H(0,tg,w);if(u>.26&&u<.88&&cup.held<0)c.grab(cup,0);if(u>=.88&&cup.held>=0)c.drop(cup,P)
   cup.tiltV=-.55*ss(.46,.56,u)*(1-ss(.6,.68,u));c.see(u<.28?P:u<.86?c.headP(0,0,3):A.main);c.lean=-.02*ss(.3,.5,u)}}}
 const extra={
  control:{},
  comms:{listen:{dur:[3,5],w:2,run:(c,u)=>{c.see(A.main);c.H(0,c.headP(.3,-.02,.02),ss(0,.2,u)*(1-ss(.85,1,u)));c.tilt=-.1;c.lean=.03}},
   gesture:{dur:[3,5],w:1.5,run:(c,u,t)=>{c.see(A.main);c.H(1,V(-.3+.04*sin(t*2.2),1+.05*sin(t*3),.32),ss(0,.2,u)*(1-ss(.8,1,u)));c.nod=.06*sin(t*3)}}},
  analysis:{study:{dur:[3.5,5.5],w:2,run:(c,u,t)=>{c.see(A.bars);c.lean=.08;c.H(1,V(A.bars.x+.05,A.bars.y+.02+.03*sin(t*2),A.bars.z-.2),ss(0,.3,u)*(1-ss(.85,1,u)))}},
   compare:{dur:[4,6],w:2,run:(c,u)=>{c.see(floor(u*4)%2?A.bars:A.main);c.lean=.05}}},
  desk:{organize:{dur:[5,7],w:2,run:(c,u,t)=>{const P=A.tidy,k=min(P.length-1,floor(u*P.length));c.H(k%2,V(P[k].x,P[k].y+.04+.03*sin(t*5),P[k].z));c.see(P[k]);c.lean=.06}},
   note:{dur:[4,6],w:2,run:(c,u,t)=>{c.see(A.note);c.H(0,V(A.note.x+.04*sin(t*5),A.note.y+.02,A.note.z+.02*sin(t*9)));c.H(1,V(A.note.x-.12,A.note.y+.015,A.note.z-.02),.8);c.lean=.08}}}}[kind]
 const order={control:['type','look','scan','adjust','ready','coffee','stretch','think'],comms:['type','listen','gesture','look','ready','coffee','stretch','think'],analysis:['study','compare','type','adjust','look','coffee','ready','stretch','think'],desk:['type','note','organize','adjust','ready','coffee','stretch','think']}[kind]
 const env={b,group:g,A,stance:'sit',footZ:.26,start:[0,0],stations:{},carry:[cup],cup,turn:0,order,actions:{...common,...extra},
  update:(t,s)=>{dial.rotation.y=env.turn*4;if(bars)bars.forEach((m,i)=>{const h=.1+.22*(.5+.5*sin(t*(s==='processing'?2.5:.4)+i));m.scale.y=h;m.position.y=.77+h/2});b.tick(t,s)}}
 return finish(env)}
// ---------- ops desk (standing): inbox → console → outbox ----------
function ops(){const b=builder(),{g,bx,screen}=b;room(b)
 const tbl=(x,w)=>{bx(w,.06,.5,SH(),x,.8,.55,g,.03);[-1,1].forEach(s=>bx(.06,.77,.44,DK(),x+s*(w/2-.07),.385,.55,g,.02))}
 tbl(2.1,.9);tbl(0,1.3);tbl(-2.1,.9);bx(.5,.025,.18,DK(),0,.845,.46,g,.01);bx(.42,.02,.3,DK(),2.1,.842,.46,g,.01);bx(.7,.02,.3,DK(),-2.1,.842,.46,g,.01)
 const sm=new THREE.MeshStandardMaterial({color:0xb9f45c,emissive:0xb9f45c,emissiveIntensity:.5,roughness:.4});b.texs.push(sm);bx(.36,.012,.24,sm,0,.842,.54,g,.005)
 screen(1.2,.7,0,1.42,.8,0,SC.dash,0,.83);screen(.9,.5,2.1,1.5,.85,.3,SC.queue,1,.83);screen(.9,.5,-2.1,1.5,.85,-.3,SC.chart,2,.83)
 const acc=[0x38d4ee,0xb9f45c,0x7c5cff],cards=[]
 for(let i=0;i<3;i++){const m=new THREE.Group();bx(.26,.012,.18,SH(),0,0,0,m,.004);bx(.26,.0125,.03,glow(acc[i],1),0,.0005,-.07,m,.002)
  const home=V(2.1,.862+i*.014,.46);m.position.copy(home);g.add(m);cards.push({mesh:m,held:-1,target:home.clone(),home:home.clone(),homeIn:home.clone(),off:V(0,-.02,.05),seq:true,state:'inbox',tiltV:0})}
 const A={main:V(0,1.42,.8),work0:V(.14,.875,.46),work1:V(-.14,.875,.46),scan:V(0,.862,.54),sL:V(2.1,1.5,.85),sR:V(-2.1,1.5,.85),tidy:[V(.35,.86,.55),V(-.35,.86,.55),V(0,.86,.62),V(.5,.86,.45)]}
 const slots=[-.22,0,.22].map(o=>V(-2.1+o,.862,.46))
 const hc=c=>c.held(0)
 const actions={
  ready:{at:'console',dur:[2,3.5],run:(c,u)=>{c.see(V(1.6-3.2*ss(0,1,u),1.2,.9))}},
  stretch:{at:'console',dur:[3,4],w:.7,next:['check','take'],run:(c,u)=>{const k=ss(0,.3,u)*(1-ss(.75,1,u));c.H(0,V(.32,1.5,.12),k);c.H(1,V(-.32,1.5,.12),k);c.see(V(0,2.4,1.2));c.lean=-.07*k}},
  check:{at:'console',dur:[3,5],w:1.5,next:['take','ready'],run:(c,u,t)=>{typing(c,t);c.see(A.main);c.lean=.04}},
  take:{at:'inbox',dur:[2.6,3.2],w:3,next:['scan'],can:c=>c.state!=='empty'&&!hc(c)&&env.inbox.length>0,run:(c,u)=>{const k=c.mem.k||(c.mem.k=env.inbox[env.inbox.length-1]);if(!k)return
   if(grabAt(c,u,k,k.homeIn,AP_T)){const i=env.inbox.indexOf(k);if(i>=0)env.inbox.splice(i,1);k.state='hand'}}},
  scan:{at:'console',dur:[5,6],next:['deliver'],can:c=>!!hc(c),run:(c,u,t)=>{const k=c.mem.k||(c.mem.k=hc(c));if(!k)return;const P=A.scan
   if(u<.45){if(placeAt(c,u/.45,k,P,AP_T))k.state='scan'}
   else if(u<.7){c.see(A.main);c.H(1,V(A.work1.x+.05,A.work1.y+.01*max(0,sin(t*8)),A.work1.z),ss(.45,.52,u)*(1-ss(.65,.7,u)));if(u>.5)env.flashT=t}
   else if(grabAt(c,(u-.7)/.3,k,P,AP_T))k.state='hand'}},
  deliver:{at:'outbox',dur:[2.6,3.2],next:['ready','check'],can:c=>!!hc(c)&&env.out.length<3,run:(c,u)=>{const k=c.mem.k||(c.mem.k=hc(c));if(!k)return;const S=c.mem.S||(c.mem.S=slots[min(env.out.length,2)])
   if(placeAt(c,u,k,S,AP_T)){k.state='out';env.out.push(k)}}}}
 const env={b,group:g,A,stance:'stand',start:[0,0],stations:{inbox:{x:2.1,z:0,yaw:0},console:{x:0,z:0,yaw:0},outbox:{x:-2.1,z:0,yaw:0}},main:'console',carry:cards,cards,inbox:[...cards],out:[],flashT:-9,order:['ready','check','take','scan','deliver','stretch'],actions,
  update:(t,s)=>{if(env.out.length>=3&&!env.rec)env.rec={t0:t,p:0};const R=env.rec
   if(R){const e=t-R.t0
    if(R.p===0&&e>3){env.out.forEach(k=>k.mesh.scale.setScalar(max(.001,1-ss(3,3.6,e))));if(e>=3.6){R.p=1;R.t1=t;cards.forEach(k=>{k.state='inbox';k.target.copy(k.homeIn);k.mesh.position.copy(k.homeIn)});env.out.length=0;env.inbox=[...cards]}}
    else if(R.p===1){const f=ss(0,.6,t-R.t1);cards.forEach(k=>k.mesh.scale.setScalar(max(.001,f)));if(f>=1)env.rec=null}}
   cards.forEach(k=>{k.mesh.visible=s!=='empty'||k.held>=0});sm.emissiveIntensity=.5+(t-env.flashT<.2?2:0);b.tick(t,s)}}
 return finish(env)}
// ---------- workshop (standing): shelf → machines → bench ----------
function workshop(){const b=builder(),{g,bx,cy,blob,screen}=b;room(b)
 const tbl=(x,w)=>{bx(w,.06,.5,SH(),x,.8,.55,g,.03);[-1,1].forEach(s=>bx(.06,.77,.44,DK(),x+s*(w/2-.07),.385,.55,g,.02))}
 tbl(0,1.5);bx(.5,.025,.18,DK(),0,.845,.46,g,.01);screen(1.2,.7,0,1.45,.85,0,SC.queue,0,.83)
 const tidy=[V(.45,.86,.55),V(-.45,.86,.55),V(.15,.86,.62),V(-.2,.86,.62)];tidy.forEach((p,i)=>bx(.1,.04,.06,i%2?DK():glow(0x7c5cff,.7),p.x,.85,p.z,g,.01))
 const lights=[],knobs=[]
 const mach=(x,sc,seed)=>{bx(.9,1.3,.5,DK(),x,.65,.75,g,.04);screen(.7,.4,x,1,.47,0,sc,seed,99)
  const lm=new THREE.MeshStandardMaterial({color:0x38d4ee,emissive:0x38d4ee,emissiveIntensity:.6});b.texs.push(lm);bx(.14,.04,.02,lm,x+.28,1.25,.49,g,.01);lights.push(lm)
  const kg=new THREE.Group();kg.position.set(x+.22,.74,.47);kg.rotation.x=PI/2;g.add(kg);const kn=cy(.06,.06,.04,SH(),0,0,0,kg);bx(.012,.01,.05,glow(0xb9f45c,1.5),0,.022,.02,kn,.002);knobs.push(kn);blob(x,.75,.55)}
 mach(1.5,SC.chart,1);mach(-1.5,SC.dash,2);mach(-3,SC.queue,3)
 bx(.2,.2,.03,MID(),-1.5,.62,.5,g,.01)
 bx(.8,.9,.4,DK(),3,.45,.55,g,.03);bx(.8,.04,.42,glow(0x38d4ee,.6),3,.9,.55,g,.01)
 const mh=V(3,.98,.5),mm=new THREE.Group();bx(.16,.16,.16,SH(),0,0,0,mm,.02);bx(.17,.03,.17,glow(0xb9f45c,1),0,0,0,mm,.005);mm.position.copy(mh);g.add(mm)
 const mod={mesh:mm,held:-1,target:mh.clone(),home:mh.clone(),off:V(0,-.03,.05),seq:true,state:'shelf',tiltV:0}
 const SLOT=V(-1.5,.62,.43)
 const A={main:V(0,1.45,.85),work0:V(.14,.875,.46),work1:V(-.14,.875,.46),sL:V(1.5,1,.5),sR:V(-1.5,1,.5),tidy}
 const insp=(at,x,nx)=>({at,dur:[3,5],w:1,next:nx,run:(c,u,t)=>{c.see(V(x,1,.47));c.H(0,V(x+.22,1+.02*sin(t*3),.4),ss(0,.25,u)*(1-ss(.85,1,u)));c.lean=.07}})
 const hc=c=>c.held(0)
 const actions={
  ready:{at:'bench',dur:[2,3.5],next:['inspectA','inspectC','fetch','tools','check'],run:(c,u)=>{c.see(V(1.6-3.2*ss(0,1,u),1,.6))}},
  stretch:{at:'bench',dur:[3,4],w:.7,next:['inspectA','fetch','tools'],run:(c,u)=>{const k=ss(0,.3,u)*(1-ss(.75,1,u));c.H(0,V(.32,1.5,.12),k);c.H(1,V(-.32,1.5,.12),k);c.see(V(0,2.4,1.2));c.lean=-.07*k}},
  check:{at:'bench',dur:[3,5],next:['inspectA','fetch','tools'],run:(c,u,t)=>{typing(c,t);c.see(A.main);c.lean=.04}},
  tools:{at:'bench',dur:[5,7],w:1.5,next:['inspectA','fetch','inspectC'],run:(c,u,t)=>{const P=tidy,k=min(P.length-1,floor(u*P.length));c.H(k%2,V(P[k].x,P[k].y+.04+.03*sin(t*5),P[k].z));c.see(P[k]);c.lean=.06}},
  inspectA:insp('mA',1.5,['adjust','fetch','tools','inspectC']),inspectB:insp('mB',-1.5,['remove','adjust']),inspectC:insp('mC',-3,['inspectA','fetch','tools']),
  adjust:{at:'mC',dur:[3,4.5],next:['remove','inspectA','fetch'],run:(c,u,t)=>{const K=V(-2.78,.74,.4);c.see(u<.2||u>.85?V(-3,1,.47):K);c.H(0,V(K.x+.015*sin(t*3),K.y,K.z),ss(0,.25,u)*(1-ss(.8,1,u)));env.turn=ss(.25,.75,u);c.lean=.06}},
  fetch:{at:'shelf',dur:[2.6,3.2],w:2,next:['install'],can:c=>!hc(c)&&mod.state==='shelf',run:(c,u)=>{if(grabAt(c,u,mod,mod.home,AP_T))mod.state='hand'}},
  install:{at:'mB',dur:[3,3.6],next:['inspectB','adjust'],can:c=>!!hc(c),run:(c,u)=>{if(placeAt(c,u,mod,SLOT,AP_W))mod.state='slot'}},
  remove:{at:'mB',dur:[2.8,3.4],next:['stow'],can:c=>!hc(c)&&mod.state==='slot',run:(c,u)=>{if(grabAt(c,u,mod,SLOT,AP_W))mod.state='hand'}},
  stow:{at:'shelf',dur:[2.8,3.4],next:['ready','tools','inspectA'],can:c=>!!hc(c),run:(c,u)=>{if(placeAt(c,u,mod,mod.home,AP_T))mod.state='shelf'}}}
 const env={b,group:g,A,stance:'stand',start:[0,0],stations:{shelf:{x:3,z:0,yaw:0},mA:{x:1.5,z:0,yaw:0},bench:{x:0,z:0,yaw:0},mB:{x:-1.5,z:0,yaw:0},mC:{x:-3,z:0,yaw:0}},main:'bench',tidyAt:'bench',carry:[mod],turn:0,
  order:['ready','check','tools','inspectA','inspectC','fetch','install','remove','stow','adjust','stretch'],actions,
  update:(t,s)=>{knobs[2].rotation.y=env.turn*4;lights.forEach((lm,i)=>{const hot=s==='processing'&&i===1,bad=s==='error'&&i===1;lm.emissiveIntensity=hot?2.2:.5+.25*sin(t*1.5+i*2);const col=bad?0xff5d7a:0x38d4ee;lm.emissive.setHex(col);lm.color.setHex(col)});b.tick(t,s)}}
 return finish(env)}
export const ENVS={control:()=>seated('control'),comms:()=>seated('comms'),analysis:()=>seated('analysis'),desk:()=>seated('desk'),ops,workshop}
