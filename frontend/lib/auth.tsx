'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, ApiError } from './api';
import type { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    const publicPaths = ['/', '/login'];
    const isPublicPage = publicPaths.includes(pathname);
    if (!user && !isPublicPage) {
      router.replace('/login');
    } else if (user && pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    const data = await api<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    router.replace('/dashboard');
  };

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
    }
    setUser(null);
    router.replace('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireRole(...roles: string[]) {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}
