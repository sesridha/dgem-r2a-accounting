import { useEffect } from 'react';
import { useAppStore } from '@/store';

/**
 * Custom hook for handling authentication redirects
 * Centralizes auth logic instead of scattering it in axios interceptors
 */
export function useAuthRedirect() {
  const { logout } = useAppStore();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      // Could add toast notification here if needed
      window.location.href = '/login';
    };

    // Listen for custom events or handle auth failures
    const handleAuthError = (event: CustomEvent) => {
      if (event.detail?.status === 401) {
        handleUnauthorized();
      }
    };

    window.addEventListener('auth-error', handleAuthError as EventListener);

    return () => {
      window.removeEventListener('auth-error', handleAuthError as EventListener);
    };
  }, [logout]);
}