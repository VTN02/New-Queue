import { useEffect, useState } from 'react';
import { Ticket, Users, CheckCircle, Clock, RefreshCw, Trash2 } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';

function Card({ icon: I, label, value }) {
  return <div className="metric"><I /><small>{label}</small><strong>{value}</strong></div>;
}

export default function AdminQueue() {
  const toast = useToast();
  const [d, setD] = useState(null);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.get('/queue/dashboard'), api.get('/queue')]);
      setD(a.data.data);
      setItems(b.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load queue.');
    }
  };

  useEffect(() => { load(); }, []);

  const next = async () => {
    setBusy(true);
    try {
      const r = await api.post('/queue/next');
      toast.success(`Queue #${r.data.data.queueNumber} is now serving.`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'No waiting customer.');
    } finally {
      setBusy(false);
    }
  };

  const complete = async (id) => {
    setBusy(true);
    try {
      await api.put(`/queue/${id}/complete`);
      toast.success('Customer completed.');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Complete failed.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      await api.delete('/queue/reset');
      toast.success('Queue has been reset.');
      setConfirm(false);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reset failed.');
    } finally {
      setBusy(false);
    }
  };

  if (!d) return <div className="page"><p className="empty">Loading queue…</p></div>;

  return (
    <div className="page">
      <div className="dashboard-head">
        <div>
          <span className="pill">OPERATIONS</span>
          <h2>Queue dashboard</h2>
          <p>Monitor today's service flow and manage the live queue.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={next} disabled={busy}><Ticket size={18} /> Call next</button>
          <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
        </div>
      </div>

      <div className="cards">
        <Card icon={Clock} label="Waiting" value={d.waiting} />
        <Card icon={Ticket} label="Serving" value={d.serving} />
        <Card icon={CheckCircle} label="Completed" value={d.completed} />
        <Card icon={Users} label="Total" value={d.total} />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>Queue list</h3>
            <div className="actions">
              <button className="btn danger mini" onClick={() => setConfirm(true)}><Trash2 size={14} /> Reset queue</button>
            </div>
          </div>
          {items.length === 0 && <p className="empty">The queue is empty.</p>}
          {items.map((x) => (
            <div className="row" key={x._id}>
              <div className="avatar">{x.name[0]}</div>
              <div className="person">
                <b>#{String(x.queueNumber).padStart(2, '0')} · {x.name}</b>
                <small>{x.serviceType}</small>
              </div>
              <span className={'status ' + x.status}>{x.status}</span>
              {x.status === 'serving' && (
                <button className="complete" disabled={busy} onClick={() => complete(x._id)}>Complete</button>
              )}
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Services</h3>
          {d.services.map((s) => (
            <div className="bar-row" key={s._id}><span>{s._id}</span><b>{s.count}</b></div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        danger
        title="Reset queue"
        message="This will permanently delete ALL queue records. This cannot be undone."
        confirmLabel="Reset everything"
        onConfirm={reset}
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}