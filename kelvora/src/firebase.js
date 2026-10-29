import {useState,useEffect} from 'react'
import {initializeApp} from 'firebase/app'
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from 'firebase/auth'
import {getFirestore,collection,query,where,orderBy,onSnapshot} from 'firebase/firestore'
const e=import.meta.env
const app=initializeApp({apiKey:e.VITE_API_KEY,authDomain:e.VITE_AUTH_DOMAIN,projectId:e.VITE_PROJECT_ID,appId:e.VITE_APP_ID})
export const auth=getAuth(app), db=getFirestore(app)
export const ADMINS=['bendalehimanshu5@gmail.com','virajrajput07@gmail.com']
export const login=()=>signInWithPopup(auth,new GoogleAuthProvider())
export const logout=()=>signOut(auth)
export const useUser=()=>{const[u,s]=useState(undefined);useEffect(()=>onAuthStateChanged(auth,s),[]);return u}
export const isAdmin=u=>!!u&&ADMINS.includes(u.email)
// useCol(name, [field,'==',val]) -> live list
export function useCol(name,w){const[d,s]=useState([]);const k=JSON.stringify(w)
useEffect(()=>{const q=w?query(collection(db,name),where(...w)):collection(db,name)
return onSnapshot(q,x=>s(x.docs.map(y=>({id:y.id,...y.data()}))),()=>s([]))},[name,k]);return d}
