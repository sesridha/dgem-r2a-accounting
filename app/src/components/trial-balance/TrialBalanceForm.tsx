import { useState } from 'react'
import { Scale, Upload, Download } from 'lucide-react'

export default function TrialBalanceForm() {
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="app-header">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-base font-medium" style={{ color: 'var(--color-foreground)' }}>Trial Balance</h1>
        </div>
        <button type="button" className="dgem-btn dgem-btn--outlined dgem-btn-sm">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
        {/* Upload card */}
        <div className="dgem-card p-6">
          <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--color-foreground)' }}>Upload Trial Balance File</h2>
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 gap-3 cursor-pointer hover:bg-muted transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Upload className="w-7 h-7" style={{ color: 'var(--color-muted-foreground)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Drop trial balance file here</p>
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Supports .xlsx, .csv</p>
            <button
              type="button"
              className="dgem-btn dgem-btn--outlined dgem-btn-sm"
              onClick={() => setIsProcessing(!isProcessing)}
            >
              Browse Files
            </button>
          </div>
        </div>

        {/* Results table */}
        <div className="dgem-card p-6">
          <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--color-foreground)' }}>Trial Balance Results</h2>
          <div className="dgem-table-wrapper">
            <table className="dgem-table w-full">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Name</th>
                  <th>Opening Debit</th>
                  <th>Opening Credit</th>
                  <th>Period Debit</th>
                  <th>Period Credit</th>
                  <th>Closing Debit</th>
                  <th>Closing Credit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
                    Upload a file to view trial balance data.
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