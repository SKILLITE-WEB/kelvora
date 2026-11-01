import {WsFlag} from './workspace/state.js'
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

import {useVerified} from './hooks.js'
export {useVerified}

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

const OS={new:['s',2],working:['a',5],done:['a',6]}
export function Dash({u,Threads}){const o0=useCol('orders',['uid','==',u.uid]);const o=o0.filter(x=>!['requested','quoted','declined'].includes(x.status));const pend=o0.filter(x=>['requested','quoted'].includes(x.status)).length;const b=useCol('businesses',['uid','==',u.uid]);const ver=useVerified(u);useEffect(()=>{ensureSupport(u).catch(()=>{})},[u.uid]);const nt=useCol('notices',['uid','==',u.uid]).filter(x=>x.status==='sent').length;const cnt=z=>o0.filter(x=>z.includes(x.status)).length
const ST=[['💰','s',7,cnt(['quoted']),'Quotes to approve'],['🔧','a',5,cnt(['new','working']),'Active orders'],['⏳','a',2,cnt(['requested']),'Waiting for quote'],['🔔','a',3,nt,'New notifications'],[ver?'✅':'📝','m',3,ver?'Verified':'In review','Verification']]
return <main className="wrap"><h2><small>Dashboard</small>Welcome back</h2>
<div className="dstats">{ST.map(([e,t,i,v,l])=><div className={'card dt'+(typeof v==='number'&&v>0&&l!=='Active orders'?' glow':'')} key={l}><div className="ic3" data-t={t} data-i={i} data-k={'d-'+l}><span className="ice">{e}</span></div><small>{l}</small><h2 className="grad">{v}</h2></div>)}</div>
{b.length===0&&<div className="card" style={{marginBottom:14}}>Want to join the Business Network? Registering your business is optional. <Link to="/register" style={{color:'var(--c)'}}>Register now →</Link></div>}
{ver&&<div className="card glow" style={{marginBottom:14}}>🎉 You are verified. <Link to="/network" style={{color:'var(--c)'}}>Open Business Network →</Link></div>}
{pend>0&&<div className="card glow" style={{marginBottom:14}}>🧾 {pend} request(s) in progress. Open your Kelvora Support chat below.</div>}<h3 style={{marginBottom:12}}>Chats</h3><Threads u={u}/>
<h3 style={{margin:'32px 0 12px'}}>Orders</h3><div className="grid">{o.length===0&&<WsFlag s="empty"/>}{o.length===0&&<p style={{color:'#8a87aa'}}>No orders yet. Request a service to get started.</p>}{o.map(x=><div className="card dc" key={x.id}><div className="ic3" data-t={(OS[x.status]||['s',2])[0]} data-i={(OS[x.status]||['s',2])[1]} data-k={'do-'+x.status}><span className="ice">{x.status==='done'?'🎉':'🔧'}</span></div><b>{x.title}</b><p>₹{x.amount}{x.due&&<small> · Due {x.due}</small>}</p><span className="tag">{x.status}</span> <span className="tag">{x.paid?'Paid':'Unpaid'}</span><Prog s={x.status}/></div>)}</div>
{b.length>0&&<><h3 style={{margin:'32px 0 12px'}}>My business profile</h3><div className="grid">{b.map(x=><ProfileCard key={x.id} x={x}/>)}</div></>}</main>}

function Prog({s}){const i=Math.max(0,['new','working','done'].indexOf(s))
return <div className="pbar">{['Received','In progress','Delivered'].map((l,k)=><div key={l} className={k<=i?'on':''}><i/><small>{l}</small></div>)}</div>}
