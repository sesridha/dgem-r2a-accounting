/* ═══════════════════════════════════════════════
   Core domain types for the R2A Accounting app
   ═══════════════════════════════════════════════ */

export interface User {
  id: string
  email: string
  name: string
  role: 'accountant' | 'reviewer' | 'admin'
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export type ProcessingStatus = 'idle' | 'loading' | 'success' | 'error'

/* ── Journal Entry ── */
export interface JournalEntryLine {
  id: string
  account: string
  description: string
  debit: number
  credit: number
  costCenter?: string
  project?: string
}

export interface JournalEntry {
  id: string
  period: string
  postingDate: string
  documentType: string
  companyCode: string
  currency: string
  reference: string
  headerText: string
  lines: JournalEntryLine[]
  status: 'draft' | 'pending' | 'posted' | 'rejected'
  createdAt: string
  createdBy: string
}

/* ── Trial Balance ── */
export interface TrialBalanceEntry {
  accountCode: string
  accountName: string
  openingDebit: number
  openingCredit: number
  periodDebit: number
  periodCredit: number
  closingDebit: number
  closingCredit: number
}

/* ── IC Item Solver ── */
export interface ICItem {
  id: string
  company: string
  counterparty: string
  amount: number
  currency: string
  description: string
  status: 'matched' | 'unmatched' | 'disputed'
}

/* ── Balance Sheet ── */
export interface BalanceSheetItem {
  id: string
  lineItem: string
  category: string
  currentPeriod: number
  priorPeriod: number
  variance: number
  variancePct: number
}