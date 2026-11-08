const L=new Set()
const bus={on:false,mode:'init',j:null,el:null,cb:null,
getP:()=>bus.cb?bus.cb.getP():0,
onStation:i=>{bus.cb&&bus.cb.onStation&&bus.cb.onStation(i)},
onPhase:p=>{bus.cb&&bus.cb.onPhase&&bus.cb.onPhase(p)},
setMode(m){bus.mode=m;bus.cb&&bus.cb.onMode&&bus.cb.onMode(m)},
sub:f=>{L.add(f);return()=>L.delete(f)},
setOn(v){bus.on=v;if(bus.el)bus.el.style.display=v?'block':'none';L.forEach(f=>f(v))},
attach(cb){bus.cb=cb;bus.setOn(true);cb.onMode&&cb.onMode(bus.mode)
 return{skip:()=>bus.j&&bus.j.skip(),replay:()=>bus.j&&bus.j.replay(),detach:()=>{if(bus.cb===cb){bus.cb=null;bus.setOn(false)}}}}}
export default bus
