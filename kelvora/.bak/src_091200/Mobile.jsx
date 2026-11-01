import {Link,useLocation} from 'react-router-dom'
import {login} from './firebase.js'
export default function Tabs({u}){const{pathname:p}=useLocation()
const T=[['/','🏠','Home'],['/network','🌐','Network'],['/agents','🤖','Agents'],['/audit','🔍','Audit']]
return <div className="mtabs">{T.map(([h,i,l])=><Link key={h} to={h} className={p===h?'on':''}><i>{i}</i>{l}</Link>)}
{u?<Link to="/dashboard" className={p==='/dashboard'?'on':''}><i>👤</i>Me</Link>:<button onClick={login}><i>👤</i>Sign in</button>}</div>}
