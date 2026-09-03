import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PASSWORD_HINT = 'At least 8 characters with one uppercase letter, one lowercase letter and one number.';

export default function Register() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState('');

  if (user) return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/dashboard'} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phoneNumber.trim() || !form.password) {
      return 'All fields are required.';
    }
    if (form.fullName.trim().length < 2) return 'Full name must contain at least 2 characters.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Please provide a valid email address.';
    if (!/^\+?[0-9\s\-()]{7,15}$/.test(form.phoneNumber.trim())) return 'Please provide a valid phone number.';
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return PASSWORD_HINT;
    }
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setDone('');
    const msg = validate();
    if (msg) return setError(msg);
    setLoading(true);
    try {
      const r = await api.post('/auth/register', form);
      setDone(r.data.message);
      setForm({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <div className="page-head">
          <span className="pill">CREATE ACCOUNT</span>
          <h2>Register</h2>
          <p>Your account must be approved by an administrator before you can sign in.</p>
        </div>
        {done && (
          <div className="notice success">
            <CheckCircle size={20} />
            <div><b>{done}</b><span>You can now return to the login page.</span></div>
          </div>
        )}
        <form className="form-card" onSubmit={submit}>
          <label>Full Name
            <input value={form.fullName} onChange={set('fullName')} placeholder="e.g. Kasun Perera" />
          </label>
          <label>Email
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>Phone Number
            <input value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="e.g. +94 77 123 4567" autoComplete="tel" />
          </label>
          <label>Password
            <div className="input-wrap">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Create a password" autoComplete="new-password" />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            <small className="hint">{PASSWORD_HINT}</small>
          </label>
          <label>Confirm Password
            <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" autoComplete="new-password" />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn primary full" disabled={loading}>{loading ? 'Registering…' : 'Create Account'} {!loading && <UserPlus size={18} />}</button>
          <p className="muted">Already have an account? <Link to="/login" className="link">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}