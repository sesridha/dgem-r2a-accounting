"use client";

import type { Column } from "@/components/shared/data-table";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import type {
  ExportMeta,
  TrialBalanceRecord,
  TrialBalanceTableProps,
} from "@/types";
import { TRIAL_BALANCE_COLUMNS } from "@/utils/tableColumns";
import { useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "../shared/data-table/DataTable";
import { trialBalanceKeyRenderers } from "./trialBalanceRenderers";

export default function TrialBalanceTable({
  data,
  loading = false,
  pageSizeOptions = [5, 10, 20],
  onExportMetaChange,
  initialPageSize = 10,
}: TrialBalanceTableProps) {
  /* ---------------------- columns ---------------------- */
  const columns: Column<TrialBalanceRecord>[] = useMemo(() => {
    return TRIAL_BALANCE_COLUMNS.map((c) => ({
      key: c.key,
      header: c.header,
      width: c.width,
      sortable: c.sortable,
      render: c.rendererId ? trialBalanceKeyRenderers[c.rendererId] : undefined,
    }));
  }, []);

  /* ---------------------- pagination (derived) ---------------------- */
  const [rulesPage, setRulesPage] = useState(1);
  const [rulesPageSize, setRulesPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const maxPage = Math.max(1, Math.ceil(totalItems / rulesPageSize));
  const currentPage = Math.min(rulesPage, maxPage);

  /* ---------------------- table model ---------------------- */
  const tableModel = useTanstackDataTableState({
    data,
    columns,
    currentPage,
    pageSize: rulesPageSize,
    totalItems,
    onPageChange: setRulesPage,
    onPageSizeChange: setRulesPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
  });

  /* ---------------------- export meta (visible rows/cols) ---------------------- */
  const visibleColumns = tableModel.table.getVisibleLeafColumns();
  const filteredRows = tableModel.table.getRowModel().rows;

  const exportRows = useMemo(() => {
    return filteredRows.map((row) => {
      const out: Record<string, unknown> = {};
      for (const col of visibleColumns) {
        out[col.id] = row.getValue(col.id);
      }
      return out;
    });
  }, [filteredRows, visibleColumns]);

  const exportColumns = useMemo(() => {
    return visibleColumns.map((col) => ({
      key: col.id,
      label: tableModel.columnLabelMap[col.id] ?? col.id,
    }));
  }, [visibleColumns, tableModel.columnLabelMap]);

  const lastExportRef = useRef<ExportMeta>({ rows: [], columns: [] });

  useEffect(() => {
    const prev = lastExportRef.current;

    // Deep compare to avoid loops and spurious calls.
    const sameRows = JSON.stringify(prev.rows) === JSON.stringify(exportRows);
    const sameCols =
      JSON.stringify(prev.columns) === JSON.stringify(exportColumns);
    if (sameRows && sameCols) return;

    const next = { rows: exportRows, columns: exportColumns };
    lastExportRef.current = next;

    // Inform parent after render commit (safe side-effect).
    onExportMetaChange?.(next);
  }, [exportRows, exportColumns, onExportMetaChange]);

  /* ---------------------- UI ---------------------- */
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <DataTable
        model={tableModel}
        loading={loading}
        showPagination
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
