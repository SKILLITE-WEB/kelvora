import {useState,useEffect} from 'react'
import {useParams,useNavigate,Link} from 'react-router-dom'
import {collection,addDoc,updateDoc,doc,onSnapshot,serverTimestamp} from 'firebase/firestore'
import {db,useCol} from './firebase.js'
import {useVerified} from './Verified.jsx'
import {toast,useBusy,Spin} from './Ui.jsx'

export function Notices({u}){const n=useCol('notices',['uid','==',u.uid]);const[a,setA]=useState({});const[busy,run]=useBusy()
if(!n.length)return null
const L=[...n].sort((x,y)=>(y.t?.seconds||0)-(x.t?.seconds||0))
const sub=(x,e)=>{e.preventDefault();run(async()=>{await updateDoc(doc(db,'notices',x.id),{answers:x.qs.map((_,i)=>a[x.id]?.[i]||''),status:'answered'});toast('Answers sent')})}
return <div style={{marginTop:24}}><h3>🔔 Notifications <span className="tag r">{L.filter(x=>x.status==='sent').length} new</span></h3>
<div className="grid" style={{marginTop:12}}>{L.map(x=><div key={x.id} className={'card '+(x.status==='sent'?'glow':'')}><span className="tag">{x.kind==='questionnaire'?'📋 Widget questionnaire':'🔔 Reminder'}</span><p style={{margin:'8px 0'}}>{x.text}</p>
{x.kind==='questionnaire'&&x.status==='sent'&&<form onSubmit={e=>sub(x,e)} style={{maxWidth:'none'}}>{x.qs.map((q,i)=><input key={i} required placeholder={q} value={a[x.id]?.[i]||''} onChange={e=>setA({...a,[x.id]:{...a[x.id],[i]:e.target.value}})}/>)}<button disabled={busy}>Submit answers</button></form>}
{x.kind==='questionnaire'&&x.status!=='sent'&&x.qs.map((q,i)=><p key={i} style={{fontSize:13}}><small>{q}</small><br/>{x.answers[i]}</p>)}
{x.kind==='reminder'&&(x.status==='sent'?<button className="s" onClick={()=>updateDoc(doc(db,'notices',x.id),{status:'done'})}>Mark as done</button>:<span className="tag">done</span>)}</div>)}</div></div>}

export function BizPage({u}){const{id}=useParams();const[b,setB]=useState(undefined);const ver=useVerified(u);const nav=useNavigate();const[busy,run]=useBusy()
useEffect(()=>onSnapshot(doc(db,'businesses',id),d=>setB(d.exists()?{id:d.id,...d.data()}:null),()=>setB(null)),[id])
if(b===undefined)return <div className="wrap"><Spin/></div>
if(!b)return <main className="wrap"><h2>Business not found</h2><Link className="btn s" to="/network">← Network</Link></main>
const chat=()=>run(async()=>{await addDoc(collection(db,'threads'),{uid:u.uid,members:[u.uid,b.uid],email:u.email,subject:'Chat: '+b.name,last:'',status:'open',type:'b2b',t:serverTimestamp()});toast('Chat started');nav('/dashboard')})
const mine=b.uid===u.uid
return <main className="wrap"><Link to="/network" style={{color:'var(--c)'}}>← Network</Link>
<div className="card glow bh" style={{marginTop:14}}><div className="av">{(b.name||'?')[0]}</div><div><h2 style={{margin:0}}>{b.name}</h2><div className="row"><span className="tag">{b.verified?'✓ Verified':'⏳ Pending'}</span><span className="tag v">{b.category}</span></div></div></div>
<div className="bento" style={{marginTop:14}}><div className="card s4"><h3>About</h3><p>{b.desc||'No description yet.'}</p></div>
<div className="card s2"><h3>Connect</h3>{b.link?<a className="btn" href={b.link} target="_blank" rel="noreferrer">Open widget ↗</a>:<p>No widget added yet.</p>}<br/><br/>
{mine?<small>This is your business.</small>:ver?<button disabled={busy} onClick={chat}>💬 Message</button>:<small>Get verified to message businesses.</small>}</div>
<div className="card s6"><h3>How to work with {b.name}</h3><div className="steps" style={{marginTop:12}}>{[['Explore','Check the about section and try their widget.'],['Message','Introduce yourself and what you can offer each other.'],['Collaborate','Share customers, services or ideas and grow together.']].map(([t,d])=><div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div></div>
{b.link&&<div className="card s6"><h3>Live preview</h3><iframe title="widget" src={b.link} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" style={{width:'100%',height:420,border:0,borderRadius:14,background:'#fff',marginTop:10}}/><small>Blank? The site may block previews. Use Open widget.</small></div>}</div></main>}

export function Bell({u}){const n=useCol('notices',['uid','==',u.uid]);const c=n.filter(x=>x.status==='sent').length
return <Link className="l" to="/dashboard">Dashboard{c>0&&<span className="dot">{c}</span>}</Link>}
