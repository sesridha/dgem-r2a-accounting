/**
 * Local Storage Service
 * Handles all localStorage operations
 */

const STORAGE_PREFIX = 'accounting_app_'

export const storageService = {
  /**
   * Get item from localStorage
   */
  getItem: <T,>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error)
      return defaultValue || null
    }
  },

  /**
   * Set item in localStorage
   */
  setItem: <T,>(key: string, value: T): void => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error)
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error)
    }
  },

  /**
   * Clear all items with STORAGE_PREFIX
   */
  clear: (): void => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing localStorage', error)
    }
  },
}
