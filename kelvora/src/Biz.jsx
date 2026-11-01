import {useState,useEffect} from 'react'
import {useParams,useNavigate,Link} from 'react-router-dom'
import {collection,addDoc,updateDoc,doc,onSnapshot,serverTimestamp} from 'firebase/firestore'
import {db,useCol} from './firebase.js'
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

