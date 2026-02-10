import React, { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'moodsense:user';
export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const value = useMemo(() => ({
    user,
    login: (email) => {
      const u = { email };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
      setUser(u);
    },
    signup: (email) => {
      const u = { email };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
      setUser(u);
    },
    logout: () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      setUser(null);
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
