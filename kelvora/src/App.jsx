import Nav from './Nav.jsx'
import {wsKind} from './workspace/state.js'
import {lazy as _lz,Suspense as _Su} from 'react'
const _IH=_lz(()=>import('./Icons3D.jsx'))
const WS=_lz(()=>import('./workspace/Workspace.jsx'))
import {HomeRoot,PITCH,World,PageStage} from './Home3D.jsx'
import Intro from './Intro.jsx'
import {Chat,requestService} from './Support.jsx'
import {Notices} from './Biz.jsx'
import {cleanUrl} from './hooks.js'
import Tabs from './Mobile.jsx'
import Bot from './Bot.jsx'
import {Toasts,Spin,useBusy,toast} from './Ui.jsx'
import {Vid} from './Showcase.jsx'
import {useState,useEffect} from 'react'
import {Routes,Route,Link,Navigate,useNavigate,useLocation} from 'react-router-dom'
import {collection,addDoc,updateDoc,setDoc,doc,serverTimestamp} from 'firebase/firestore'
import {db,login,useUser,useCol} from './firebase.js'
import VIDEOS from './videos.js'
const AdminPanel=_lz(()=>import('./Admin.jsx')),AgentsPage=_lz(()=>import('./Agents.jsx'))
const AuditPage=_lz(()=>import('./Scout.jsx').then(m=>({default:m.AuditPage})))
const BizPage=_lz(()=>import('./Profile.jsx').then(m=>({default:m.BizPage})))
const ProfileEditor=_lz(()=>import('./Profile.jsx').then(m=>({default:m.ProfileEditor})))
const NetworkPage=_lz(()=>import('./Profile.jsx').then(m=>({default:m.NetworkPage})))
const Dash=_lz(()=>import('./Verified.jsx').then(m=>({default:m.Dash})))
const VerifyPanel=_lz(()=>import('./Verified.jsx').then(m=>({default:m.VerifyPanel})))

const Need=({u,children})=>u===undefined?<div className="wrap"><Spin/></div>:u?children:<div className="card"><p>Please sign in to continue.</p><br/><button onClick={login}>Sign in with Google</button></div>

function Threads({u,admin}){const th=useCol('threads',admin?null:['members','array-contains',u.uid]);const[o,setO]=useState(null)
const L=[...th].sort((a,b)=>((b.type==='support')-(a.type==='support'))||((b.t?.seconds||0)-(a.t?.seconds||0)));useEffect(()=>{const s=th.find(x=>x.type==='support');if(s&&o===null&&!admin)setO(s.id)},[th.length])
return <div className="grid">{L.length===0&&<p style={{color:'#8a87aa'}}>No chats yet.</p>}{L.map(x=><div className="card rv" key={x.id} style={{gridColumn:o===x.id?'1/-1':undefined}}>
<div className="row"><b>{x.subject}</b><span className={'tag '+(x.type==='verify'?'v':'')}>{x.type==='verify'?'verification':x.type==='b2b'?'network':x.type==='support'?'Kelvora':x.status}</span></div><small>{x.email}</small><p>{x.last}</p>
{x.type==='verify'&&<_Su fallback={null}><VerifyPanel x={x} admin={admin}/></_Su>}
<div className="row" style={{marginTop:10}}><button className="s" onClick={()=>setO(o===x.id?null:x.id)}>{o===x.id?'Close chat':'Open chat'}</button>
{admin&&x.type!=='verify'&&<button className="s" onClick={()=>updateDoc(doc(db,'threads',x.id),{status:x.status==='open'?'closed':'open'})}>Toggle status</button>}</div>
{o===x.id&&<Chat tid={x.id} u={u} th={x}/>}</div>)}</div>}

function Contact({u}){const[s,setS]=useState('');const[m,setM]=useState('');const[ok,setOk]=useState(false)
const go=async e=>{e.preventDefault()
const r=await addDoc(collection(db,'threads'),{uid:u.uid,members:[u.uid],email:u.email,subject:s,last:m,status:'open',t:serverTimestamp()})
await addDoc(collection(db,'threads',r.id,'messages'),{text:m,from:u.email,t:serverTimestamp()});setS('');setM('');setOk(true)}
return <form onSubmit={go}><input required placeholder="Subject" value={s} onChange={e=>setS(e.target.value)}/>
<textarea required rows="4" placeholder="Tell us about your business and what you need" value={m} onChange={e=>setM(e.target.value)}/><button>Send inquiry</button>
{ok&&<small style={{color:'var(--l)'}}>Sent! Replies will appear in your dashboard.</small>}</form>}

function Portfolio(){const b=useCol('businesses',['verified','==',true])
return <main className="wrap"><h2><small>Portfolio</small>Our work</h2>
{VIDEOS.length===0&&<p style={{color:'#8a87aa'}}>Showreel coming soon.</p>}
<div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(min(320px,100%),1fr))'}}>{VIDEOS.map((v,i)=><div key={i}><Vid v={v}/><p style={{margin:'8px 0 0'}}>{v.title}</p></div>)}</div>
<h2><small>Community</small>Verified businesses</h2><div className="grid">{b.map(x=><div className="card rv" key={x.id}><span className="tag">✓ Verified</span><h3>{x.name}</h3><small>{x.category}</small><p>{x.desc}</p>{cleanUrl(x.link)&&<a href={cleanUrl(x.link)} target="_blank" rel="noreferrer" style={{color:'var(--c)'}}>Visit →</a>}</div>)}</div></main>}

function Store({u}){const s=useCol('services');const[n,setN]=useState('')
const order=x=>requestService(u,x.title,x.category||'service',x.price||0).then(()=>setN(x.title)).catch(e=>toast(e.message||'Failed','err'))
return <main className="wrap"><h2><small>Store</small>Services & Marketing</h2>{n&&<p style={{color:'var(--l)'}}>✅ Request sent for "{n}". <Link to="/dashboard" style={{color:'var(--c)'}}>Open your chat →</Link></p>}
<div className="grid">{s.length===0&&<p style={{color:'#8a87aa'}}>Services coming soon.</p>}{s.map(x=><div className="card rv" key={x.id}><span className="tag">{x.category}</span><h3>{x.title}</h3><p>{x.desc}</p><h3>₹{x.price}</h3>
{u?<button onClick={()=>order(x)}>Request quote</button>:<button onClick={login}>Sign in to order</button>}</div>)}</div></main>}

function Register({u}){const[f,setF]=useState({name:'',category:'',desc:'',link:''});const[busy,run]=useBusy();const nav=useNavigate()
const go=e=>{e.preventDefault();run(async()=>{
if(f.link&&!cleanUrl(f.link))throw new Error('That link looks invalid. Enter a website like example.com or leave it empty.')
const b=await addDoc(collection(db,'businesses'),{...f,link:cleanUrl(f.link),uid:u.uid,verified:false,t:serverTimestamp()})
await setDoc(doc(db,'bizPrivate',b.id),{uid:u.uid,email:u.email,adminNote:''})
const msg='Hi! I just registered "'+f.name+'" ('+f.category+'). Please verify my business.'
const th=await addDoc(collection(db,'threads'),{uid:u.uid,members:[u.uid],email:u.email,subject:'Verification: '+f.name,last:msg,status:'open',type:'verify',bizId:b.id,t:serverTimestamp()})
await addDoc(collection(db,'threads',th.id,'messages'),{text:msg,from:u.email,t:serverTimestamp()})
await updateDoc(b,{threadId:th.id});toast('Submitted! Chat with our team in your dashboard');nav('/dashboard')})}
return <main className="wrap"><h2><small>Join</small>Register your business</h2><Need u={u}><form onSubmit={go}>
{[['name','Business name'],['category','Category (e.g. Retail, Food, Education)'],['link','Website or widget link (optional)']].map(([k,p])=><input key={k} required={k!=='link'} placeholder={p} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/>)}
<textarea rows="4" placeholder="Describe your business" value={f.desc} onChange={e=>setF({...f,desc:e.target.value})}/><button disabled={busy}>{busy?'Submitting…':'Submit for verification'}</button>
<small style={{color:'#8a87aa'}}>A private verification chat opens with our team right after you submit.</small></form></Need></main>}

const SK={"/network":"network","/audit":"audit","/store":"growth","/portfolio":"computer","/register":"chat","/agents":"build","/dashboard":"chat","/admin":"servers"}
function Page({children}){const{pathname}=useLocation();useEffect(()=>{scrollTo({top:0})},[pathname]);return <div key={pathname} className="pg">{['/dashboard','/admin'].includes(pathname)&&<_Su fallback={null}><_IH/></_Su>}{wsKind(pathname)&&<_Su fallback={null}><WS kind={wsKind(pathname)}/></_Su>}{children}</div>}
export default function App(){const u=useUser();const[w3,setW3]=useState(()=>{try{return localStorage.getItem('kv_3d')!=='off'}catch{return true}})
return <><div className="bg"><i/><i/><i/></div><World on={w3}/><Toasts/><Intro/>
<Nav u={u}/>
<Page><_Su fallback={<Spin/>}><Routes><Route path="/" element={<HomeRoot u={u} Contact={Contact} Need={Need}/>}/><Route path="/portfolio" element={<Portfolio/>}/><Route path="/store" element={<Store u={u}/>}/>
<Route path="/register" element={<Register u={u}/>}/><Route path="/dashboard" element={<Need u={u}><div className="wrap"><Notices u={u}/></div><Dash u={u} Threads={Threads}/></Need>}/>
<Route path="/admin" element={<Need u={u}><AdminPanel u={u} Threads={Threads}/></Need>}/><Route path="/network" element={<NetworkPage u={u}/>}/><Route path="/business/:id" element={<BizPage u={u}/>}/><Route path="/audit" element={<Need u={u}><AuditPage u={u}/></Need>}/><Route path="/agents" element={<AgentsPage u={u}/>}/><Route path="/profile/:id" element={<Need u={u}><ProfileEditor u={u}/></Need>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></_Su></Page>
<Tabs u={u}/><Bot u={u}/><footer>© 2026 Kelvora Infotech · kelvorainfortech.com · <a href={PITCH} target="_blank" rel="noreferrer" style={{color:'var(--c)'}}>Watch our pitch ↗</a> · <button className="s tg" onClick={()=>{try{localStorage.setItem('kv_3d',w3?'off':'on')}catch{};location.reload()}}>3D {w3?'on':'off'}</button></footer></>}
