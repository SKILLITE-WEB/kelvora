import {useState,useEffect} from 'react'
export const toast=(m,t='ok')=>dispatchEvent(new CustomEvent('toast',{detail:{m,t}}))
export function Toasts(){const[l,s]=useState([]);useEffect(()=>{const h=e=>{const id=Math.random();s(x=>[...x,{id,...e.detail}]);setTimeout(()=>s(x=>x.filter(y=>y.id!==id)),3200)};addEventListener('toast',h);return()=>removeEventListener('toast',h)},[]);return <div className="toasts">{l.map(x=><div key={x.id} className={'toast '+x.t}>{x.t==='err'?'⚠️ ':'✓ '}{x.m}</div>)}</div>}
export const Spin=()=><div className="spin"/>
export function useBusy(){const[b,s]=useState(false);return[b,async f=>{s(true);try{await f()}catch(e){toast(e.message||'Something went wrong','err')}s(false)}]}
