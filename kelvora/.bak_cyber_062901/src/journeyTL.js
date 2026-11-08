export const U=[.036,.145,.258,.372,.475],E=.0035
export const TL=(()=>{const s=[];let c=.02
 for(let i=0;i<5;i++){
  if(i){s.push({k:'t',a:c,b:c+.16,u0:U[i-1]+E,u1:U[i]-E,i});c+=.16}
  s.push({k:'a',a:c,b:c+.04,u0:U[i]-E,u1:U[i],i});c+=.04
  s.push({k:'w',a:c,b:c+.1,i});c+=.1
  if(i<4){s.push({k:'d',a:c,b:c+.04,u0:U[i],u1:U[i]+E,i});c+=.04}}
 return{s,total:c+.02,w:s.filter(x=>x.k==='w')}})()
export const stationP=i=>{const g=TL.w[i];return(g.a+.45*(g.b-g.a))/TL.total}
