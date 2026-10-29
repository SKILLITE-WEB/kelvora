import {useState,useEffect} from 'react'
export function Vid({v}){const[p,s]=useState(false)
if(p||!v.clip)return <div className="vid"><iframe loading="lazy" allow="autoplay;fullscreen" allowFullScreen src={v.yt?`https://www.youtube.com/embed/${v.yt}?autoplay=${p?1:0}`:`https://drive.google.com/file/d/${v.drive}/preview`}/></div>
return <div className="vid pv" onClick={()=>s(true)}><video src={v.clip} autoPlay muted loop playsInline/><span className="play">▶ Watch full video</span></div>}
const Count=({to,suf=''})=>{const[n,setN]=useState(0);useEffect(()=>{let i=0;const t=setInterval(()=>{i++;setN(Math.round(to*Math.min(i/60,1)));if(i>=60)clearInterval(t)},25);return()=>clearInterval(t)},[to]);return <>{n}{suf}</>}
export default function Showcase(){return <section><h2><small>Live demos</small>See it in action.</h2>
<div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))'}}>
<div className="card demo"><span className="tag">AI Agent</span><div className="chat">
<p className="b u" style={{'--d':'0s'}}>Hi, do you deliver today?</p><p className="b a" style={{'--d':'1.2s'}}>Yes! Order before 6 PM. Want me to book it?</p>
<p className="b u" style={{'--d':'2.6s'}}>Book 2 boxes</p><p className="b a" style={{'--d':'3.8s'}}>✅ Done. Invoice sent on WhatsApp.</p></div></div>
<div className="card demo"><span className="tag">Business Dashboard</span><div className="kp"><div><h3 className="grad"><Count to={248}/></h3><small>Orders</small></div><div><h3 className="grad">+<Count to={64} suf="%"/></h3><small>Growth</small></div></div>
<div className="bars">{[40,65,50,80,60,95,75].map((h,i)=><i key={i} style={{'--h':h+'%','--d':i*.12+'s'}}/>)}</div></div>
<div className="card demo"><span className="tag">Motion Graphics</span><div className="mo"><i/><i/><i/></div></div></div></section>}
