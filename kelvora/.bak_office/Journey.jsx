import {useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {Link} from 'react-router-dom'
import {stationP} from './journeyTL.js'
const ST=[
{k:'Kelvora Infotech',n:'Welcome',t:'Less effort. More growth.',d:'Kelvora takes the manual work out of running a business. Our AI finds the gaps, then our agents, software and creative team close them.',c:[['Register your business','/register'],['Free AI audit','/audit',1]]},
{k:'01 · Audit',n:'Audit',t:'AI finds the gaps in a minute.',d:'Enter a business name or website. Our AI reads the public site and checks software and marketing gaps: chatbot, booking, payments, SEO and social.',c:[['Try the free audit','/audit']]},
{k:'02 · Automate',n:'Automate',t:'Agents and software that do the work.',d:'We build AI agents and custom software that handle follow-ups, reminders, reports and data entry, so your team stops doing them by hand.',c:[['See AI agents','/agents']]},
{k:'03 · Grow',n:'Grow',t:'Less effort, more profit.',d:'When manual work drops, time and money go back into growth. Our creative team adds social media, video and motion graphics.',c:[['Browse services','/store'],['Our portfolio','/portfolio',1]]},
{k:'One chat for everything',n:'Start',t:'A platform where businesses grow together.',d:'Register, get verified, showcase your profile, and request services in one chat.',c:[['Get started','/register'],['Browse the network','/network',1]]}]
export default function Journey({me}){
const root=useRef(),host=useRef(),pan=useRef([]),nav=useRef([]),st=useRef();const[mode,setMode]=useState('init')
useEffect(()=>{
 if(pan.current[0])pan.current[0].classList.add('on')
 let dead=false,j=null,off=false
 try{off=localStorage.getItem('kv_3d')==='off'}catch{}
 if(off){setMode('fb');return}
 const rm=matchMedia('(prefers-reduced-motion:reduce)').matches
 import('./JourneyScene.js').then(m=>{
  if(dead)return
  const rect=()=>root.current.getBoundingClientRect()
  const getP=()=>{const r=rect(),span=Math.max(1,r.height-innerHeight),p=-r.top/span
   if(p<=1)return Math.max(0,p)
   const end=scrollY+r.top+span,max=Math.max(end+1,document.documentElement.scrollHeight-innerHeight)
   return 1+Math.min(1,Math.max(0,(scrollY-end)/(max-end)))}
  const onStation=i=>{if(i>=0&&st.current)st.current.dataset.side=i%2?'r':'l'
   pan.current.forEach((e,k)=>{if(e)e.classList.toggle('on',k===i)})
   nav.current.forEach((e,k)=>{if(!e)return;if(k===i)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current')})}
  j=m.createJourney(host.current,{getP,visible:()=>true,onStation,onFail:()=>{document.body.classList.remove('home3d');setMode('fb')},reduced:rm})
  if(j)document.body.classList.add('home3d')
  setMode(j?'3d':'fb')
 }).catch(()=>setMode('fb'))
 return()=>{dead=true;document.body.classList.remove('home3d');if(j)j.dispose()}
},[])
const go=i=>{const el=root.current,top=el.getBoundingClientRect().top+scrollY,span=el.offsetHeight-innerHeight
 scrollTo({top:top+stationP(i)*span,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}
const S=ST.map((s,i)=>i===0&&me?{...s,d:'Welcome back, '+me.name+'. Your agents, orders and Kelvora chat are right below.',c:[['Request a service','/agents'],['Dashboard','/dashboard',1]]}:s)
return <>
{createPortal(<div className="jny-fx" ref={host} aria-hidden="true"/>,document.body)}
<div className={'jny'+(mode==='fb'?' jny-fb':'')} ref={root}><div className="jny-st" ref={st} data-side="l">
<a className="jny-skip" href="#jny-end">Skip the journey</a>
<nav className="jny-nav" aria-label="Journey stops">{S.map((s,i)=><button key={i} type="button" className="s" ref={e=>{nav.current[i]=e}} onClick={()=>go(i)}><b>{i+1}</b><span>{s.n}</span></button>)}</nav>
{S.map((s,i)=><section key={i} ref={e=>{pan.current[i]=e}} className={'jny-p'+(i%2?' r':'')} aria-labelledby={'jh'+i}>
<span className="jny-k">{s.k}</span><div id={'jh'+i} role="heading" aria-level={i?2:1} className="jny-h">{s.t}</div><p>{s.d}</p>
<div className="row">{s.c.map(([l,to,sec])=><Link key={l} className={'btn'+(sec?' s':'')} to={to}>{l}</Link>)}</div>
{i===0&&<small className="jny-hint">Scroll to walk with Chimpuk ↓</small>}</section>)}
</div></div><div id="jny-end"/></>}
