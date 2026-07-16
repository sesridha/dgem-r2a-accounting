import { Layers, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const statusConfig = {
  matched: { icon: <CheckCircle className="w-4 h-4" />, color: 'var(--color-green)' },
  unmatched: { icon: <XCircle className="w-4 h-4" />, color: 'var(--color-destructive)' },
  disputed: { icon: <AlertCircle className="w-4 h-4" />, color: 'var(--color-yellow)' },
} as const

export default function ICItemSolver() {
  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="app-header">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-base font-medium" style={{ color: 'var(--color-foreground)' }}>IC Item Solver</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {(['matched', 'unmatched', 'disputed'] as const).map((status) => (
            <div key={status} className="dgem-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: statusConfig[status].color }}>{statusConfig[status].icon}</span>
                <span
                  className="text-xs font-medium capitalize"
                  style={{ color: statusConfig[status].color }}
                >{status}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>0</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>IC items</p>
            </div>
          ))}
        </div>

        {/* IC items table */}
        <div className="dgem-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Intercompany Items</h2>
            <button type="button" className="dgem-btn dgem-btn--filled dgem-btn-sm">
              Run Matching
            </button>
          </div>
          <div className="dgem-table-wrapper">
            <table className="dgem-table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Company</th>
                  <th>Counterparty</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
                    No intercompany items loaded. Run matching to begin.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}