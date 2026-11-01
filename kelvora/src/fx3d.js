const rm=matchMedia('(prefers-reduced-motion:reduce)').matches
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches
if(!rm){
const SEL='.frow,.bento,.hubs,.dstats,.grid,.cta,.rep,.pfh,.mq'
let els=[],mx=0,my=0
const refresh=()=>{els=[...document.querySelectorAll(SEL)].filter(e=>!e.parentElement.closest(SEL))}
setInterval(refresh,600);refresh()
if(fine)addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true})
const tick=()=>{const vh=innerHeight,k=innerWidth<800?.5:1,job=[]
for(const e of els){const r=e.getBoundingClientRect();if(r.bottom<-120||r.top>vh+120)continue
job.push([e,Math.max(-1,Math.min(1,((r.top+r.height/2)-vh/2)/vh))])}
for(const[e,d]of job)e.style.transform=`perspective(1400px) translateZ(${(-Math.abs(d)*90*k).toFixed(1)}px) rotateX(${(d*9*k-my*1.2).toFixed(2)}deg) rotateY(${(mx*2.2*k).toFixed(2)}deg)`
requestAnimationFrame(tick)}
tick()
if(fine){let cur=null
const reset=()=>{if(cur){cur.style.setProperty('--mx','0px');cur.style.setProperty('--my','0px');cur=null}}
addEventListener('pointermove',e=>{const b=e.target.closest&&e.target.closest('.btn:not(.s),button:not(.s):not(.hb):not(.icb):not(.fab)')
if(b!==cur)reset();if(!b)return;cur=b;const r=b.getBoundingClientRect()
b.style.setProperty('--mx',Math.max(-10,Math.min(10,(e.clientX-r.left-r.width/2)*.22))+'px')
b.style.setProperty('--my',Math.max(-8,Math.min(8,(e.clientY-r.top-r.height/2)*.28))+'px')},{passive:true})
document.addEventListener('mouseleave',reset)}}
