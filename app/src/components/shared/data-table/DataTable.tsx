"use client";

import * as React from "react";
import { DataTableView } from "./DataTableView";
import type { TanstackTableModel } from "@/hooks/useTanstackDataTableState";

export function DataTable<T>({
  model,
  className,
  loading = false,
  showPagination = true,
  pageSizeOptions = [5, 10, 20, 50],
  emptyState,
  emptyMessage = "No data available",
  hoverEffect = true,
  getRowClassName,
  defaultVisibleFilterColumns,
  isDownload = false,
  downloadData = [],
  downloadColumns = [],
  downloadFileName = "data_export",
}: {
  model: TanstackTableModel<T>;
  className?: string;
  loading?: boolean;
  showPagination?: boolean;
  pageSizeOptions?: number[];
  emptyState?: React.ReactNode;
  emptyMessage?: string;
  hoverEffect?: boolean;
  getRowClassName?: (row: T, index: number) => string | undefined;
  defaultVisibleFilterColumns?: string[];
  isDownload?: boolean;
  downloadData?: unknown[];
  downloadColumns?: { key: string; label: string }[];
  downloadFileName?: string;
}) {
  return (
    <DataTableView
      model={model}
      className={className}
      loading={loading}
      showPagination={showPagination}
      pageSizeOptions={pageSizeOptions}
      emptyState={emptyState}
      emptyMessage={emptyMessage}
      hoverEffect={hoverEffect}
      getRowClassName={getRowClassName}
      defaultVisibleFilterColumns={defaultVisibleFilterColumns}
      isDownload={isDownload}
      downloadData={downloadData}
      downloadColumns={downloadColumns}
      downloadFileName={downloadFileName}
    />
  );
}
