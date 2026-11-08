import {useState,useEffect} from 'react'
const get=()=>{try{return localStorage.getItem('kv_theme')||'auto'}catch{return 'auto'}}
const eff=m=>m==='auto'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):m
export const apply=m=>{const t=eff(m);document.documentElement.dataset.theme=t;document.querySelector('meta[name=theme-color]')?.setAttribute('content',t==='light'?'#f5f6fb':'#090a10')}
export function useTheme(){const[m,setM]=useState(get);const[t,setT]=useState(()=>eff(get()))
useEffect(()=>{apply(m);setT(eff(m));if(m!=='auto')return;const q=matchMedia('(prefers-color-scheme: light)');const f=()=>{apply('auto');setT(eff('auto'))};q.addEventListener('change',f);return()=>q.removeEventListener('change',f)},[m])
const toggle=()=>{const n=t==='light'?'dark':'light';try{localStorage.setItem('kv_theme',n)}catch{};setM(n)}
return[t,toggle]}
