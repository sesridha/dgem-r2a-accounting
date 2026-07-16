import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store'

/**
 * Login Page Component
 * Default landing page for the application
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

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock validation
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

      // Mock successful login
      const userName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
      login({
        id: crypto.randomUUID(),
        email,
        name: userName,
        role: 'accountant',
      })
      navigate('/journal-entry')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="box-border h-dvh bg-primary/15 px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex h-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative hidden w-3/5 items-center justify-center bg-linear-to-br from-background via-primary/5 to-primary/15 p-10 lg:flex">
          
          <div className="absolute -left-8 top-10 h-28 w-28 rotate-12 rounded-xl border-4 border-primary/50 bg-background/80" />
          <div className="absolute right-20 top-16 h-12 w-12 rounded-md border-2 border-primary/50 bg-background/80" />
          <div className="absolute bottom-20 right-12 h-24 w-24 rounded-full border-8 border-primary/20" />
          <div className="relative flex h-72 w-full max-w-lg items-center justify-center rounded-xl border border-border bg-background/80 px-8">
            <div className="absolute bottom-12 left-14 h-24 w-28 rounded-[44px] border-4 border-primary bg-primary/15" />
            <div className="absolute bottom-10 left-20 h-16 w-36 rounded-full bg-primary/20 blur-sm" />
            <div className="relative h-40 w-36 rounded-3xl border-4 border-primary bg-primary/15">
              <div className="absolute -top-16 left-1/2 h-20 w-24 -translate-x-1/2 rounded-t-[54px] border-4 border-b-0 border-primary bg-background" />
              <div className="absolute left-1/2 top-14 h-16 w-16 -translate-x-1/2 rounded-full bg-primary/20" />
              <div className="absolute left-1/2 top-[4.65rem] h-14 w-5 -translate-x-1/2 rounded-full bg-primary" />
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-card px-6 py-8 sm:px-10 lg:w-2/5">
          <div className="w-full max-w-sm">
            <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
              <img src="/cg.png" alt="Capgemini logo" className="h-10 w-10 rounded-md object-contain" />
              <div>
                <p className="text-lg font-semibold leading-tight text-foreground">Capgemini</p>
                <p className="text-xs font-medium tracking-wide text-primary">R2A AGENTIC AI</p>
              </div>
            </div>

            <h1 className="text-3xl font-semibold text-foreground">Welcome Back!</h1>

            {error && (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="h-10 pl-9"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-10 pl-9"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="h-10 w-full text-sm font-medium">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  'Login'
                )}
              </Button>

              {/* <div className="flex items-center justify-between pt-0.5 text-xs sm:text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                    disabled={isLoading}
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  disabled={isLoading}
                >
                  Forgot Your Password?
                </button>
              </div> */}
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>© 2026 Capgemini. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
