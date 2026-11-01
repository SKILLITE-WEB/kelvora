const fine=matchMedia('(hover:hover) and (pointer:fine)').matches
addEventListener('mousemove',e=>{const c=e.target.closest&&e.target.closest('.card');if(!c)return;const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top
c.style.setProperty('--x',x+'px');c.style.setProperty('--y',y+'px');c.style.setProperty('--px',((x/r.width-.5)*14).toFixed(1)+'px');c.style.setProperty('--py',((y/r.height-.5)*14).toFixed(1)+'px')
if(fine&&r.width<700&&!c.querySelector('form,iframe,textarea,input')){c.style.setProperty('--ry',((x/r.width-.5)*8).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-y/r.height)*8).toFixed(2)+'deg')}})
addEventListener('mouseout',e=>{const c=e.target.closest&&e.target.closest('.card');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');c.style.setProperty('--px','0px');c.style.setProperty('--py','0px')}})
