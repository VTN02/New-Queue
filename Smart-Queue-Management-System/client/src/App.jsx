import React,{useEffect,useState} from 'react';
import {Routes,Route,Link,useNavigate,useLocation} from 'react-router-dom';
import {Users,Ticket,LayoutDashboard,Home as HomeIcon,ArrowRight,CheckCircle,Clock,Headphones,CreditCard,Settings2,RefreshCw} from 'lucide-react';
import {motion} from 'framer-motion';
import api from './api';

const services=['General Service','Customer Support','Payment','Technical Support'];
const icons=[Users,Headphones,CreditCard,Settings2];

function Layout({children}){
 const loc=useLocation();
 return <div className="app"><header><Link className="brand" to="/"><span className="logo">Q</span> QueueFlow</Link><nav>
 {[[ '/', 'Home',HomeIcon],['/join','Join Queue',Ticket],['/status','Queue Status',Clock],['/dashboard','Dashboard',LayoutDashboard]].map(([p,t,I])=><Link className={loc.pathname===p?'active':''} to={p}><I size={17}/>{t}</Link>)}
 </nav></header><main>{children}</main><footer>Smart Queue Management • MERN Stack</footer></div>
}

function Home(){return <section className="hero"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><span className="pill">LIVE QUEUE SYSTEM</span><h1>Skip the uncertainty.<br/><em>Know your place.</em></h1><p>Join a digital queue, track your position in real time, and get served without standing in line.</p><div className="actions"><Link className="btn primary" to="/join">Join Queue <ArrowRight size={18}/></Link><Link className="btn secondary" to="/status">Check Status</Link></div></motion.div><div className="hero-card"><div className="mini-label">CURRENTLY SERVING</div><div className="big-number">03</div><div className="serving">Payment Service</div><div className="live"><span/> Live now</div></div></section>}

function Join(){const nav=useNavigate();const [name,setName]=useState('');const [service,setService]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);
 const submit=async e=>{e.preventDefault();setError('');if(name.trim().length<2)return setError('Enter a valid name (at least 2 characters).');if(!service)return setError('Please select a service.');setLoading(true);try{const r=await api.post('/queue/join',{name,serviceType:service});nav('/status',{state:{queueNumber:r.data.data.queueNumber}})}catch(e){setError(e.response?.data?.message||'Could not join queue.')}finally{setLoading(false)}};
 return <div className="page"><div className="page-head"><span className="pill">STEP 01</span><h2>Join the queue</h2><p>Tell us who you are and what service you need.</p></div><form className="form-card" onSubmit={submit}><label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Kasun Perera"/></label><label>Choose a service<div className="service-grid">{services.map((s,i)=>{const I=icons[i];return <button type="button" className={'service '+(service===s?'selected':'')} onClick={()=>setService(s)}><I/><span>{s}</span></button>})}</div></label>{error&&<div className="error">{error}</div>}<button className="btn primary full" disabled={loading}>{loading?'Joining...':'Get Queue Number'} <ArrowRight size={18}/></button></form></div>}

function Status(){const [num,setNum]=useState('');const [data,setData]=useState(null);const [error,setError]=useState('');const state=useLocation().state;
 useEffect(()=>{if(state?.queueNumber){setNum(state.queueNumber);load(state.queueNumber)}},[]);
 const load=async n=>{try{setError('');const r=await api.get('/queue/status/'+n);setData(r.data.data)}catch(e){setData(null);setError(e.response?.data?.message||'Queue not found.')}};
 return <div className="page"><div className="page-head"><span className="pill">TRACK</span><h2>Queue status</h2><p>Enter your queue number to see your live position.</p></div><div className="lookup"><input value={num} onChange={e=>setNum(e.target.value.replace(/\D/g,''))} placeholder="Queue number"/><button className="btn primary" onClick={()=>num&&load(num)}>Check</button></div>{error&&<div className="error">{error}</div>}{data&&<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="status-grid"><div className="status-main"><span className="pill">YOUR NUMBER</span><div className="queue-number">#{String(data.user.queueNumber).padStart(2,'0')}</div><h3>{data.user.name}</h3><p>{data.user.serviceType}</p><span className={'status '+data.user.status}>{data.user.status}</span></div><div className="stats"><Stat label="Currently serving" value={data.currentlyServing?`#${String(data.currentlyServing).padStart(2,'0')}`:'—'}/><Stat label="People ahead" value={data.peopleAhead}/><Stat label="Approx. wait" value={`${data.approximateMinutes} min`}/></div></motion.div>}</div>}
function Stat({label,value}){return <div className="stat"><small>{label}</small><strong>{value}</strong></div>}

function Dashboard(){const [d,setD]=useState(null),[items,setItems]=useState([]);const load=async()=>{const [a,b]=await Promise.all([api.get('/queue/dashboard'),api.get('/queue')]);setD(a.data.data);setItems(b.data.data)};useEffect(()=>{load()},[]);
 const next=async()=>{try{await api.post('/queue/next');load()}catch(e){alert(e.response?.data?.message||'No waiting customer')}};const complete=async id=>{await api.put('/queue/'+id+'/complete');load()};
 if(!d)return <div className="page"><p>Loading dashboard...</p></div>;
 return <div className="page"><div className="dashboard-head"><div><span className="pill">OPERATIONS</span><h2>Queue dashboard</h2><p>Monitor and manage today's service flow.</p></div><button className="btn primary" onClick={next}><Ticket size={18}/> Call next</button></div><div className="cards"><Card icon={Clock} label="Waiting" value={d.waiting}/><Card icon={Ticket} label="Serving" value={d.serving}/><Card icon={CheckCircle} label="Completed" value={d.completed}/><Card icon={Users} label="Total" value={d.total}/></div><div className="dashboard-grid"><div className="panel"><div className="panel-title"><h3>Queue list</h3><button className="icon-btn" onClick={load}><RefreshCw size={16}/></button></div><div className="queue-list">{items.map(x=><div className="row"><div className="avatar">{x.name[0]}</div><div className="person"><b>#{String(x.queueNumber).padStart(2,'0')} · {x.name}</b><small>{x.serviceType}</small></div><span className={'status '+x.status}>{x.status}</span>{x.status==='serving'&&<button className="complete" onClick={()=>complete(x._id)}>Complete</button>}</div>)}</div></div><div className="panel"><h3>Services</h3>{d.services.map(s=><div className="bar-row"><span>{s._id}</span><b>{s.count}</b></div>)}</div></div></div>}
function Card({icon:I,label,value}){return <div className="metric"><I/><small>{label}</small><strong>{value}</strong></div>}

export default function App(){return <Layout><Routes><Route path="/" element={<Home/>}/><Route path="/join" element={<Join/>}/><Route path="/status" element={<Status/>}/><Route path="/dashboard" element={<Dashboard/>}/></Routes></Layout>}
