import {useState,useEffect,useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import {collection,addDoc,serverTimestamp} from 'firebase/firestore'
import {db,login} from './firebase.js'
import {useVerified} from './Verified.jsx'
import {toast} from './Ui.jsx'

const KB=[
{k:['hi','hii','hello','hey','namaste','namaskar'],a:"Hi! 👋 I'm Kelvora Bot. Ask me anything or tap a topic below."},
{k:['my status','am i verified','status of my','my verification','my account'],a:({u,ver})=>!u?'Please sign in first and I can check your status.':ver?'✅ You are verified. The Business Network is unlocked and you can edit your profile and widget link from the Dashboard.':'Open your Dashboard and check the Verification chat for the review status. Not registered yet? Use Register.',go:['Open Dashboard','/dashboard']},
{k:['how it works','workflow','process','steps','pipeline','kasa kaam','kase chalte'],a:"The full flow:\n1) Sign in with Google\n2) Register your business\n3) A private Verification chat opens with our team\n4) Once verified you can edit your profile, add your widget link and join the Network\n5) Order services from the Store\n6) Track orders and answer notices in your Dashboard",go:['Register now','/register']},
{k:['what do you do','services','service','kay karta','software','app','website','web','kaam'],a:'Kelvora Infotech builds custom web apps, software and AI agents that cut manual work and grow your business. We also run marketing: social media, video editing and motion graphics.',go:['Browse Store','/store']},
{k:['ai','agent','agents','automation','automate','chatbot'],a:'Our AI agents handle repetitive work: answering leads, following up on orders, sending reminders and reports, so your team saves hours every week.',go:['See AI Agents','/agents']},
{k:['marketing','social','instagram','video','edit','editing','motion','graphics','reels','reel'],a:'Our creative team does social media management, video editing, motion graphics, reels and posts. Order a package from the Store or message us.',go:['Open Store','/store']},
{k:['register','signup','join','nondani','add business','list my'],a:'Sign in, open Register, fill your business details and submit. A private verification chat with our team opens instantly.',go:['Register','/register']},
{k:['verify','verification','verified','approved','approval','pending'],a:'After you register, our team reviews your business in your Verification chat (Dashboard). When verified you get a ✅ message, the Network unlocks and you can add your widget link and edit your profile any time.',go:['Open Dashboard','/dashboard']},
{k:['network','collaborate','partner','partners','connect'],a:'Anyone can browse the Business Network and view profiles. Only verified businesses can chat and collaborate. Registering your business is optional.',go:['Open Network','/network']},
{k:['widget','embed','preview','widgets'],a:'A widget is your website or tool link. Add it when registering or later from the Dashboard (or your Verification chat) once verified. Others can open it and see a live preview on your profile page.',go:['Open Dashboard','/dashboard']},
{k:['edit','change','update','profile','logo','presentation','approve','approval','upload','instagram','linkedin','gallery'],a:'Open Dashboard → My business profile → Edit profile. Upload your logo and cover, add Instagram, LinkedIn and Google links, services and photos. Submit for approval: our team reviews it and your public page updates once approved. Visitors can also view it as a full-screen presentation.',go:['Open Dashboard','/dashboard']},
{k:['order','orders','buy','purchase','track','tracking','delivery','due'],a:'Choose a service in the Store and tap Order now. Track progress (Received → In progress → Delivered), payment and due date in your Dashboard.',go:['Open Store','/store']},
{k:['price','pricing','cost','charges','paise','kiti','budget','quote','rate'],a:'Store services show their price. For custom software or AI agents, tell us your requirement and we will send a quote.',go:['See Store','/store']},
{k:['store','shop','catalog','packages'],a:'The Store lists our services and marketing packages. Sign in, tap Order now, done.',go:['Open Store','/store']},
{k:['notification','notifications','questionnaire','reminder','reminders','notice'],a:'Our team may send you reminders or a widget questionnaire. They appear under 🔔 Notifications in your Dashboard (a red badge shows new ones). Fill the answers and submit.',go:['Open Dashboard','/dashboard']},
{k:['pay','payment','payments','invoice','razorpay','upi'],a:'Payment status is shown on each order. Our team will share payment details in your order chat or by email. Online payments are coming soon.'},
{k:['login','sign in','signin','google','account'],a:'We use Google sign-in: one tap, no passwords. Use the Sign in button at the top.'},
{k:['dashboard'],a:'Your Dashboard shows notifications, chats, orders and your business profile in one place.',go:['Open Dashboard','/dashboard']},
{k:['portfolio','past work','demo','showreel','samples'],a:'See our videos and verified businesses in the Portfolio.',go:['Open Portfolio','/portfolio']},
{k:['audit','scout','analyse','analyze','free audit','review my website','website check'],a:'Try our Free AI Business Audit: enter a business name or website and get software + marketing gaps, AI agent ideas and partner suggestions. 3 free audits a day.',go:['Free AI Audit','/audit']},
{k:['secure','safe','security','privacy','data'],a:'Your data lives in Google Firebase with strict access rules: you only see your own orders and chats. Only the Kelvora admins can manage them.'},
{k:['contact','support','help','talk','call','inquiry','human','team','email'],a:'Ask here and tap "Send to our team", or sign in and use the contact box on the home page. Replies come in your Dashboard chat.',team:true},
{k:['admin'],a:'The admin panel is private to the Kelvora team. It manages clients, orders, employees, verification and finance.'},
{k:['thanks','thank','thx','ok','great','nice','shukriya','dhanyavad'],a:"You're welcome! 😊 Anything else?"}]
const CH=['What do you do?','Register my business','Verification','Business Network','Orders & tracking','Pricing','How it works','Talk to team']

export default function Bot({u}){const[open,setO]=useState(false);const[ms,setMs]=useState([{r:'ai',t:KB[0].a}]);const[t,setT]=useState('');const[typ,setTyp]=useState(false)
const nav=useNavigate();const ver=useVerified(u);const end=useRef()
useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth'})},[ms,typ,open])
const find=q=>{const s=q.toLowerCase();const tk=s.split(/[^a-z0-9\u0900-\u097f]+/);let b=null,sc=0
KB.forEach(e=>{const n=e.k.filter(w=>w.length<=3&&!w.includes(' ')?tk.includes(w):s.includes(w)).length;if(n>sc){sc=n;b=e}});return b}
const ask=q=>{q=q.trim();if(!q)return;setT('');setMs(m=>[...m,{r:'me',t:q}]);setTyp(true)
setTimeout(()=>{const e=find(q);setTyp(false)
setMs(m=>[...m,e?{r:'ai',t:typeof e.a==='function'?e.a({u,ver}):e.a,go:e.go,team:e.team,q}:{r:'ai',t:"I'm not sure about that yet. Pick a topic below or send your question to our team.",team:true,q}])},550)}
const toTeam=async q=>{if(!u)return login();await addDoc(collection(db,'threads'),{uid:u.uid,members:[u.uid],email:u.email,subject:'Question from chatbot',last:q||'Hello',status:'open',t:serverTimestamp()}).then(r=>addDoc(collection(db,'threads',r.id,'messages'),{text:q||'Hello, I need help.',from:u.email,t:serverTimestamp()}))
toast('Sent to our team. Reply will come in your Dashboard');setO(false);nav('/dashboard')}
return <>{!open&&<button className="fab" onClick={()=>setO(true)} aria-label="Chat">💬</button>}
{open&&<div className="bot"><div className="bh2"><b>🤖 Kelvora Bot</b><button className="s" onClick={()=>setO(false)}>✕</button></div>
<div className="bm">{ms.map((m,i)=><div key={i} className={'bb '+m.r}>{m.t.split('\n').map((l,j)=><div key={j}>{l}</div>)}
{m.go&&<button className="s" onClick={()=>{nav(m.go[1]);setO(false)}}>{m.go[0]} →</button>}{m.team&&<button className="s" onClick={()=>toTeam(m.q)}>📨 Send to our team</button>}</div>)}
{typ&&<div className="bb ai"><span className="dts"><i/><i/><i/></span></div>}<div ref={end}/></div>
<div className="chips">{CH.map(c=><button key={c} className="s" onClick={()=>ask(c)}>{c}</button>)}</div>
<form onSubmit={e=>{e.preventDefault();ask(t)}} style={{display:'flex',gap:8,maxWidth:'none'}}><input value={t} onChange={e=>setT(e.target.value)} placeholder="Ask anything…" style={{flex:1}}/><button>➤</button></form></div>}</>}
