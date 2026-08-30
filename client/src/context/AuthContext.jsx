import { createContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import { login as loginRequest } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Registered once: any 401 on an authenticated request clears the
  // session and leaves a message for the login screen to show.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      setSessionMessage('Your session has expired. Please log in again.');
    });
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { token: newToken, user: newUser } = await loginRequest(email, password);
      setToken(newToken);
      setUser(newUser);
      setSessionMessage('');
      return newUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSessionMessage = useCallback(() => setSessionMessage(''), []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(token),
    sessionMessage,
    clearSessionMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}