/**
 * Common Types
 */
export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "accountant" | "admin" | "viewer";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type ResultVariant = "success" | "failure";
export type JournalType = { id: string; name: string; code?: boolean };

export type SelectOption = {
  id: string;
  name: string;
};

export interface TopNavProps {
  title?: string;
  description?: string;
  breadcrumbItems?: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
  variant?: "success" | "failure" | null;
}
