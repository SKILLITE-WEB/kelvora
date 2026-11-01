import {useState,useEffect} from 'react'
import {doc,onSnapshot} from 'firebase/firestore'
import {db} from './firebase.js'
export function useVerified(u){const[v,s]=useState(false)
useEffect(()=>u?onSnapshot(doc(db,'users',u.uid),d=>s(!!d.data()?.verified),()=>s(false)):undefined,[u?.uid]);return v}
export const cleanUrl=s=>{s=String(s||'').trim();if(!s||/\s/.test(s))return '';if(!/^https?:\/\//i.test(s)){if(/^[a-z][a-z0-9+.-]*:/i.test(s))return '';s='https://'+s}
try{const u=new URL(s);return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)?u.href:''}catch{return ''}}
