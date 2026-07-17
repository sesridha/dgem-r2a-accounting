import apiClient from './client'
import type { Account, ApiResponse } from '@/types'

/**
 * Account Service - Shared
 * API calls for account operations
 */

export const accountService = {
  /**
   * Get all accounts
   */
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Account[]>>('/accounts')
    return response.data
  },

  /**
   * Get accounts by type
   */
  getByType: async (type: Account['type']) => {
    const response = await apiClient.get<ApiResponse<Account[]>>(
      '/accounts',
      {
        params: { type },
      },
    )
    return response.data
  },

  /**
   * Search accounts
   */
  search: async (query: string) => {
    const response = await apiClient.get<ApiResponse<Account[]>>(
      '/accounts/search',
      {
        params: { q: query },
      },
    )
    return response.data
  },

  /**
   * Get single account by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Account>>(
      `/accounts/${id}`,
    )
    return response.data
  },
}
