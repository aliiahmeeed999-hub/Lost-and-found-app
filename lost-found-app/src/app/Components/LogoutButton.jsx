'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ========================================
      // CLEAR CLIENT-SIDE DATA
      // ========================================
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      
      // Clear sessionStorage
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      
      // Clear all localStorage items (just to be safe)
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('auth') || key.includes('user') || key.includes('token')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Could not clear all localStorage items:', e);
      }

      // ========================================
      // CALL LOGOUT API
      // ========================================
      
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Prevent caching of this request
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      // ========================================
      // REDIRECT AND REFRESH
      // ========================================
      
      // Redirect to login page
      router.push('/login');
      
      // Force refresh to clear all server-side session data
      router.refresh();
      
      // Additional measure: clear browser history for protected pages
      if (window.history && window.history.length > 1) {
        window.history.replaceState(null, '', '/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout. Please try again.');
      
      // Even if logout fails, redirect to login as a fallback
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      title={error ? error : 'Click to logout'}
    >
      <LogOut className="w-4 h-4" />
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
