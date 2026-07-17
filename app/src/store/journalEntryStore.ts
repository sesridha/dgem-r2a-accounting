import { create } from 'zustand'
import type { JournalEntry, CreateJournalEntryRequest } from '@/types'

interface JournalEntryState {
  // State
  entries: JournalEntry[]
  currentEntry: Partial<CreateJournalEntryRequest> | null
  isLoading: boolean
  error: string | null

  // Actions
  addEntry: (entry: JournalEntry) => void
  setCurrentEntry: (entry: Partial<CreateJournalEntryRequest>) => void
  resetCurrentEntry: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  clearEntries: () => void
}

/**
 * Journal Entry Store
 * Manages all journal entry related state
 */
export const useJournalEntryStore = create<JournalEntryState>((set) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,

  addEntry: (entry) =>
    set((state) => ({ entries: [...state.entries, entry] })),

  setCurrentEntry: (entry) => set({ currentEntry: entry }),

  resetCurrentEntry: () => set({ currentEntry: null }),

  setError: (error) => set({ error }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearEntries: () => set({ entries: [] }),
}))
