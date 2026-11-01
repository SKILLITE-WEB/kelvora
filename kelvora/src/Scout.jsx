import {useState} from 'react'
import {WsFlag} from './workspace/state.js'
import {Link} from 'react-router-dom'
import {useCol,auth} from './firebase.js'
import {toast,useBusy} from './Ui.jsx'
const API=import.meta.env.VITE_API_URL
const PC={high:'r',medium:'v',low:''}

export function Report({s,admin}){const r=s.report||{};const ok=s.checks||[];const nm=s.input.name||s.domain||'business'
const body=nm+'\n\n'+(r.summary||'')+'\n\nTop recommendations:\n'+(r.recommendations||[]).map(x=>'- '+x.service+': '+x.why).join('\n')
return <div className="rep" style={{marginTop:16}}>
<div className="card glow bh"><div className="ring" style={{'--v':s.score}}><b>{s.score}</b></div><div><h3 style={{margin:0}}>{nm}</h3><small>{s.domain||'no website'} · digital score /100 · confidence: {r.confidence||'unknown'}{s.cached?' · cached':''}</small><p style={{marginTop:6}}>{r.summary}</p></div></div>
<h3 style={{margin:'22px 0 10px'}}>Software and marketing check</h3>
<div className="grid">{['software','marketing'].map(c=><div className="card" key={c}><b style={{textTransform:'capitalize'}}>{c}</b>{ok.filter(x=>x.cat===c).map(x=><div key={x.k}>{x.ok?'✅':'❌'} {x.k}</div>)}
{((c==='software'?r.software_gaps:r.marketing_gaps)||[]).map((g,i)=><p key={i} style={{fontSize:13,color:'#ffb4c0',marginTop:6}}>→ {g}</p>)}</div>)}</div>
<h3 style={{margin:'22px 0 10px'}}>How Kelvora can help</h3>
<div className="grid">{(r.recommendations||[]).map((x,i)=><div className="card" key={i}><span className={'tag '+PC[x.priority]}>{x.priority}</span> <span className="tag v">{x.when}</span><h3>{x.service}</h3><p>{x.why}</p></div>)}</div>
{(r.agents||[]).length>0&&<><h3 style={{margin:'22px 0 10px'}}>🤖 AI agents we can build</h3><div className="grid">{r.agents.map((x,i)=><div className="card" key={i}><h3>{x.name}</h3><p>{x.does}</p><span className="tag">{x.saves_est}</span> <span className="tag v">{x.build_time}</span></div>)}</div></>}
{(r.partners||[]).length>0&&<><h3 style={{margin:'22px 0 10px'}}>🤝 Businesses in our network who can collaborate</h3><div className="grid">{r.partners.map((p,i)=><div className="card" key={i}><span className="tag">✓ Verified</span><h3>{p.name}</h3><small>{p.category}</small><p><b>Why:</b> {p.why}</p><p><b>How:</b> {p.how}</p><p><b>When:</b> {p.when}</p><Link className="btn s" to={'/business/'+p.id}>View profile</Link></div>)}</div></>}
{(r.plan||[]).length>0&&<><h3 style={{margin:'22px 0 10px'}}>🗓 Roadmap</h3><div className="card">{r.plan.map((x,i)=><p key={i} style={{margin:'6px 0'}}><span className="tag">{x.when}</span> {x.what}</p>)}</div></>}
{(r.founders||[]).length>0&&<><h3 style={{margin:'22px 0 10px'}}>👤 Public team info</h3><div className="card">{r.founders.map((f,i)=><p key={i}>{f.name} <small>({f.role})</small> {f.source&&<a href={f.source} target="_blank" rel="noreferrer" style={{color:'var(--c)'}}>source ↗</a>}</p>)}</div></>}
{admin&&r.pitch&&<div className="card glow" style={{marginTop:16}}><b>🎯 Pitch opener</b><p>{r.pitch}</p><div className="row"><button className="s" onClick={()=>{navigator.clipboard.writeText(r.pitch);toast('Copied')}}>Copy</button>
<a className="btn s" href={'mailto:?subject='+encodeURIComponent('Ideas for '+nm+' from Kelvora Infotech')+'&body='+encodeURIComponent(body)}>✉ Email summary</a></div></div>}
{(s.sources||[]).length>0&&<p style={{marginTop:16,fontSize:13}}><small>Sources:</small> {s.sources.map((u,i)=><a key={i} href={u} target="_blank" rel="noreferrer" style={{color:'var(--c)',marginRight:10}}>[{i+1}]</a>)}</p>}
<small style={{color:'#8a87aa'}}>AI-generated from public information. Numbers marked est. are estimates. Please verify before acting.</small></div>}

export function ScoutBox({u,admin}){const all=useCol('scouts',admin?null:['uid','==',u.uid]);const[f,setF]=useState({name:'',link:'',city:''});const[cur,setCur]=useState(null);const[busy,run]=useBusy()
const L=[...all].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));const s=all.find(x=>x.id===cur)
const go=e=>{e.preventDefault();if(!API)return toast('API URL missing','err');const id=crypto.randomUUID().replace(/-/g,'');setCur(id)
run(async()=>{const tok=await auth.currentUser.getIdToken();const r=await fetch(API+'/api/scout',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+tok},body:JSON.stringify({...f,jobId:id})})
const j=await r.json().catch(()=>({}));if(!r.ok){setCur(null);throw new Error(j.error||'Something went wrong')}})}
return <div><form onSubmit={go} className="card" style={{maxWidth:'none'}}><div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))'}}>
<input placeholder="Business name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><input placeholder="Website link (optional)" value={f.link} onChange={e=>setF({...f,link:e.target.value})}/><input placeholder="City (optional)" value={f.city} onChange={e=>setF({...f,city:e.target.value})}/></div>
<div className="row" style={{marginTop:10}}><button disabled={busy}>{busy?'Analysing…':'🔍 Analyse business'}</button><small style={{color:'#8a87aa'}}>No link? We search the web for it.</small></div></form>
{busy&&<WsFlag s="processing"/>}{busy&&<div className="card" style={{marginTop:14}}><div className="row"><div className="spin" style={{margin:0,width:22,height:22}}/><span>{s?.step||'Starting…'}</span></div></div>}
{s?.status==='error'&&<WsFlag s="error"/>}{s?.status==='error'&&<div className="card ord late" style={{marginTop:14}}>⚠️ {s.step}</div>}
{s?.status==='done'&&!s.cached&&Date.now()-(s.createdAt?.toMillis?.()||0)<30000&&<WsFlag s="success"/>}{s?.status==='done'&&<Report s={s} admin={admin}/>}
{L.filter(x=>x.status==='done').length>0&&<><h3 style={{margin:'28px 0 10px'}}>Past reports</h3><div className="grid">{L.filter(x=>x.status==='done').map(x=><div className="card" key={x.id}><b>{x.input.name||x.domain}</b><br/><small>{x.domain} · score {x.score}{admin?' · '+x.email:''}</small><div className="row" style={{marginTop:8}}><button className="s" onClick={()=>{setCur(x.id);scrollTo({top:0,behavior:'smooth'})}}>Open</button></div></div>)}</div></>}</div>}

export const AuditPage=({u})=><main className="wrap"><h2><small>Free tool</small>AI Business Audit</h2>
<p style={{color:'#b9b6d6',maxWidth:'60ch',marginBottom:16}}>Enter a business name or website. Our AI reads the public website, checks software and marketing gaps, suggests AI agents to cut manual work, and finds partners in our network. 3 free audits a day.</p><ScoutBox u={u}/></main>
