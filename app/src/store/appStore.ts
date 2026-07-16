import { create } from 'zustand'
import type { User } from '@/types'

const USER_STORAGE_KEY = 'user'

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<User>
    if (!parsed?.email || !parsed?.name) return null

    return {
      id: parsed.id ?? crypto.randomUUID(),
      name: parsed.name,
      email: parsed.email,
      role: parsed.role ?? 'accountant',
    }
  } catch {
    return null
  }
}

const persistUser = (user: User | null) => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY)
    return
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

const initialUser = getStoredUser()

interface AppState {
  // State
  user: User | null
  isAuthenticated: boolean
  isDarkMode: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  login: (user: User) => void
  logout: () => void
  hydrateAuth: () => void
  setDarkMode: (isDark: boolean) => void
  setLoading: (loading: boolean) => void
}

/**
 * App Store - Shared
 * Manages global app state like user, theme, etc.
 */
export const useAppStore = create<AppState>((set) => ({
  user: initialUser,
  isAuthenticated: Boolean(initialUser),
  isDarkMode: false,
  isLoading: false,

  setUser: (user) => {
    persistUser(user)
    set({ user, isAuthenticated: Boolean(user) })
  },

  login: (user) => {
    persistUser(user)
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    persistUser(null)
    set({ user: null, isAuthenticated: false })
  },

  hydrateAuth: () => {
    const user = getStoredUser()
    set({ user, isAuthenticated: Boolean(user) })
  },

  setDarkMode: (isDark) => {
    set({ isDarkMode: isDark })
    // Apply dark mode to document
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}))
