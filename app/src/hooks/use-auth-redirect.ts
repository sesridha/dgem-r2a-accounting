import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store'

/**
 * Centrally handles auth-based redirects.
 * - If unauthenticated and on a protected route, send to /login.
 * - If authenticated and on /login, send to /journal-entry.
 */
export function useAuthRedirect() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const publicPaths = ['/login']
    const isPublic = publicPaths.includes(location.pathname)

    if (!isAuthenticated && !isPublic) {
      navigate('/login', { replace: true })
    } else if (isAuthenticated && isPublic) {
      navigate('/journal-entry', { replace: true })
    }
  }, [isAuthenticated, location.pathname, navigate])
}