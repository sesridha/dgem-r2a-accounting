"use client";

import { Cloud, Upload } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusToast } from "@/components/shared/StatusToast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  InvestmentAccountingPostingRecord,
  InvestmentAccResultProps,
} from "@/types";
import { IA_OUTPUT_COLUMNS } from "@/utils/tableColumns";
import { InvestmentAccJsonOutputData } from "../../../../data/journalEntry.mock";
import { useTanstackDataTableState } from "../../../hooks/useTanstackDataTableState";
import { DataTable, type Column } from "../../shared/data-table";
import { EmptyState } from "../../shared/EmptyState";
import { investmentAccountingRenders } from "../JournalColumnsRenderer";

const InvestmentAccountResult = ({
  variant,
  content,
  postingData = [],
}: InvestmentAccResultProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isSuccess = variant === "success";
  const isVisible = false;
  /* ---------------- Output Columns ---------------- */
  const outputColumns: Column<InvestmentAccountingPostingRecord>[] =
    useMemo(() => {
      return IA_OUTPUT_COLUMNS.map((c) => {
        const isDebitCreditColumn = c.key === "dr_cr";
        const isDateColumn = c.key === "transaction_date";

        return {
          key: c.key,
          header: c.header,
          width: c.width,
          sortable: c.sortable,

          accessor: c.accessorId
            ? investmentAccountingRenders[c.accessorId]
            : undefined,

          render: c.rendererId
            ? investmentAccountingRenders[c.rendererId]
            : undefined,

          filterType: isDateColumn ? ("date" as const) : undefined,

          filterFn: isDebitCreditColumn
            ? (row: InvestmentAccountingPostingRecord, filterValue: string) => {
                const raw = row.dr_cr; // "DR" | "CR"

                const normalized =
                  raw === "DR" ? "debit" : raw === "CR" ? "credit" : "";

                const search = String(filterValue ?? "")
                  .toLowerCase()
                  .trim();

                // allow empty filter
                if (!search) return true;

                return (
                  normalized.includes(search) ||
                  raw.toLowerCase().includes(search)
                );
              }
            : isDateColumn
              ? (row: InvestmentAccountingPostingRecord, filterValue: string) => {
                  // Date filter: match if the row's transaction_date contains the selected date
                  if (!filterValue) return true;
                  const rowDate = String(row.transaction_date ?? "");
                  return rowDate.includes(filterValue);
                }
              : undefined,
        };
      });
    }, []);

  const hasPostingData = postingData.length > 0;

  /* ---------------- Table Model ---------------- */
  const postingModel = useTanstackDataTableState({
    data: postingData,
    columns: outputColumns,
    currentPage: page,
    pageSize,
    totalItems: postingData.length,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    enableColumnFilters: true,
    showFilteredCount: false,
    title: `Processed Journal Investment Accounting Posting Entries (${InvestmentAccJsonOutputData.length} rows)`,
  });

  return (
    <div className="space-y-6">
      {isVisible && (
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
      {/* ================= Output Data ================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6">
        {hasPostingData ? (
          <DataTable
            model={postingModel}
            showPagination
            pageSizeOptions={[5, 10, 20]}
            emptyState={<EmptyState message="No posting data found." />}
            defaultVisibleFilterColumns={["transaction_date"]}
            isDownload={true}
            downloadData={InvestmentAccJsonOutputData}
            downloadColumns={outputColumns.map((col) => ({
              label: col.header,
              key: col.key,
            }))}
            downloadFileName="investment_accounting_posting"
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
                investment accounting processing, validation results, and final
                posting records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportFile
                data={InvestmentAccJsonOutputData}
                fileName="investment_accounting_proof_of_work"
                columns={outputColumns.map((col) => ({
                  label: col.header,
                  key: col.key,
                }))}
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
                Investment Accounting
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

      {/* ================= ERP Integration ================= */}
      <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
          <Cloud className="h-6 w-6 text-blue-600" />
        </div>

        <h4 className="text-lg font-semibold text-slate-900 mt-4">
          Ready for ERP Integration
        </h4>

        <p className="text-sm text-slate-600 mt-2">
          The calculated journal posting entries are ready to be pushed to ERP.
        </p>

        <div className="flex justify-center mt-6">
          <Button className="h-10 px-6 bg-blue-600 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Export to ERP
          </Button>
        </div>

        <div className="text-[10px] text-slate-500 mt-4">
          CONNECTED TO: SAP‑S4HANA‑PROD
        </div>
      </div>
      {/* <ProofOfWorkPanel hasProofOfWorkData={false} /> */}
    </div>
  );
};

export default InvestmentAccountResult;
