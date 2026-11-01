import Journey from './Journey.jsx'
import {today} from './date.js'
import {lazy,Suspense,useState,useEffect} from 'react'
import {Link} from 'react-router-dom'
import {collection,query,where,onSnapshot} from 'firebase/firestore'
import {db,useCol,isAdmin} from './firebase.js'
import {useVerified} from './hooks.js'
import {Chat,ensureSupport,supportId} from './Support.jsx'
import {Spin} from './Ui.jsx'
import Showcase from './Showcase.jsx'
const Scene=lazy(()=>import('./Scene3D.jsx'))
export const PITCH='https://himanshu-heist.github.io/Kelvora-Pitch/'
const SV=[['⚡','Custom Software & Apps','Web apps, mobile apps and internal tools built around how your business works.','s4'],['🤖','AI Agents','Agents that reply to leads, follow up on orders and send reports, so your team saves hours.','s2'],['🎬','Video Editing','Reels, ads and brand films.','s2'],['✨','Motion Graphics','Animated logos and explainers.','s2'],['📣','Social Media','Strategy, posting and growth by our team.','s2']]
const STEPS=[['01','Audit','Our AI reads your public website and finds software and marketing gaps in a minute.'],['02','Automate','We build the agents, software and creative that close those gaps.'],['03','Grow','Less manual work, more customers. Track everything in one chat.']]

function Landing({u,Contact,Need,me,hub}){const[pv,setPv]=useState(false)
return <main>
<Journey me={me}/>
<div className="hz">
{hub}
<div className="mq"><div className="mt">{[0,1].map(k=><span key={k} style={{display:'flex',gap:48}}>{['AI AGENTS','WEB APPS','AUTOMATION','VIDEO EDITING','MOTION GRAPHICS','SOCIAL MEDIA','BRANDING'].map(x=><span key={x}>{x} ✦</span>)}</span>)}</div></div>
<div className="wrap"><h2><small>How it works</small>How Kelvora works, step by step.</h2>
<div>{ROWS.map((r,i)=><Row key={i} r={r} i={i}/>)}</div>
<h2><small>What we do</small>Everything your business needs to scale.</h2>
<div className="bento">{SV.map(([i,t,d,c])=><div key={t} className={'card rv '+c}><div className="ic">{i}</div><h3>{t}</h3><p>{d}</p></div>)}</div>
<Showcase/>
<h2><small>The story</small>See it in 70 seconds.</h2>
<div className="card s6">{pv?<iframe title="Kelvora pitch" src={PITCH} allow="fullscreen" allowFullScreen style={{width:'100%',height:'min(70vh,540px)',border:0,borderRadius:16,background:'#000'}}/>:<div className="row"><button onClick={()=>setPv(true)}>▶ Play here</button><a className="btn s" href={PITCH} target="_blank" rel="noreferrer">Open full screen ↗</a></div>}</div>
<h2><small>Roadmap</small>Where we are going.</h2>
<div className="card glow"><span className="tag v">Coming soon</span><h3>🤝 Investor and VC network</h3><p>Businesses on Kelvora will be able to see how much they may need to raise and why, which investors could fit, and how to reach out. We will bring this step by step.</p></div>
<div className="cta"><h2>A platform where businesses grow together.</h2><p style={{color:'#b9b6d6',margin:'0 auto 24px',maxWidth:'55ch'}}>Register, get verified, showcase your profile, and request services in one chat.</p><Link className="btn" to="/register">Get started</Link></div>
<h2><small>Contact</small>Let's talk about your project.</h2><Need u={u}><Contact u={u}/></Need></div></div></main>}

function AdminStrip(){const o=useCol('orders');const b=useCol('businesses');const td=today()
const L=[['🧾','Quote requests',o.filter(x=>x.status==='requested').length,'inquiries'],['🚨','Overdue',o.filter(x=>x.due&&x.due<td&&['new','working'].includes(x.status)).length,'orders'],['⏳','To verify',b.filter(x=>!x.verified).length,'clients'],['📝','Profile reviews',b.filter(x=>x.profileStatus==='pending').length,'approvals']]
return <div className="wrap" style={{paddingTop:14}}><div className="card glow"><div className="row"><b>🛠 Admin</b>{L.map(([i,k,v,t])=><Link key={k} className={'btn s'+(v?' hot':'')} to={'/admin#'+t}>{i} {k}: {v}</Link>)}<Link className="btn" to="/admin">Open panel</Link></div></div></div>}

const HI={'Quotes to approve':['s',7],'Active orders':['a',5],'Waiting for quote':['a',2],'New notifications':['a',3],'Verification':['m',3]}
const IconHost=lazy(()=>import('./Icons3D.jsx'))
function Hub({u,b}){const o=useCol('orders',['uid','==',u.uid]);const n=useCol('notices',['uid','==',u.uid]);const ver=useVerified(u);const[tid,setTid]=useState(supportId(u.uid))
useEffect(()=>{ensureSupport(u).then(setTid).catch(()=>{})},[u.uid])
const go=()=>document.getElementById('hubchat')?.scrollIntoView({behavior:'smooth',block:'start'})
const q=o.filter(x=>x.status==='quoted').length,act=o.filter(x=>['new','working'].includes(x.status)).length,rq=o.filter(x=>x.status==='requested').length,nn=n.filter(x=>x.status==='sent').length
const S=[['💰',q,'Quotes to approve',go],['🔧',act,'Active orders','/dashboard'],['🧾',rq,'Waiting for quote',go],['🔔',nn,'New notifications','/dashboard'],[ver?'✅':'⏳',ver?'Verified':'In review','Verification','/dashboard']]
return <div className="wrap" id="hub" style={{paddingTop:30}}><h2><small>Your workspace</small>{b.name}</h2>
<Suspense fallback={null}><IconHost/></Suspense><div className="hubs">{S.map(([i,v,l,t])=>{const c=<><div className="ic3" data-t={(HI[l]||['s',0])[0]} data-i={(HI[l]||['s',0])[1]} data-k={'h-'+l}><span className="ice">{i}</span></div><small>{l}</small><h2 style={{margin:0}}>{v}</h2></>,hot=typeof v==='number'&&v>0&&l!=='Active orders';return typeof t==='string'?<Link key={l} to={t} className={'card alc'+(hot?' glow':'')}>{c}</Link>:<button key={l} onClick={t} className={'card alc'+(hot?' glow':'')}>{c}</button>})}</div>
<div className="card" id="hubchat" style={{marginTop:14}}><div className="row"><b>💬 Kelvora Support</b><span className="tag">Our team replies here</span></div><p style={{margin:'6px 0 10px',fontSize:14,color:'#b9b6d6'}}>Ask anything, request a service, approve quotes and track payments, all in this one chat.</p>
<Chat tid={tid} u={u} th={{type:'support',uid:u.uid,email:u.email,id:tid}}/></div>
<h3 style={{margin:'24px 0 10px'}}>Quick actions</h3>
<div className="row"><Link className="btn" to="/agents">🤖 Request a service</Link><Link className="btn s" to="/audit">🔍 Free AI audit</Link><Link className="btn s" to="/network">🌐 Network</Link><Link className="btn s" to={'/profile/'+b.id}>✏️ Edit profile</Link><Link className="btn s" to={'/business/'+b.id}>👁 My public page</Link><Link className="btn s" to="/dashboard">📋 Orders and chats</Link><a className="btn s" href={PITCH} target="_blank" rel="noreferrer">▶ Pitch</a></div></div>}

function HomeAuth({u,Contact,Need}){const[b,setB]=useState(undefined)
useEffect(()=>onSnapshot(query(collection(db,'businesses'),where('uid','==',u.uid)),s=>setB(s.docs.map(d=>({id:d.id,...d.data()}))),()=>setB([])),[u.uid])
if(b===undefined)return <div className="wrap"><Spin/></div>
return <>{isAdmin(u)&&<AdminStrip/>}<Landing u={u} Contact={Contact} Need={Need} me={b[0]} hub={b.length?<Hub u={u} b={b[0]}/>:null}/></>}
export const HomeRoot=({u,Contact,Need})=>u===undefined?<div className="wrap"><Spin/></div>:u?<HomeAuth u={u} Contact={Contact} Need={Need}/>:<Landing u={u} Contact={Contact} Need={Need}/>

const World3D=lazy(()=>import('./World3D.jsx'))
export const World=({on})=>on?<Suspense fallback={null}><World3D/></Suspense>:null

const Stage=lazy(()=>import('./Stage3D.jsx'))
const ROWS=[['01 · Audit','AI finds the gaps in a minute','Enter a business name or website. Our AI reads the public site and checks software and marketing gaps: chatbot, booking, payments, SEO and social.','audit','/audit','Try the free audit'],
['02 · Automate','Agents and software that do the work','We build AI agents and custom software that handle follow-ups, reminders, reports and data entry, so your team stops doing them by hand.','build','/agents','See AI agents'],
['03 · Grow','Less effort, more profit','When manual work drops, time and money go back into growth. Our creative team adds marketing: social media, video and motion graphics.','growth','/store','Browse services'],
['Software','Custom apps built around you','Web apps, mobile apps, dashboards and internal tools, built and maintained by our team.','computer','/agents','Request a build'],
['Support','One chat for everything','Requests, quotes, approvals and payments happen in one Kelvora chat. Nothing gets lost.','chat','/register','Get started'],
['Network','Businesses that help each other','Verified businesses discover each other, view profiles and collaborate.','network','/network','Browse the network']]
function Row({r,i}){const[n,t,d,k,to,cta]=r
return <div className={'frow'+(i%2?' flip':'')}><div className="card rv"><span className="tag v">{n}</span><h3>{t}</h3><p>{d}</p><br/><Link className="btn" to={to}>{cta} →</Link></div><div className="fstage"><Suspense fallback={null}><Stage kind={k}/></Suspense></div></div>}
export const PageStage=({kind})=><div className="wrap"><div className="banstage"><Suspense fallback={null}><Stage kind={kind}/></Suspense></div></div>
