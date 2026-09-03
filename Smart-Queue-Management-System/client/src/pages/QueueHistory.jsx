import { useEffect, useState } from 'react';
import { RefreshCw, ListOrdered } from 'lucide-react';
import api from '../api';

const rowVariant = (st) => (st === 'completed' ? '' : st);

export default function QueueHistory() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const r = await api.get('/users/queue-history');
      setItems(r.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load queue history.');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="dashboard-head">
        <div>
          <span className="pill">HISTORY</span>
          <h2>Queue history</h2>
          <p>Track all of your previous queue activity.</p>
        </div>
        <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
      </div>
      {error && <div className="error">{error}</div>}
      {!items && !error && <p className="empty">Loading…</p>}
      {items && items.length === 0 && (
        <div className="empty-card">
          <ListOrdered size={34} />
          <h3>No queue history yet</h3>
          <p>Once you join a queue, your history will appear here.</p>
        </div>
      )}
      {items && items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Queue No</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id} className={rowVariant(i.status)}>
                  <td><b>#{String(i.queueNumber).padStart(2, '0')}</b></td>
                  <td>{i.serviceType}</td>
                  <td>{i.joinedAt ? new Date(i.joinedAt).toLocaleDateString() : '—'}</td>
                  <td>{i.joinedAt ? new Date(i.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td><span className={'status ' + i.status}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}