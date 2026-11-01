import {useState,useEffect} from 'react'
import {NavLink,Link,useLocation} from 'react-router-dom'
import {useCol,login,logout,isAdmin} from './firebase.js'
import {PITCH} from './Home3D.jsx'
import {useTheme} from './Theme.js'
const cls=({isActive})=>'l'+(isActive?' on':'')
const NL=({to,i,children,end})=><NavLink className={cls} to={to} end={end}><i>{i}</i>{children}</NavLink>
function DashLink({u}){const n=useCol('notices',['uid','==',u.uid]);const c=n.filter(x=>x.status==='sent').length
return <NavLink className={cls} to="/dashboard"><i>📋</i>Dashboard{c>0&&<span className="dot">{c}</span>}</NavLink>}
export default function Nav({u}){const[o,setO]=useState(false);const[th,toggle]=useTheme();const{pathname}=useLocation();const adm=isAdmin(u)
useEffect(()=>{setO(false)},[pathname])
useEffect(()=>{document.body.style.overflow=o?'hidden':'';const k=e=>{if(e.key==='Escape')setO(false)};addEventListener('keydown',k);return()=>{removeEventListener('keydown',k);document.body.style.overflow=''}},[o])
const main=<><NL to="/" i="🏠" end>Home</NL><NL to="/network" i="🌐">Network</NL><NL to="/agents" i="🤖">AI Agents</NL><NL to="/store" i="🛒">Store</NL><NL to="/audit" i="🔍">Free Audit</NL><NL to="/portfolio" i="🎬">Portfolio</NL></>
const acct=<>{u&&<DashLink u={u}/>}{adm&&<NL to="/admin" i="🛠">Admin</NL>}</>
const theme=<button className="s icb" aria-label="Toggle light and dark theme" title="Theme" onClick={toggle}>{th==='light'?'🌙':'☀️'}</button>
const auth=u?<button className="s" onClick={logout}>Sign out</button>:<button onClick={login}>Sign in</button>
return <>
<header className="top"><div className="topin">
<button className="hb s" aria-label="Open menu" aria-expanded={o} aria-controls="dw" onClick={()=>setO(v=>!v)}><i/><i/><i/></button>
<Link to="/" className="logo">Kelvora</Link>
<div className="inl" role="navigation">{main}{acct}</div>
<div className="tr">{theme}{auth}</div></div></header>
<div className={'sc'+(o?' on':'')} onClick={()=>setO(false)}/>
<aside id="dw" className={'dw'+(o?' on':'')} aria-hidden={!o}>
<div className="row" style={{justifyContent:'space-between',padding:'4px 6px 10px'}}><Link to="/" className="logo">Kelvora</Link><button className="s icb" aria-label="Close menu" onClick={()=>setO(false)}>✕</button></div>
<h4>Explore</h4>{main}<h4>Account</h4>{acct}<NL to="/register" i="🏢">Register business</NL><a className="l" href={PITCH} target="_blank" rel="noreferrer"><i>▶</i>Pitch ↗</a>
<div className="dwf">{u&&<small style={{color:'var(--dim)',overflowWrap:'anywhere'}}>{u.email}</small>}<div className="row">{theme}{auth}</div></div></aside></>}
