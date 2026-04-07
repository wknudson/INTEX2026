import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import type { AuthUser } from '../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  function toAuthUser(raw: any): AuthUser {
    return {
      id: raw.id ?? raw.Id,
      email: raw.email ?? raw.Email,
      displayName: raw.displayName ?? raw.DisplayName ?? '',
      roles: raw.roles ?? raw.Roles ?? [],
      privacyPolicyAccepted: Boolean(raw.privacyPolicyAccepted ?? raw.PrivacyPolicyAccepted),
      cookieConsentAccepted: Boolean(raw.cookieConsentAccepted ?? raw.CookieConsentAccepted),
    };
  }

  async function refreshUser() {
    try {
      const data = await apiFetch<any>('/api/auth/me');
      setUser(toAuthUser(data));
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(toAuthUser(data));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
