import { useEffect, useState } from 'react';
import { Search, Check, X, UserX, Trash2, RefreshCw, Eye } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState('');
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (role) params.set('role', role);
      const r = await api.get('/admin/users?' + params.toString());
      setUsers(r.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load users.');
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, role]);

  const act = async (type, user) => {
    setBusy(user._id);
    try {
      const r = await api.put(`/admin/users/${user._id}/${type}`);
      toast.success(r.data.message);
      setConfirm(null);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed.');
    } finally {
      setBusy('');
    }
  };

  const remove = async (user) => {
    setBusy(user._id);
    try {
      const r = await api.delete(`/admin/users/${user._id}`);
      toast.success(r.data.message);
      setConfirm(null);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="page">
      <div className="dashboard-head">
        <div>
          <span className="pill">USER MANAGEMENT</span>
          <h2>All users</h2>
          <p>Search, filter and manage every registered account.</p>
        </div>
        <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
      </div>

      <div className="filters">
        <div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone…" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
      </div>

      {!users && <p className="empty">Loading users…</p>}
      {users && users.length === 0 && <div className="empty-card"><p>No users match your filters.</p></div>}

      {users && users.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Registered</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><b>{u.fullName}</b></td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber}</td>
                  <td><span className={'role ' + u.role.toLowerCase()}>{u.role}</span></td>
                  <td><span className={'status ' + u.status.toLowerCase()}>{u.status}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="View details" onClick={() => setDetail(u)}><Eye size={15} /></button>
                      {u.status === 'Pending' && (
                        <>
                          <button className="icon-btn ok" title="Approve" disabled={busy === u._id} onClick={() => act('approve', u)}><Check size={15} /></button>
                          <button className="icon-btn bad" title="Reject" disabled={busy === u._id} onClick={() => setConfirm({ type: 'reject', user: u })}><X size={15} /></button>
                        </>
                      )}
                      {u.status === 'Approved' && (
                        <button className="icon-btn warn" title="Deactivate" disabled={busy === u._id} onClick={() => setConfirm({ type: 'deactivate', user: u })}><UserX size={15} /></button>
                      )}
                      {u.role !== 'Admin' && (
                        <button className="icon-btn bad" title="Delete" disabled={busy === u._id} onClick={() => setConfirm({ type: 'delete', user: u })}><Trash2 size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          open
          danger={confirm.type === 'delete' || confirm.type === 'reject'}
          title={{ reject: 'Reject user', deactivate: 'Deactivate user', delete: 'Delete user' }[confirm.type]}
          message={{
            reject: `Reject the registration request for ${confirm.user.fullName}? They will not be able to log in.`,
            deactivate: `Deactivate ${confirm.user.fullName}? They will lose access immediately.`,
            delete: `Permanently delete ${confirm.user.fullName}? This cannot be undone.`
          }[confirm.type]}
          confirmLabel={{ reject: 'Reject', deactivate: 'Deactivate', delete: 'Delete' }[confirm.type]}
          onConfirm={() => (confirm.type === 'delete' ? remove(confirm.user) : act(confirm.type, confirm.user))}
          onClose={() => setConfirm(null)}
        />
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="pill">USER DETAILS</span>
              <button className="icon-btn" onClick={() => setDetail(null)}><X size={16} /></button>
            </div>
            <div className="info-row"><small>Full name</small><b>{detail.fullName}</b></div>
            <div className="info-row"><small>Email</small><b>{detail.email}</b></div>
            <div className="info-row"><small>Phone</small><b>{detail.phoneNumber}</b></div>
            <div className="info-row"><small>Role</small><b>{detail.role}</b></div>
            <div className="info-row"><small>Status</small><b>{detail.status}</b></div>
            <div className="info-row"><small>Registered</small><b>{new Date(detail.createdAt).toLocaleString()}</b></div>
            <div className="info-row"><small>Last login</small><b>{detail.lastLoginAt ? new Date(detail.lastLoginAt).toLocaleString() : 'Never'}</b></div>
            {detail.rejectionReason && <div className="info-row"><small>Rejection reason</small><b>{detail.rejectionReason}</b></div>}
          </div>
        </div>
      )}
    </div>
  );
}