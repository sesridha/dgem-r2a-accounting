import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types";

/**
 * API Client Configuration
 * Centralizes all API communication
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data as Record<string, unknown> | undefined,
    };

    // Handle specific status codes
    if (error.response?.status === 401) {
      // Dispatch custom event for centralized auth handling
      window.dispatchEvent(new CustomEvent('auth-error', {
        detail: { status: 401, message: 'Unauthorized' }
      }));
    }

    return Promise.reject(apiError);
  },
);
export default apiClient;
