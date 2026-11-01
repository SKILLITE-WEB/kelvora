import {useState,useEffect} from 'react'
export default function Intro(){const[st,setSt]=useState(()=>{try{return !sessionStorage.getItem('kv_intro')&&!matchMedia('(prefers-reduced-motion:reduce)').matches?0:2}catch{return 2}});const[p,setP]=useState(0)
useEffect(()=>{if(st!==0)return;let v=0;const t=setInterval(()=>{v=Math.min(100,v+Math.random()*16+8);setP(Math.round(v));if(v>=100){clearInterval(t);setTimeout(()=>{setSt(1);try{sessionStorage.setItem('kv_intro','1')}catch{};setTimeout(()=>setSt(2),650)},300)}},110);return()=>clearInterval(t)},[st])
if(st===2)return null
return <div className={'intro'+(st===1?' out':'')}><div className="dm"/><h1 className="grad">KELVORA</h1><p>Less effort. More growth.</p><div className="ib"><i style={{width:p+'%'}}/></div><small>{p}%</small></div>}
