import {useState,useEffect,useRef} from 'react'
import {Link,useParams,useNavigate,useLocation} from 'react-router-dom'
import {collection,addDoc,updateDoc,setDoc,deleteDoc,getDoc,doc,onSnapshot,serverTimestamp} from 'firebase/firestore'
import {db,auth,isAdmin,useCol,login} from './firebase.js'
import {toast,useBusy,Spin} from './Ui.jsx'

const IC={instagram:['📷','Instagram'],linkedin:['in','LinkedIn'],google:['📍','Google'],youtube:['▶','YouTube'],facebook:['f','Facebook']}
const BASIC=['name','category','desc','link']
export const cleanUrl=s=>{s=String(s||'').trim();if(!s||/\s/.test(s))return '';if(!/^https?:\/\//i.test(s)){if(/^[a-z][a-z0-9+.-]*:/i.test(s))return '';s='https://'+s}
try{const u=new URL(s);return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)?u.href:''}catch{return ''}}
const safe=s=>cleanUrl(s)||'#'
const cache=new Map()
export function Img({id,alt='',className='',style}){const[s,setS]=useState(cache.get(id)||'')
useEffect(()=>{if(!id)return setS('');if(/^(data:|https?:)/.test(id))return setS(id);if(cache.has(id))return setS(cache.get(id))
let on=true;getDoc(doc(db,'images',id)).then(d=>{if(d.exists()){cache.set(id,d.data().data);on&&setS(d.data().data)}}).catch(()=>{});return()=>{on=false}},[id])
return s?<img src={s} alt={alt} className={className} style={style}/>:null}
export const Logo=({b,s=56})=><div className="lg" style={{width:s,height:s,fontSize:s/2.2}}>{b?.profile?.logo?<Img id={b.profile.logo} alt={b.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:(b?.name||'?')[0]}</div>

async function shrink(file,max,limit){const bmp=await createImageBitmap(file);const k=Math.min(1,max/Math.max(bmp.width,bmp.height));const cv=document.createElement('canvas');cv.width=Math.round(bmp.width*k);cv.height=Math.round(bmp.height*k)
cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);let q=.85,url='';for(let i=0;i<6;i++){url=cv.toDataURL('image/webp',q);if(url.length<limit)break;q-=.13}
if(url.length>=limit)throw new Error('Image is too big. Try a smaller one.');return url}
function ImgField({label,v,on,max=1200,limit=280000}){const[busy,run]=useBusy()
const pick=e=>{const f=e.target.files?.[0];if(!f)return;run(async()=>{if(!/^image\//.test(f.type))throw new Error('Please choose an image');const data=await shrink(f,max,limit);const r=await addDoc(collection(db,'images'),{uid:auth.currentUser.uid,data,t:serverTimestamp()});on(r.id)})}
return <div><small>{label}</small><div className="row" style={{marginTop:6}}>{v?<Img id={v} className="th"/>:<div className="th none">none</div>}<label className="btn s">{busy?'Uploading…':'Upload'}<input type="file" accept="image/*" hidden onChange={pick}/></label>{v&&<button type="button" className="s" onClick={()=>on('')}>Remove</button>}</div></div>}
const In=({l,v,on,area,ph,type})=><label style={{display:'block'}}><small>{l}</small>{area?<textarea rows={4} value={v||''} placeholder={ph} onChange={e=>on(e.target.value)}/>:<input type={type||'text'} value={v||''} placeholder={ph} onChange={e=>on(e.target.value)}/>}</label>
const ListEd=({title,items,max,fields,onChange,blank})=><div className="card"><b>{title}</b><div className="pe" style={{marginTop:10}}>{items.map((it,i)=><div key={i} className="vp">{fields.map(([k,l,area])=><In key={k} l={l} area={area} v={it[k]} on={v=>onChange(items.map((x,j)=>j===i?{...x,[k]:v}:x))}/>)}<button type="button" className="s" style={{marginTop:8}} onClick={()=>onChange(items.filter((_,j)=>j!==i))}>Remove</button></div>)}
{items.length<max&&<button type="button" className="s" onClick={()=>onChange([...items,{...blank}])}>+ Add</button>}</div></div>

const BLANK={tagline:'',logo:'',cover:'',accent:'#7c5cff',about:'',location:'',founded:'',team:'',instagram:'',linkedin:'',google:'',youtube:'',facebook:'',email:'',phone:'',offering:'',lookingFor:'',services:[],highlights:[],gallery:['','','','']}
const merge=(b,d)=>d?{...b,...d,profile:{...BLANK,...(b.profile||{}),...(d.profile||{})}}:{...b,profile:{...BLANK,...(b.profile||{})}}

export function ProfileEditor({u}){const{id}=useParams();const[b,setB]=useState(undefined);const[f,setF]=useState(null);const[busy,run]=useBusy();const adm=isAdmin(u);const nav=useNavigate()
useEffect(()=>{(async()=>{try{const bs=await getDoc(doc(db,'businesses',id));if(!bs.exists())return setB(null);const biz={id:bs.id,...bs.data()};let d=null
try{const ds=await getDoc(doc(db,'drafts',id));if(ds.exists())d=ds.data().data}catch{}
const m=merge({name:biz.name||'',category:biz.category||'',desc:biz.desc||'',link:biz.link||'',profile:biz.profile},d);setB(biz);setF({name:m.name,category:m.category,desc:m.desc,link:m.link,profile:m.profile})}catch{setB(null)}})()},[id])
if(b===undefined)return <div className="wrap"><Spin/></div>
if(!b||(!adm&&b.uid!==u.uid))return <main className="wrap"><h2>Not found or no access</h2><Link className="btn s" to="/dashboard">← Dashboard</Link></main>
const P=(k,v)=>setF(x=>({...x,profile:{...x.profile,[k]:v}}));const T=(k,v)=>setF(x=>({...x,[k]:v}));const p=f.profile
const bad=()=>{const k=[];if(f.link&&!cleanUrl(f.link))k.push('Widget link');Object.keys(IC).forEach(x=>{if(p[x]&&!cleanUrl(p[x]))k.push(IC[x][1])});return k}
const draft=submit=>run(async()=>{const e=bad();if(e.length)throw new Error('Invalid link: '+e.join(', ')+'. Use a real address like example.com');await setDoc(doc(db,'drafts',id),{uid:b.uid,data:f,t:serverTimestamp()});if(submit){await updateDoc(doc(db,'businesses',id),{profileStatus:'pending',submittedAt:serverTimestamp()});toast('Sent to Kelvora for approval');nav('/dashboard')}else toast('Draft saved')})
const publish=()=>run(async()=>{const e=bad();if(e.length)throw new Error('Invalid link: '+e.join(', ')+'. Use a real address like example.com');await updateDoc(doc(db,'businesses',id),{name:f.name,category:f.category,desc:f.desc,link:f.link,profile:f.profile,profileStatus:'approved',adminNote:''});await deleteDoc(doc(db,'drafts',id)).catch(()=>{})
await addDoc(collection(db,'notices'),{uid:b.uid,biz:f.name,email:b.email||'',kind:'reminder',text:'✏️ Kelvora updated your business profile.',qs:[],answers:[],status:'sent',t:serverTimestamp()});toast('Published');nav('/business/'+id)})
return <main className="wrap"><Link to={adm?'/admin':'/dashboard'} style={{color:'var(--c)'}}>← Back</Link><h2><small>{adm?'Admin edit':'Your profile'}</small>Business profile</h2>
{b.profileStatus==='pending'&&<div className="card glow" style={{marginBottom:12}}>⏳ Your changes are waiting for Kelvora approval. Your public page updates once approved.</div>}
{b.profileStatus==='rejected'&&<div className="card ord late" style={{marginBottom:12}}>❌ Please update: {b.adminNote}</div>}
<div className="pe">
<div className="card"><b>Branding</b><div className="pe two" style={{marginTop:10}}><ImgField label="Logo (square works best)" v={p.logo} on={v=>P('logo',v)} max={400} limit={90000}/><ImgField label="Cover image (wide)" v={p.cover} on={v=>P('cover',v)} max={1400} limit={300000}/><In l="Brand color" type="color" v={p.accent} on={v=>P('accent',v)}/></div></div>
<div className="card"><b>Basics</b><div className="pe two" style={{marginTop:10}}><In l="Business name" v={f.name} on={v=>T('name',v)}/><In l="Category" v={f.category} on={v=>T('category',v)}/><In l="Tagline (one line)" v={p.tagline} on={v=>P('tagline',v)}/><In l="Widget / website link" v={f.link} on={v=>T('link',v)}/></div><div style={{marginTop:10}}><In l="Short description" area v={f.desc} on={v=>T('desc',v)}/></div></div>
<div className="card"><b>About</b><div style={{margin:'10px 0'}}><In l="Your story" area v={p.about} on={v=>P('about',v)}/></div><div className="pe two"><In l="City / location" v={p.location} on={v=>P('location',v)}/><In l="Founded (year)" v={p.founded} on={v=>P('founded',v)}/><In l="Team size" v={p.team} on={v=>P('team',v)}/></div></div>
<div className="card"><b>Links</b><div className="pe two" style={{marginTop:10}}>{Object.keys(IC).map(k=><In key={k} l={IC[k][1]+' link'} v={p[k]} on={v=>P(k,v)} ph="https://"/>)}</div></div>
<ListEd title="Services / what you offer" items={p.services} max={6} blank={{title:'',text:''}} fields={[['title','Title'],['text','Description',1]]} onChange={v=>P('services',v)}/>
<ListEd title="Highlights (numbers people remember)" items={p.highlights} max={4} blank={{value:'',label:''}} fields={[['value','Number (e.g. 500+)'],['label','Label']]} onChange={v=>P('highlights',v)}/>
<div className="card"><b>Gallery</b><div className="pe two" style={{marginTop:10}}>{[0,1,2,3].map(i=><ImgField key={i} label={'Photo '+(i+1)} v={(p.gallery||[])[i]} max={1000} limit={220000} on={v=>P('gallery',[0,1,2,3].map(j=>j===i?v:(p.gallery||[])[j]||''))}/>)}</div></div>
<div className="card glow"><b>🤝 Collaboration</b><div className="pe two" style={{marginTop:10}}><In l="What we can offer other businesses" area v={p.offering} on={v=>P('offering',v)}/><In l="What we are looking for / need help with" area v={p.lookingFor} on={v=>P('lookingFor',v)}/></div></div>
<div className="card"><b>Public contact (optional)</b><div className="pe two" style={{marginTop:10}}><In l="Email" v={p.email} on={v=>P('email',v)}/><In l="Phone / WhatsApp" v={p.phone} on={v=>P('phone',v)}/></div></div>
<div className="row" style={{position:'sticky',bottom:12}}>{adm?<button disabled={busy} onClick={publish}>✓ Publish now</button>:<><button disabled={busy} onClick={()=>draft(true)}>📨 Submit for approval</button><button className="s" disabled={busy} onClick={()=>draft(false)}>Save draft</button></>}
<Link className="btn s" to={'/business/'+id+'?draft=1'}>👁 Preview</Link></div>
{!adm&&<small style={{color:'#8a87aa'}}>Your public page changes only after Kelvora approves. We will notify you.</small>}</div></main>}

export const ProfileCard=({x})=><div className="card"><div className="row"><Logo b={x} s={48}/><div><b>{x.name}</b><br/><span className="tag">{x.verified?'✓ Verified':'⏳ Pending'}</span> {x.profileStatus==='pending'&&<span className="tag v">update in review</span>} {x.profileStatus==='rejected'&&<span className="tag r">changes needed</span>}</div></div>
{x.profileStatus==='rejected'&&<p style={{fontSize:13,marginTop:6}}>{x.adminNote}</p>}<div className="row" style={{marginTop:10}}><Link className="btn" to={'/profile/'+x.id}>✏️ Edit profile</Link><Link className="btn s" to={'/business/'+x.id}>View page</Link></div></div>

function useVer(u){const[v,s]=useState(false);useEffect(()=>u?onSnapshot(doc(db,'users',u.uid),d=>s(!!d.data()?.verified),()=>s(false)):undefined,[u?.uid]);return v}
function Deck({b,p,onClose}){const el=useRef();const[i,setI]=useState(0);const gal=(p.gallery||[]).filter(Boolean)
const S=[<><Logo b={b} s={110}/><h1>{b.name}</h1><p>{p.tagline||b.desc}</p><span className="tag v">{b.category}</span></>,
(p.about||b.desc)&&<><h1>About</h1><p>{p.about||b.desc}</p></>,
(p.services||[]).length>0&&<><h1>What we do</h1><div className="gal">{p.services.map((s,k)=><div className="card" key={k}><h3>{s.title}</h3><p style={{fontSize:16}}>{s.text}</p></div>)}</div></>,
(p.highlights||[]).length>0&&<><h1>Highlights</h1><div className="gal">{p.highlights.map((h,k)=><div className="card" key={k}><div className="hl">{h.value}</div><p style={{fontSize:16}}>{h.label}</p></div>)}</div></>,
gal.length>0&&<><h1>Gallery</h1><div className="gal">{gal.map((g,k)=><Img key={k} id={g}/>)}</div></>,
(p.offering||p.lookingFor)&&<><h1>Let's collaborate</h1>{p.offering&&<p><b>We offer:</b> {p.offering}</p>}{p.lookingFor&&<p><b>We need:</b> {p.lookingFor}</p>}</>,
<><h1>Get in touch</h1>{p.email&&<p>✉ {p.email}</p>}{p.phone&&<p>📞 {p.phone}</p>}{b.link&&<p>🌐 {b.link}</p>}<div className="row">{Object.keys(IC).filter(k=>p[k]).map(k=><span className="tag" key={k}>{IC[k][1]}</span>)}</div></>].filter(Boolean)
useEffect(()=>{el.current?.requestFullscreen?.().catch(()=>{});const k=e=>{if(e.key==='ArrowRight'||e.key===' ')setI(x=>Math.min(x+1,S.length-1));if(e.key==='ArrowLeft')setI(x=>Math.max(x-1,0));if(e.key==='Escape')onClose()}
const fs=()=>{if(!document.fullscreenElement)onClose()};addEventListener('keydown',k);document.addEventListener('fullscreenchange',fs)
return()=>{removeEventListener('keydown',k);document.removeEventListener('fullscreenchange',fs);document.fullscreenElement&&document.exitFullscreen?.()}},[])
return <div className="deck" ref={el} style={{'--ac':p.accent||'#7c5cff'}}><div className="slide" key={i} onClick={()=>setI(x=>Math.min(x+1,S.length-1))}>{S[i]}</div>
<div className="dn"><button className="s" onClick={()=>setI(x=>Math.max(x-1,0))}>←</button><span className="dots">{S.map((_,k)=><i key={k} className={k===i?'on':''}/>)}</span><button className="s" onClick={()=>setI(x=>Math.min(x+1,S.length-1))}>→</button><button onClick={onClose}>✕ Close</button></div></div>}

export function BizPage({u}){const{id}=useParams();const loc=useLocation();const nav=useNavigate();const[b0,setB]=useState(undefined);const[dr,setDr]=useState(null);const ver=useVer(u);const[busy,run]=useBusy();const[deck,setDeck]=useState(false);const[live,setLive]=useState(false);const pv=useRef()
const wd=new URLSearchParams(loc.search).get('draft')==='1'
useEffect(()=>onSnapshot(doc(db,'businesses',id),d=>setB(d.exists()?{id:d.id,...d.data()}:null),()=>setB(null)),[id])
useEffect(()=>{if(!wd){setDr(null);return}return onSnapshot(doc(db,'drafts',id),d=>setDr(d.exists()?d.data().data:null),()=>setDr(null))},[id,wd])
if(b0===undefined)return <div className="wrap"><Spin/></div>
if(!b0)return <main className="wrap"><h2>Business not found</h2><Link className="btn s" to="/network">← Network</Link></main>
const b=merge(b0,dr),p=b.profile,mine=!!u&&b0.uid===u.uid,adm=isAdmin(u),gal=(p.gallery||[]).filter(Boolean),wl=cleanUrl(b.link)
const chat=msg=>run(async()=>{const r=await addDoc(collection(db,'threads'),{uid:u.uid,members:[u.uid,b0.uid],email:u.email,subject:(msg?'Collaboration: ':'Chat: ')+b0.name,last:msg||'',status:'open',type:'b2b',t:serverTimestamp()})
if(msg)await addDoc(collection(db,'threads',r.id,'messages'),{text:msg,from:u.email,t:serverTimestamp()});toast('Chat started');nav('/dashboard')})
return <main className="wrap" style={{'--ac':p.accent||'#7c5cff'}}>
{wd&&<div className="card ord urg" style={{marginBottom:12}}>👁 Draft preview. Visitors still see the approved version.</div>}
<section className="pfh">{p.cover&&<Img id={p.cover} className="cov"/>}<div className="pfi"><div className="row" style={{gap:16}}><Logo b={b} s={84}/><div><h1>{b.name}</h1>{p.tagline&&<p style={{color:'#d8d5f2'}}>{p.tagline}</p>}</div></div>
<div className="row"><span className="tag">{b0.verified?'✓ Verified':'⏳ Pending'}</span><span className="tag v">{b.category}</span>{p.location&&<span className="tag">📍 {p.location}</span>}</div>
<div className="row">{Object.keys(IC).filter(k=>cleanUrl(p[k])).map(k=><a key={k} className="soc" title={IC[k][1]} href={cleanUrl(p[k])} target="_blank" rel="noreferrer">{IC[k][0]}</a>)}</div>
<div className="row">{wl&&<a className="btn" href={wl} target="_blank" rel="noreferrer">Open widget ↗</a>}<button className="s" onClick={()=>setDeck(true)}>▶ Present</button>
{!mine&&(ver?<><button disabled={busy} onClick={()=>chat()}>💬 Message</button><button className="s" disabled={busy} onClick={()=>chat('Hi! I would like to explore a collaboration with '+b0.name+'.')}>🤝 Propose collaboration</button></>:u?<Link className="btn s" to="/register">🔒 Register to chat</Link>:<button className="s" onClick={login}>🔒 Sign in to connect</button>)}
{(mine||adm)&&<Link className="btn s" to={'/profile/'+b0.id}>✏️ Edit</Link>}</div></div></section>
<div className="bento" style={{marginTop:14}}>
<div className="card s4"><h3>About</h3><p>{p.about||b.desc||'No description yet.'}</p></div>
<div className="card s2"><h3>Details</h3>{p.founded&&<p>🗓 Founded {p.founded}</p>}{p.team&&<p>👥 Team: {p.team}</p>}{p.email&&<p><a href={'mailto:'+p.email} style={{color:'var(--c)'}}>✉ {p.email}</a></p>}{p.phone&&<p>📞 {p.phone}</p>}{!mine&&!ver&&<small>Browsing is open to everyone. Chat and collaboration are for verified businesses.</small>}</div>
{(p.services||[]).length>0&&<div className="card s6"><h3>What we do</h3><div className="grid" style={{marginTop:10}}>{p.services.map((s,i)=><div className="card" key={i}><h3>{s.title}</h3><p>{s.text}</p></div>)}</div></div>}
{(p.highlights||[]).length>0&&<div className="card s6"><div className="grid">{p.highlights.map((h,i)=><div key={i}><div className="hl">{h.value}</div><small>{h.label}</small></div>)}</div></div>}
{(p.offering||p.lookingFor)&&<div className="card glow s6"><h3>🤝 Collaboration</h3><div className="grid" style={{marginTop:8}}>{p.offering&&<div><b>We can offer</b><p>{p.offering}</p></div>}{p.lookingFor&&<div><b>We are looking for</b><p>{p.lookingFor}</p></div>}</div></div>}
{gal.length>0&&<div className="card s6"><h3>Gallery</h3><div className="gal" style={{marginTop:10}}>{gal.map((g,i)=><Img key={i} id={g}/>)}</div></div>}
{wl&&<div className="card s6"><div className="row"><h3 style={{marginRight:'auto'}}>Live widget</h3><a className="btn s" href={wl} target="_blank" rel="noreferrer">Open ↗</a>{live&&<button className="s" onClick={()=>pv.current?.requestFullscreen?pv.current.requestFullscreen():window.open(wl,'_blank')}>⛶ Full screen</button>}</div>
{!live?<button className="s" style={{marginTop:10}} onClick={()=>setLive(true)}>▶ Load live preview</button>:<><iframe ref={pv} title="widget" src={wl} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" style={{width:'100%',height:420,border:0,borderRadius:14,background:'#fff',marginTop:10}}/><small>Blank or refused to connect? That website blocks previews. Use Open ↗.</small></>}</div>}</div>
{deck&&<Deck b={b} p={p} onClose={()=>setDeck(false)}/>}</main>}

export function NetworkPage({u}){const list=useCol('businesses',['verified','==',true]);const ver=useVer(u);const[q,setQ]=useState('')
const L=list.filter(x=>JSON.stringify([x.name,x.category,x.desc,x.profile?.tagline]).toLowerCase().includes(q.toLowerCase()))
return <main className="wrap"><h2><small>Network</small>Verified businesses</h2>
<p style={{color:'#b9b6d6',marginBottom:12}}>Anyone can browse and view profiles. Verified businesses can also chat and collaborate.</p>
{!u?<div className="card" style={{marginBottom:14}}><div className="row">Browsing as a guest. <button onClick={login}>Sign in</button></div></div>
:!ver?<div className="card" style={{marginBottom:14}}>You can browse everything. Want to chat and collaborate? <Link to="/register" style={{color:'var(--c)'}}>Register your business</Link> (optional).</div>
:<div className="card glow" style={{marginBottom:14}}>✓ You are verified. Open a profile to message or propose a collaboration.</div>}
<input placeholder="Search businesses…" value={q} onChange={e=>setQ(e.target.value)} style={{marginBottom:14}}/>
<div className="grid">{L.length===0&&<p style={{color:'#8a87aa'}}>No businesses found.</p>}{L.map(x=><Link className="card rv bc" key={x.id} to={'/business/'+x.id}><div className="row"><Logo b={x} s={52}/><div><b>{x.name}</b><br/><small>{x.category}</small></div></div><p>{x.profile?.tagline||x.desc}</p><span className="tag">✓ Verified</span></Link>)}</div></main>}


const LBL={name:'Name',category:'Category',desc:'Description',link:'Widget link'}
const same=(a,b)=>JSON.stringify(a??'')===JSON.stringify(b??'')
const show=(k,v)=>['logo','cover'].includes(k)?(v?<Img id={v} className="th"/>:'—'):k==='gallery'?<span>{(v||[]).filter(Boolean).length} photos {(v||[]).filter(Boolean).map((g,i)=><Img key={i} id={g} className="th"/>)}</span>:Array.isArray(v)?<span>{v.length} items: {v.map(i=>i.title||i.label||'').join(', ')}</span>:<span>{String(v||'—')}</span>
function AppCard({b}){const[d,setD]=useState(undefined);const[busy,run]=useBusy()
useEffect(()=>onSnapshot(doc(db,'drafts',b.id),x=>setD(x.exists()?x.data():null),()=>setD(null)),[b.id])
const x=d?.data||{},old=b.profile||{},ch=[];BASIC.forEach(k=>{if(x[k]!==undefined&&!same(x[k],b[k]))ch.push([LBL[k],b[k],x[k],k])});Object.keys(x.profile||{}).forEach(k=>{if(!same(x.profile[k],old[k]))ch.push([k,old[k],x.profile[k],k])})
const act=ok=>run(async()=>{let note='';if(!ok){note=prompt('What should they change?')||'';if(!note)return}
const up={profileStatus:ok?'approved':'rejected',adminNote:note};if(ok){BASIC.forEach(k=>{if(x[k]!==undefined)up[k]=x[k]});if(x.profile)up.profile={...old,...x.profile}}
await updateDoc(doc(db,'businesses',b.id),up);if(ok)await deleteDoc(doc(db,'drafts',b.id)).catch(()=>{})
await addDoc(collection(db,'notices'),{uid:b.uid,biz:b.name,email:b.email||'',kind:'reminder',text:ok?'✅ Your profile update was approved and is now live.':'❌ Your profile update needs changes: '+note,qs:[],answers:[],status:'sent',t:serverTimestamp()});toast(ok?'Approved, now live':'Sent back to business')})
return <div className="card"><div className="row"><Logo b={b} s={44}/><b>{b.name}</b><small>{b.email}</small></div>
{d===undefined?<Spin/>:ch.length===0?<p style={{margin:'8px 0',color:'#8a87aa'}}>No visible changes in the draft.</p>:<div className="tw"><table><tbody>{ch.map(([l,o,n],i)=><tr key={i}><td><b>{l}</b></td><td style={{whiteSpace:'normal'}}>{show(ch[i][3],o)}</td><td>→</td><td style={{whiteSpace:'normal',color:'var(--l)'}}>{show(ch[i][3],n)}</td></tr>)}</tbody></table></div>}
<div className="row" style={{marginTop:10}}><button disabled={busy} onClick={()=>act(true)}>✓ Approve</button><button className="s" disabled={busy} onClick={()=>act(false)}>✕ Reject</button><Link className="btn s" to={'/business/'+b.id+'?draft=1'}>👁 Preview</Link><Link className="btn s" to={'/profile/'+b.id}>✏️ Edit</Link></div></div>}
export function Approvals(){const bs=useCol('businesses').filter(x=>x.profileStatus==='pending')
return <div style={{marginTop:16}}><h3>Profile updates to review <span className="tag r">{bs.length}</span></h3><div className="grid" style={{marginTop:12}}>{bs.length===0&&<p style={{color:'#8a87aa'}}>No pending updates 🎉</p>}{bs.map(b=><AppCard key={b.id} b={b}/>)}</div></div>}
