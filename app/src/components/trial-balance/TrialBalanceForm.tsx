"use client";

import {
  AIAgentWorkflowLoader,
  type WorkflowStep,
} from "@/components/shared/AIAgentWorkflowLoader";
import { AutoCompleteInput } from "@/components/shared/AutocompleteInput";
import { DataTable } from "@/components/shared/data-table";
import { StatusToast } from "@/components/shared/StatusToast";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import { trialBalanceService } from "@/services/api";
import type {
  ReviewDecision,
  TBAnomalyOutputRecord,
  TBDrillComparisonRow,
  TBInputRecord,
  TBPeriodOption,
  TBPostingDetail,
  TBSelectOption,
} from "@/types";
import { getTrialBalanceBreadcrumbs } from "@/utils/breadcrumb.utils";
import { parsePeriodId, periodLabel, periodValue } from "@/utils/common";
import { TB_WORKFLOW_CONFIG } from "@/utils/constants";
import { FileChartColumnIncreasing } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TableSkeletonLoader } from "@/components/shared";
import { IconTextButton } from "../shared/IconTextButton";
import { TableRecordInfo } from "../shared/TableRecordInfo";
import {
  createTrialBalanceInputColumns,
  getInputCompanyCode,
  getInputGLAccount,
  getInputPeriod,
  getInputYear,
} from "./config/inputColumns";
import TrialBalanceResult from "./TrialBalanceResult";
import TrialBalanceTopNav from "./TrialBalanceTopNav";

export default function TrialBalanceForm() {
  const [inputData, setInputData] = useState<TBInputRecord[]>([]);

  const [companyCodeOptions, setCompanyCodeOptions] = useState<
    TBSelectOption[]
  >([]);
  const [allPeriodOptions, setAllPeriodOptions] = useState<TBPeriodOption[]>(
    [],
  );

  const [selectedCompanyCode, setSelectedCompanyCode] = useState("");
  const [selectedCompPeriod, setSelectedCompPeriod] = useState("");
  const [selectedCurrPeriod, setSelectedCurrPeriod] = useState("");

  const [companyCodeText, setCompanyCodeText] = useState("");
  const [compPeriodText, setCompPeriodText] = useState("");
  const [currPeriodText, setCurrPeriodText] = useState("");

  const [results, setResults] = useState<TBAnomalyOutputRecord[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [inputPage, setInputPage] = useState(1);
  const [inputPageSize, setInputPageSize] = useState(10);

  const [drillDownAccountCode, setDrillDownAccountCode] = useState<
    string | null
  >(null);
  const [drillDownAccountName, setDrillDownAccountName] = useState<
    string | null
  >(null);
  const [drillDownRows, setDrillDownRows] = useState<TBDrillComparisonRow[]>(
    [],
  );
  const [isDrillLoading, setIsDrillLoading] = useState(false);
  const [drillingAccountCode, setDrillingAccountCode] = useState<string | null>(
    null,
  );
  const [selectedDrillResult, setSelectedDrillResult] =
    useState<TBAnomalyOutputRecord | null>(null);
  const [reviewDecisions, setReviewDecisions] = useState<
    Record<string, ReviewDecision>
  >({});
  const [toastState, setToastState] = useState<{
    variant: "success" | "failure";
    title: string;
    description: string;
    key: number;
  } | null>(null);

  // Workflow loader state
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStep, setLoaderStep] = useState<WorkflowStep>("initializing");
  const [loaderError, setLoaderError] = useState<string | null>(null);
  const [loaderErrorDetail, setLoaderErrorDetail] = useState<string | null>(
    null,
  );

  // ---------------------------------------------------------------
  // On mount → fetch ALL data once, extract filters on frontend
  // ---------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    trialBalanceService
      .getInputData()
      .then((inputRows) => {
        if (cancelled) return;

        setInputData(inputRows);
        setIsInitialLoading(false);

        // Extract distinct company codes
        const codes = [
          ...new Set(
            inputRows
              .map((row) => getInputCompanyCode(row))
              .filter((code) => code.length > 0),
          ),
        ].sort();
        setCompanyCodeOptions(codes.map((code) => ({ id: code, name: code })));

        // Extract distinct period+year combos
        const seen = new Map<string, { period: number; year: number }>();
        inputRows.forEach((row) => {
          const period = getInputPeriod(row);
          const year = getInputYear(row);
          if (!Number.isFinite(period) || !Number.isFinite(year)) return;
          const key = `${period}_${year}`;
          if (!seen.has(key)) seen.set(key, { period, year });
        });

        const sorted = [...seen.values()].sort(
          (a, b) =>
            periodValue(a.period, a.year) - periodValue(b.period, b.year),
        );
        setAllPeriodOptions(
          sorted.map((item) => ({
            id: `${item.period}_${item.year}`,
            name: periodLabel(item.period, item.year),
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setIsInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------
  // Derived period option lists – show all periods from data,
  // just exclude the other dropdown's selected value
  // ---------------------------------------------------------------
  const sortedPeriodOptions = useMemo(() => {
    return [...allPeriodOptions].sort((a, b) => {
      const ap = parsePeriodId(a.id);
      const bp = parsePeriodId(b.id);
      return periodValue(ap.period, ap.year) - periodValue(bp.period, bp.year);
    });
  }, [allPeriodOptions]);

  /** Current-period dropdown: if comparison is selected, show only periods greater than it */
  const currentPeriodOptions = useMemo(() => {
    return sortedPeriodOptions.filter((option) => {
      if (selectedCompPeriod) {
        const comp = parsePeriodId(selectedCompPeriod);
        const opt = parsePeriodId(option.id);
        return (
          periodValue(opt.period, opt.year) >
          periodValue(comp.period, comp.year)
        );
      }
      return true;
    });
  }, [sortedPeriodOptions, selectedCompPeriod]);

  /** Comparison-period dropdown: if current is selected, show only periods less than it */
  const comparisonPeriodOptions = useMemo(() => {
    return sortedPeriodOptions.filter((option) => {
      if (selectedCurrPeriod) {
        const curr = parsePeriodId(selectedCurrPeriod);
        const opt = parsePeriodId(option.id);
        return (
          periodValue(opt.period, opt.year) <
          periodValue(curr.period, curr.year)
        );
      }
      return true;
    });
  }, [sortedPeriodOptions, selectedCurrPeriod]);
  const effectiveSelectedCompPeriod = useMemo(() => {
    if (!selectedCompPeriod) return "";
    return comparisonPeriodOptions.some(
      (option) => option.id === selectedCompPeriod,
    )
      ? selectedCompPeriod
      : "";
  }, [comparisonPeriodOptions, selectedCompPeriod]);

  const effectiveSelectedCurrPeriod = useMemo(() => {
    if (!selectedCurrPeriod) return "";
    return currentPeriodOptions.some(
      (option) => option.id === selectedCurrPeriod,
    )
      ? selectedCurrPeriod
      : "";
  }, [currentPeriodOptions, selectedCurrPeriod]);

  const isRunEnabled = useMemo(() => {
    if (
      !selectedCompanyCode ||
      !effectiveSelectedCompPeriod ||
      !effectiveSelectedCurrPeriod
    ) {
      return false;
    }

    const comparison = parsePeriodId(effectiveSelectedCompPeriod);
    const current = parsePeriodId(effectiveSelectedCurrPeriod);

    return (
      periodValue(current.period, current.year) >
      periodValue(comparison.period, comparison.year)
    );
  }, [
    selectedCompanyCode,
    effectiveSelectedCompPeriod,
    effectiveSelectedCurrPeriod,
  ]);

  // ---------------------------------------------------------------
  // Input table – filter on frontend by selected company + periods
  // ---------------------------------------------------------------
  const initialInputRows = useMemo(() => {
    const selectedPeriodKeys =
      effectiveSelectedCompPeriod && effectiveSelectedCurrPeriod
        ? new Set([effectiveSelectedCompPeriod, effectiveSelectedCurrPeriod])
        : null;

    return inputData
      .filter((row) =>
        selectedCompanyCode
          ? getInputCompanyCode(row) === selectedCompanyCode
          : true,
      )
      .filter((row) => {
        if (!selectedPeriodKeys) return true;
        const key = `${getInputPeriod(row)}_${getInputYear(row)}`;
        return selectedPeriodKeys.has(key);
      })
      .sort((a, b) => {
        const accountSort = getInputGLAccount(a).localeCompare(
          getInputGLAccount(b),
        );
        if (accountSort !== 0) return accountSort;
        return getInputPeriod(a) - getInputPeriod(b);
      });
  }, [
    inputData,
    selectedCompanyCode,
    effectiveSelectedCompPeriod,
    effectiveSelectedCurrPeriod,
  ]);

  const inputColumns = useMemo(() => createTrialBalanceInputColumns(), []);

  const inputModel = useTanstackDataTableState<TBInputRecord>({
    data: initialInputRows,
    columns: inputColumns,
    currentPage: inputPage,
    pageSize: inputPageSize,
    onPageChange: setInputPage,
    onPageSizeChange: setInputPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
  });

  const currKey = useMemo(() => {
    if (!effectiveSelectedCurrPeriod) return "";
    const { period, year } = parsePeriodId(effectiveSelectedCurrPeriod);
    return `current_period_${period}_${year}`;
  }, [effectiveSelectedCurrPeriod]);

  const prevKey = useMemo(() => {
    if (!effectiveSelectedCompPeriod) return "";
    const { period, year } = parsePeriodId(effectiveSelectedCompPeriod);
    return `previous_period_${period}_${year}`;
  }, [effectiveSelectedCompPeriod]);

  const currPeriodHeader = useMemo(() => {
    if (!effectiveSelectedCurrPeriod) return "Current Period";
    const { period, year } = parsePeriodId(effectiveSelectedCurrPeriod);
    return `${periodLabel(period, year)} (Current)`;
  }, [effectiveSelectedCurrPeriod]);

  const prevPeriodHeader = useMemo(() => {
    if (!effectiveSelectedCompPeriod) return "Comparison Period";
    const { period, year } = parsePeriodId(effectiveSelectedCompPeriod);
    return `${periodLabel(period, year)} (Comparison)`;
  }, [effectiveSelectedCompPeriod]);

  const currPeriodLabel = useMemo(() => {
    if (!effectiveSelectedCurrPeriod) return "Current Period";
    const { period, year } = parsePeriodId(effectiveSelectedCurrPeriod);
    return periodLabel(period, year);
  }, [effectiveSelectedCurrPeriod]);

  const prevPeriodLabel = useMemo(() => {
    if (!effectiveSelectedCompPeriod) return "Comparison Period";
    const { period, year } = parsePeriodId(effectiveSelectedCompPeriod);
    return periodLabel(period, year);
  }, [effectiveSelectedCompPeriod]);

  const resetResults = () => {
    setShowResults(false);
    setResults([]);
    setDrillDownAccountCode(null);
    setDrillDownAccountName(null);
    setDrillDownRows([]);
    setSelectedDrillResult(null);
    setReviewDecisions({});
  };

  const handleRun = async () => {
    if (!isRunEnabled) return;

    const current = parsePeriodId(effectiveSelectedCurrPeriod);
    const comparison = parsePeriodId(effectiveSelectedCompPeriod);

    setShowLoader(true);
    setLoaderError(null);
    setLoaderErrorDetail(null);
    setLoaderStep("initializing");

    setDrillDownAccountCode(null);
    setDrillDownAccountName(null);
    setDrillDownRows([]);
    setSelectedDrillResult(null);
    setReviewDecisions({});
    setShowResults(false);

    try {
      setLoaderStep("validating");
      await new Promise((r) => setTimeout(r, 800));

      setLoaderStep("processing");
      const anomalyResults = await trialBalanceService.runAnomalyDetection({
        companyCode: selectedCompanyCode,
        currentPeriod: current.period,
        currentYear: current.year,
        comparisonPeriod: comparison.period,
        comparisonYear: comparison.year,
      });

      if (anomalyResults.length === 0) {
        setResults([]);
        setShowResults(false);
        setLoaderError("no_data");
        setLoaderErrorDetail(
          `No records found for Company ${selectedCompanyCode}, Comparison ${prevPeriodLabel}, and Current ${currPeriodLabel}. Please select different periods and try again.`,
        );
        return;
      }

      setLoaderStep("analyzing");
      await new Promise((r) => setTimeout(r, 500));

      setLoaderStep("finalizing");
      setResults(anomalyResults);
      setShowResults(true);
      setShowLoader(false);
    } catch (error) {
      console.error("Error running anomaly detection:", error);
      setLoaderError("unknown");
      setLoaderErrorDetail(
        error instanceof Error
          ? error.message
          : "Failed to run anomaly detection. Please try again.",
      );
    }
  };

  const handleDrillDown = async (accountCode: string, accountName: string) => {
    if (!effectiveSelectedCurrPeriod || !effectiveSelectedCompPeriod) return;

    const current = parsePeriodId(effectiveSelectedCurrPeriod);
    const comparison = parsePeriodId(effectiveSelectedCompPeriod);

    setIsDrillLoading(true);
    setDrillingAccountCode(accountCode);
    try {
      const anomalyDetails = await trialBalanceService.getAnomalyDetails({
        companyCode: selectedCompanyCode,
        accountCode: accountCode,
        accountName: accountName,
        currentPeriod: current.period,
        currentYear: current.year,
        comparisonPeriod: comparison.period,
        comparisonYear: comparison.year,
      });

      const previousRows = anomalyDetails
        .filter(
          (row) =>
            row.Period === comparison.period &&
            row.FiscalYear === comparison.year,
        )
        .sort((a, b) => a.DocumentNumber - b.DocumentNumber);
      const currentRows = anomalyDetails
        .filter(
          (row) =>
            row.Period === current.period && row.FiscalYear === current.year,
        )
        .sort((a, b) => a.DocumentNumber - b.DocumentNumber);

      const mapPosting = (
        posting: TBPostingDetail,
        periodLabel: string,
      ): TBDrillComparisonRow => ({
        ...posting,
        period_label: periodLabel,
      });

      const comparisonRows: TBDrillComparisonRow[] = [
        ...previousRows.map((row) => mapPosting(row, prevPeriodLabel)),
        ...currentRows.map((row) => mapPosting(row, currPeriodLabel)),
      ];

      let selectedResult =
        results.find((row) => row.account_code === accountCode) ?? null;

      // Fetch the latest anomaly_explanation from tb_anomaly_explanation
      try {
        const explanationRows = await trialBalanceService.getAnomalyExplanation(
          {
            company_code: selectedCompanyCode,
            fiscal_year: current.year,
            fiscal_period: current.period,
          },
        );
        if (explanationRows.length > 0) {
          const latest = explanationRows[0] as Record<string, unknown>;
          const explanation = String(latest.anomaly_explanation ?? "");
          if (selectedResult) {
            selectedResult = {
              ...selectedResult,
              explanation: explanation || selectedResult.explanation,
            };
          }
        }
      } catch (err) {
        console.warn(
          "Could not fetch anomaly explanation, using existing data:",
          err,
        );
      }

      setDrillDownAccountCode(accountCode);
      setDrillDownAccountName(accountName);
      setDrillDownRows(comparisonRows);
      setSelectedDrillResult(selectedResult);
    } catch (error) {
      console.error("Error fetching anomaly details:", error);
      setToastState({
        variant: "failure",
        title: "Error",
        description: "Failed to fetch anomaly details. Please try again.",
        key: Date.now(),
      });
    } finally {
      setIsDrillLoading(false);
      setDrillingAccountCode(null);
    }
  };

  const handleExplanationChange = (
    accountCode: string,
    explanation: string,
  ) => {
    setResults((prev) =>
      prev.map((row) =>
        row.account_code === accountCode ? { ...row, explanation } : row,
      ),
    );
    setSelectedDrillResult((prev) =>
      prev?.account_code === accountCode ? { ...prev, explanation } : prev,
    );
  };

  const handleReviewDecision = (
    accountCode: string,
    decision: ReviewDecision,
  ) => {
    setReviewDecisions((prev) => ({
      ...prev,
      [accountCode]: decision,
    }));
  };

  const breadcrumbItems = getTrialBalanceBreadcrumbs(showResults, resetResults);
  const inp = inputModel.pagination;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-[#1a252f] border-b border-[#dbe0e6] dark:border-slate-700 shrink-0 z-10">
        <header className="px-8 py-6">
          <TrialBalanceTopNav
            title={showResults ? "Anomaly Detection Results" : "Trial Balance"}
            description={
              showResults
                ? "Reviewing deviations and business rule violations for the selected period."
                : "Select company and periods to run anomaly detection."
            }
            variant={showResults ? "success" : null}
            breadcrumbItems={breadcrumbItems}
          />

          {!showResults ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="min-w-0 flex-1 grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <AutoCompleteInput<TBSelectOption>
                      label="Company Code"
                      required
                      placeholder="Select company"
                      options={companyCodeOptions}
                      value={selectedCompanyCode}
                      onChange={(value) => setSelectedCompanyCode(value)}
                      inputValue={companyCodeText}
                      onInputChange={setCompanyCodeText}
                      getOptionValue={(option) => option.id}
                      getOptionLabel={(option) => option.name}
                      size="sm"
                      clearable
                    />
                    <AutoCompleteInput<TBPeriodOption>
                      label="Current Period"
                      required
                      placeholder="Select current period"
                      options={currentPeriodOptions}
                      value={effectiveSelectedCurrPeriod}
                      onChange={(value) => setSelectedCurrPeriod(value)}
                      inputValue={
                        effectiveSelectedCurrPeriod ? currPeriodText : ""
                      }
                      onInputChange={setCurrPeriodText}
                      getOptionValue={(option) => option.id}
                      getOptionLabel={(option) => option.name}
                      size="sm"
                      clearable
                    />
                    <AutoCompleteInput<TBPeriodOption>
                      label="Comparison Period"
                      required
                      placeholder="Select comparison period"
                      options={comparisonPeriodOptions}
                      value={effectiveSelectedCompPeriod}
                      onChange={(value) => setSelectedCompPeriod(value)}
                      inputValue={
                        effectiveSelectedCompPeriod ? compPeriodText : ""
                      }
                      onInputChange={setCompPeriodText}
                      getOptionValue={(option) => option.id}
                      getOptionLabel={(option) => option.name}
                      size="sm"
                      clearable
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Select the company code and periods, then run anomaly
                    detection.
                  </p>
                </div>
                <div className="flex min-w-0 lg:w-auto lg:shrink-0">
                  <IconTextButton
                    text="Run Anomaly Detection"
                    icon={FileChartColumnIncreasing}
                    variant="default"
                    className="h-11 px-6 bg-primary text-white font-bold rounded-lg"
                    iconSize={20}
                    onClick={handleRun}
                    disabled={!isRunEnabled}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Selected Filters
              </span>
              <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                Company: {selectedCompanyCode || "-"}
              </span>
              <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                Comparison: {prevPeriodLabel}
              </span>
              <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                Current: {currPeriodLabel}
              </span>
            </div>
          )}
        </header>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-5">
        <div className="w-full space-y-6">
          {!showResults && isInitialLoading && (
            <TableSkeletonLoader columns={6} rows={10} showToolbar showTitle />
          )}

          {!showResults && !isInitialLoading && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 mb-4 px-6 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wide">
                  Input Data
                </h3>

                <TableRecordInfo
                  total={inp.totalItems}
                  startIndex={inp.startIndex}
                  endIndex={inp.endIndex}
                />
              </div>

              <div className="p-4">
                <DataTable
                  model={inputModel}
                  showPagination={initialInputRows.length > 0}
                  pageSizeOptions={[5, 10, 20]}
                  emptyMessage="No input data found for selected filters"
                />
              </div>
            </div>
          )}

          {showResults && (
            <div>
              <TrialBalanceResult
                results={results}
                currKey={currKey}
                prevKey={prevKey}
                currPeriodHeader={currPeriodHeader}
                prevPeriodHeader={prevPeriodHeader}
                currPeriodLabel={currPeriodLabel}
                drillDownAccountCode={drillDownAccountCode}
                drillDownAccountName={drillDownAccountName}
                drillDownRows={drillDownRows}
                selectedDrillResult={selectedDrillResult}
                selectedReviewDecision={
                  drillDownAccountCode
                    ? (reviewDecisions[drillDownAccountCode] ?? null)
                    : null
                }
                onDrillDown={handleDrillDown}
                isDrillLoading={isDrillLoading}
                drillingAccountCode={drillingAccountCode}
                onExplanationChange={handleExplanationChange}
                onReviewDecision={handleReviewDecision}
              />
            </div>
          )}
        </div>
      </div>

      {toastState ? (
        <div className="fixed bottom-4 right-4 z-50">
          <StatusToast
            key={toastState.key}
            variant={toastState.variant}
            title={toastState.title}
            description={toastState.description}
            autoHideDuration={2500}
          />
        </div>
      ) : null}

      <AIAgentWorkflowLoader
        isVisible={showLoader}
        currentStep={loaderStep}
        workflowConfig={TB_WORKFLOW_CONFIG}
        documentName={`Anomaly Detection: ${selectedCompanyCode}`}
        errorKind={loaderError}
        errorDetail={loaderErrorDetail}
        onRetry={handleRun}
        onClose={() => {
          setShowLoader(false);
        }}
      />
    </div>
  );
}
