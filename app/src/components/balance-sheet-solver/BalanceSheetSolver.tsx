import { Grid3x3, TrendingUp, TrendingDown } from 'lucide-react'

export default function BalanceSheetSolver() {
  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="app-header">
        <div className="flex items-center gap-3">
          <Grid3x3 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-base font-medium" style={{ color: 'var(--color-foreground)' }}>Balance Sheet Item Solver</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="dgem-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Total Assets</span>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-green)' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>$0</p>
          </div>
          <div className="dgem-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Total Liabilities</span>
              <TrendingDown className="w-4 h-4" style={{ color: 'var(--color-destructive)' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>$0</p>
          </div>
        </div>

        {/* Balance sheet table */}
        <div className="dgem-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Balance Sheet Items</h2>
            <button type="button" className="dgem-btn dgem-btn--filled dgem-btn-sm">
              Analyze
            </button>
          </div>
          <div className="dgem-table-wrapper">
            <table className="dgem-table w-full">
              <thead>
                <tr>
                  <th>Line Item</th>
                  <th>Category</th>
                  <th>Current Period</th>
                  <th>Prior Period</th>
                  <th>Variance</th>
                  <th>Variance %</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
                    No balance sheet data loaded. Click Analyze to begin.
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