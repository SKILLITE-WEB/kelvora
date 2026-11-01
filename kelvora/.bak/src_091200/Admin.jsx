import {today} from './date.js'
import {cleanUrl} from './Profile.jsx'
import {Link} from 'react-router-dom'
import {Approvals} from './Profile.jsx'
import {ScoutBox} from './Scout.jsx'
import {useState} from 'react'
import {collection,addDoc,updateDoc,deleteDoc,setDoc,deleteField,doc,serverTimestamp} from 'firebase/firestore'
import {db,useCol,isAdmin} from './firebase.js'
import {verify} from './Verified.jsx'
import {toast,useBusy} from './Ui.jsx'

const mail=(to,sub,body='')=>`mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`
const has=(r,q)=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())
const csv=(rows,name)=>{if(!rows.length)return toast('Nothing to export','err');const k=[...new Set(rows.flatMap(r=>Object.keys(r)))].filter(x=>x!=='t'&&typeof rows[0][x]!=='object');const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"'
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([k.join(',')+'\n'+rows.map(r=>k.map(x=>q(r[x])).join(',')).join('\n')],{type:'text/csv'}));a.download=name+'.csv';a.click()}
const late=r=>r.due&&r.due<today()&&r.status!=='done'
const Head=({title,n,q,setQ,rows,name})=><div className="row" style={{margin:'18px 0 10px'}}><h3 style={{marginRight:'auto'}}>{title} <span className="tag">{n}</span></h3>
<input style={{width:190}} placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/><button className="s" onClick={()=>csv(rows,name)}>⬇ CSV</button></div>

function Manager({col,fields,title,num=[]}){const d=useCol(col);const[f,setF]=useState({});const[q,setQ]=useState('')
const add=async e=>{e.preventDefault();const v={...f};num.forEach(k=>{if(v[k])v[k]=Number(v[k])});await addDoc(collection(db,col),{...v,t:serverTimestamp()});setF({});toast('Added')}
const R=d.filter(r=>has(r,q))
return <div><Head title={title} n={d.length} q={q} setQ={setQ} rows={d} name={col}/>
<form onSubmit={add} style={{display:'flex',gap:8,flexWrap:'wrap',maxWidth:'none',marginBottom:12}}>{fields.map(k=><input key={k} style={{flex:1,minWidth:130}} placeholder={k} value={f[k]||''} onChange={e=>setF({...f,[k]:e.target.value})}/>)}<button>Add</button></form>
<div className="card tw"><table><thead><tr>{fields.map(k=><th key={k}>{k}</th>)}<th/></tr></thead><tbody>{R.map(r=><tr key={r.id}>{fields.map(k=><td key={k}>{k==='email'&&r[k]?<a href={mail(r[k],'Kelvora Infotech')}>✉ {r[k]}</a>:/^https?:/.test(r[k])?<a href={r[k]} target="_blank" rel="noreferrer">link ↗</a>:String(r[k]??'')}</td>)}
<td><button className="s" onClick={()=>deleteDoc(doc(db,col,r.id))}>🗑</button></td></tr>)}</tbody></table></div></div>}

function Orders({staff}){const o=useCol('orders');const[f,setF]=useState({title:'',email:'',amount:'',due:''});const[q,setQ]=useState('')
const up=(r,p)=>updateDoc(doc(db,'orders',r.id),p)
const add=async e=>{e.preventDefault();await addDoc(collection(db,'orders'),{uid:'',title:f.title,email:f.email,amount:Number(f.amount)||0,due:f.due,type:'manual',status:'new',paid:false,urgent:false,t:serverTimestamp()});setF({title:'',email:'',amount:'',due:''});toast('Order added')}
const L=o.filter(r=>has(r,q)&&!['requested','quoted','declined'].includes(r.status)).sort((a,b)=>(!!late(b)-!!late(a))||(!!b.urgent-!!a.urgent)||(a.due||'9').localeCompare(b.due||'9'))
return <div><Head title="Orders" n={o.length} q={q} setQ={setQ} rows={o} name="orders"/>
<form onSubmit={add} style={{display:'flex',gap:8,flexWrap:'wrap',maxWidth:'none',marginBottom:12}}><input required style={{flex:2,minWidth:150}} placeholder="Order title" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/>
<input style={{flex:2,minWidth:150}} placeholder="Client email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/><input style={{flex:1,minWidth:90}} placeholder="₹ amount" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/>
<input type="date" style={{flex:1,minWidth:140}} value={f.due} onChange={e=>setF({...f,due:e.target.value})}/><button>Add order</button></form>
<div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(min(300px,100%),1fr))'}}>{L.map(r=><div key={r.id} className={'card ord '+(late(r)?'late':r.urgent?'urg':'')}>
<div className="row"><b>{r.title}</b>{late(r)&&<span className="tag r">OVERDUE</span>}{r.urgent&&<span className="tag r">URGENT</span>}{r.paid&&<span className="tag">Paid</span>}</div>
<small>{r.email}</small><p>₹{r.amount}</p>
<div className="row"><label><small>Due</small><input type="date" value={r.due||''} onChange={e=>up(r,{due:e.target.value})}/></label>
<label><small>Assignee</small><select value={r.assignee||''} onChange={e=>up(r,{assignee:e.target.value})}><option value="">Unassigned</option>{staff.map(s=><option key={s.id}>{s.name}</option>)}</select></label></div>
<div className="row" style={{marginTop:8}}><select style={{width:'auto'}} value={r.status} onChange={e=>up(r,{status:e.target.value})}>{['new','working','done'].map(s=><option key={s}>{s}</option>)}</select>
<button className="s" title="Urgent" onClick={()=>up(r,{urgent:!r.urgent})}>🔥</button><button className="s" title="Paid" onClick={()=>up(r,{paid:!r.paid})}>₹</button>
{r.email&&<a className="btn s" href={mail(r.email,'Update on your order: '+r.title)}>✉</a>}<button className="s" onClick={()=>deleteDoc(doc(db,'orders',r.id))}>🗑</button></div></div>)}</div></div>}

const DEFQ="What is the main goal of your widget?\nWhich pages should it appear on?\nBrand colors / logo link\nAny deadline or urgent need?"
function Clients(){const b0=useCol('businesses');const pv=useCol('bizPrivate');const em=new Map(pv.map(x=>[x.id,x.email]));const b=b0.map(x=>({...x,email:em.get(x.id)||x.email||''}));const o=useCol('orders');const n=useCol('notices');const[t,setT]=useState(null);const[kind,setKind]=useState('reminder');const[txt,setTxt]=useState('');const[qs,setQs]=useState(DEFQ);const[q,setQ]=useState('');const[busy,run]=useBusy()
const send=()=>run(async()=>{await addDoc(collection(db,'notices'),{uid:t.uid,biz:t.name,email:t.email,kind,text:txt,qs:kind==='questionnaire'?qs.split('\n').filter(Boolean):[],answers:[],status:'sent',t:serverTimestamp()});toast('Sent to '+t.name);setTxt('');setT(null)})
return <div><Head title="Clients" n={b.length} q={q} setQ={setQ} rows={b} name="clients"/>
{t&&<div className="card glow" style={{marginBottom:14}}><div className="row"><b>Send to {t.name}</b><select style={{width:'auto'}} value={kind} onChange={e=>setKind(e.target.value)}><option value="reminder">🔔 Reminder</option><option value="questionnaire">📋 Widget questionnaire</option></select></div>
<textarea rows="2" placeholder="Message (e.g. Please share your widget details by Friday)" value={txt} onChange={e=>setTxt(e.target.value)} style={{margin:'8px 0'}}/>
{kind==='questionnaire'&&<textarea rows="5" value={qs} onChange={e=>setQs(e.target.value)} placeholder="One question per line"/>}
<div className="row" style={{marginTop:8}}><button disabled={busy||!txt} onClick={send}>Send to dashboard</button><a className="btn s" href={mail(t.email,'Kelvora: '+(kind==='questionnaire'?'Widget questionnaire':'Reminder'),txt+(kind==='questionnaire'?'\n\n'+qs:''))}>✉ Also email</a><button className="s" onClick={()=>setT(null)}>Cancel</button></div></div>}
<div className="grid">{b.filter(r=>has(r,q)).map(r=>{const mo=o.filter(x=>x.uid===r.uid||(x.email&&x.email===r.email));const mn=n.filter(x=>x.uid===r.uid)
return <div className="card rv" key={r.id}><div className="row"><b>{r.name}</b><span className="tag">{r.verified?'✓ Verified':'⏳ Pending'}</span></div><small>{r.category}</small>
<p><a href={mail(r.email,'Kelvora Infotech')} style={{color:'var(--c)'}}>✉ {r.email}</a></p>
<small>{mo.length} orders · ₹{mo.filter(x=>x.paid).reduce((a,x)=>a+(x.amount||0),0)} paid</small>
{cleanUrl(r.link)&&<p><a href={cleanUrl(r.link)} target="_blank" rel="noreferrer" style={{color:'var(--c)'}}>Widget ↗</a></p>}
<div className="row" style={{margin:'10px 0'}}><button className="s" onClick={()=>run(()=>verify(r))}>{r.verified?'Unverify':'✓ Verify'}</button><Link className="btn s" to={'/profile/'+r.id}>✏️ Profile</Link><button onClick={()=>setT(r)}>🔔 Send notice</button></div>
{mn.map(x=><div key={x.id} className="vp"><span className="tag">{x.kind==='questionnaire'?'📋':'🔔'} {x.status}</span> <small>{x.text}</small>{x.status==='answered'&&x.qs.map((qq,i)=><p key={i} style={{fontSize:13}}><small>{qq}</small><br/>{x.answers[i]}</p>)}</div>)}</div>})}</div></div>}

function Overview({go}){const o=useCol('orders');const f=useCol('finance');const b=useCol('businesses');const n=useCol('notices');const th=useCol('threads')
const lt=o.filter(r=>late(r)&&['new','working'].includes(r.status)),ur=o.filter(r=>r.urgent&&['new','working'].includes(r.status)),live=o.filter(x=>['new','working','done'].includes(x.status))
const rev=live.filter(x=>x.paid).reduce((a,x)=>a+(x.amount||0),0)+f.filter(x=>x.type==='income').reduce((a,x)=>a+(x.amount||0),0)
const exp=f.filter(x=>x.type==='expense').reduce((a,x)=>a+(x.amount||0),0)
const al=[['🧾','Requests awaiting quote',o.filter(x=>x.status==='requested').length,'inquiries','r'],['💰','Quotes awaiting client',o.filter(x=>x.status==='quoted').length,'inquiries',''],['🚨','Overdue orders',lt.length,'orders','r'],['🔥','Urgent orders',ur.length,'orders','r'],['⏳','Pending verifications',b.filter(x=>!x.verified).length,'clients',''],['📝','Profile updates to review',b.filter(x=>x.profileStatus==='pending').length,'approvals','r'],['📋','Unanswered questionnaires',n.filter(x=>x.kind==='questionnaire'&&x.status==='sent').length,'clients',''],['💬','Open chats',th.filter(x=>x.status==='open').length,'inquiries','']]
const st=[['Clients',b.length,'clients'],['Orders',live.length,'orders'],['Completed',live.filter(x=>x.status==='done').length,'orders'],['Revenue ₹',rev,'finance'],['Expenses ₹',exp,'finance'],['Profit ₹',rev-exp,'finance']]
return <div style={{marginTop:16}}><p style={{color:'#8a87aa',marginBottom:10}}>Tap any card to open it.</p><div className="grid">{al.map(([i,k,v,t,c])=><button key={k} className={'card alc '+(c&&v?'ord late':'')} onClick={()=>go(t)}><small>{i} {k}</small><h2>{v}</h2><small style={{color:'var(--c)'}}>Open {t} →</small></button>)}</div>
<div className="grid" style={{marginTop:14}}>{st.map(([k,v,t])=><button className="card alc" key={k} onClick={()=>go(t)}><small>{k}</small><h2 className="grad">{v}</h2></button>)}</div></div>}

export default function Admin({u,Threads}){const[t,setT0]=useState(()=>(location.hash||'').slice(1)||'overview');const setT=k=>{setT0(k);try{history.replaceState(null,'','#'+k)}catch{};scrollTo({top:0,behavior:'smooth'})};const staff=useCol('staff')
if(!isAdmin(u))return <main className="wrap"><h2>No access</h2></main>
const tabs={overview:<Overview go={setT}/>,approvals:<Approvals/>,clients:<Clients/>,orders:<Orders staff={staff}/>,inquiries:<div style={{marginTop:16}}><Threads u={u} admin/></div>,
scout:<ScoutBox u={u} admin/>,
employees:<Manager title="Employees" col="staff" fields={['name','email','phone','role','task']}/>,
finance:<Manager title="Payments & expenses (type: income or expense)" col="finance" fields={['title','type','amount']} num={['amount']}/>,
work:<Manager title="Future work & AI agents" col="work" fields={['title','link','status']}/>,
services:<Manager title="Store services" col="services" fields={['title','category','desc','price']} num={['price']}/>}
return <main className="wrap"><h2><small>Admin</small>Management</h2><div className="tabs">{Object.keys(tabs).map(k=><button key={k} className={t===k?'':'s'} onClick={()=>setT(k)}>{k}</button>)}</div>{tabs[t]||tabs.overview}</main>}
