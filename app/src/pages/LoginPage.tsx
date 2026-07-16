import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store'

/**
 * Login Page – built with @dgem/design-system classes.
 * Page background: DGEM gradient (applied on <body> via index.html).
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAppStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (!email || !password) {
        setError('Please enter both email and password')
        setIsLoading(false)
        return
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        return
      }

      const userName =
        email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
      login({ id: crypto.randomUUID(), email, name: userName, role: 'accountant' })
      navigate('/journal-entry')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-dvh px-4 py-8"
      style={{ backgroundColor: 'transparent' }}
    >
      <div
        className="flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-lg"
        style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)' }}
      >
        {/* Decorative left panel */}
        <div
          className="hidden lg:flex w-3/5 items-center justify-center p-10 relative"
          style={{ background: 'linear-gradient(135deg, var(--color-background) 0%, rgba(0,88,171,0.05) 50%, rgba(0,213,208,0.08) 100%)' }}
        >
          {/* Decorative shapes using DGEM brand colors */}
          <div
            className="absolute -left-8 top-10 h-28 w-28 rotate-12 rounded-xl"
            style={{ border: '4px solid var(--dgem-blue)', opacity: 0.3 }}
          />
          <div
            className="absolute right-20 top-16 h-12 w-12 rounded-md"
            style={{ border: '2px solid var(--dgem-turquoise)', opacity: 0.4 }}
          />
          <div
            className="absolute bottom-20 right-12 h-24 w-24 rounded-full"
            style={{ border: '8px solid var(--dgem-blue)', opacity: 0.1 }}
          />
          <div
            className="relative flex h-72 w-full max-w-lg items-center justify-center rounded-xl px-8"
            style={{ border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.6)' }}
          >
            {/* Lock icon illustration */}
            <div className="relative flex flex-col items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-muted)', border: '2px solid var(--dgem-blue)', opacity: 0.8 }}
              >
                <Lock className="w-10 h-10" style={{ color: 'var(--dgem-blue)' }} />
              </div>
              <p className="text-sm font-medium text-center" style={{ color: 'var(--color-muted-foreground)' }}>
                Secure access to R2A Agentic AI
              </p>
            </div>
          </div>
        </div>

        {/* Login form */}
        <div
          className="flex w-full items-center justify-center px-8 py-10 lg:w-2/5"
          style={{ backgroundColor: 'var(--color-card)' }}
        >
          <div className="w-full max-w-sm">
            {/* Brand header */}
            <div
              className="mb-6 flex items-center gap-3 pb-5"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <img src="/cg.png" alt="Capgemini logo" className="h-10 w-10 rounded-md object-contain" />
              <div>
                <p className="text-base font-medium leading-tight" style={{ color: 'var(--color-foreground)' }}>Capgemini</p>
                <p className="text-xs font-medium tracking-wider" style={{ color: 'var(--color-primary)' }}>R2A AGENTIC AI</p>
              </div>
            </div>

            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Welcome Back!</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sign in to your account to continue</p>

            {/* Error message */}
            {error && (
              <div
                className="mt-4 rounded-lg px-4 py-3 text-sm"
                style={{
                  backgroundColor: 'rgba(227,0,33,0.08)',
                  border: '1px solid rgba(227,0,33,0.3)',
                  color: 'var(--color-destructive)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              {/* Email field */}
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--color-muted-foreground)' }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled={isLoading}
                  autoComplete="email"
                  className="dgem-input w-full"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--color-muted-foreground)' }}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="dgem-input w-full"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="dgem-btn dgem-btn--filled dgem-btn-md w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              &copy; 2026 Capgemini. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}