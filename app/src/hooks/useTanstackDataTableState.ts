"use client";

import type { Column } from "@/components/shared/data-table/types";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
} from "@tanstack/react-table";
import * as React from "react";

type Align = "left" | "center" | "right";

export type TableFilterOperator =
  | "contains"
  | "doesNotContain"
  | "equals"
  | "doesNotEqual"
  | "beginsWith"
  | "endsWith"
  | "blank"
  | "notBlank";

type TableFilterValue = {
  operator: TableFilterOperator;
  value?: string;
};

function parseFilterValue(filterValue: unknown): {
  operator: TableFilterOperator;
  value: string;
} {
  if (
    typeof filterValue === "object" &&
    filterValue !== null &&
    "operator" in filterValue
  ) {
    const typed = filterValue as TableFilterValue;
    return {
      operator: typed.operator,
      value: String(typed.value ?? ""),
    };
  }

  return {
    operator: "contains",
    value: String(filterValue ?? ""),
  };
}

function matchesColumnFilter(rawValue: unknown, filterValue: unknown): boolean {
  const { operator, value } = parseFilterValue(filterValue);
  const rawText =
    rawValue === null || rawValue === undefined ? "" : String(rawValue);
  const text = rawText.toLowerCase();
  const query = value.trim().toLowerCase();
  const isBlank = rawText.trim() === "";

  switch (operator) {
    case "blank":
      return isBlank;
    case "notBlank":
      return !isBlank;
    case "contains":
      return query === "" ? true : text.includes(query);
    case "doesNotContain":
      return query === "" ? true : !text.includes(query);
    case "equals":
      return query === "" ? true : text === query;
    case "doesNotEqual":
      return query === "" ? true : text !== query;
    case "beginsWith":
      return query === "" ? true : text.startsWith(query);
    case "endsWith":
      return query === "" ? true : text.endsWith(query);
    default:
      return true;
  }
}

export type TableColumnMeta = {
  width?: string;
  align?: Align;
  headerAlign?: Align;
  filterable?: boolean;
  filterType?: "text" | "date";
};

export type TanstackTableModel<T> = {
  /** TanStack table instance (used for render) */
  table: ReturnType<typeof useReactTable<T>>;
  /** Label map for column ids for UI copy (filters/visibility) */
  columnLabelMap: Record<string, React.ReactNode>;
  /** Derived info */
  rows: ReturnType<ReturnType<typeof useReactTable<T>>["getRowModel"]>["rows"];
  filteredRowCount: number;
  isEmpty: boolean;

  /** Controls from the hook (states and setters) */
  state: {
    sorting: SortingState;
    globalFilter: string;
    columnFilters: ColumnFiltersState;
    columnVisibility: Record<string, boolean>;
  };
  title?: React.ReactNode | string;
  description?: React.ReactNode | string;
  actions: {
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
    setGlobalFilter: (v: string) => void;
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
    setColumnVisibility: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
  };

  /** Flags that the view needs */
  options: {
    enableGlobalFilter: boolean;
    enableColumnFilters: boolean;
    enableSorting: boolean;
    enableColumnVisibility: boolean;
    globalFilterPlaceholder: string;
    showFilteredCount: boolean;
  };

  /** Pagination derived values (driven by props) */
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
  };
};

export function useTanstackDataTableState<T>(params: {
  data: T[];
  columns: Column<T>[];
  /** Pagination (controlled from parent) */
  currentPage: number;
  pageSize: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  /** Feature flags */
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  globalFilterPlaceholder?: string;
  showFilteredCount?: boolean;
  /** Columns hidden by default; user can toggle them on via the column visibility menu */
  initialColumnVisibility?: Record<string, boolean>;
  title?: React.ReactNode | string;
  description?: React.ReactNode | string;
}) {
  const {
    data,
    columns,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    enableGlobalFilter = false,
    enableColumnFilters = false,
    enableSorting = false,
    enableColumnVisibility = false,
    globalFilterPlaceholder = "Search all columns...",
    showFilteredCount = true,
    initialColumnVisibility = {},
    title,
    description,
  } = params;

  // TanStack states
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >(initialColumnVisibility);

  // Default column filter function
  const defaultColumnFilterFn: FilterFn<T> = React.useCallback(
    (row, columnId, filterValue, addMeta) => {
      void addMeta;
      const rawValue = row.getValue(columnId);
      return matchesColumnFilter(rawValue, filterValue);
    },
    [],
  );

  // Labels for UI (column toggle/filter placeholders)
  const columnLabelMap = React.useMemo(
    () =>
      Object.fromEntries(
        columns.map((column) => [column.key, column.header] as const),
      ),
    [columns],
  );

  // Global filter across all columns
  const globalFilterFn: FilterFn<T> = React.useCallback(
    (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase().trim();
      if (!query) return true;

      return columns.some((column) => {
        const rawValue = column.accessor
          ? column.accessor(row.original)
          : (row.original as Record<string, unknown>)[column.key];

        const value =
          rawValue === null || rawValue === undefined ? "" : String(rawValue);
        return value.toLowerCase().includes(query);
      });
    },
    [columns],
  );

  // Map your Column<T> to TanStack ColumnDef<T>
  const tanstackColumns = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    return columns.map((column) => {
      const columnFilterFn: FilterFn<T> = (row, _columnId, filterValue) => {
        const parsedFilter = parseFilterValue(filterValue);

        if (column.filterFn) {
          if (parsedFilter.operator === "contains") {
            return column.filterFn(row.original, parsedFilter.value);
          }

          const rawValue = column.accessor
            ? column.accessor(row.original)
            : (row.original as Record<string, unknown>)[column.key];

          return matchesColumnFilter(rawValue, filterValue);
        }

        return defaultColumnFilterFn(
          row,
          column.key,
          filterValue,
          () => undefined,
        );
      };

      // Sorting logic
      let columnEnableSorting = false;
      if (enableSorting) {
        columnEnableSorting = true;
      } else if (column.sortable === true) {
        columnEnableSorting = true;
      }

      return {
        id: column.key,
        accessorFn: (row) =>
          column.accessor
            ? column.accessor(row)
            : (row as Record<string, unknown>)[column.key],
        header: () => column.header,
        cell: ({ row }) => {
          if (column.render) return column.render(row.original, row.index);
          const rawValue = column.accessor
            ? column.accessor(row.original)
            : (row.original as Record<string, unknown>)[column.key];
          return rawValue as React.ReactNode;
        },
        enableSorting: columnEnableSorting,
        enableColumnFilter: column.filterable ?? true,
        filterFn: columnFilterFn,
        meta: {
          width: column.width,
          align: column.align,
          headerAlign: column.headerAlign || column.align,
          filterable: column.filterable ?? true,
          filterType: column.filterType ?? "text",
        } as TableColumnMeta,
      };
    });
  }, [columns, defaultColumnFilterFn, enableSorting]);

  // Build TanStack table

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel:
      enableGlobalFilter || enableColumnFilters
        ? getFilteredRowModel()
        : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    globalFilterFn,
    autoResetPageIndex: false,
  });

  const rows = table.getRowModel().rows;
  const filteredRowCount = rows.length;

  const pagedRows = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);
  }, [rows, currentPage, pageSize]);

  // Pagination derived info (driven by parent-controlled pagination)
  const actualTotalItems = filteredRowCount;
  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(0, actualTotalItems) / pageSize),
  );
  const startIndex =
    actualTotalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex =
    actualTotalItems === 0
      ? 0
      : Math.min(currentPage * pageSize, actualTotalItems);

  const isEmpty = rows.length === 0;

  return {
    table,
    columnLabelMap,
    rows: pagedRows,
    filteredRowCount,
    isEmpty,
    title,
    description,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    actions: {
      setSorting,
      setGlobalFilter,
      setColumnFilters,
      setColumnVisibility,
      setPage: (p: number) => onPageChange?.(p),
      setPageSize: (s: number) => {
        onPageSizeChange?.(s);
        onPageChange?.(1);
      },
    },

    options: {
      enableGlobalFilter,
      enableColumnFilters,
      enableSorting,
      enableColumnVisibility,
      globalFilterPlaceholder,
      showFilteredCount,
    },

    pagination: {
      currentPage,
      pageSize,
      totalItems: actualTotalItems,
      totalPages,
      startIndex,
      endIndex,
    },
  } satisfies TanstackTableModel<T>;
}
