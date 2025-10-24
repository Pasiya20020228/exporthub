'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest } from '../lib/api';

const STORAGE_KEY = 'exporthub.session';

const SessionContext = createContext(null);

export default function SessionProvider({ children }) {
  const [session, setSession] = useState({
    token: null,
    user: null,
    initialised: false,
  });

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      setSession((prev) => ({ ...prev, initialised: true }));
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setSession({ ...parsed, initialised: true });
    } catch (error) {
      console.warn('Failed to parse persisted session', error);
      window.localStorage.removeItem(STORAGE_KEY);
      setSession({ token: null, user: null, initialised: true });
    }
  }, []);

  const persist = useCallback((nextSession) => {
    if (typeof window === 'undefined') return;
    if (nextSession.token && nextSession.user) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: nextSession.token, user: nextSession.user }),
      );
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback((token, user) => {
    setSession({ token, user, initialised: true });
    persist({ token, user });
  }, [persist]);

  const logout = useCallback(async () => {
    try {
      if (session.token) {
        await apiRequest('/auth/logout', { method: 'POST', token: session.token });
      }
    } catch (error) {
      console.warn('Failed to revoke session token', error);
    } finally {
      persist({ token: null, user: null });
      setSession({ token: null, user: null, initialised: true });
    }
  }, [persist, session.token]);

  const refreshProfile = useCallback(async () => {
    if (!session.token) {
      return null;
    }
    try {
      const profile = await apiRequest('/auth/me', { token: session.token });
      setSession((prev) => ({ ...prev, user: profile, initialised: true }));
      persist({ token: session.token, user: profile });
      return profile;
    } catch (error) {
      console.warn('Unable to refresh profile', error);
      persist({ token: null, user: null });
      setSession({ token: null, user: null, initialised: true });
      return null;
    }
  }, [persist, session.token]);

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      loading: !session.initialised,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      logout,
      refreshProfile,
    }),
    [login, logout, refreshProfile, session.token, session.user, session.initialised],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
