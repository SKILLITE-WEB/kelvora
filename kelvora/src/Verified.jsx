import {ensureSupport} from './Support.jsx'
import {ProfileCard,Logo,cleanUrl} from './Profile.jsx'
import {useState,useEffect} from 'react'
import {useNavigate,Link} from 'react-router-dom'
import {collection,addDoc,updateDoc,setDoc,doc,onSnapshot,serverTimestamp} from 'firebase/firestore'
import {db,useCol} from './firebase.js'
import {toast,useBusy} from './Ui.jsx'

export const verify=async r=>{const v=!r.verified
await updateDoc(doc(db,'businesses',r.id),{verified:v});await setDoc(doc(db,'users',r.uid),{verified:v},{merge:true})
if(r.threadId){const text=v?'✅ Your business is verified! The Business Network is now unlocked. Add your widget link below and edit your profile anytime.':'Verification was removed.'
await addDoc(collection(db,'threads',r.threadId,'messages'),{text,from:'system',sys:true,t:serverTimestamp()})
await updateDoc(doc(db,'threads',r.threadId),{status:v?'verified':'open',last:text})}
toast(v?'Business verified':'Verification removed')}

export function useVerified(u){const[v,s]=useState(false)
useEffect(()=>u?onSnapshot(doc(db,'users',u.uid),d=>s(!!d.data()?.verified),()=>s(false)):undefined,[u?.uid]);return v}

export function VerifyPanel({x,admin}){const[b,setB]=useState(null);const[l,setL]=useState('');const[busy,run]=useBusy()
useEffect(()=>x.bizId?onSnapshot(doc(db,'businesses',x.bizId),d=>{const v={id:d.id,...d.data()};setB(v);setL(v.link||'')},()=>{}):undefined,[x.bizId])
if(!b)return null
return <div className="vp"><div className="row"><b>{b.name}</b><span className="tag">{b.verified?'✓ Verified':'⏳ In review'}</span><small>{b.category}</small></div>
{b.desc&&<p style={{margin:'6px 0'}}>{b.desc}</p>}
{admin&&<button disabled={busy} onClick={()=>run(()=>verify(b))}>{b.verified?'Remove verification':'✓ Verify business'}</button>}
{admin&&b.link&&<p style={{marginTop:8}}><a href={b.link} target="_blank" rel="noreferrer" style={{color:'var(--c)'}}>Widget: {b.link}</a></p>}
{!admin&&!b.verified&&<small style={{color:'#b9b6d6'}}>Our team will review and reply here. You can chat below.</small>}
{!admin&&b.verified&&<div className="unlock"><Link className="btn" to="/network">🌐 Open Business Network</Link>
<form onSubmit={e=>{e.preventDefault();run(async()=>{if(l&&!cleanUrl(l))throw new Error('Enter a valid link like example.com');await setDoc(doc(db,'drafts',b.id),{uid:b.uid,data:{link:cleanUrl(l)},t:serverTimestamp()},{merge:true});await updateDoc(doc(db,'businesses',b.id),{profileStatus:'pending',submittedAt:serverTimestamp()});toast('Sent for approval')})}} style={{display:'flex',gap:8,maxWidth:'none',marginTop:12}}>
<input style={{flex:1}} placeholder="Add your widget / website link" value={l} onChange={e=>setL(e.target.value)}/><button disabled={busy}>Save</button></form></div>}</div>}

function BizEdit({x}){const[f,setF]=useState({name:x.name,category:x.category,desc:x.desc||'',link:x.link||''});const[busy,run]=useBusy()
return <form onSubmit={e=>{e.preventDefault();run(async()=>{await updateDoc(doc(db,'businesses',x.id),f);toast('Profile updated')})}} className="card" style={{maxWidth:'none'}}>
<div className="row"><b>{x.name}</b><span className="tag">{x.verified?'✓ Verified':'⏳ Pending'}</span></div>
{[['name','Business name'],['category','Category'],['link','Website / widget link']].map(([k,p])=><input key={k} placeholder={p} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/>)}
<textarea rows="3" placeholder="Description" value={f.desc} onChange={e=>setF({...f,desc:e.target.value})}/><button disabled={busy}>Save changes</button></form>}

export function Dash({u,Threads}){const o0=useCol('orders',['uid','==',u.uid]);const o=o0.filter(x=>!['requested','quoted','declined'].includes(x.status));const pend=o0.filter(x=>['requested','quoted'].includes(x.status)).length;const b=useCol('businesses',['uid','==',u.uid]);const ver=useVerified(u);useEffect(()=>{ensureSupport(u).catch(()=>{})},[u.uid])
return <main className="wrap"><h2><small>Dashboard</small>Welcome back</h2>
{b.length===0&&<div className="card" style={{marginBottom:14}}>Want to join the Business Network? Registering your business is optional. <Link to="/register" style={{color:'var(--c)'}}>Register now →</Link></div>}
{ver&&<div className="card glow" style={{marginBottom:14}}>🎉 You are verified. <Link to="/network" style={{color:'var(--c)'}}>Open Business Network →</Link></div>}
{pend>0&&<div className="card glow" style={{marginBottom:14}}>🧾 {pend} request(s) in progress. Open your Kelvora Support chat below.</div>}<h3 style={{marginBottom:12}}>Chats</h3><Threads u={u}/>
<h3 style={{margin:'32px 0 12px'}}>Orders</h3><div className="grid">{o.length===0&&<p style={{color:'#8a87aa'}}>No orders yet. Request a service to get started.</p>}{o.map(x=><div className="card" key={x.id}><b>{x.title}</b><p>₹{x.amount}{x.due&&<small> · Due {x.due}</small>}</p><span className="tag">{x.status}</span> <span className="tag">{x.paid?'Paid':'Unpaid'}</span><Prog s={x.status}/></div>)}</div>
{b.length>0&&<><h3 style={{margin:'32px 0 12px'}}>My business profile</h3><div className="grid">{b.map(x=><ProfileCard key={x.id} x={x}/>)}</div></>}</main>}

export function Network({u}){const ver=useVerified(u);const list=useCol('businesses',['verified','==',true]);const nav=useNavigate();const[busy,run]=useBusy()
if(!ver)return <main className="wrap"><h2><small>Network</small>Verified businesses only</h2><div className="card">The Business Network unlocks after your business is verified. <Link to="/register" style={{color:'var(--c)'}}>Register →</Link></div></main>
const go=x=>run(async()=>{await addDoc(collection(db,'threads'),{uid:u.uid,members:[u.uid,x.uid],email:u.email,subject:'Chat: '+x.name,last:'',status:'open',type:'b2b',t:serverTimestamp()});toast('Chat started');nav('/dashboard')})
return <main className="wrap"><h2><small>Network</small>Grow together</h2><p style={{color:'#b9b6d6',marginBottom:16}}>Chat with other verified businesses, discover widgets and find partners.</p>
<div className="grid">{list.filter(x=>x.uid!==u.uid).map(x=><div className="card rv" key={x.id}><Logo b={x} s={48}/><span className="tag">✓ Verified</span><h3>{x.name}</h3><small>{x.category}</small><p>{x.desc}</p>
<div className="row"><Link className="btn s" to={'/business/'+x.id}>View profile</Link>{x.link&&<a className="btn s" href={x.link} target="_blank" rel="noreferrer">Open widget ↗</a>}<button disabled={busy} onClick={()=>go(x)}>Message</button></div></div>)}</div></main>}

function Prog({s}){const i=Math.max(0,['new','working','done'].indexOf(s))
return <div className="pbar">{['Received','In progress','Delivered'].map((l,k)=><div key={l} className={k<=i?'on':''}><i/><small>{l}</small></div>)}</div>}
