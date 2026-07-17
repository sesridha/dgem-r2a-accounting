"use client";

import { AutoCompleteInput } from "@/components/shared/AutocompleteInput";
import { StatusToast } from "@/components/shared/StatusToast";
import type {
  APEntryRecord,
  BalanceSheetRecord,
  ManualJournalEntryRecord,
  ReviewDecision,
} from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TableSkeletonLoader } from "@/components/shared";
import {
  AIAgentWorkflowLoader,
  type WorkflowStep,
} from "@/components/shared/AIAgentWorkflowLoader";
import { Button } from "@/components/ui/button";
import type {
  DrillDownPayload,
  OUListItem,
} from "@/services/api/balanceSheetSolverService";
import { balanceSheetSolverService } from "@/services/api/balanceSheetSolverService";
import { getBalanceSheetSolverBreadcrumbs } from "@/utils/breadcrumb.utils";
import { BS_WORKFLOW_CONFIG } from "@/utils/constants";
import {
  ArrowRight,
  BarChart3,
  FileSpreadsheet,
  Play,
  Search,
} from "lucide-react";
import BalanceSheetSolverResult from "./BalanceSheetSolverResult";
import BalanceSheetSolverTopNav from "./BalanceSheetSolverTopNav";

export default function BalanceSheetSolver() {
  const [selectedOUs, setSelectedOUs] = useState<string[]>([]);
  const [ouText, setOuText] = useState("");
  const [drillDownOU, setDrillDownOU] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [pageByTab, setPageByTab] = useState({
    ap: 1,
    ap_entry: 1,
    tb: 1,
    mje: 1,
    reval: 1,
    project_entry: 1,
  });

  const [explanations, setExplanations] = useState<{ [ou: string]: string }>(
    {},
  );
  const [selectedDrillResult, setSelectedDrillResult] =
    useState<BalanceSheetRecord | null>(null);
  const [reviewDecisions, setReviewDecisions] = useState<{
    [ou: string]: ReviewDecision | null;
  }>({});
  const [toastState, setToastState] = useState<{
    variant: "success" | "failure";
    title: string;
    description: string;
    key: number;
  } | null>(null);

  // OU list from API
  const [ouOptions, setOuOptions] = useState<OUListItem[]>([]);
  const [isOUListLoading, setIsOUListLoading] = useState(true);

  // Summary data
  const [allSummary, setAllSummary] = useState<BalanceSheetRecord[]>([]);

  // Store initial full data so we can restore after agent run + reset
  const initialSummaryRef = useRef<BalanceSheetRecord[]>([]);

  // Drill-down data populated from /reco/drilldown
  const [apEntry, setApEntry] = useState<APEntryRecord[]>([]);
  const [mjeData, setMjeData] = useState<{
    [key: string]: ManualJournalEntryRecord[];
  }>({});
  const [projectEntryData, setProjectEntryData] = useState<{
    [key: string]: ManualJournalEntryRecord[];
  }>({});
  const [isDrillLoading, setIsDrillLoading] = useState(false);

  // Workflow loader state
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStep, setLoaderStep] = useState<WorkflowStep>("initializing");
  const [loaderError, setLoaderError] = useState<string | null>(null);
  const [loaderErrorDetail, setLoaderErrorDetail] = useState<string | null>(
    null,
  );
  const [agentRunCompleted, setAgentRunCompleted] = useState(false);

  // Fetch input data on mount
  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        setIsOUListLoading(true);
        const { records, ouList } =
          await balanceSheetSolverService.getInputFiles();
        if (cancelled) return;

        // Filter out records where all numeric fields are 0
        const filteredRecords = records.filter(
          (r) =>
            r.apBalance !== 0 ||
            r.glBalance !== 0 ||
            r.diff !== 0 ||
            r.revaluation !== 0 ||
            r.manualEntries !== 0 ||
            r.adjustedDiff !== 0,
        );
        setAllSummary(filteredRecords);
        initialSummaryRef.current = filteredRecords;

        // Derive OU options only from records that have non-zero values
        const nonZeroOUs = new Set(filteredRecords.map((r) => r.ou));
        const filteredOuList = ouList.filter((item) => nonZeroOUs.has(item.value));
        setOuOptions(filteredOuList);

        setShowResults(true);
      } catch {
        if (!cancelled) {
          setToastState({
            variant: "failure",
            title: "Failed to Load Data",
            description:
              "Could not fetch initial data. Please refresh the page.",
            key: Date.now(),
          });
        }
      } finally {
        if (!cancelled) setIsOUListLoading(false);
      }
    };

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset to initial view (called from breadcrumb)
  // Keeps selectedOUs intact so user can add/remove from existing selection
  const resetResults = () => {
    setAgentRunCompleted(false);
    setDrillDownOU(null);
    setSelectedDrillResult(null);
    setApEntry([]);
    setMjeData({});
    setProjectEntryData({});
    setReviewDecisions({});
    setExplanations({});
    setPageByTab({
      ap: 1,
      ap_entry: 1,
      tb: 1,
      mje: 1,
      reval: 1,
      project_entry: 1,
    });
    // Restore the full initial data so OU filtering works correctly again
    setAllSummary(initialSummaryRef.current);
    setShowResults(true);
  };

  // Breadcrumb items - matches IC Item Solver pattern
  const breadcrumbItems = getBalanceSheetSolverBreadcrumbs(
    agentRunCompleted,
    resetResults,
  );

  // Derived: display filtered rows based on selected OUs
  const displayData = useMemo(() => {
    const rows =
      selectedOUs.length > 0
        ? allSummary.filter((r) => selectedOUs.includes(r.ou))
        : allSummary;

    if (rows.length === 0) return [];

    const totals: BalanceSheetRecord = {
      ou: "Total",
      apBalance: rows.reduce((s, r) => s + r.apBalance, 0),
      glBalance: rows.reduce((s, r) => s + r.glBalance, 0),
      diff: rows.reduce((s, r) => s + r.diff, 0),
      revaluation: rows.reduce((s, r) => s + r.revaluation, 0),
      manualEntries: rows.reduce((s, r) => s + r.manualEntries, 0),
      adjustedDiff: rows.reduce((s, r) => s + r.adjustedDiff, 0),
      remarks: "",
    };

    return [...rows, totals];
  }, [selectedOUs, allSummary]);

  const handleDrillDown = useCallback(async (ou: BalanceSheetRecord | null) => {
    if (!ou) {
      setDrillDownOU(null);
      setSelectedDrillResult(null);
      return;
    }

    setDrillDownOU(ou.ou);
    setSelectedDrillResult(ou);
    setIsDrillLoading(true);
    setPageByTab({
      ap: 1,
      ap_entry: 1,
      tb: 1,
      mje: 1,
      reval: 1,
      project_entry: 1,
    });

    try {
      const payload: DrillDownPayload = {
        ou_code: ou.ou,
        remark: ou.remarks,
        manual_entries: String(ou.manualEntries),
        diff_ap_gl_reval_manual: String(ou.adjustedDiff),
      };

      const result = await balanceSheetSolverService.drillDown(payload);

      if (result.apEntry.length > 0) {
        setApEntry(result.apEntry);
      }
      if (result.mjeData.length > 0) {
        setMjeData((prev) => ({ ...prev, [ou.ou]: result.mjeData }));
      }
      if (result.projectEntryData.length > 0) {
        setProjectEntryData((prev) => ({
          ...prev,
          [ou.ou]: result.projectEntryData,
        }));
      }
    } catch (error) {
      console.error("Drill-down failed:", error);
      setToastState({
        variant: "failure",
        title: "Drill-down Failed",
        description:
          "Could not fetch detailed data for this OU. Please try again.",
        key: Date.now(),
      });
    } finally {
      setIsDrillLoading(false);
    }
  }, []);

  const handleExplanationChange = useCallback((ou: string, value: string) => {
    setExplanations((prev) => ({ ...prev, [ou]: value }));
  }, []);

  const handleReviewDecision = useCallback(
    (ou: string, decision: ReviewDecision) => {
      setReviewDecisions((prev) => ({ ...prev, [ou]: decision }));
    },
    [],
  );

  const handleRun = async () => {
    setShowLoader(true);
    setLoaderError(null);
    setLoaderErrorDetail(null);
    setLoaderStep("initializing");
    setShowResults(false);
    setDrillDownOU(null);
    setSelectedDrillResult(null);
    setApEntry([]);
    setMjeData({});
    setProjectEntryData({});
    setPageByTab({
      ap: 1,
      ap_entry: 1,
      tb: 1,
      mje: 1,
      reval: 1,
      project_entry: 1,
    });

    try {
      setLoaderStep("validating");
      await new Promise((r) => setTimeout(r, 2000));

      setLoaderStep("processing");
      const agentResponse =
        await balanceSheetSolverService.runAgent(selectedOUs);

      setLoaderStep("finalizing");
      await new Promise((r) => setTimeout(r, 1000));

      setAllSummary(agentResponse.records);

      setShowResults(true);
      setAgentRunCompleted(true);
      setShowLoader(false);
    } catch (error) {
      console.error("Error running balance sheet solver:", error);
      setLoaderError("unknown");
      setLoaderErrorDetail(
        error instanceof Error
          ? error.message
          : "Failed to run balance sheet solver. Please try again.",
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-[#1a252f] border-b border-[#dbe0e6] dark:border-slate-700 shrink-0 z-10">
        <header className="px-8 py-6">
          <BalanceSheetSolverTopNav
            title={agentRunCompleted ? "Balance Sheet Item Solver Results" : "Balance Sheet Item Solver"}
            description={
              agentRunCompleted
                ? "Balance sheet reconciliation analysis results."
                : "Select OU to analyze and reconcile balance sheet items."
            }
            variant={agentRunCompleted ? "success" : null}
            breadcrumbItems={breadcrumbItems}
          />

          {!agentRunCompleted ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1 lg:max-w-xl">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(50px,1fr))] gap-6">
                    <div className="flex flex-col gap-2">
                      <AutoCompleteInput<OUListItem>
                        placeholder={
                          isOUListLoading ? "Loading OUs..." : "Filter by OU..."
                        }
                        label="Operating Unit"
                        options={ouOptions}
                        required
                        values={selectedOUs}
                        onValuesChange={(values) => {
                          setSelectedOUs(values);
                          setOuText("");
                          if (
                            drillDownOU &&
                            values.length > 0 &&
                            !values.includes(drillDownOU)
                          ) {
                            setDrillDownOU(null);
                          }
                        }}
                        inputValue={ouText}
                        onInputChange={setOuText}
                        getOptionValue={(opt) => opt.value}
                        getOptionLabel={(opt) => opt.label}
                        size="sm"
                        clearable
                        multiSelect
                        enableSelectAll
                        selectAllLabel="Select All OUs"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {isOUListLoading
                      ? "Loading available Operating Units..."
                      : selectedOUs.length === 0
                        ? "Select OUs to run balance sheet reconciliation."
                        : `Selected ${selectedOUs.length} OU${selectedOUs.length > 1 ? "s" : ""} for processing`}
                  </p>
                </div>
                <Button
                  onClick={handleRun}
                  disabled={
                    selectedOUs.length === 0 || showLoader || isOUListLoading
                  }
                  className="h-11 px-6 bg-primary text-white font-bold rounded-lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Balance Sheet Solver
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Selected Filters
              </span>
              <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                Operating Units: {selectedOUs.length > 0 ? selectedOUs.join(", ") : "All"}
              </span>
            </div>
          )}
        </header>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-5">
        {toastState && (
          <StatusToast
            variant={toastState.variant}
            title={toastState.title}
            description={toastState.description}
            key={toastState.key}
          />
        )}

        <AIAgentWorkflowLoader
          isVisible={showLoader}
          currentStep={loaderStep}
          workflowConfig={BS_WORKFLOW_CONFIG}
          errorKind={loaderError}
          errorDetail={loaderErrorDetail}
          onRetry={handleRun}
          onClose={() => {
            setShowLoader(false);
            setLoaderError(null);
            setLoaderErrorDetail(null);
          }}
        />

        {!showLoader && showResults && (
          <BalanceSheetSolverResult
            data={displayData}
            drillDownOU={drillDownOU}
            onDrillDown={handleDrillDown}
            isDrillLoading={isDrillLoading}
            apData={{}}
            apEntry={apEntry}
            tbData={{}}
            mjeData={mjeData}
            revalData={{}}
            projectEntryData={projectEntryData}
            explanation={drillDownOU ? (explanations[drillDownOU] ?? "") : ""}
            reviewDecision={
              drillDownOU ? (reviewDecisions[drillDownOU] ?? null) : null
            }
            onExplanationChange={handleExplanationChange}
            onReviewDecision={handleReviewDecision}
            selectedDrillResult={selectedDrillResult ?? null}
            pageByTab={pageByTab}
            setPageByTab={setPageByTab}
            showDrillButton={agentRunCompleted}
          />
        )}

        {!showLoader && !showResults && isOUListLoading && (
          <TableSkeletonLoader
            columns={8}
            rows={10}
            showToolbar={false}
            showTitle
          />
        )}

        {!showLoader && !showResults && !isOUListLoading && !agentRunCompleted && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="max-w-lg w-full">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-60"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 shadow-lg">
                    <FileSpreadsheet className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Balance Sheet Item Solver
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                  Reconcile AP and GL balances, identify discrepancies, and
                  analyze adjustments across operating units.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  How to get started
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Select Operating Units
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Use the dropdown above to choose one or more OUs for
                        reconciliation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Run the Solver
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Click the Run button to start the AI-powered
                        reconciliation agent.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Review Results
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Analyze reconciliation results with AP vs GL balances,
                        differences, and remarks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {ouOptions.length > 0 && selectedOUs.length === 0 && (
                <div className="text-center">
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    Select OUs above to enable the solver
                  </p>
                </div>
              )}

              {isOUListLoading && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500"></div>
                  <p className="text-xs text-slate-500">
                    Loading available Operating Units...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
