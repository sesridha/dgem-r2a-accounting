"use client";

import { DataTable } from "@/components/shared/data-table";
import { StatusToast } from "@/components/shared/StatusToast";
import { Button } from "@/components/ui/button";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import type { BalanceSheetRecord, ReviewDecision } from "@/types";
import type {
  BalanceSheetSolverResultProps,
  DrillTab,
  TabConfig,
} from "@/types/balanceSheet";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBalanceSheetColumns } from "./balanceSheetColumns";
import {
  createAPEntryColumns,
  createJournalEntryColumns,
} from "./BalanceSheetRenders";
import BalanceSheetTable from "./BalanceSheetTable";

// Helper: check if a row is fully reconciled (no action needed)
const isReconciled = (row: BalanceSheetRecord): boolean => {
  const remark = row.remarks?.toLowerCase() || "";
  return (
    row.adjustedDiff === 0 ||
    remark.includes("fully reconciled") ||
    remark.includes("no action required")
  );
};

export default function BalanceSheetSolverResult({
  data,
  drillDownOU,
  onDrillDown,
  isDrillLoading,
  // apData,
  apEntry,
  // tbData,
  mjeData,
  // revalData,
  projectEntryData,
  reviewDecision,
  onExplanationChange,
  onReviewDecision,
  selectedDrillResult,
  pageByTab,
  setPageByTab,
  showDrillButton = false,
}: BalanceSheetSolverResultProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Mark when component has mounted and initial render is done
  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);
  const [manualActiveTab, setManualActiveTab] = useState<DrillTab | null>(null);
  const [toastState, setToastState] = useState<{
    variant: "success" | "failure";
    title: string;
    description: string;
    key: number;
  } | null>(null);
  const drillSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drillDownOU) return;

    const timer = setTimeout(() => {
      drillSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [drillDownOU]);

  // Memoize drill button click handler
  const handleDrillClick = useCallback(
    (row: BalanceSheetRecord) => {
      setManualActiveTab("ap");
      onDrillDown(row);
    },
    [onDrillDown],
  );

  // Determine if the drilled-down row is a reconciled (no-issue) row
  const isDrilledRowReconciled = useMemo(() => {
    if (!selectedDrillResult) return false;
    return isReconciled(selectedDrillResult);
  }, [selectedDrillResult]);

  // Create columns - conditionally include Action column only after agent run
  const columns = useMemo(() => {
    const baseColumns = createBalanceSheetColumns();

    // If agent hasn't run yet, exclude the Action (remarks) column entirely
    if (!showDrillButton) {
      return baseColumns.filter((col) => col.key !== "remarks");
    }

    // Agent has run - include Action column with drill button for ALL rows
    return baseColumns.map((col) => {
      if (col.key === "remarks") {
        return {
          ...col,
          render: (row: BalanceSheetRecord) => {
            if (row.ou === "Total") return null;

            const isDrilled = drillDownOU === row.ou;
            const isLoading = isDrillLoading && drillDownOU === row.ou;

            return (
              <button
                onClick={() => handleDrillClick(row)}
                disabled={isDrillLoading}
                className={`group relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  isLoading
                    ? "bg-linear-to-r from-cyan-400 to-blue-500 text-white shadow-sm opacity-80 cursor-wait"
                    : isDrilled
                      ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-200 ring-2 ring-cyan-200"
                      : isDrillLoading
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
                  {isLoading ? "Loading\u2026" : "Drill"}
                </span>
              </button>
            );
          },
        };
      }
      return col;
    });
  }, [drillDownOU, isDrillLoading, showDrillButton, handleDrillClick]);

  const tableModel = useTanstackDataTableState<BalanceSheetRecord>({
    data,
    columns,
    currentPage,
    pageSize,
    totalItems: data.length,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    title: "Balance Sheet Summary",
  });

  // Build tab config with record counts (only for non-reconciled rows)
  const tabs: TabConfig[] = useMemo(() => {
    if (!drillDownOU || isDrilledRowReconciled) return [];

    // Check if all reconciliation values are zero
    const hasReconciliationIssue =
      (selectedDrillResult?.diff ?? 0) !== 0 ||
      (selectedDrillResult?.revaluation ?? 0) !== 0 ||
      (selectedDrillResult?.manualEntries ?? 0) !== 0;

    if (!hasReconciliationIssue) return [];

    const visibleTabs: TabConfig[] = [];

    // Show AP Entry tab only if diff > 0
    if ((selectedDrillResult?.diff ?? 0) > 0) {
      const apEntryMatchingDiff = apEntry.filter((entry) => {
        const accountMatch = selectedDrillResult?.accountCode
          ? entry.accountCode === selectedDrillResult.accountCode
          : true;
        const amountMatch =
          Math.abs(entry.invoiceLineAmt ?? 0) ===
          Math.abs(selectedDrillResult?.diff ?? 0);
        return accountMatch && amountMatch;
      });

      visibleTabs.push({
        key: "ap_entry",
        label: "AP Entry",
        count: apEntryMatchingDiff.length,
      });
    }

    // Show Manual Journal Entries tab if manualEntries has any value
    if ((selectedDrillResult?.manualEntries ?? 0) !== 0) {
      visibleTabs.push({
        key: "mje",
        label: "Manual Journal Entries",
        count: mjeData[drillDownOU]?.length ?? 0,
      });
    }

    // Show Project Entry tab if diff < 0 (negative)
    if ((selectedDrillResult?.diff ?? 0) < 0) {
      visibleTabs.push({
        key: "project_entry",
        label: "Project Entry",
        count: projectEntryData[drillDownOU]?.length ?? 0,
      });
    }

    return visibleTabs;
  }, [
    drillDownOU,
    apEntry,
    mjeData,
    projectEntryData,
    selectedDrillResult,
    isDrilledRowReconciled,
  ]);

  // Compute the active tab
  const activeTab =
    manualActiveTab && tabs.some((t) => t.key === manualActiveTab)
      ? manualActiveTab
      : tabs.length > 0
        ? tabs[0].key
        : null;

  // Review status styling
  const reviewStatusClassName =
    reviewDecision === "accepted"
      ? "bg-emerald-100 text-emerald-700"
      : reviewDecision === "rejected"
        ? "bg-rose-100 text-rose-700"
        : "bg-slate-100 text-slate-600";

  const reviewStatusLabel =
    reviewDecision === "accepted"
      ? "Accepted"
      : reviewDecision === "rejected"
        ? "Rejected"
        : "Pending Review";

  const handleReviewAction = (decision: ReviewDecision) => {
    if (!drillDownOU) return;
    onReviewDecision(drillDownOU, decision);
    setToastState({
      variant: decision === "accepted" ? "success" : "failure",
      title: `Explanation ${decision}`,
      description:
        decision === "accepted"
          ? "The explanation has been accepted for this OU."
          : "The explanation has been marked for rework.",
      key: Date.now(),
    });
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Results Table */}
      <div className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden bg-white shadow-sm">
        <div className="p-4">
          <DataTable
            model={tableModel}
            showPagination={data.length > 0}
            pageSizeOptions={[5, 10, 20]}
            emptyMessage={
              data.length === 0 ? "No data found" : "No results available"
            }
            getRowClassName={(row) => {
              if (row.ou === "Total")
                return "bg-slate-100 border-t-2 border-slate-300 font-bold";
              if (drillDownOU === row.ou) return "bg-blue-50";
              return undefined;
            }}
          />
        </div>
      </div>

      {/* Drill Down Section */}
      {drillDownOU && (
        <div
          ref={drillSectionRef}
          className="mt-8 rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-sky-50/40 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Details for OU: {drillDownOU}
              </h3>
              <button
                onClick={() => onDrillDown(null)}
                className="text-xs text-slate-500 hover:text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>

          {/* Explanation + Review */}
          <div className="px-6 py-4">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
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

              {isDrilledRowReconciled ? (
                <div className="mt-3 min-h-20 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                  There is no difference between AP &amp; GL. This line item is
                  reconciled and needs no action from operator.
                </div>
              ) : (
                <textarea
                  value={selectedDrillResult?.remarks || ""}
                  onChange={(event) => {
                    if (!drillDownOU) return;
                    onExplanationChange(drillDownOU, event.target.value);
                  }}
                  placeholder="Add or update the explanation for this reconciliation difference"
                  className="mt-3 min-h-32 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              )}

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

          {/* Tab section - only shown for non-reconciled rows */}
          {!isDrilledRowReconciled && (
            <div className="p-6">
              <div className="mt-8">
                <div className="flex border-b border-slate-200">
                  {tabs.length > 0 ? (
                    tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setManualActiveTab(tab.key)}
                        className={`relative flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
                          activeTab === tab.key
                            ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {tab.label}
                        <span
                          className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                            activeTab === tab.key
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="w-full px-6 py-4 text-sm text-slate-500">
                      No reconciliation issues found for this OU
                    </div>
                  )}
                </div>

                {/* Tab Content */}
                <div className="mt-0 rounded-b-lg border border-t-0 border-slate-200 bg-white overflow-hidden shadow-sm">
                  {activeTab === "ap_entry" && (
                    <BalanceSheetTable
                      data={apEntry.filter((entry) => {
                        const accountMatch = selectedDrillResult?.accountCode
                          ? entry.accountCode ===
                            selectedDrillResult.accountCode
                          : true;
                        const amountMatch =
                          Math.abs(entry.invoiceLineAmt ?? 0) ===
                          Math.abs(selectedDrillResult?.diff ?? 0);
                        return accountMatch && amountMatch;
                      })}
                      title="AP Entry Records"
                      columns={createAPEntryColumns()}
                      currentPage={pageByTab.ap_entry}
                      setCurrentPage={(page) =>
                        setPageByTab({ ...pageByTab, ap_entry: page })
                      }
                    />
                  )}
                  {activeTab === "mje" && (
                    <BalanceSheetTable
                      data={mjeData[drillDownOU] ?? []}
                      title="Manual Journal Entries"
                      columns={createJournalEntryColumns()}
                      currentPage={pageByTab.mje}
                      setCurrentPage={(page) =>
                        setPageByTab({ ...pageByTab, mje: page })
                      }
                    />
                  )}
                  {activeTab === "project_entry" && (
                    <BalanceSheetTable
                      data={projectEntryData[drillDownOU] ?? []}
                      title="Project Entry Records"
                      columns={createJournalEntryColumns()}
                      currentPage={pageByTab.project_entry}
                      setCurrentPage={(page) =>
                        setPageByTab({ ...pageByTab, project_entry: page })
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
