const rm=matchMedia('(prefers-reduced-motion:reduce)').matches
const hold=()=>!!document.querySelector('.intro:not(.out)')
const gt=setInterval(()=>{if(!hold()){document.documentElement.dataset.go='1';clearInterval(gt)}},120)
if(!rm){
const SEL='main h2,.pill,.hcopy p,.hcopy .row,.mq,.cta,.pfh,.vid,.fstage,.banstage,.card'
const skip=new WeakSet(),pend=new Set();let ft=0,last=0,tm=0
const flush=()=>{if(hold()){setTimeout(flush,150);return}
const l=[...pend].filter(e=>e.isConnected&&!e.dataset.in).sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return(A.top-B.top)||(A.left-B.left)})
pend.clear();l.forEach((e,k)=>{e.style.setProperty('--rd',Math.min(k,7));e.dataset.in='1'})}
const io=new IntersectionObserver(es=>{let a=0;es.forEach(x=>{if(x.isIntersecting){io.unobserve(x.target);pend.add(x.target);a=1}});if(a&&!ft)ft=setTimeout(()=>{ft=0;flush()},50)},{threshold:.1,rootMargin:'0px 0px -5% 0px'})
const kind=e=>{if(e.matches('h2'))return 'text';const f=e.closest('.frow');if(f&&e.matches('.card'))return f.classList.contains('flip')?'right':'left';return e.matches('.fstage,.banstage,.cta,.pfh,.vid,.mq')?'zoom':'up'}
const scan=()=>{document.querySelectorAll(SEL).forEach(e=>{if(e.dataset.rv||skip.has(e))return
if(e.parentElement&&e.parentElement.closest('[data-rv]')){skip.add(e);return}
e.dataset.rv=kind(e);io.observe(e)})}
const run=()=>{tm=0;last=performance.now();scan()}
new MutationObserver(()=>{if(tm)return;const d=performance.now()-last;if(d>100)run();else tm=setTimeout(run,100-d)}).observe(document.body,{childList:true,subtree:true})
scan()
setInterval(()=>{if(hold())return;document.querySelectorAll('[data-rv]:not([data-in])').forEach(e=>{const r=e.getBoundingClientRect();if(r.height>0&&r.top<innerHeight*.9&&r.bottom>0&&!pend.has(e))e.dataset.in='1'})},1800)
if(matchMedia('(hover:hover) and (pointer:fine)').matches){const g=document.createElement('div');g.className='cglow';document.body.appendChild(g)
let x=innerWidth/2,y=innerHeight/3,tx=x,ty=y,on=0
const loop=()=>{x+=(tx-x)*.12;y+=(ty-y)*.12;g.style.transform='translate('+(x-260)+'px,'+(y-260)+'px)';if(Math.abs(tx-x)+Math.abs(ty-y)>.5)requestAnimationFrame(loop);else on=0}
addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;g.style.opacity=1;if(!on){on=1;requestAnimationFrame(loop)}},{passive:true})
document.addEventListener('mouseleave',()=>{g.style.opacity=0})}
}
