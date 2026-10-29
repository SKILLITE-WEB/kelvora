import Showcase,{Vid} from './Showcase.jsx'
import {useState,useEffect} from 'react'
import {Routes,Route,Link,Navigate} from 'react-router-dom'
import {collection,addDoc,updateDoc,deleteDoc,doc,onSnapshot,query,orderBy,serverTimestamp} from 'firebase/firestore'
import {db,login,logout,useUser,useCol,isAdmin} from './firebase.js'
import VIDEOS from './videos.js'

const Need=({u,children})=>u===undefined?<p>Loading…</p>:u?children:<div className="card"><p>Please sign in to continue.</p><br/><button onClick={login}>Sign in with Google</button></div>

function Chat({tid,u}){const[ms,setMs]=useState([]);const[t,setT]=useState('')
useEffect(()=>onSnapshot(query(collection(db,'threads',tid,'messages'),orderBy('t')),x=>setMs(x.docs.map(d=>d.data()))),[tid])
const send=async e=>{e.preventDefault();if(!t.trim())return
await addDoc(collection(db,'threads',tid,'messages'),{text:t,from:u.email,t:serverTimestamp()})
await updateDoc(doc(db,'threads',tid),{last:t});setT('')}
return <div><div className="msgs">{ms.map((m,i)=><div key={i} className={'m '+(m.from===u.email?'me':'')}><small>{m.from}</small><br/>{m.text}</div>)}</div>
<form onSubmit={send} className="row" style={{display:'flex'}}><input value={t} onChange={e=>setT(e.target.value)} placeholder="Type a message…" style={{flex:1}}/><button>Send</button></form></div>}

function Threads({u,admin}){const th=useCol('threads',admin?null:['uid','==',u.uid]);const[o,setO]=useState(null)
return <div className="grid">{th.length===0&&<p style={{color:'#8a87aa'}}>No inquiries yet.</p>}{th.map(x=><div className="card" key={x.id}><b>{x.subject}</b> <span className="tag">{x.status}</span><br/><small>{x.email}</small><p>{x.last}</p>
<div className="row"><button className="s" onClick={()=>setO(o===x.id?null:x.id)}>Open chat</button>
{admin&&<button className="s" onClick={()=>updateDoc(doc(db,'threads',x.id),{status:x.status==='open'?'closed':'open'})}>Toggle status</button>}</div>
{o===x.id&&<Chat tid={x.id} u={u}/>}</div>)}</div>}

function Contact({u}){const[s,setS]=useState('');const[m,setM]=useState('');const[ok,setOk]=useState(false)
const go=async e=>{e.preventDefault()
const r=await addDoc(collection(db,'threads'),{uid:u.uid,email:u.email,subject:s,last:m,status:'open',t:serverTimestamp()})
await addDoc(collection(db,'threads',r.id,'messages'),{text:m,from:u.email,t:serverTimestamp()});setS('');setM('');setOk(true)}
return <form onSubmit={go}><input required placeholder="Subject" value={s} onChange={e=>setS(e.target.value)}/>
<textarea required rows="4" placeholder="Tell us about your business and what you need" value={m} onChange={e=>setM(e.target.value)}/><button>Send inquiry</button>
{ok&&<small style={{color:'var(--l)'}}>Sent! Replies will appear in your dashboard.</small>}</form>}

const SV=[['⚡','Custom Software & Apps','Web apps, mobile apps and internal tools built exactly around how your business works.','s4'],['🤖','AI Agents','Agents that answer leads, follow up on orders and cut your manual effort.','s2'],
['🎬','Video Editing','Reels, ads and brand films that stop the scroll.','s2'],['✨','Motion Graphics','Animated logos, explainers and social visuals.','s2'],['📣','Social Media Management','Strategy, posting and growth, handled by our team.','s2']]

function Home({u}){return <main>
<div className="wrap"><section className="hero"><span className="pill rv">● Now onboarding new businesses</span>
<h1 className="rv">Software that <span className="grad">runs your business</span> while you sleep.</h1>
<p className="rv">Kelvora Infotech builds custom web apps, software and AI agents that cut human effort and grow your business, plus a full marketing team to get you seen.</p>
<div className="row rv"><Link className="btn" to="/register">Register your business</Link><Link className="btn s" to="/portfolio">See our work</Link></div></section></div>
<div className="mq"><div className="mt">{[...Array(2)].map((_,k)=><span key={k} style={{display:'flex',gap:48}}>{['WEB APPS','AI AGENTS','AUTOMATION','VIDEO EDITING','MOTION GRAPHICS','SOCIAL MEDIA','BRANDING'].map(x=><span key={x}>{x} ✦</span>)}</span>)}</div></div>
<div className="wrap"><h2><small>What we do</small>Everything your business needs to scale.</h2>
<div className="bento">{SV.map(([i,t,d,c])=><div key={t} className={'card rv '+c}><div className="ic">{i}</div><h3>{t}</h3><p>{d}</p></div>)}</div>
<h2><small>How it works</small>From idea to live in three steps.</h2>
<div className="steps">{[['Tell us','Share your business and the problems you want solved.'],['We build','Our team designs and builds your software and AI agents.'],['You grow','Less manual work, more customers. We keep improving it with you.']].map(([t,d])=><div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
<Showcase/><div className="cta"><h2>A platform where businesses grow together.</h2><p style={{color:'#b9b6d6',margin:'0 auto 24px',maxWidth:'55ch'}}>Register your business, get verified, showcase your portfolio and place orders, all in one place.</p><Link className="btn" to="/register">Get started</Link></div>
<h2><small>Contact</small>Let's talk about your project.</h2><Need u={u}><Contact u={u}/></Need></div></main>}

function Portfolio(){const b=useCol('businesses',['verified','==',true])
return <main className="wrap"><h2><small>Portfolio</small>Our work</h2>
{VIDEOS.length===0&&<p style={{color:'#8a87aa'}}>Showreel coming soon.</p>}
<div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))'}}>{VIDEOS.map((v,i)=><div key={i}><Vid v={v}/><p style={{margin:'8px 0 0'}}>{v.title}</p></div>)}</div>
<h2><small>Community</small>Verified businesses</h2><div className="grid">{b.map(x=><div className="card rv" key={x.id}><span className="tag">✓ Verified</span><h3>{x.name}</h3><small>{x.category}</small><p>{x.desc}</p>{x.link&&<a href={x.link} target="_blank" rel="noreferrer" style={{color:'var(--c)'}}>Visit →</a>}</div>)}</div></main>}

function Store({u}){const s=useCol('services');const[n,setN]=useState('')
const order=async x=>{await addDoc(collection(db,'orders'),{uid:u.uid,email:u.email,title:x.title,type:x.category||'service',amount:x.price||0,status:'new',paid:false,t:serverTimestamp()});setN(x.title)}
return <main className="wrap"><h2><small>Store</small>Services & Marketing</h2>{n&&<p style={{color:'var(--l)'}}>✅ Order placed for "{n}". Track it in your dashboard.</p>}
<div className="grid">{s.length===0&&<p style={{color:'#8a87aa'}}>Services coming soon.</p>}{s.map(x=><div className="card rv" key={x.id}><span className="tag">{x.category}</span><h3>{x.title}</h3><p>{x.desc}</p><h3>₹{x.price}</h3>
{u?<button onClick={()=>order(x)}>Order now</button>:<button onClick={login}>Sign in to order</button>}</div>)}</div></main>}

function Register({u}){const[f,setF]=useState({name:'',category:'',desc:'',link:''});const[ok,setOk]=useState(false)
const go=async e=>{e.preventDefault();await addDoc(collection(db,'businesses'),{...f,uid:u.uid,email:u.email,verified:false,t:serverTimestamp()});setOk(true)}
return <main className="wrap"><h2><small>Join</small>Register your business</h2><Need u={u}><form onSubmit={go}>
{[['name','Business name'],['category','Category (e.g. Retail, Food, Education)'],['link','Website or widget link (optional)']].map(([k,p])=><input key={k} required={k!=='link'} placeholder={p} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/>)}
<textarea rows="4" placeholder="Describe your business" value={f.desc} onChange={e=>setF({...f,desc:e.target.value})}/><button>Submit for verification</button>
{ok&&<small style={{color:'var(--l)'}}>Submitted! Once verified, your business appears in our portfolio.</small>}</form></Need></main>}

function Dashboard({u}){const o=useCol('orders',['uid','==',u.uid]);const b=useCol('businesses',['uid','==',u.uid])
return <main className="wrap"><h2><small>Dashboard</small>Welcome back</h2><h3>Orders</h3><div className="grid" style={{marginTop:12}}>{o.map(x=><div className="card" key={x.id}><b>{x.title}</b><p>₹{x.amount}</p><span className="tag">{x.status}</span> <span className="tag">{x.paid?'Paid':'Unpaid'}</span></div>)}</div>
<h3 style={{marginTop:28}}>My businesses</h3><div className="grid" style={{marginTop:12}}>{b.map(x=><div className="card" key={x.id}><b>{x.name}</b><p>{x.verified?'✓ Verified':'⏳ Pending verification'}</p></div>)}</div>
<h3 style={{margin:'28px 0 12px'}}>Inquiries</h3><Threads u={u}/></main>}

function Manager({col,fields,act,title}){const d=useCol(col);const[f,setF]=useState({})
const add=async e=>{e.preventDefault();const v={...f};fields.forEach(x=>{if(x.n&&v[x.k])v[x.k]=Number(v[x.k])});await addDoc(collection(db,col),{...v,t:serverTimestamp()});setF({})}
return <div><h3 style={{margin:'18px 0 10px'}}>{title}</h3>{fields.length>0&&<form onSubmit={add} className="row" style={{display:'flex',maxWidth:'none',marginBottom:12}}>{fields.map(x=><input key={x.k} style={{width:'auto',flex:1,minWidth:130}} placeholder={x.k} value={f[x.k]||''} onChange={e=>setF({...f,[x.k]:e.target.value})}/>)}<button>Add</button></form>}
<div className="card tw"><table><tbody>{d.map(r=><tr key={r.id}>{(fields.length?fields.map(x=>x.k):['title','email','name','type','amount','status','verified','paid']).filter(k=>r[k]!==undefined).map(k=><td key={k}>{String(r[k])}</td>)}
<td><div className="row">{act&&act(r)}<button className="s" onClick={()=>deleteDoc(doc(db,col,r.id))}>🗑</button></div></td></tr>)}</tbody></table></div></div>}

function Stats(){const o=useCol('orders');const f=useCol('finance')
const rev=o.filter(x=>x.paid).reduce((a,x)=>a+(x.amount||0),0)+f.filter(x=>x.type==='income').reduce((a,x)=>a+(x.amount||0),0)
const exp=f.filter(x=>x.type==='expense').reduce((a,x)=>a+(x.amount||0),0)
return <div className="grid" style={{marginTop:16}}>{[['Orders',o.length],['Completed',o.filter(x=>x.status==='done').length],['Revenue ₹',rev],['Expenses ₹',exp],['Profit ₹',rev-exp]].map(([k,v])=><div className="card" key={k}><small>{k}</small><h2 style={{margin:0}} className="grad">{v}</h2></div>)}</div>}

function Admin({u}){const[t,setT]=useState('stats')
if(!isAdmin(u))return <main className="wrap"><h2>No access</h2></main>
const st=r=><select style={{width:'auto'}} value={r.status} onChange={e=>updateDoc(doc(db,'orders',r.id),{status:e.target.value})}>{['new','working','done'].map(s=><option key={s}>{s}</option>)}</select>
const tabs={stats:<Stats/>,orders:<Manager title="Orders" col="orders" fields={[]} act={r=><>{st(r)}<button className="s" onClick={()=>updateDoc(doc(db,'orders',r.id),{paid:!r.paid})}>Paid?</button></>}/>,
inquiries:<div style={{marginTop:16}}><Threads u={u} admin/></div>,
businesses:<Manager title="Businesses" col="businesses" fields={[]} act={r=><button className="s" onClick={()=>updateDoc(doc(db,'businesses',r.id),{verified:!r.verified})}>Verify</button>}/>,
services:<Manager title="Services" col="services" fields={[{k:'title'},{k:'category'},{k:'desc'},{k:'price',n:1}]}/>,
finance:<Manager title="Payments & expenses (type: income or expense)" col="finance" fields={[{k:'title'},{k:'type'},{k:'amount',n:1}]}/>,
work:<Manager title="Future work & AI agent links" col="work" fields={[{k:'title'},{k:'link'},{k:'status'}]}/>}
return <main className="wrap"><h2><small>Admin</small>Control panel</h2><div className="tabs">{Object.keys(tabs).map(k=><button key={k} className={t===k?'':'s'} onClick={()=>setT(k)}>{k}</button>)}</div>{tabs[t]}</main>}

export default function App(){const u=useUser();const[o,setO]=useState(false)
return <><div className="bg"><i/><i/><i/></div>
<nav><Link to="/" className="logo">Kelvora</Link><button className="s burger" onClick={()=>setO(!o)}>☰</button>
<div className={'menu'+(o?' open':'')} onClick={()=>setO(false)}><Link className="l" to="/">Home</Link><Link className="l" to="/portfolio">Portfolio</Link><Link className="l" to="/store">Store</Link><Link className="l" to="/register">Register</Link>
{u&&<Link className="l" to="/dashboard">Dashboard</Link>}{isAdmin(u)&&<Link className="l" to="/admin">Admin</Link>}
{u?<button className="s" onClick={logout}>Sign out</button>:<button onClick={login}>Sign in</button>}</div></nav>
<Routes><Route path="/" element={<Home u={u}/>}/><Route path="/portfolio" element={<Portfolio/>}/><Route path="/store" element={<Store u={u}/>}/>
<Route path="/register" element={<Register u={u}/>}/><Route path="/dashboard" element={<Need u={u}><Dashboard u={u}/></Need>}/>
<Route path="/admin" element={<Need u={u}><Admin u={u}/></Need>}/><Route path="*" element={<Navigate to="/"/>}/></Routes>
<footer>© 2026 Kelvora Infotech · kelvorainfortech.com</footer></>}
