import {useEffect} from 'react'
let cur=null
export const getWs=()=>cur
export const setWs=s=>{cur=s==='success'?null:s;dispatchEvent(new CustomEvent('ws-state',{detail:s}))}
export const wsKind=p=>({dashboard:'ops',store:'ops',agents:'workshop',portfolio:'workshop',network:'comms',audit:'analysis',register:'desk',profile:'desk'})[(p.split('/')[1]||'')]||null
export const adminKind=t=>({overview:'control',approvals:'ops',clients:'ops',orders:'ops',inquiries:'comms',scout:'analysis',employees:'workshop',finance:'analysis',work:'workshop',services:'workshop'})[t]||'control'
export function WsFlag({s}){useEffect(()=>{setWs(s);return()=>{if(s!=='success')setWs(null)}},[s]);return null}
