import {useState,useEffect} from 'react'
import {initializeApp} from 'firebase/app'
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from 'firebase/auth'
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,collection,query,where,limit,onSnapshot} from 'firebase/firestore'
const e=import.meta.env
const app=initializeApp({apiKey:e.VITE_API_KEY,authDomain:e.VITE_AUTH_DOMAIN,projectId:e.VITE_PROJECT_ID,appId:e.VITE_APP_ID})
export const auth=getAuth(app)
export const db=initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})})
export const ADMINS=['bendalehimanshu5@gmail.com','virajrajput07@gmail.com']
export const login=()=>signInWithPopup(auth,new GoogleAuthProvider())
export const logout=()=>signOut(auth)
export const useUser=()=>{const[u,s]=useState(undefined);useEffect(()=>onAuthStateChanged(auth,s),[]);return u}
export const isAdmin=u=>!!u&&ADMINS.includes(u.email)
const C=new Map()
export function useCol(name,w){const k=name+JSON.stringify(w||0);const[d,s]=useState(()=>C.get(k)||[])
useEffect(()=>{s(C.get(k)||[]);const q=w?query(collection(db,name),where(...w),limit(300)):query(collection(db,name),limit(300))
return onSnapshot(q,x=>{const r=x.docs.map(y=>({id:y.id,...y.data()}));C.set(k,r);s(r)},()=>s([]))},[k]);return d}
