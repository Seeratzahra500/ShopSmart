'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = '_ss_auth';

function readCache() {
  try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)); } catch { return null; }
}
function writeCache(u) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(u)); } catch {}
}
function clearCache() {
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer       = useRef(null);

  const doLogout = useCallback(() => {
    clearCache();
    setUser(null);
    api.post('/auth/logout').catch(() => {});
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(doLogout, INACTIVITY_MS);
  }, [doLogout]);

  // Start/stop inactivity watcher based on whether user is logged in
  useEffect(() => {
    if (!user) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, resetInactivityTimer]);

  useEffect(() => {
    // Restore from sessionStorage immediately so protected layouts don't redirect
    const cached = readCache();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    // Verify / refresh in background
    api.get('/auth/me')
      .then(res => {
        setUser(res.data);
        writeCache(res.data);
        setLoading(false);
      })
      .catch(() => {
        // If server says no session, clear the cache and user
        clearCache();
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    writeCache(data.user);
    setUser(data.user);
    setLoading(false);
    return data.user;
  };

  const logout = doLogout;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
