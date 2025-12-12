import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for logout functionality
 * @returns {Object} logout function and loading/error states
 */
export function useLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      // Clear any local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Redirect to login page
      router.push('/login');
      
      // Force refresh to clear session
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [router]);

  return { logout };
}
