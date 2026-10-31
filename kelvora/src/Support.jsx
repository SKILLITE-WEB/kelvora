import {useState,useEffect,useRef} from 'react'
import {collection,addDoc,updateDoc,setDoc,getDoc,doc,onSnapshot,query,orderBy,serverTimestamp} from 'firebase/firestore'
import {db,useCol,isAdmin,ADMINS} from './firebase.js'
import {toast,useBusy,Spin} from './Ui.jsx'

export const supportId=uid=>'support_'+uid
export async function ensureSupport(u){const ref=doc(db,'threads',supportId(u.uid));const s=await getDoc(ref).catch(()=>null)
if(!s||!s.exists())await setDoc(ref,{uid:u.uid,members:[u.uid],email:u.email,subject:'Kelvora Support',last:'Chat started',status:'open',type:'support',t:serverTimestamp()});return ref.id}
export async function requestService(u,title,type,amount=0){const tid=await ensureSupport(u)
const o=await addDoc(collection(db,'orders'),{uid:u.uid,email:u.email,title,type,amount:Number(amount)||0,due:'',notes:'',status:'requested',paid:false,urgent:false,tid,t:serverTimestamp()})
await addDoc(collection(db,'threads',tid,'messages'),{kind:'order',orderId:o.id,text:'Requested: '+title,from:u.email,t:serverTimestamp()})
await updateDoc(doc(db,'threads',tid),{last:'Requested: '+title,status:'open'})
toast('Request sent! Our team will reply with a quote in your chat.');return tid}

const STAT={requested:'⏳ Requested',quoted:'💰 Quote sent',new:'✅ Approved',working:'🔧 In progress',done:'🎉 Done',declined:'✕ Declined'}
const Prog=({s})=>{const i=Math.max(0,['new','working','done'].indexOf(s));return <div className="pbar">{['Approved','In progress','Delivered'].map((l,k)=><div key={l} className={k<=i?'on':''}><i/><small>{l}</small></div>)}</div>}
const csvOf=o=>{const k=['title','type','amount','due','status','paid'];const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return k.join(',')+'\n'+o.map(r=>k.map(x=>q(r[x])).join(',')).join('\n')}
const dl=(n,c)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:'text/csv'}));a.download=n;a.click()}

const OI={requested:['a',3],quoted:['s',7],new:['s',2],working:['a',5],done:['a',6],declined:['m',3]}
function OrderCard({oid,u,tid}){const[o,setO]=useState(undefined);const[f,setF]=useState({});const[busy,run]=useBusy();const adm=isAdmin(u)
useEffect(()=>onSnapshot(doc(db,'orders',oid),d=>setO(d.exists()?{id:d.id,...d.data()}:null),()=>setO(null)),[oid])
if(o===undefined)return <Spin/>
if(o===null)return <div className="ocard"><small>Order not available</small></div>
const val=k=>f[k]??o[k]??''
const up=(p,msg)=>run(async()=>{await updateDoc(doc(db,'orders',oid),p);if(msg)await addDoc(collection(db,'threads',tid,'messages'),{text:msg,from:'system',sys:true,t:serverTimestamp()})})
const quote=()=>run(async()=>{const a=Number(val('amount'))||0;await updateDoc(doc(db,'orders',oid),{amount:a,due:val('due'),notes:val('notes'),status:'quoted',quotedAt:serverTimestamp()})
await addDoc(collection(db,'threads',tid,'messages'),{text:'💰 Quote for "'+o.title+'": ₹'+a+(val('due')?' · due '+val('due'):'')+'. Please approve to start.',from:'system',sys:true,t:serverTimestamp()})
await addDoc(collection(db,'notices'),{uid:o.uid,biz:o.title,email:o.email,kind:'reminder',text:'💰 You have a new quote in your Kelvora chat: '+o.title,qs:[],answers:[],status:'sent',t:serverTimestamp()});toast('Quote sent')})
const open=['requested','quoted'].includes(o.status),act=['new','working','done'].includes(o.status)
return <div className={'ocard '+(o.status==='quoted'?'q':'')}>
{(()=>{const[t,i]=OI[o.status]||['s',0];return <div className="ic3" data-t={t} data-i={i} data-k={'o-'+o.status}/>})()}
<div className="row"><b>{o.title}</b><span className="tag">{STAT[o.status]||o.status}</span>{o.urgent&&<span className="tag r">URGENT</span>}{o.paid&&<span className="tag">Paid ✓</span>}</div>
<small>{o.type} · {o.email}</small>
{adm&&open?<div style={{display:'grid',gap:8}}><div className="row"><input style={{flex:1,minWidth:110}} placeholder="Amount ₹" value={val('amount')} onChange={e=>setF({...f,amount:e.target.value})}/><input type="date" style={{flex:1,minWidth:140}} value={val('due')} onChange={e=>setF({...f,due:e.target.value})}/></div>
<textarea rows="2" placeholder="Notes for client (scope, delivery…)" value={val('notes')} onChange={e=>setF({...f,notes:e.target.value})}/>
<div className="row"><button disabled={busy} onClick={quote}>{o.status==='quoted'?'Update quote':'📨 Send quote'}</button><button className="s" disabled={busy} onClick={()=>up({status:'declined'},'Request "'+o.title+'" was declined.')}>Decline</button></div></div>
:<p style={{margin:0}}>₹{o.amount||0}{o.due&&' · due '+o.due}{o.notes&&<><br/><small>{o.notes}</small></>}</p>}
{!adm&&o.status==='requested'&&<small>⏳ Waiting for Kelvora to send a quote…</small>}
{!adm&&o.status==='quoted'&&<div className="row"><button disabled={busy} onClick={()=>up({status:'new',approvedAt:serverTimestamp()},'✅ Approved "'+o.title+'". Work starts now.')}>✅ Approve & start</button><button className="s" disabled={busy} onClick={()=>up({status:'declined',approvedAt:serverTimestamp()},'Quote for "'+o.title+'" was declined by the client.')}>✕ Decline</button></div>}
{act&&<Prog s={o.status}/>}
{adm&&act&&<div className="row"><select style={{width:'auto'}} value={o.status} onChange={e=>up({status:e.target.value},e.target.value==='done'?'🎉 "'+o.title+'" is completed.':null)}>{['new','working','done'].map(s=><option key={s}>{s}</option>)}</select>
<button className="s" onClick={()=>up({urgent:!o.urgent})}>🔥</button><button className="s" onClick={()=>up({paid:!o.paid},!o.paid?'💳 Payment received ₹'+(o.amount||0)+' for "'+o.title+'" ✅':null)}>₹ {o.paid?'Unpay':'Paid'}</button></div>}</div>}

function Tools({th,post,setT}){const o=useCol('orders',['uid','==',th.uid]);const[q,setQ]=useState(false);const[f,setF]=useState({title:'',amount:'',due:'',notes:''});const[busy,run]=useBusy()
const act=o.filter(x=>['new','working','done'].includes(x.status))
const nq=e=>{e.preventDefault();run(async()=>{const r=await addDoc(collection(db,'orders'),{uid:th.uid,email:th.email,title:f.title,type:'custom',amount:Number(f.amount)||0,due:f.due,notes:f.notes,status:'quoted',paid:false,urgent:false,tid:th.id,t:serverTimestamp()})
await post({kind:'order',orderId:r.id,text:'Quote: '+f.title});setQ(false);setF({title:'',amount:'',due:'',notes:''});toast('Quote sent')})}
const sum=()=>{const b=act.reduce((a,x)=>a+(x.amount||0),0),p=act.filter(x=>x.paid).reduce((a,x)=>a+(x.amount||0),0);run(()=>post({text:'📊 Summary · Orders: '+act.length+' · Completed: '+act.filter(x=>x.status==='done').length+' · Billed ₹'+b+' · Paid ₹'+p+' · Due ₹'+(b-p)}))}
const pay=()=>{const a=prompt('Payment amount ₹?');if(!a)return;const note=prompt('Note (UPI id / bank details / for what)')||'';run(()=>post({kind:'pay',amount:Number(a)||0,note,text:'💳 Payment request ₹'+a}))}
return <div style={{marginBottom:10}}><div className="tools"><button className="s" onClick={()=>setQ(!q)}>➕ New quote</button><button className="s" disabled={busy} onClick={sum}>📊 Summary</button>
<button className="s" disabled={busy} onClick={()=>run(()=>post({kind:'csv',name:'kelvora-orders.csv',csv:csvOf(act),text:'📎 Orders & payments (CSV)'}))}>📎 Orders CSV</button><button className="s" onClick={pay}>💳 Request payment</button>
<select style={{width:'auto'}} value="" onChange={e=>setT(e.target.value)}><option value="">⚡ Quick reply</option>{['Thanks! Could you share a few more details?','We will start today ✅','Payment received, thank you ✅','Your order is completed 🎉'].map(x=><option key={x}>{x}</option>)}</select></div>
{q&&<form onSubmit={nq} className="card" style={{maxWidth:'none',marginTop:8}}><input required placeholder="Service / title" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/><div className="row"><input style={{flex:1}} placeholder="Amount ₹" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/><input type="date" style={{flex:1}} value={f.due} onChange={e=>setF({...f,due:e.target.value})}/></div><textarea rows="2" placeholder="Notes" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/><button disabled={busy}>Send quote to client</button></form>}</div>}

export function Chat({tid,u,th}){const[ms,setMs]=useState([]);const[t,setT]=useState('');const[busy,run]=useBusy();const end=useRef();const adm=isAdmin(u)
useEffect(()=>onSnapshot(query(collection(db,'threads',tid,'messages'),orderBy('t')),x=>setMs(x.docs.map(d=>d.data()))),[tid])
useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[ms.length])
const post=o=>addDoc(collection(db,'threads',tid,'messages'),{from:u.email,t:serverTimestamp(),...o}).then(()=>updateDoc(doc(db,'threads',tid),{last:o.text||'Update'}))
const send=e=>{e.preventDefault();const v=t.trim();if(!v)return;setT('');run(()=>post({text:v}))}
return <div>{adm&&th?.type==='support'&&<Tools th={th} post={post} setT={setT}/>}
<div className="msgs big">{ms.length===0&&<small style={{color:'#8a87aa'}}>No messages yet.</small>}{ms.map((m,i)=>{const fa=ADMINS.includes(m.from)
if(m.sys)return <div key={i} className="m sys">{m.text}</div>
if(m.kind==='order')return <div key={i} className="mw"><OrderCard oid={m.orderId} u={u} tid={tid}/></div>
if(m.kind==='csv'&&fa)return <div key={i} className="mw"><div className="ocard"><b>{m.text}</b><button className="s" onClick={()=>dl(m.name,m.csv)}>⬇ Download {m.name}</button></div></div>
if(m.kind==='pay'&&fa)return <div key={i} className="mw"><div className="ocard q"><b>💳 Payment request: ₹{m.amount}</b>{m.note&&<small>{m.note}</small>}{!adm&&<button disabled={busy} onClick={()=>run(()=>post({text:'I have paid ₹'+m.amount+'.'}))}>✅ I have paid</button>}</div></div>
return <div key={i} className={'m '+(m.from===u.email?'me':'')}><small>{m.from}</small><br/>{m.text}</div>})}<div ref={end}/></div>
<form onSubmit={send} style={{display:'flex',gap:8,maxWidth:'none'}}><input value={t} onChange={e=>setT(e.target.value)} placeholder="Type a message…" style={{flex:1}}/><button disabled={busy}>Send</button></form></div>}
