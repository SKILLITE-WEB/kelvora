const ADMINS=['bendalehimanshu5@gmail.com','virajrajput07@gmail.com']
const ORIGINS=['https://kelvora-tech.web.app','https://kelvora-tech.firebaseapp.com','https://kelvorainfortech.com','https://www.kelvorainfortech.com','http://localhost:5173']
const okOrigin=o=>ORIGINS.includes(o)||/^https:\/\/[a-z0-9-]+\.app\.github\.dev$/.test(o||'')
const UA='KelvoraScoutBot/1.0 (+https://kelvorainfortech.com)'
const SKIP=/facebook|instagram|linkedin|justdial|indiamart|youtube|wikipedia|zomato|swiggy|twitter|x\.com|sulekha|yelp|tripadvisor|google\./i
const AGENTS='lead reply agent, FAQ/support agent, appointment booking agent, order & payment reminder agent, invoice/document data-entry agent, weekly report agent, review reply agent, social content agent, email triage agent, sales research agent'
const SYS=`You are Kelvora Scout, an analyst for Kelvora Infotech (custom software, AI agents, marketing agency: social media, video editing, motion graphics).
Use ONLY the facts given. Focus ONLY on software and digital-marketing gaps seen from the website/portfolio, not business strategy. If unknown, write "unknown". Never invent people, numbers or sources. Only public professional info about people. Time or effort numbers are estimates: prefix "est.". Partners must use ids from the provided list only, and explain why they fit, how to approach them, and when.
Reply with JSON only: {"summary":"2-3 sentences what they do","confidence":"high|medium|low","founders":[{"name":"","role":"","source":"url from search"}],"software_gaps":[""],"marketing_gaps":[""],"recommendations":[{"service":"","why":"","priority":"high|medium|low","when":"Week 1|Month 1|Month 2-3"}],"agents":[{"name":"","does":"","saves_est":"","build_time":""}],"partners":[{"id":"","why":"","how":"","when":""}],"plan":[{"when":"","what":""}],"pitch":"2 friendly sentences for a sales call"}
Limits: 5 recommendations, 4 agents, 3 partners, 5 plan steps, 4 gaps per list.`
let E,JWKS,JT=0,AT,AX=0
const enc=new TextEncoder(),dec=new TextDecoder()
const b64u=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))
const b64s=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
const RS={name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'}

async function verify(tok,pid){const[h,p,s]=tok.split('.');if(!s)throw new Error('Please sign in again')
const hd=JSON.parse(dec.decode(b64u(h))),pl=JSON.parse(dec.decode(b64u(p)))
if(!JWKS||Date.now()-JT>36e5){JWKS=(await(await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')).json()).keys;JT=Date.now()}
const k=JWKS.find(x=>x.kid===hd.kid);if(!k||hd.alg!=='RS256')throw new Error('Invalid session')
const key=await crypto.subtle.importKey('jwk',k,RS,false,['verify'])
if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64u(s),enc.encode(h+'.'+p)))throw new Error('Invalid session')
if(pl.aud!==pid||pl.iss!=='https://securetoken.google.com/'+pid||pl.exp<Date.now()/1e3||!pl.sub)throw new Error('Session expired. Please sign in again.')
return{uid:pl.sub,email:pl.email,verified:pl.email_verified}}

async function access(sa){if(AT&&Date.now()<AX)return AT
const now=Math.floor(Date.now()/1e3),h=b64s(enc.encode(JSON.stringify({alg:'RS256',typ:'JWT'}))),p=b64s(enc.encode(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})))
const der=Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----|\s/g,'')),c=>c.charCodeAt(0))
const key=await crypto.subtle.importKey('pkcs8',der,RS,false,['sign'])
const sig=b64s(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,enc.encode(h+'.'+p)))
const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+h+'.'+p+'.'+sig})
const j=await r.json();if(!j.access_token)throw new Error('Database auth failed');AT=j.access_token;AX=Date.now()+3e6;return AT}

const fv=v=>v===null||v===undefined?{nullValue:null}:v instanceof Date?{timestampValue:v.toISOString()}:typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?(Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v}):typeof v==='string'?{stringValue:v}:Array.isArray(v)?{arrayValue:{values:v.map(fv)}}:{mapValue:{fields:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,fv(x)]))}}
const uv=f=>{if('stringValue'in f)return f.stringValue;if('integerValue'in f)return Number(f.integerValue);if('doubleValue'in f)return f.doubleValue;if('booleanValue'in f)return f.booleanValue;if('timestampValue'in f)return new Date(f.timestampValue);if('arrayValue'in f)return(f.arrayValue.values||[]).map(uv);if('mapValue'in f)return Object.fromEntries(Object.entries(f.mapValue.fields||{}).map(([k,x])=>[k,uv(x)]));return null}
function FS(){const sa=JSON.parse(E.FIREBASE_SA),base=`https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents`
const call=async(url,m='GET',body)=>{const r=await fetch(url,{method:m,headers:{authorization:'Bearer '+await access(sa),'content-type':'application/json'},body:body&&JSON.stringify(body)});if(r.status===404&&m==='GET')return null;if(!r.ok)throw new Error('DB '+r.status+' '+(await r.text()).slice(0,100));return r.json()}
const fields=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,fv(v)]))
const parse=d=>({id:d.name.split('/').pop(),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,uv(x)]))})
return{pid:sa.project_id,
get:async p=>{const d=await call(`${base}/${p}`);return d?parse(d):null},
create:(c,id,o)=>call(`${base}/${c}?documentId=${id}`,'POST',{fields:fields(o)}),
update:(p,o)=>call(`${base}/${p}?`+Object.keys(o).map(k=>'updateMask.fieldPaths='+encodeURIComponent(k)).join('&'),'PATCH',{fields:fields(o)}),
set:(p,o)=>call(`${base}/${p}`,'PATCH',{fields:fields(o)}),
query:async(c,f,lim)=>{const q={from:[{collectionId:c}],limit:lim};if(f)q.where={fieldFilter:{field:{fieldPath:f[0]},op:'EQUAL',value:fv(f[1])}};return(await call(`${base}:runQuery`,'POST',{structuredQuery:q})).filter(x=>x.document).map(x=>parse(x.document))}}}

const bad=h=>/^(localhost|.*\.local|.*\.internal)$/i.test(h)||/^[\d.]+$/.test(h)||h.includes(':')||h.startsWith('[')
async function get(url,hops=0){const u=new URL(url);if(!/^https?:$/.test(u.protocol)||bad(u.hostname)||(u.port&&!['80','443'].includes(u.port)))throw new Error('Blocked link')
const r=await fetch(u.href,{redirect:'manual',signal:AbortSignal.timeout(8000),headers:{'user-agent':UA,accept:'text/html,text/plain'}})
if(r.status>=300&&r.status<400&&r.headers.get('location')&&hops<3)return get(new URL(r.headers.get('location'),u).href,hops+1)
if(!r.ok)throw new Error('HTTP '+r.status);return{html:(await r.text()).slice(0,150000),url:u.href}}
async function robots(origin){try{const{html}=await get(origin+'/robots.txt');const rules=[];let on=false
for(const l of html.split('\n')){const m=l.split('#')[0].trim(),i=m.indexOf(':');if(i<0)continue;const k=m.slice(0,i).toLowerCase(),v=m.slice(i+1).trim();if(k==='user-agent')on=v==='*';else if(on&&k==='disallow'&&v)rules.push(v)}
return p=>!rules.some(r=>p.startsWith(r))}catch{return()=>true}}
const dom=u=>new URL(u).hostname.replace(/^www\./,'')
const strip=h=>h.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&amp;/g,' ').replace(/\s+/g,' ').trim()
const meta=(h,n)=>{const m=h.match(new RegExp(`<meta[^>]+(?:name|property)=["']${n}["'][^>]*>`,'i'));const c=m&&m[0].match(/content=["']([^"']*)["']/i);return c?c[1]:''}
const c=(k,ok,cat)=>({k,ok:!!ok,cat})
function analyse(html,url){const title=((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'').replace(/\s+/g,' ').trim().slice(0,120),desc=meta(html,'description').slice(0,200)
const links=[...new Set([...html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)].map(m=>m[1]))].slice(0,200)
const soc=['instagram','facebook','youtube','linkedin','twitter','tiktok','pinterest'].filter(s=>links.some(l=>l.includes(s)))
const tech=/wp-content/.test(html)?'WordPress':/wixstatic|wix\.com/.test(html)?'Wix':/cdn\.shopify/.test(html)?'Shopify':/webflow/.test(html)?'Webflow':/squarespace/.test(html)?'Squarespace':'custom/unknown'
const checks=[c('HTTPS secure',url.startsWith('https'),'software'),c('Mobile friendly',/<meta[^>]+name=["']viewport/i.test(html),'software'),
c('Chatbot / live chat',/tawk\.to|intercom|crisp\.chat|tidio|drift|livechat|zendesk|wati|gupshup|botpress|chatbot/i.test(html),'software'),
c('WhatsApp button',/wa\.me|api\.whatsapp|whatsapp/i.test(html),'software'),c('Online booking',/calendly|booksy|setmore|book (now|a)|appointment/i.test(html),'software'),
c('Online payment / cart',/razorpay|stripe|paypal|payu|cashfree|add to cart|checkout/i.test(html),'software'),c('Lead / contact form',/<form/i.test(html),'software'),
c('SEO title + description',title.length>10&&desc,'marketing'),c('Clear H1 heading',/<h1/i.test(html),'marketing'),c('Social share tags',meta(html,'og:title'),'marketing'),
c('Structured data (schema)',/application\/ld\+json/.test(html),'marketing'),c('Analytics / pixels',/googletagmanager|google-analytics|gtag\(|fbq\(|connect\.facebook\.net/.test(html),'marketing'),c('Social profiles linked (2+)',soc.length>=2,'marketing')]
return{title,desc,tech,social:soc,checks,text:strip(html).slice(0,1400),links}}
async function tavily(q){const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+E.TAVILY_KEY},body:JSON.stringify({query:q,max_results:5,search_depth:'basic'})})
if(!r.ok)return[];return((await r.json()).results||[]).map(x=>({title:x.title,url:x.url,snippet:(x.content||'').slice(0,280)}))}
async function groq(messages){for(const model of [E.GROQ_MODEL||'openai/gpt-oss-120b','llama-3.3-70b-versatile','llama-3.1-8b-instant']){
const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+E.GROQ_KEY},
body:JSON.stringify({model,messages,temperature:.3,max_tokens:2400,...(model.includes('gpt-oss')?{reasoning_effort:'low'}:{}),response_format:{type:'json_object'}})})
if(r.ok){try{const t=(await r.json()).choices[0].message.content;return JSON.parse(t.match(/\{[\s\S]*\}/)[0])}catch{}}}
throw new Error('AI is busy right now. Try again in a minute.')}
async function quota(fs,user,adm){const day=new Date().toISOString().slice(0,10),gk='usage/g_'+day,uk=`usage/${user.uid}_${day}`
const[g,u]=await Promise.all([fs.get(gk),fs.get(uk)]);const gn=g?.n||0,un=u?.n||0
if(!adm&&un>=3)return'You used your 3 free audits today. Try again tomorrow.';if(gn>=40)return'Free capacity for today is full. Try again tomorrow.'
await Promise.all([fs.set(gk,{n:gn+1}),fs.set(uk,{n:un+1})]);return null}

async function scout(req){const fs=FS();let jid
try{const tok=(req.headers.get('authorization')||'').replace('Bearer ','');const user=await verify(tok,fs.pid)
const adm=ADMINS.includes(user.email)&&user.verified;const b=await req.json()
let name=String(b.name||'').slice(0,100).trim(),link=String(b.link||'').slice(0,300).trim(),city=String(b.city||'').slice(0,60).trim()
if(!name&&!link)return{status:400,body:{error:'Enter a business name or link.'}}
if(link&&!/^https?:\/\//i.test(link))link='https://'+link
jid=/^[a-zA-Z0-9]{10,40}$/.test(b.jobId||'')?b.jobId:crypto.randomUUID().replace(/-/g,'')
const input={name,link,city},path='scouts/'+jid,step=s=>fs.update(path,{step:s}).catch(()=>{})
if(link){try{const d=dom(link);const hit=(await fs.query('scouts',['domain',d],8)).filter(x=>x.status==='done'&&x.createdAt&&Date.now()-x.createdAt.getTime()<7*864e5).sort((x,y)=>y.createdAt-x.createdAt)[0]
if(hit){await fs.create('scouts',jid,{uid:user.uid,email:user.email,input,domain:d,status:'done',step:'Done',cached:true,checks:hit.checks,score:hit.score,report:hit.report,sources:hit.sources||[],createdAt:new Date()});return{body:{id:jid}}}}catch(e){if(/duplicate|409/i.test(e.message))throw e}}
const q=await quota(fs,user,adm);if(q)return{status:429,body:{error:q}}
await fs.create('scouts',jid,{uid:user.uid,email:user.email,input,status:'running',step:'Starting…',createdAt:new Date()})
let sources=[],snips=[],sig=null,pages=[],domain=''
if(!link){await step('Searching the web for the official website…');const r=await tavily(`${name} ${city} official website`);sources.push(...r.map(x=>x.url))
const f=r.find(x=>{try{return !SKIP.test(new URL(x.url).hostname)}catch{return false}});if(f)link=new URL(f.url).origin}
if(link){domain=dom(link);await step('Reading '+domain+'…');const o0=new URL(link),ok=await robots(o0.origin)
if(!ok(o0.pathname||'/'))throw new Error('This website asks bots not to read it (robots.txt). Respecting that.')
const home=await get(link);sig=analyse(home.html,home.url);pages.push(sig.text)
const o=new URL(home.url);const more=[...new Set(sig.links.map(l=>{try{return new URL(l,o).href}catch{return null}}).filter(l=>l&&new URL(l).origin===o.origin&&/about|team|contact|service|portfolio|work|product/i.test(l)))].slice(0,2)
for(const m of more){try{if(ok(new URL(m).pathname)){const p=await get(m);pages.push(strip(p.html.slice(0,60000)).slice(0,1000))}}catch{}}
sources.push(home.url)}
if(!name&&sig)name=sig.title
await step('Looking for public team and brand info…');snips=await tavily(`${name} ${city} founder owner team`);sources.push(...snips.map(x=>x.url))
await step('Matching with Kelvora network…')
const[bs,sv]=await Promise.all([fs.query('businesses',['verified',true],40),fs.query('services',null,20)])
const P=bs.filter(x=>!domain||!x.link||!x.link.includes(domain))
const checks=sig?sig.checks:[...['HTTPS secure','Mobile friendly','Chatbot / live chat','WhatsApp button','Online booking','Online payment / cart','Lead / contact form'].map(k=>c(k,false,'software')),...['SEO title + description','Clear H1 heading','Social share tags','Structured data (schema)','Analytics / pixels','Social profiles linked (2+)'].map(k=>c(k,false,'marketing'))]
const score=Math.round(100*checks.filter(x=>x.ok).length/checks.length)
await step('AI is writing the report…')
const rep=await groq([{role:'system',content:SYS},{role:'user',content:JSON.stringify({subject:{name,city,link:link||'NO WEBSITE FOUND',title:sig?.title,desc:sig?.desc,tech:sig?.tech,social:sig?.social,excerpt:pages.join(' | ').slice(0,3000)},passed:checks.filter(x=>x.ok).map(x=>x.k),missing:checks.filter(x=>!x.ok).map(x=>x.k),search:snips,
kelvora:{services:sv.map(d=>({title:d.title,category:d.category})),agents:AGENTS},partners:P.slice(0,25).map(x=>({id:x.id,name:x.name,category:x.category,about:(x.desc||'').slice(0,110)}))})}])
rep.partners=(rep.partners||[]).map(p=>{const x=P.find(y=>y.id===p.id);return x?{...p,name:x.name,category:x.category}:null}).filter(Boolean)
await fs.update(path,{status:'done',step:'Done',domain,checks,score,report:rep,sources:[...new Set(sources)].slice(0,10),cached:false})
return{body:{id:jid}}}catch(e){try{if(jid)await fs.update('scouts/'+jid,{status:'error',step:e.message})}catch{}
return{status:500,body:{error:e.message||'Failed'}}}}

export default{async fetch(req,env){E=env;const o=req.headers.get('origin')||'';const cors={'access-control-allow-origin':okOrigin(o)?o:ORIGINS[0],'access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'POST,OPTIONS',vary:'origin'}
if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors})
if(req.method!=='POST')return new Response('Kelvora Scout API',{headers:cors})
const out=await scout(req).catch(e=>({status:500,body:{error:e.message||'Failed'}}))
return new Response(JSON.stringify(out.body),{status:out.status||200,headers:{...cors,'content-type':'application/json'}})}}
