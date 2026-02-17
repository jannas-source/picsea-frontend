'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://api.picsea.app';
const TOKEN_KEY = 'picsea_token';
const USER_KEY = 'picsea_user';

export interface User {
  id: number;
  email: string;
  name: string;
  company: string;
  cwrAccount?: string;
  phone?: string;
  shopType?: string;
  plan: 'free' | 'pro' | 'shop';
  scansUsed: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  scanLimit: number;
  scansRemaining: number;
  canScan: boolean;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  company: string;
  phone?: string;
  shopType?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const saveAuth = (t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      saveAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (signupData: SignupData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      saveAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const clearError = () => setError(null);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else if (res.status === 401) {
        clearAuth();
      }
    } catch { /* silent */ }
  }, [token]);

  const scanLimit = user?.plan === 'free' ? 5 : -1;
  const scansRemaining = scanLimit === -1 ? -1 : Math.max(0, scanLimit - (user?.scansUsed || 0));
  const canScan = !user || scanLimit === -1 || scansRemaining > 0;

  return (
    <AuthContext.Provider
      value={{
        user, token, loading, error,
        login, signup, logout, clearError, refreshUser,
        scanLimit, scansRemaining, canScan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

// Helper: get checkout URL for upgrade
export async function getCheckoutUrl(token: string, plan: 'pro' | 'shop'): Promise<string> {
  const res = await fetch(`${API_BASE}/api/billing/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create checkout');
  return data.url;
}

// Helper: get billing portal URL
export async function getBillingPortalUrl(token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/billing/portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to open billing portal');
  return data.url;
}
