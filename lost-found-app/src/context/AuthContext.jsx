'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Authentication Context
 * Provides user data and auth state across the app
 */
const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    // If we already have initial user data, don't fetch
    if (initialUser) {
      setIsLoading(false);
      return;
    }

    // Check if token exists and decode it
    const checkAuth = () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (token) {
          // Decode JWT (basic decoding, doesn't verify signature)
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(atob(parts[1]));
            setUser({
              userId: decoded.userId,
              email: decoded.email,
              iat: decoded.iat
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [initialUser]);

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
