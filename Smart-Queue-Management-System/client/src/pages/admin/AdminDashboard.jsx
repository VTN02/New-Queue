import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle, XCircle, Ticket, Timer, RefreshCw, Check, X, LayoutDashboard } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

function Metric({ icon: I, label, value }) {
  return <div className="metric"><I /><small>{label}</small><strong>{value}</strong></div>;
}

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState('');

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users/pending')]);
      setStats(a.data.data);
      setPending(b.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load stats.');
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (type, id) => {
    setBusy(id);
    try {
      const r = await api.put(`/admin/users/${id}/${type}`);
      toast.success(r.data.message);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed.');
    } finally {
      setBusy('');
    }
  };

  if (!stats) return <div className="page"><p className="empty">Loading dashboard…</p></div>;

  return (
    <div className="page">
      <div className="dashboard-head">
        <div>
          <span className="pill">ADMIN DASHBOARD</span>
          <h2>Overview</h2>
          <p>System statistics, pending approvals and queue health.</p>
        </div>
        <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
      </div>

      <div className="cards">
        <Metric icon={Users} label="Total Users" value={stats.totalUsers} />
        <Metric icon={Clock} label="Pending Users" value={stats.pending} />
        <Metric icon={CheckCircle} label="Approved Users" value={stats.approved} />
        <Metric icon={XCircle} label="Rejected Users" value={stats.rejected} />
        <Metric icon={Timer} label="Active Queues" value={stats.waiting + stats.serving} />
        <Metric icon={CheckCircle} label="Completed Queues" value={stats.completed} />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>Pending approvals</h3>
            <Link className="btn secondary small-btn" to="/admin/pending-users">View all</Link>
          </div>
          {pending.length === 0 && <p className="empty">No pending registrations 🎉</p>}
          {pending.map((u) => (
            <div className="row" key={u._id}>
              <div className="avatar">{u.fullName[0]}</div>
              <div className="person">
                <b>{u.fullName}</b>
                <small>{u.email} • {new Date(u.createdAt).toLocaleDateString()}</small>
              </div>
              <button className="btn primary mini" disabled={busy === u._id} onClick={() => act('approve', u._id)}><Check size={14} /> Approve</button>
              <button className="btn danger mini" disabled={busy === u._id} onClick={() => act('reject', u._id)}><X size={14} /> Reject</button>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Queue overview</h3>
          <div className="info-row"><small>Currently serving</small><b>{stats.serving ? `#${String(stats.serving).padStart(2, '0')}` : '—'}</b></div>
          <div className="info-row"><small>Total waiting</small><b>{stats.waiting}</b></div>
          <div className="info-row"><small>Completed today</small><b>{stats.completedToday}</b></div>
          <div className="info-row"><small>Total queues</small><b>{stats.totalQueues}</b></div>
          <Link className="btn secondary small-btn full" to="/admin/queue"><LayoutDashboard size={15} /> Manage queue</Link>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Active services</h3>
        {stats.services.map((s) => (
          <div className="bar-row" key={s._id}><span>{s._id}</span><b>{s.count}</b></div>
        ))}
      </div>
    </div>
  );
}