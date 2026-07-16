"use client";

import { DataTable } from "@/components/shared/data-table";
import { StatusToast } from "@/components/shared/StatusToast";
import { Button } from "@/components/ui/button";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import type { ICTransactionRecord, ReviewDecision } from "@/types";
import type { ICItemSolverResultProps } from "@/types/icItemSolver";
import { useEffect, useRef, useState } from "react";
import TransposeView from "../shared/data-table/TransposeView";
import { icTransactionRenderers } from "./ICTransactionRenderers";
import {
  useCreateAPInvoiceBookColumns,
  useICItemSolverInputColumns,
  useICItemSolverResultColumns,
  useUnAccountedInvoiceColumns,
} from "./useICItemSolverColumns";

export default function ICItemSolverTable({
  results,
  drillDownAccountCode,
  drillDownAccountName,
  drillDownRows,
  selectedDrillResult,
  selectedReviewDecision,
  onDrillDown,
  isDrillLoading,
  onExplanationChange,
  onReviewDecision,
  invoiceData,
  drillDownTransactionNumber,
  showResults,
  setResultPage,
  resultPage,
}: ICItemSolverResultProps) {
  const [resultPageSize, setResultPageSize] = useState(10);
  const [toastState, setToastState] = useState<{
    variant: "success" | "failure";
    title: string;
    description: string;
    key: number;
  } | null>(null);
  const drillSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drillDownAccountCode) return;
    setTimeout(() => {
      drillSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }, [drillDownAccountCode, drillDownRows.length, drillDownTransactionNumber]);

  const isAutoReconciled =
    showResults &&
    results.length > 0 &&
    results.every((r) => r.reconciliationStatus === "Auto Reconciled");

  const resultColumns = useICItemSolverResultColumns({
    onDrillDown,
    isDrillLoading,
    drillDownTransactionNumber,
    hideDrillColumn: isAutoReconciled,
  });

  const inputColumns = useICItemSolverInputColumns(icTransactionRenderers);

  const resultModel = useTanstackDataTableState<ICTransactionRecord>({
    data: results,
    columns: showResults ? resultColumns : inputColumns,
    currentPage: resultPage,
    pageSize: resultPageSize,
    totalItems: results.length,
    onPageChange: setResultPage,
    onPageSizeChange: setResultPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    title: showResults ? "Reconciliation Summary" : "Input Data",
  });

  const unAccountedInvoiceColumns = useUnAccountedInvoiceColumns();

  const invoiceBookColumns = useCreateAPInvoiceBookColumns();

  const reviewStatusClassName =
    selectedReviewDecision === "accepted"
      ? "bg-emerald-100 text-emerald-700"
      : selectedReviewDecision === "rejected"
        ? "bg-rose-100 text-rose-700"
        : "bg-slate-100 text-slate-600";

  const reviewStatusLabel =
    selectedReviewDecision === "accepted"
      ? "Accepted"
      : selectedReviewDecision === "rejected"
        ? "Rejected"
        : "Pending Review";

  const handleReviewAction = (decision: ReviewDecision) => {
    if (!drillDownAccountCode) return;

    onReviewDecision(drillDownAccountCode, decision);
    setToastState({
      variant: decision === "accepted" ? "success" : "failure",
      title: `Explanation ${decision}`,
      description:
        decision === "accepted"
          ? "The edited explanation has been accepted for this anomaly."
          : "The explanation has been marked for rework.",
      key: Date.now(),
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4">
          <DataTable
            model={resultModel}
            showPagination={results.length > 0}
            pageSizeOptions={[5, 10, 20]}
            emptyMessage={
              showResults
                ? "No results for selected filters"
                : "No input data found for selected filters"
            }
            getRowClassName={(row) =>
              drillDownTransactionNumber === row.transactionNumber
                ? "bg-blue-50"
                : undefined
            }
            isDownload={showResults && results.length > 0}
            downloadData={results as unknown as Record<string, unknown>[]}
            downloadColumns={resultColumns
              .filter((col) => col.key !== "drillProcess")
              .map((data) => ({
                label: data.header,
                key: data.key,
              }))}
            downloadFileName="Export Invoice Missing Report"
          />
        </div>
      </div>

      {drillDownAccountCode && (
        <div
          ref={drillSectionRef}
          className="mt-8 rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-sky-50/40 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#111418] uppercase tracking-wide">
                Posting Data for {drillDownAccountName}
              </h3>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Explanation
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${reviewStatusClassName}`}
                >
                  {reviewStatusLabel}
                </span>
              </div>

              <textarea
                value={selectedDrillResult?.explanation ?? ""}
                onChange={(event) => {
                  if (!drillDownAccountCode) return;
                  onExplanationChange(drillDownAccountCode, event.target.value);
                }}
                placeholder="Add or update the explanation for this anomaly"
                className="mt-3 min-h-32 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  className="h-9 bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                  onClick={() => handleReviewAction("accepted")}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-rose-200 px-4 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  onClick={() => handleReviewAction("rejected")}
                >
                  Reject
                </Button>
              </div>
            </div>

            {toastState ? (
              <div className="mt-3">
                <StatusToast
                  key={toastState.key}
                  variant={toastState.variant}
                  title={toastState.title}
                  description={toastState.description}
                  autoHideDuration={2500}
                />
              </div>
            ) : null}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: AP Invoice Book */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-linear-to-r from-sky-100 to-cyan-50">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    AP Invoice Book
                  </h4>
                </div>
                <div className="p-3">
                  {invoiceData?.ap_invoice_book &&
                  invoiceData?.ap_invoice_book?.length > 0 ? (
                    <TransposeView
                      record={invoiceData.ap_invoice_book[0]}
                      columns={invoiceBookColumns}
                    />
                  ) : (
                    <div className="flex flex-col mt-15 items-center justify-center py-6 text-slate-400">
                      <span className="text-sm font-medium">
                        No AP Invoice data available
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Un‑accounted Invoices */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-linear-to-r from-rose-100 to-orange-50">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Un‑accounted Invoices
                  </h4>
                </div>
                <div className="p-3">
                  {invoiceData?.un_accounted_invoices[0] && (
                    <TransposeView
                      record={invoiceData?.un_accounted_invoices[0]}
                      columns={unAccountedInvoiceColumns}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
