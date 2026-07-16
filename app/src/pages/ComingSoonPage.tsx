import { Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ComingSoonPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 px-4 py-16">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-muted)' }}
      >
        <Clock className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Coming Soon
        </h1>
        <p className="mt-2 text-sm max-w-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          This feature is currently in development. Stay tuned for updates.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="dgem-btn dgem-btn--outlined dgem-btn-md"
      >
        Go Back
      </button>
    </div>
  )
}