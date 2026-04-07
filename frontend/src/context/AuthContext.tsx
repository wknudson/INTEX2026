import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import type { AuthUser } from '../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  mfaRequired: boolean;
  login: (email: string, password: string) => Promise<void>;
  validateMfa: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

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
      setMfaRequired(false);
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
      if (data.requiresMfa) {
        setMfaRequired(true);
        return;
      }
      setUser(toAuthUser(data));
      setMfaRequired(false);
    } finally {
      setLoading(false);
    }
  }

  async function validateMfa(code: string) {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/api/auth/mfa/validate', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setUser(toAuthUser(data));
      setMfaRequired(false);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMfaRequired(false);
  }

  const value = useMemo(
    () => ({ user, loading, mfaRequired, login, validateMfa, logout, refreshUser }),
    [user, loading, mfaRequired],
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
