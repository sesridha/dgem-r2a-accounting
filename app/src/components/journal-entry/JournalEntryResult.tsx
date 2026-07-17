"use client";

import { StatusToast } from "@/components/shared/StatusToast";
import { Button } from "@/components/ui/button";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import { cn } from "@/lib/utils";
import { type JePostingRecord, type JournalEntryResultProps } from "@/types";
import { Cloud, Upload } from "lucide-react";
import { useState } from "react";
import { DataTable, type Column } from "../shared/data-table";
import { EmptyState } from "../shared/EmptyState";

function formatCurrency(val: number | null | undefined): string {
  if (val == null) return "-";
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  return val;
}

function sanitizeFileNamePart(value: string | undefined): string {
  const normalized = (value ?? "").trim();
  if (!normalized) return "je_posting_results";

  return (
    normalized
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase() || "je_posting_results"
  );
}

export function JournalEntryResult({
  variant,
  content,
  postingData = [],
  documentName,
}: JournalEntryResultProps) {
  const [postingPage, setPostingPage] = useState(1);
  const [postingPageSize, setPostingPageSize] = useState(10);
  const isSuccess = variant === "success";
  const isVisbile = false;
  const hasPostingData = postingData.length > 0;
  const exportFileName = `${sanitizeFileNamePart(documentName)}_posting`;

  // -----------------------
  // POSTING COLUMNS (real data from je_posting)
  // -----------------------
  const postingColumns: Column<JePostingRecord>[] = [
    {
      key: "company_code",
      header: "COMPANY CODE",
      width: "w-28",
      accessor: (r) => r.company_code ?? "",
      sortable: true,
    },
    {
      key: "document_type",
      header: "DOC TYPE",
      width: "w-24",
      accessor: (r) => r.document_type ?? "",
      sortable: true,
    },
    {
      key: "posting_date",
      header: "POSTING DATE",
      width: "w-28",
      render: (r) => <span>{formatDate(r.posting_date)}</span>,
      accessor: (r) => r.posting_date ?? "",
      sortable: true,
    },
    {
      key: "gl_account",
      header: "GL ACCOUNT",
      width: "w-32",
      render: (r) => <span>{r.gl_account ?? "-"}</span>,
      accessor: (r) => r.gl_account ?? "",
      sortable: true,
    },
    {
      key: "amount_document_currency",
      header: "AMOUNT (IN DOC CURRENCY)",
      width: "w-32",
      align: "right",
      render: (r) => (
        <span className="font-semibold">
          {formatCurrency(r.amount_document_currency)}
        </span>
      ),
      accessor: (r) => r.amount_document_currency ?? 0,
      sortable: true,
    },
    {
      key: "document_currency",
      header: "CURRENCY",
      width: "w-20",
      accessor: (r) => r.document_currency ?? "",
      sortable: true,
    },
    {
      key: "cost_center",
      header: "COST CENTER",
      width: "w-28",
      accessor: (r) => r.cost_center ?? "",
      sortable: true,
    },
  ];

  // -----------------------
  // HEADLESS TANSTACK STATE
  // -----------------------
  // Pass full postingData — the hook handles pagination internally via pagedRows
  const postingModel = useTanstackDataTableState<JePostingRecord>({
    data: postingData,
    columns: postingColumns,
    currentPage: postingPage,
    pageSize: postingPageSize,
    onPageChange: setPostingPage,
    onPageSizeChange: setPostingPageSize,
    enableSorting: true,
    enableColumnFilters: false,
    enableColumnVisibility: true,
    title: `JE Posting Results (${postingData.length} rows)`,
  });

  return (
    <div>
      <div className="w-full space-y-6">
        {/* TOAST */}
        {isVisbile && (
          <StatusToast
            variant={isSuccess ? "success" : "failure"}
            title={content.toastTitle}
            description={isSuccess ? content.toastDescription : undefined}
            showIcon={isSuccess}
            autoHideDuration={isSuccess ? 4000 : undefined}
            className={cn(
              isSuccess
                ? "rounded-xl"
                : "rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wide",
              isSuccess ? "bg-green-50" : "bg-red-50",
            )}
            titleClassName={isSuccess ? "text-green-800" : "text-red-700"}
          />
        )}

        {isSuccess && (
          /* SUCCESS RESULT VIEW */
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-center lg:justify-end"></div>
              {hasPostingData ? (
                <DataTable
                  model={postingModel}
                  showPagination
                  pageSizeOptions={[10, 25, 50, 100]}
                  emptyState={<EmptyState message="No posting data found." />}
                  isDownload={true}
                  downloadData={postingData}
                  downloadColumns={postingColumns.map((col) => ({
                    key: col.key,
                    label: col.header,
                  }))}
                  downloadFileName={exportFileName}
                />
              ) : (
                <EmptyState message="No posting data returned. The workflow may still be processing." />
              )}
            </div>

            {/* -----------------------
              EXPORT PROOF OF WORK
              Generates a detailed audit trail PDF/CSV containing:
              - Document metadata (name, timestamp, user)
              - All posting line items with debit/credit totals
              - Validation summary (balanced check, GL account verification)
              - Processing workflow steps and timestamps
            ----------------------- */}
            {/* {hasPostingData && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">
                      Export Proof of Work
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Generate a comprehensive audit trail documenting the
                      journal entry processing, validation results, and final
                      posting records.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExportFile
                      data={postingData}
                      fileName={`${sanitizeFileNamePart(documentName)}_proof_of_work`}
                      columns={postingExportColumns}
                      type="csv"
                      title="Export Proof of Work"
                      dropdown
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Document
                    </div>
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {documentName ?? "N/A"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Total Line Items
                    </div>
                    <div className="text-sm font-medium text-slate-800">
                      {postingData.length}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Balance Status
                    </div>
                    <div className="text-sm font-medium text-green-700">
                      Balanced ✓
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {/* ERP Integration Panel */}
            <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-5 lg:p-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Cloud className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mt-4">
                Ready for ERP Integration
              </h4>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                The calculated entries are balanced and validated. Push these
                records to SAP / Oracle ERP.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <Button className="h-10 px-6 bg-blue-600 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Export to ERP
                </Button>
              </div>

              <div className="text-[10px] text-slate-500 mt-4">
                CONNECTED TO: SAP‑S4HANA‑PROD
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
