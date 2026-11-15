import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken, getToken } from '../api/restClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, onNavigate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync pending quiz results after auth
  const syncPendingQuiz = useCallback(async () => {
    const pending = sessionStorage.getItem('pendingQuizResult');
    if (pending) {
      try {
        const payload = JSON.parse(pending);
        await api.exercises.saveProgress(payload);
        sessionStorage.removeItem('pendingQuizResult');
      } catch (err) {
        console.error('Failed to save pending quiz result:', err);
      }
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        return null;
      }
      const data = await api.auth.me();
      setUser(data.user || null);
      return data.user;
    } catch {
      setUser(null);
      clearToken();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async ({ email, password, returnUrl }) => {
    const result = await api.auth.login({ email, password, returnUrl });
    if (result.token) {
      setToken(result.token);
      setUser(result.user);
      await syncPendingQuiz();
      if (onNavigate) {
        onNavigate(result.returnUrl || '/');
      }
    }
    return result;
  };

  const register = async ({ username, email, password, password2, returnUrl }) => {
    const result = await api.auth.register({ username, email, password, password2, returnUrl });
    if (result.token) {
      setToken(result.token);
      setUser(result.user);
      await syncPendingQuiz();
      if (onNavigate) {
        onNavigate(result.returnUrl || '/');
      }
    }
    return result;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore logout failure on server
    } finally {
      clearToken();
      setUser(null);
      if (onNavigate) {
        onNavigate('/');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
