import { useEffect, useState } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminPending() {
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [busy, setBusy] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/admin/users/pending');
      setUsers(r.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load pending users.');
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (user) => {
    setBusy(user._id);
    try {
      const r = await api.put(`/admin/users/${user._id}/approve`);
      toast.success(r.data.message);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approve failed.');
    } finally {
      setBusy('');
    }
  };

  const reject = async () => {
    if (!confirm) return;
    setBusy(confirm._id);
    try {
      const r = await api.put(`/admin/users/${confirm._id}/reject`, { reason });
      toast.success(r.data.message);
      setConfirm(null);
      setReason('');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reject failed.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="page">
      <div className="dashboard-head">
        <div>
          <span className="pill">APPROVALS</span>
          <h2>Pending users</h2>
          <p>Review registration requests and approve or reject them.</p>
        </div>
        <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
      </div>

      {!users && <p className="empty">Loading pending users…</p>}
      {users && users.length === 0 && <div className="empty-card"><h3>No pending registrations 🎉</h3><p>New user sign-ups will appear here for review.</p></div>}

      {users && users.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><b>{u.fullName}</b></td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td><span className="status pending">Pending</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn primary mini" disabled={busy === u._id} onClick={() => approve(u)}><Check size={14} /> Approve</button>
                      <button className="btn danger mini" disabled={busy === u._id} onClick={() => setConfirm(u)}><X size={14} /> Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        danger
        title="Reject user"
        message={`Reject the registration request for ${confirm?.fullName}? They will not be able to log in.`}
        confirmLabel="Reject"
        onConfirm={reject}
        onClose={() => { setConfirm(null); setReason(''); }}
      >
        <label className="field-block">Reason (optional)
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate account" />
        </label>
      </ConfirmDialog>
    </div>
  );
}