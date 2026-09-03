import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Headphones, CreditCard, Settings2, ArrowRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const services = ['General Service', 'Customer Support', 'Payment', 'Technical Support'];
const icons = [Users, Headphones, CreditCard, Settings2];

export default function JoinQueue() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [service, setService] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!service) return setError('Please select a service.');
    setLoading(true);
    try {
      const r = await api.post('/queue/join', { serviceType: service });
      nav('/queue/status', { state: { queueNumber: r.data.data.queueNumber } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join queue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <span className="pill">STEP 01</span>
        <h2>Join the queue</h2>
        <p>Hi {user?.fullName?.split(' ')[0]} — pick a service and we will reserve your spot in line.</p>
      </div>
      <form className="form-card" onSubmit={submit}>
        <label>Your name
          <input value={user?.fullName || ''} disabled />
        </label>
        <label>Choose a service
          <div className="service-grid">
            {services.map((s, i) => {
              const I = icons[i];
              return (
                <button type="button" key={s} className={'service ' + (service === s ? 'selected' : '')} onClick={() => setService(s)}>
                  <I /><span>{s}</span>
                </button>
              );
            })}
          </div>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn primary full" disabled={loading}>{loading ? 'Joining…' : 'Get Queue Number'} <ArrowRight size={18} /></button>
      </form>
    </div>
  );
}