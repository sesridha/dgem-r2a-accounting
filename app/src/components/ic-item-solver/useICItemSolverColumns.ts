import { useMemo } from "react";
import type { Column } from "@/components/shared/data-table";
import type {
  ICAPInvoiceRecord,
  ICInvoiceExceptionRecord,
  ICTransactionRecord,
} from "@/types";
import {
  apInvoiceRenderers,
  icTransactionRenderers,
  unAccountedInvoiceRenderers,
  type APInvoiceRendererId,
  type ICTransactionRendererId,
  type UnAccountedInvoiceRendererId,
} from "./ICTransactionRenderers";
import {
  AP_INVOICE_BOOK_COLUMNS,
  IC_ITEM_SOLVER_RESULT_COLUMNS,
  UNACCOUNTED_INVOICE_COLUMNS,
} from "@/utils/tableColumns";
import type { JSX } from "react";
export function useICItemSolverResultColumns({
  onDrillDown,
  isDrillLoading,
  drillDownTransactionNumber,
  hideDrillColumn = false,
}: {
  onDrillDown: (row: ICTransactionRecord) => void;
  isDrillLoading: boolean;
  drillDownTransactionNumber: string | number | null;
  hideDrillColumn?: boolean;
}): Column<ICTransactionRecord>[] {
  return useMemo(() => {
    const boundRenderers: {
      [K in ICTransactionRendererId]: (
        row: ICTransactionRecord,
      ) => JSX.Element | null;
    } = {
      ...icTransactionRenderers,

      drillButton: (row) =>
        icTransactionRenderers.drillButton(row, {
          onDrillDown,
          isDrillLoading,
          drillDownTransactionNumber,
        }),
    };

    return IC_ITEM_SOLVER_RESULT_COLUMNS
      .filter((c) => !(hideDrillColumn && c.key === "drillProcess"))
      .map((c) => ({
        key: c.key,
        header: c.header,
        width: c.width,
        sortable: c.sortable,
        render: c.rendererId ? boundRenderers[c.rendererId] : undefined,
      }));
  }, [onDrillDown, isDrillLoading, drillDownTransactionNumber, hideDrillColumn]);
}

export function useICItemSolverInputColumns(boundRenderers: {
  [K in ICTransactionRendererId]: (
    row: ICTransactionRecord,
  ) => JSX.Element | null;
}): Column<ICTransactionRecord>[] {
  return useMemo(() => {
    return IC_ITEM_SOLVER_RESULT_COLUMNS.filter(
      (c) => c.key !== "drillProcess" && c.key !== "mismatchType",
    ).map((c) => ({
      key: c.key,
      header: c.header,
      width: c.width,
      sortable: c.sortable,
      render: c.rendererId ? boundRenderers[c.rendererId] : undefined,
    }));
  }, [boundRenderers]);
}

export const useCreateAPInvoiceBookColumns = (
  highlightedInvoiceNumbers: Set<string> = new Set(),
): Column<ICAPInvoiceRecord>[] => {
  const boundRenderers: {
    [K in APInvoiceRendererId]: (row: ICAPInvoiceRecord) => JSX.Element;
  } = {
    ...apInvoiceRenderers,

    invoiceNumber: (row) =>
      apInvoiceRenderers.invoiceNumber(row, {
        highlightedInvoiceNumbers,
      })!,
  };

  return AP_INVOICE_BOOK_COLUMNS.map((c) => ({
    key: c.key,
    header: c.header,
    width: c.width,
    align: c.align,
    render: c.rendererId ? boundRenderers[c.rendererId] : undefined,
  }));
};

export const useUnAccountedInvoiceColumns = (
  highlightedInvoiceNumbers: Set<string> = new Set(),
): Column<ICInvoiceExceptionRecord>[] => {
  const boundRenderers: {
    [K in UnAccountedInvoiceRendererId]: (
      row: ICInvoiceExceptionRecord,
    ) => JSX.Element;
  } = {
    ...unAccountedInvoiceRenderers,

    invoiceNumber: (row) =>
      unAccountedInvoiceRenderers.invoiceNumber(row, {
        highlightedInvoiceNumbers,
      })!,
  };

  return UNACCOUNTED_INVOICE_COLUMNS.map((c) => ({
    key: c.key,
    header: c.header,
    width: c.width,
    align: c.align,
    render: c.rendererId ? boundRenderers[c.rendererId] : undefined,
  }));
};

export const getInputSupplierEntityName = (row: ICTransactionRecord): string =>
  String(row.supplierEntityName ?? row["supplierEntityName"] ?? "").trim();
