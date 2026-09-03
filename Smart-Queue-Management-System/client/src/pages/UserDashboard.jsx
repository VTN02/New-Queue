import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock, Timer, CheckCircle, Users, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon: I, label, value }) {
  return <div className="metric"><I /><small>{label}</small><strong>{value}</strong></div>;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const r = await api.get('/users/dashboard');
      setD(r.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load dashboard.');
    }
  };

  useEffect(() => { load(); }, []);
  if (!d && !error) return <div className="page"><p className="empty">Loading dashboard…</p></div>;

  const q = d?.currentQueue;

  return (
    <div className="page">
      <div className="dashboard-head">
        <div>
          <span className="pill">USER DASHBOARD</span>
          <h2>Welcome, {user?.fullName?.split(' ')[0]}</h2>
          <p>Here is your current queue activity at a glance.</p>
        </div>
        <div className="actions">
          <Link className="btn secondary" to="/queue">Join Queue <ArrowRight size={18} /></Link>
          <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="cards">
        <StatCard icon={Ticket} label="Current Queue Number" value={q ? `#${String(q.queueNumber).padStart(2, '0')}` : '—'} />
        <StatCard icon={Users} label="Current Position" value={q ? (q.position || '—') : '—'} />
        <StatCard icon={Timer} label="Estimated Waiting Time" value={q ? `${q.approximateMinutes} min` : '—'} />
        <StatCard icon={CheckCircle} label="Completed Queues" value={d?.completedCount ?? 0} />
      </div>

      <div className="quick-actions">
        <Link to="/queue"><Ticket size={18} /> Join Queue</Link>
        <Link to="/queue/status"><Clock size={18} /> Queue Status</Link>
        <Link to="/queue/history"><CheckCircle size={18} /> Queue History</Link>
        <Link to="/profile"><Users size={18} /> My Profile</Link>
      </div>

      {q ? (
        <div className="status-grid">
          <div className="status-main">
            <span className="pill">YOUR QUEUE</span>
            <div className="queue-number">#{String(q.queueNumber).padStart(2, '0')}</div>
            <h3>{q.serviceType}</h3>
            <p>Joined {new Date(q.joinedAt).toLocaleString()}</p>
            <span className={'status ' + q.status}>{q.status}</span>
          </div>
          <div className="stats">
            <div className="stat"><small>Currently serving</small><strong>{q.currentlyServing ? `#${String(q.currentlyServing).padStart(2, '0')}` : '—'}</strong></div>
            <div className="stat"><small>Your position</small><strong>{q.position || 'Serving now'}</strong></div>
            <div className="stat"><small>Estimated waiting</small><strong>{q.approximateMinutes} min</strong></div>
          </div>
        </div>
      ) : (
        <div className="empty-card">
          <Users size={34} />
          <h3>You are not currently in a queue</h3>
          <p>Join a queue to get a number and track your position in real time.</p>
          <Link className="btn primary" to="/queue">Join Queue <ArrowRight size={18} /></Link>
        </div>
      )}
    </div>
  );
}