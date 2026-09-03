import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Users, Ticket, LayoutDashboard, Home as HomeIcon, Clock, UserRound, History, LogOut, Settings, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JoinQueue from './pages/JoinQueue';
import QueueStatus from './pages/QueueStatus';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import QueueHistory from './pages/QueueHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPending from './pages/admin/AdminPending';
import AdminQueue from './pages/admin/AdminQueue';
import AdminSettings from './pages/admin/AdminSettings';

function Layout({ children }) {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const links = [];
  if (user) {
    if (user.role === 'Admin') {
      links.push(
        ['/admin/dashboard', 'Dashboard', LayoutDashboard],
        ['/admin/users', 'Users', Users],
        ['/admin/pending-users', 'Pending', Clock],
        ['/admin/queue', 'Queue', Ticket],
        ['/admin/settings', 'Settings', Settings]
      );
    } else {
      links.push(
        ['/dashboard', 'Dashboard', LayoutDashboard],
        ['/queue', 'Join Queue', Ticket],
        ['/queue/status', 'Status', Clock],
        ['/queue/history', 'History', History],
        ['/profile', 'Profile', UserRound]
      );
    }
  }

  const onLogout = () => {
    logout();
    nav('/', { replace: true });
  };

  return (
    <div className="app">
      <header>
        <Link className="brand" to={user ? (user.role === 'Admin' ? '/admin/dashboard' : '/dashboard') : '/'}>
          <span className="logo">Q</span> QueueFlow
        </Link>
        <nav>
          {user ? (
            <>
              <span className="nav-user-info hide-mobile"><ShieldCheck size={15} /> {user.fullName}</span>
              {links.map(([p, t, I]) => (
                <Link key={p} className={loc.pathname === p ? 'active' : ''} to={p}><I size={17} /><span>{t}</span></Link>
              ))}
              <button className="nav-logout" onClick={onLogout} title="Logout"><LogOut size={17} /></button>
            </>
          ) : (
            <>
              <Link className={loc.pathname === '/' ? 'active' : ''} to="/"><HomeIcon size={17} /><span>Home</span></Link>
              <Link className={loc.pathname === '/login' ? 'active' : ''} to="/login"><LogIn size={17} /><span>Sign in</span></Link>
              <Link className={loc.pathname === '/register' ? 'active' : ''} to="/register"><UserPlus size={17} /><span>Register</span></Link>
            </>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer>Smart Queue Management • MERN Stack</footer>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['User']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute roles={['User']}><JoinQueue /></ProtectedRoute>} />
        <Route path="/queue/status" element={<ProtectedRoute roles={['User']}><QueueStatus /></ProtectedRoute>} />
        <Route path="/queue/history" element={<ProtectedRoute roles={['User']}><QueueHistory /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={['User']}><Profile /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['Admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/pending-users" element={<ProtectedRoute roles={['Admin']}><AdminPending /></ProtectedRoute>} />
        <Route path="/admin/queue" element={<ProtectedRoute roles={['Admin']}><AdminQueue /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute roles={['Admin']}><AdminSettings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}