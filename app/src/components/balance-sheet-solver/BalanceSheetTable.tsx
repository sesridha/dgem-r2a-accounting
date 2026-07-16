"use client";

import { DataTable, type Column } from "@/components/shared/data-table";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import type { BalanceSheetTableProps } from "@/types/balanceSheet";
import { useMemo, useState } from "react";

export default function BalanceSheetTable<T>({
  data,
  title,
  columns,
  currentPage,
  setCurrentPage,
}: BalanceSheetTableProps<T>) {
  const [pageSize] = useState(10);

  // Calculate subtotals for numeric columns from current page data
  const subtotals = useMemo(() => {
    const totals: { [key: string]: number } = {};

    // Only calculate for current page data to improve performance
    const paginatedData = data.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );

    columns.forEach((col) => {
      if (
        col.key === "ou" ||
        col.key === "jrnBatchName" ||
        col.key === "jeName"
      ) {
        return; // Skip non-numeric columns
      }

      const sum = paginatedData.reduce((acc, row) => {
        const value = (row as Record<string, number | string | boolean>)[
          col.key
        ];
        if (typeof value === "number") {
          return acc + value;
        }
        return acc;
      }, 0);

      if (sum !== 0) {
        totals[col.key] = sum;
      }
    });

    return totals;
  }, [data, columns, currentPage, pageSize]);

  // Create synthetic subtotal row to add to data
  const subtotalRow = useMemo(() => {
    const row: Record<string, number | string | boolean> = {
      ou: "Subtotal",
      status: "",
      paymentStatusName: "",
      jeName: "",
      jrnBatchName: "",
      _isSubtotal: true,
    };
    columns.forEach((col) => {
      if (!Object.prototype.hasOwnProperty.call(row, col.key)) {
        row[col.key] = subtotals[col.key] ?? "";
      }
    });
    return row;
  }, [subtotals, columns]);

  // Append subtotal row to current page data
  const dataWithSubtotal = useMemo(() => {
    const paginatedData = data.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );

    if (Object.keys(subtotals).length === 0) {
      return paginatedData;
    }

    return [...paginatedData, subtotalRow];
  }, [data, currentPage, pageSize, subtotals, subtotalRow]);

  const tableModel = useTanstackDataTableState<
    T | Record<string, number | string | boolean>
  >({
    data: dataWithSubtotal as (T | Record<string, number | string | boolean>)[],
    columns: columns as Column<T | Record<string, number | string | boolean>>[],
    currentPage: 1, // Set to 1 since we're showing paginated data + subtotal
    pageSize: dataWithSubtotal.length,
    totalItems: dataWithSubtotal.length,
    onPageChange: () => {}, // Pagination handled by parent component
    onPageSizeChange: () => {},
    enableSorting: true,
    enableColumnVisibility: true,
    title: title,
  });

  return (
    <div className="w-full space-y-4 p-6">
      <DataTable
        model={tableModel}
        showPagination={false}
        emptyMessage={`No ${title.toLowerCase()} records available`}
        getRowClassName={(
          row: T | Record<string, number | string | boolean>,
        ) => {
          const rowData = row as Record<string, number | string | boolean>;
          if (rowData.ou === "Subtotal") {
            return "bg-slate-100 border-t-2 border-slate-300 font-bold";
          }
          return undefined;
        }}
      />

      {/* Pagination Controls */}
      {data.length > pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {currentPage} of {Math.ceil(data.length / pageSize)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(Math.ceil(data.length / pageSize), currentPage + 1),
                )
              }
              disabled={currentPage >= Math.ceil(data.length / pageSize)}
              className="px-3 py-1 text-xs border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
