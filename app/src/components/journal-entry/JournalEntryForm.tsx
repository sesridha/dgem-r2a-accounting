import { useState } from 'react'
import { BookOpen, Upload, Plus, RefreshCw } from 'lucide-react'

type JETab = 'standard' | 'adhoc'

/**
 * Journal Entry Form – main R2A accounting module.
 * Uses @dgem/design-system classes exclusively.
 */
export default function JournalEntryForm() {
  const [activeTab, setActiveTab] = useState<JETab>('standard')

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="app-header">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-base font-medium" style={{ color: 'var(--color-foreground)' }}>
            Journal Entry
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="dgem-btn dgem-btn--outlined dgem-btn-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button type="button" className="dgem-btn dgem-btn--filled dgem-btn-sm">
            <Plus className="w-3.5 h-3.5" />
            New Entry
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Tab switcher */}
        <div className="dgem-switcher mb-6">
          <button
            type="button"
            className={`dgem-switcher-item${activeTab === 'standard' ? ' dgem-switcher-item--active' : ''}`}
            onClick={() => setActiveTab('standard')}
          >
            Standard JEs
          </button>
          <button
            type="button"
            className={`dgem-switcher-item${activeTab === 'adhoc' ? ' dgem-switcher-item--active' : ''}`}
            onClick={() => setActiveTab('adhoc')}
          >
            AD-HOC JEs
          </button>
        </div>

        {activeTab === 'standard' ? <StandardJEView /> : <AdhocJEView />}
      </div>
    </div>
  )
}

function StandardJEView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Upload card */}
      <div className="dgem-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Upload Source Data</h2>
          <span
            className="dgem-tag"
            style={{ backgroundColor: 'rgba(0,88,171,0.08)', color: 'var(--dgem-blue)' }}
          >Standard</span>
        </div>

        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 gap-3 cursor-pointer transition-colors hover:bg-muted"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Upload className="w-8 h-8" style={{ color: 'var(--color-muted-foreground)' }} />
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Drop your file here</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Supports .xlsx, .csv (max 10 MB)</p>
          </div>
          <button type="button" className="dgem-btn dgem-btn--outlined dgem-btn-sm">
            Browse Files
          </button>
        </div>
      </div>

      {/* Entry list placeholder */}
      <div className="dgem-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Recent Journal Entries</h2>
        </div>
        <div className="dgem-table-wrapper">
          <table className="dgem-table w-full">
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Period</th>
                <th>Company</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
                  No journal entries yet. Upload a source file to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AdhocJEView() {
  return (
    <div className="dgem-card p-6">
      <h2 className="text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>AD-HOC Journal Entry</h2>
      <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
        Parse email content or attachments to generate ad-hoc journal entries.
      </p>
      <div className="flex gap-3 mt-4">
        <button type="button" className="dgem-btn dgem-btn--outlined dgem-btn-md">
          JE as Email Content
        </button>
        <button type="button" className="dgem-btn dgem-btn--outlined dgem-btn-md">
          JE as Email Attachment
        </button>
      </div>
    </div>
  )
}