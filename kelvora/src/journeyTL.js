export const U=[.036,.145,.258,.372,.475],E=.0035
export const TL=(()=>{const s=[];let c=.02
 for(let i=0;i<5;i++){
  if(i){s.push({k:'t',a:c,b:c+.14,u0:U[i-1]+E,u1:U[i]-E,i});c+=.14}
  s.push({k:'a',a:c,b:c+.03,u0:U[i]-E,u1:U[i],i});c+=.03
  s.push({k:'w',a:c,b:c+.11,i});c+=.11
  if(i<4){s.push({k:'d',a:c,b:c+.03,u0:U[i],u1:U[i]+E,i});c+=.03}}
 return{s,total:c+.02,w:s.filter(x=>x.k==='w')}})()
export const stationP=i=>{const g=TL.w[i];return(g.a+.45*(g.b-g.a))/TL.total}
