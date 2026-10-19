import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Role } from '@soldirectory/shared-types';
import * as api from '../api/resources';
import { SESSION_ENDED_EVENT, installSessionGuard } from '../api/client';

interface AuthUser {
  id: string;
  name: string;
  role: Role;
  // Only meaningful for role === 'provider'. Undefined for every
  // other role. Drives the pro-plan gate on the worker directory.
  plan?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, code?: string) => Promise<AuthUser>;
  signup: (input: { name: string; email: string; mobile: string; password: string; role: Role; referralCode?: string }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'sd_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // When any request says the sign-in has ended, forget the user: pages that need an account then send them to the login page.
  useEffect(() => {
    installSessionGuard();
    const ended = () => setUser(null);
    window.addEventListener(SESSION_ENDED_EVENT, ended);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, ended);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${(import.meta as any).env?.VITE_API_URL ?? '/api'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) { setUser((await res.json()).user); return; }
        // Only a "not signed in" answer ends the session. A server restart or a poor connection (500, 502, no answer) must not log anyone out.
        if (res.status === 401) localStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => { /* offline or the server is restarting: keep the sign-in and try again on the next request */ })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string, code?: string) {
    const res = await api.login(email, password, code);
    setUser(res.user);
    return res.user;
  }

  async function signup(input: { name: string; email: string; mobile: string; password: string; role: Role; referralCode?: string }) {
    const res = await api.signup(input);
    setUser(res.user);
    return res.user;
  }

  function logout() {
    api.logout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
