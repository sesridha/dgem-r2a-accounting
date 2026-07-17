"use client";

import type {
  ICAPInvoiceRecord,
  ICInvoiceExceptionRecord,
  ICTransactionRecord,
} from "@/types";
import { formatCurrency } from "@/utils/common";
import { Loader2, Search } from "lucide-react";
/* -------------------------------------------------------------------------- */
/*                           IC TRANSACTION RENDERERS                          */
/* -------------------------------------------------------------------------- */

export const icTransactionRenderers = {
  transactionNumber: (row: ICTransactionRecord) => (
    <span className=" text-slate-700">{row.transactionNumber}</span>
  ),

  supplierEntity: (row: ICTransactionRecord) => (
    <span title={row.supplierEntityName}>{row.supplierEntityName}</span>
  ),

  clientEntity: (row: ICTransactionRecord) => (
    <span title={row.clientEntityName}>{row.clientEntityName}</span>
  ),

  reconciliationStatus: (row: ICTransactionRecord) =>
    row.reconciliationStatus === "Auto Reconciled" ? (
      <span>Auto Reconciled</span>
    ) : (
      <span>Unreconciled</span>
    ),

  transactionDate: (row: ICTransactionRecord) => (
    <span className="text-slate-700">{row.transactionDate}</span>
  ),

  transactionType: (row: ICTransactionRecord) => (
    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold">
      {row.transactionType}
    </span>
  ),

  transactionCurrency: (row: ICTransactionRecord) => (
    <span className="">{row.transactionCurrency}</span>
  ),

  transactionAmount: (row: ICTransactionRecord) => (
    <span
      className={`tabular-nums font-semibold ${
        row.transactionAmount < 0 ? "text-rose-700" : "text-slate-800"
      }`}
    >
      {Number(row.transactionAmount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  ),

  mismatchType: (row: ICTransactionRecord) =>
    !row.mismatchType ? (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
        No mismatch
      </span>
    ) : row.mismatchType === "Auto Reconciled" ? (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
        Auto Reconciled
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
        {row.mismatchType}
      </span>
    ),

  drillButton: (
    row: ICTransactionRecord,
    ctx?: {
      onDrillDown?: (row: ICTransactionRecord) => void;
      isDrillLoading?: boolean;
      drillDownTransactionNumber?: string | number | null;
    },
  ) => {
    if (!row.supplierEntityCode || !ctx?.onDrillDown) return null;

    if (row.reconciliationStatus === "Auto Reconciled") return null;

    const isDrilled = ctx.drillDownTransactionNumber === row.transactionNumber;

    const isLoading =
      ctx.isDrillLoading &&
      ctx.drillDownTransactionNumber === row.transactionNumber;

    return (
      <button
        onClick={() => ctx.onDrillDown?.(row)}
        disabled={ctx.isDrillLoading}
        className={`group relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all duration-200 ${
          isLoading
            ? "bg-linear-to-r from-cyan-400 to-blue-500 text-white shadow-sm opacity-80 cursor-wait"
            : isDrilled
              ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-200 ring-2 ring-cyan-200"
              : ctx.isDrillLoading
                ? "bg-linear-to-r from-sky-500 to-blue-600 text-white/60 shadow-sm cursor-not-allowed"
                : "bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-blue-200 hover:from-cyan-500 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-200"
        }`}
      >
        {!isLoading && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-200 opacity-90" />
        )}

        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Search
            className={`w-3 h-3 transition-transform duration-200 ${
              isDrilled
                ? "scale-110"
                : "group-hover:scale-110 group-hover:rotate-3"
            }`}
          />
        )}

        <span className="tracking-wide">
          {isLoading ? "Loading…" : "Drill"}
        </span>
      </button>
    );
  },
};

export const apInvoiceRenderers = {
  supplierName: (row: ICAPInvoiceRecord) => (
    <span className="block truncate" title={row.supplier_name}>
      {row.supplier_name}
    </span>
  ),

  invoiceNumber: (
    row: ICAPInvoiceRecord,
    ctx?: { highlightedInvoiceNumbers?: Set<string> },
  ) => {
    const isHighlighted = ctx?.highlightedInvoiceNumbers?.has(row.invoice_num);

    return (
      <span
        className={`inline-flex rounded-md py-1  ${
          isHighlighted
            ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
            : "text-slate-700"
        }`}
      >
        {row.invoice_num}
      </span>
    );
  },

  invoiceStatus: (row: ICAPInvoiceRecord) => (
    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      {row.invoice_status}
    </span>
  ),

  invoiceAmount: (row: ICAPInvoiceRecord) => (
    <span
      className={`tabular-nums ${
        row.invoice_amount_inv < 0 ? "font-semibold text-rose-700" : ""
      }`}
    >
      {formatCurrency(row.invoice_amount_inv)}
    </span>
  ),

  paidAmount: (row: ICAPInvoiceRecord) => (
    <span className="tabular-nums">{formatCurrency(row.amount_paid_inv)}</span>
  ),

  balanceAmount: (row: ICAPInvoiceRecord) => (
    <span
      className={`tabular-nums ${
        row.balance_amount_inv !== 0 ? "text-amber-600" : ""
      }`}
    >
      {formatCurrency(row.balance_amount_inv)}
    </span>
  ),
};

export const unAccountedInvoiceRenderers = {
  supplierName: (row: ICInvoiceExceptionRecord) => (
    <span className="block truncate" title={row.supplier_name}>
      {row.supplier_name}
    </span>
  ),

  supplierNumber: (row: ICInvoiceExceptionRecord) => (
    <span className=" text-slate-700">{row.supplier_number}</span>
  ),

  invoiceNumber: (
    row: ICInvoiceExceptionRecord,
    ctx?: { highlightedInvoiceNumbers?: Set<string> },
  ) => {
    const isHighlighted = ctx?.highlightedInvoiceNumbers?.has(
      row.invoice_number,
    );

    return (
      <span
        className={`inline-flex rounded-md py-1  ${
          isHighlighted
            ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
            : "text-slate-700"
        }`}
      >
        {row.invoice_number}
      </span>
    );
  },

  voucherNumber: (row: ICInvoiceExceptionRecord) => (
    <span className=" text-slate-700">{row.voucher_number}</span>
  ),

  invoiceAmount: (row: ICInvoiceExceptionRecord) => (
    <span
      className={`tabular-nums ${
        row.invoice_amount < 0 ? "text-rose-700" : ""
      }`}
    >
      {formatCurrency(row.invoice_amount)}
    </span>
  ),

  exceptionBadge: (row: ICInvoiceExceptionRecord) => (
    <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
      {row.exceptions}
    </span>
  ),
};

export type UnAccountedInvoiceRendererId =
  keyof typeof unAccountedInvoiceRenderers;

export type APInvoiceRendererId = keyof typeof apInvoiceRenderers;

export type ICTransactionRendererId = keyof typeof icTransactionRenderers;
