import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setInitializing(false);
      return;
    }
    api.get('/auth/me')
      .then((r) => setUser(r.data.data))
      .catch(() => { localStorage.removeItem('token'); setUser(null); })
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', r.data.token);
    setUser(r.data.data);
    return r.data.data;
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const r = await api.get('/auth/me');
    setUser(r.data.data);
    return r.data.data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}