import { create } from 'zustand'
import type { TrialBalance, TrialBalanceAnomaly } from '@/types'

interface TrialBalanceState {
  // State
  balances: TrialBalance[]
  anomalies: TrialBalanceAnomaly[]
  asOfDate: string | null
  isLoading: boolean
  error: string | null
  totalDebits: number
  totalCredits: number
  isBalanced: boolean

  // Actions
  setBalances: (balances: TrialBalance[]) => void
  setAnomalies: (anomalies: TrialBalanceAnomaly[]) => void
  setAsOfDate: (date: string) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  updateTotals: (debits: number, credits: number) => void
  clearData: () => void
}

/**
 * Trial Balance Store - Dev 2 Only
 * Manages all trial balance related state
 */
export const useTrialBalanceStore = create<TrialBalanceState>((set) => ({
  balances: [],
  anomalies: [],
  asOfDate: null,
  isLoading: false,
  error: null,
  totalDebits: 0,
  totalCredits: 0,
  isBalanced: false,

  setBalances: (balances) => set({ balances }),

  setAnomalies: (anomalies) => set({ anomalies }),

  setAsOfDate: (date) => set({ asOfDate: date }),

  setError: (error) => set({ error }),

  setLoading: (loading) => set({ isLoading: loading }),

  updateTotals: (debits, credits) =>
    set({
      totalDebits: debits,
      totalCredits: credits,
      isBalanced: Math.abs(debits - credits) < 0.01,
    }),

  clearData: () =>
    set({
      balances: [],
      anomalies: [],
      asOfDate: null,
      error: null,
      totalDebits: 0,
      totalCredits: 0,
      isBalanced: false,
    }),
}))
