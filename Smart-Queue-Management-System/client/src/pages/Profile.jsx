import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Field({ label, value }) {
  return <div className="info-row"><small>{label}</small><b>{value || '—'}</b></div>;
}

export default function Profile() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.put('/users/profile', { fullName, phoneNumber });
      await refresh();
      toast.success(r.data.message || 'Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <span className="pill">MY PROFILE</span>
        <h2>Profile</h2>
        <p>View your account details and update your information.</p>
      </div>
      <div className="profile-grid">
        <form className="form-card" onSubmit={save}>
          <label>Full Name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label>Phone Number
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn primary full" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'} <Save size={17} /></button>
        </form>
        <div className="panel">
          <h3>Account details</h3>
          <Field label="Full name" value={user?.fullName} />
          <Field label="Email" value={user?.email} />
          <Field label="Phone number" value={user?.phoneNumber} />
          <Field label="Role" value={user?.role} />
          <div className="info-row"><small>Status</small><span className={'status ' + String(user?.status || '').toLowerCase()}>{user?.status}</span></div>
          <Field label="Registered" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
          <Field label="Last login" value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'} />
        </div>
      </div>
    </div>
  );
}