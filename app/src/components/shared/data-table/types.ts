/**
 * DataTable Component Props and Types
 */

export interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Header label to display */
  header: string;
  /** Optional custom width class (e.g., 'w-32', 'w-48') */
  width?: string;
  /** Optional header alignment */
  headerAlign?: "left" | "center" | "right";
  /** Optional cell alignment */
  align?: "left" | "center" | "right";
  /** Custom render function for cell content */
  render?: (row: T, index: number) => React.ReactNode;
  /** Accessor function to get value from row */
  accessor?: (row: T) => unknown;
  /** Enable sorting for this column (defaults to true) */
  sortable?: boolean;
  /** Enable filtering for this column (defaults to true) */
  filterable?: boolean;
  /** Optional custom filter function */
  filterFn?: (row: T, filterValue: string) => boolean;
  /** Filter type: 'text' for text-based filter (default), 'date' for calendar date picker */
  filterType?: "text" | "date";
}

export interface DataTableProps<T> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Optional row className resolver */
  getRowClassName?: (row: T, index: number) => string;
  /** Current page (1-indexed) */
  currentPage?: number;
  /** Items per page */
  pageSize?: number;
  /** Total number of items (for pagination calculation) */
  totalItems?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Show pagination controls */
  showPagination?: boolean;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Custom class for table container */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Enable row hover effect */
  hoverEffect?: boolean;
  /** Enable global filtering */
  enableGlobalFilter?: boolean;
  /** Enable per-column filtering */
  enableColumnFilters?: boolean;
  /** Enable column sorting */
  enableSorting?: boolean;
  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;
  /** Placeholder text for global filter input */
  globalFilterPlaceholder?: string;
  /** Show results summary for filtered rows */
  showFilteredCount?: boolean;
  /** Column ids that should show filter icons by default */
  defaultVisibleFilterColumns?: string[];
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}
