import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service.js';
import { setMemoryToken, clearMemoryToken } from '../../../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on application mount via silent refresh
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const refreshRes = await authService.refresh();
        const newAccessToken = refreshRes.data.accessToken;

        setMemoryToken(newAccessToken);
        if (isMounted) {
          setAccessToken(newAccessToken);
        }

        const meRes = await authService.getMe();
        if (isMounted) {
          setUser(meRes.data.user);
        }
      } catch (_err) {
        // No valid session cookie found; user remains unauthenticated
        clearMemoryToken();
        if (isMounted) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    // Listen for global session expiration events from Axios interceptor
    const handleSessionExpired = () => {
      clearMemoryToken();
      queryClient.clear();
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [queryClient]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { accessToken: newAccessToken, user: authUser } = res.data;

    setMemoryToken(newAccessToken);
    setAccessToken(newAccessToken);
    setUser(authUser);
    return authUser;
  }, []);

  const startDemoSession = useCallback(async () => {
    const res = await authService.createDemoSession();
    const { accessToken: newAccessToken, user: authUser } = res.data;

    setMemoryToken(newAccessToken);
    setAccessToken(newAccessToken);
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (_err) {
      // Ignore network errors on logout to ensure local cleanup
    } finally {
      clearMemoryToken();
      queryClient.clear();
      setUser(null);
      setAccessToken(null);
    }
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  }, []);

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    isDemo: !!user?.isDemo || user?.role === 'DEMO',
    login,
    startDemoSession,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
