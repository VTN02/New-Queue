import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [live, setLive] = useState(null);

  useEffect(() => {
    api.get('/queue/summary')
      .then((r) => setLive(r.data.data))
      .catch(() => {});
  }, []);

  const dashboardPath = user ? (user.role === 'Admin' ? '/admin/dashboard' : '/dashboard') : null;

  return (
    <section className="hero">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="pill">LIVE QUEUE SYSTEM</span>
        <h1>Skip the uncertainty.<br /><em>Know your place.</em></h1>
        <p>Join a digital queue, track your position in real time, and get served without standing in line.</p>
        <div className="actions">
          {dashboardPath ? (
            <Link className="btn primary" to={dashboardPath}>Open my dashboard <ArrowRight size={18} /></Link>
          ) : (
            <>
              <Link className="btn primary" to="/register">Join Queue <ArrowRight size={18} /></Link>
              <Link className="btn secondary" to="/login">Sign In</Link>
            </>
          )}
        </div>
      </motion.div>
      <div className="hero-card">
        <div className="mini-label">CURRENTLY SERVING</div>
        <div className="big-number">{live?.currentlyServing ? String(live.currentlyServing).padStart(2, '0') : '—'}</div>
        <div className="serving">{live?.serviceType || 'No one is being served right now'}</div>
        <div className="live"><span /> {live ? `${live.waiting} waiting in queue` : 'Live now'}</div>
      </div>
    </section>
  );
}