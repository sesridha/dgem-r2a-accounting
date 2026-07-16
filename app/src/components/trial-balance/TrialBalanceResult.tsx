"use client";

import { DataTable } from "@/components/shared/data-table";
import ExportFile from "@/components/shared/ExportFile";
import { Button } from "@/components/ui/button";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import type {
  ReviewDecision,
  TBDrillComparisonRow,
  TrialBalanceResultProps,
} from "@/types";
import {
  createTrialBalanceDrillColumns,
  createTrialBalanceResultColumns,
  type TBResultRow,
} from "./config/resultColumns";
import { useEffect, useMemo, useRef, useState } from "react";
import { toLabel, extractDocNumbers } from "@/utils/common";

export default function TrialBalanceResult({
  results,
  currKey,
  prevKey,
  currPeriodHeader,
  prevPeriodHeader,
  currPeriodLabel,
  drillDownAccountCode,
  drillDownAccountName,
  drillDownRows,
  selectedDrillResult,
  selectedReviewDecision,
  onDrillDown,
  isDrillLoading,
  drillingAccountCode,
  onExplanationChange,
  onReviewDecision,
}: TrialBalanceResultProps) {
  const [resultPage, setResultPage] = useState(1);
  const [resultPageSize, setResultPageSize] = useState(10);
  const drillSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drillDownAccountCode) return;
    setTimeout(() => {
      drillSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }, [drillDownAccountCode, drillDownRows.length]);

  const resultRows = useMemo<TBResultRow[]>(
    () =>
      results.map((row) => ({
        ...row,
        current_amount: Number(row[currKey] ?? 0),
        previous_amount: Number(row[prevKey] ?? 0),
      })),
    [results, currKey, prevKey],
  );

  const pagedResultRows = useMemo(() => {
    const start = (resultPage - 1) * resultPageSize;
    return resultRows.slice(start, start + resultPageSize);
  }, [resultRows, resultPage, resultPageSize]);

  const resultColumns = useMemo(
    () =>
      createTrialBalanceResultColumns({
        currPeriodHeader,
        prevPeriodHeader,
        drillDownAccount: drillDownAccountCode,
        onDrillDown,
        isDrillLoading,
        drillingAccountCode,
      }),
    [
      currPeriodHeader,
      prevPeriodHeader,
      drillDownAccountCode,
      onDrillDown,
      isDrillLoading,
      drillingAccountCode,
    ],
  );

  const resultModel = useTanstackDataTableState<TBResultRow>({
    data: pagedResultRows,
    columns: resultColumns,
    currentPage: resultPage,
    pageSize: resultPageSize,
    totalItems: resultRows.length,
    onPageChange: setResultPage,
    onPageSizeChange: setResultPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
  });

  const currentMonthRows = useMemo(
    () => drillDownRows.filter((row) => row.period_label === currPeriodLabel),
    [drillDownRows, currPeriodLabel],
  );

  /** Derive anomaly export columns dynamically; maps computed amount keys to their period header labels */
  const anomalyExportColumns = useMemo(() => {
    if (resultRows.length === 0) return [];
    return Object.keys(resultRows[0]).map((key) => ({
      key,
      label:
        key === "current_amount"
          ? currPeriodHeader
          : key === "previous_amount"
            ? prevPeriodHeader
            : toLabel(key),
      transform: (row: Record<string, unknown>) => {
        const val = row[key];
        if (typeof val === "number") return val;
        if (
          typeof val === "string" &&
          val.trim() !== "" &&
          !Number.isNaN(Number(val))
        )
          return Number(val);
        return val ?? "";
      },
    }));
  }, [resultRows, currPeriodHeader, prevPeriodHeader]);

  /** Derive export columns dynamically from actual data keys so new/removed backend fields are handled automatically */
  const drillExportColumns = useMemo(() => {
    if (currentMonthRows.length === 0) return [];
    return Object.keys(currentMonthRows[0]).map((key) => ({
      key,
      label: toLabel(key),
      // Coerce any numeric-looking values to numbers for clean Excel output
      transform: (row: Record<string, unknown>) => {
        const val = row[key];
        if (typeof val === "number") return val;
        if (
          typeof val === "string" &&
          val.trim() !== "" &&
          !Number.isNaN(Number(val))
        )
          return Number(val);
        return val ?? "";
      },
    }));
  }, [currentMonthRows]);

  /** Extract doc numbers from explanation text */
  const highlightedDocNumbers = useMemo(() => {
    const explanationText = selectedDrillResult?.explanation ?? "";
    return new Set(extractDocNumbers(explanationText));
  }, [selectedDrillResult?.explanation]);

  const drillColumns = useMemo(
    () => createTrialBalanceDrillColumns(highlightedDocNumbers),
    [highlightedDocNumbers],
  );

  const currentDrillModel = useTanstackDataTableState<TBDrillComparisonRow>({
    data: currentMonthRows,
    columns: drillColumns,
    currentPage: 1,
    pageSize: Math.max(currentMonthRows.length, 1),
    totalItems: currentMonthRows.length,
    enableSorting: true,
    enableColumnVisibility: true,
  });

  /** Radio button options for review decision */
  const reviewOptions: { value: ReviewDecision; label: string }[] = [
    { value: "accept_no_action", label: "Accept, no action needed" },
    { value: "accept_action_required", label: "Accept, action required" },
    { value: "further_investigation", label: "Further investigation is required" },
  ];

  const handleRadioChange = (decision: ReviewDecision) => {
    if (!drillDownAccountCode) return;
    onReviewDecision(drillDownAccountCode, decision);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wide">
              Anomaly Analysis
            </h3>
            {resultRows.length > 0 && (
              <ExportFile
                data={resultRows as unknown as Record<string, unknown>[]}
                fileName="anomaly_analysis"
                columns={anomalyExportColumns}
                type="excel"
                dropdown={true}
                title="Export Anomaly Report"
              />
            )}
          </div>
          <p className="text-xs text-[#617589] mt-0.5">
            {results.filter((row) => row.anomaly_flag === "Y").length} anomal
            {results.filter((row) => row.anomaly_flag === "Y").length === 1
              ? "y"
              : "ies"}{" "}
            detected out of {results.length} line items
          </p>
        </div>

        <div className="p-4">
          <DataTable
            model={resultModel}
            showPagination={resultRows.length > 0}
            pageSizeOptions={[5, 10, 20]}
            emptyMessage="No anomaly results for selected filters"
            getRowClassName={(row) =>
              drillDownAccountCode === row.account_code
                ? "bg-blue-50"
                : undefined
            }
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
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Drill Down:{" "}
                  <span className="text-sky-700">
                    {drillDownAccountCode} – {drillDownAccountName}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Posting details for the selected anomaly account
                </p>
              </div>
              {currentMonthRows.length > 0 && (
                <ExportFile
                  data={
                    currentMonthRows as unknown as Record<string, unknown>[]
                  }
                  fileName={`drill_${drillDownAccountCode ?? "posting"}_${(drillDownAccountName ?? "").replace(/[^a-zA-Z0-9]/g, "_")}`}
                  columns={drillExportColumns}
                  type="excel"
                  dropdown={true}
                  title="Export Postings"
                />
              )}
            </div>

            {/* Anomaly Explanation */}
            <div className="mt-3">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex flex-col">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Anomaly Explanation
                </p>

                <textarea
                  value={selectedDrillResult?.explanation ?? ""}
                  onChange={(event) => {
                    if (!drillDownAccountCode) return;
                    onExplanationChange(
                      drillDownAccountCode,
                      event.target.value,
                    );
                  }}
                  placeholder="Add or update the anomaly explanation"
                  className="mt-3 min-h-40 flex-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Correction Impact */}
            <div className="mt-3">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex flex-col">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Correction Impact
                </p>

                <textarea
                  value={selectedDrillResult?.correction_impact ?? ""}
                  readOnly
                  placeholder="No correction impact data available"
                  className="mt-3 min-h-28 flex-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none cursor-default"
                />
              </div>
            </div>

            {/* Review Decision Radio Buttons */}
            <div className="mt-4 hidden">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Review Decision
                </p>

                <div className="flex flex-col gap-2.5">
                  {reviewOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name={`review-decision-${drillDownAccountCode}`}
                        value={option.value}
                        checked={selectedReviewDecision === option.value}
                        onChange={() => handleRadioChange(option.value)}
                        className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="h-9 px-4 border-slate-300 text-slate-400 cursor-not-allowed"
                  >
                    Escalate lack of solution
                  </Button>
                </div>
              </div>
            </div>

            {highlightedDocNumbers.size > 0 ? (
              <p className="mt-3 text-xs text-slate-600">
                Highlighted in {currPeriodLabel}:{" "}
                {Array.from(highlightedDocNumbers).join(", ")}
              </p>
            ) : null}
          </div>

          <div className="p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-linear-to-r from-sky-100 to-cyan-50">
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  {currPeriodLabel}
                </h4>
              </div>

              <div className="p-3">
                <DataTable
                  model={currentDrillModel}
                  showPagination={false}
                  emptyMessage={`No posting details found for ${currPeriodLabel}`}
                  className="space-y-2"
                  getRowClassName={(row) =>
                    highlightedDocNumbers.has(row.DocumentNumber)
                      ? "bg-amber-50/80"
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
