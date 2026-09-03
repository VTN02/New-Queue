import { useEffect, useState } from 'react';
import { ShieldCheck, KeyRound, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

function Row({ label, value }) {
  return <div className="info-row"><small>{label}</small><b>{value}</b></div>;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  const load = async () => {
    try {
      const r = await api.get('/admin/stats');
      setStats(r.data.data);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-head">
        <span className="pill">ADMIN SETTINGS</span>
        <h2>Settings</h2>
        <p>System information and security details.</p>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <h3><ShieldCheck size={17} /> System information</h3>
          <Row label="Application" value="Smart Queue Management System" />
          <Row label="Version" value="2.0 — with authentication" />
          <Row label="Signed in as" value={`${user?.fullName} (${user?.email})`} />
          <Row label="Role" value={user?.role} />
          <Row label="Total registered users" value={stats?.totalUsers ?? '…'} />
        </div>
        <div className="panel">
          <h3><KeyRound size={17} /> Security</h3>
          <div className="info-row"><small>Password storage</small><b>bcrypt hash (never plain text)</b></div>
          <div className="info-row"><small>Authentication</small><b>JWT (7 day expiry)</b></div>
          <div className="info-row"><small>Protected routes</small><b>Frontend + Backend</b></div>
          <div className="info-row"><small>Role enforcement</small><b>Verified server-side</b></div>
        </div>
      </div>

      <div className="notice" style={{ marginTop: 16 }}>
        <AlertTriangle size={20} />
        <div>
          <b>Default admin credentials</b>
          <span>Email <code>admin@queueflow.com</code> · Password <code>admin</code>. Create a unique admin before going live and rotate the JWT secret in <code>server/.env</code>.</span>
        </div>
      </div>
    </div>
  );
}