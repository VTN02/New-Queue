import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

function Stat({ label, value }) { return <div className="stat"><small>{label}</small><strong>{value}</strong></div>; }

export default function QueueStatus() {
  const [num, setNum] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const state = useLocation().state;

  const load = async (n) => {
    try {
      setError('');
      const r = await api.get('/queue/status/' + n);
      setData(r.data.data);
    } catch (e) {
      setData(null);
      setError(e.response?.data?.message || 'Queue not found.');
    }
  };

  useEffect(() => {
    if (state?.queueNumber) {
      setNum(state.queueNumber);
      load(state.queueNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="page-head">
        <span className="pill">TRACK</span>
        <h2>Queue status</h2>
        <p>Enter your queue number to see your live position.</p>
      </div>
      <div className="lookup">
        <input value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, ''))} placeholder="Queue number" />
        <button className="btn primary" onClick={() => num && load(num)}>Check</button>
      </div>
      {error && <div className="error">{error}</div>}
      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="status-grid">
          <div className="status-main">
            <span className="pill">YOUR NUMBER</span>
            <div className="queue-number">#{String(data.user.queueNumber).padStart(2, '0')}</div>
            <h3>{data.user.name}</h3>
            <p>{data.user.serviceType}</p>
            <span className={'status ' + data.user.status}>{data.user.status}</span>
          </div>
          <div className="stats">
            <Stat label="Currently serving" value={data.currentlyServing ? `#${String(data.currentlyServing).padStart(2, '0')}` : '—'} />
            <Stat label="People ahead" value={data.peopleAhead} />
            <Stat label="Approx. wait" value={`${data.approximateMinutes} min`} />
          </div>
        </motion.div>
      )}
    </div>
  );
}