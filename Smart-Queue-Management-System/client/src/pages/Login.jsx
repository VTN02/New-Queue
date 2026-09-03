import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/dashboard'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      const u = await login(email, password);
      const from = location.state?.from;
      const target = u.role === 'Admin' ? '/admin/dashboard' : (from || '/dashboard');
      nav(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <div className="page-head">
          <span className="pill">WELCOME BACK</span>
          <h2>Sign in</h2>
          <p>Log in to check your queue status or manage the system.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>Password
            <div className="input-wrap">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn primary full" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'} {!loading && <ArrowRight size={18} />}</button>
          <p className="muted">New here? <Link to="/register" className="link">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
}