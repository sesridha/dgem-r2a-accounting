import { Loader2 } from 'lucide-react'

/**
 * Full-page loading fallback used by React Suspense boundaries.
 */
export default function LoadingFallback() {
  return (
    <div
      className="flex items-center justify-center h-screen w-full"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: 'var(--color-primary)' }}
        />
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Loading...</p>
      </div>
    </div>
  )
}