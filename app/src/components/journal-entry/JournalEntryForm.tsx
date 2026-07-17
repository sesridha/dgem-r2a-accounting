"use client";

import { AIAgentWorkflowLoader } from "@/components/shared/AIAgentWorkflowLoader";
import { AutoCompleteInput } from "@/components/shared/AutocompleteInput";
import { Button } from "@/components/ui/button";
import {
  cn,
  extractSafeConditions,
  filterRowsByConditions,
  normalizeKey,
} from "@/lib/utils";
import { journalEntryService } from "@/services/api";
import { JournalEntryWorkflowInvocationError } from "@/services/api/journalEntryService";
import {
  type BusinessRule,
  type IAProofOfWork,
  type InputDataRecord,
  type InvestmentAccountingBankStatement,
  type InvestmentAccountingFundStatement,
  type InvestmentAccountingPostingRecord,
  type JePostingRecord,
  type JEProofOfWork,
  type JournalEntryStatus,
  type JournalType,
  type ResultVariant,
} from "@/types";
import { RESULT_CONTENT } from "@/utils";
import { getJournalEntryBreadcrumbs } from "@/utils/breadcrumb.utils";
import { ACCOUNTING_CONFIG, JE_WORKFLOW_CONFIG } from "@/utils/constants";
import { INPUT_DATA_COLUMNS, type ColumnMeta } from "@/utils/tableColumns";
import { CheckCircle2, Eye, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TableSkeletonLoader } from "@/components/shared";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IconTextButton } from "../shared/IconTextButton";
import { StatusToast } from "../shared/StatusToast";
import InvestmentAccountDataTables from "./investment-accounting/InvestmentAccountDataTables";
// import InvestmentAccountProofOfWorkExport from "./investment-accounting/InvestmentAccountProofOfWorkExport";
import InvestmentAccountResult from "./investment-accounting/InvestmentAccountResult";
import JournalDataTables from "./JournalDataTables";
import { JournalEntryResult } from "./JournalEntryResult";
import JournalEntryTopNav from "./JournalEntryTopNav";
// import { JournalProofOfWork } from "./JournalProofOfWork";

/** Cache structure to avoid re-fetching same payload */
type RulesAndDataCache = {
  journalEntry?: {
    jeRows: InputDataRecord[];
    rulesRows: BusinessRule[];
  };
  investmentAccounting?: {
    fundStatementRows: InvestmentAccountingFundStatement[];
    bankStatementRows: InvestmentAccountingBankStatement[];
    businessRulesRows: BusinessRule[];
  };
};

type FilterToastState = {
  variant: "success" | "failure";
  title: string;
  description: string;
  key: number;
} | null;

const INVESTMENT_ACCOUNTING_ID = "INVESTMENT_ACCOUNTING";

/**
 * Journal types from the API that should appear in the dropdown.
 * Values are stored in lowercase; matching is case-insensitive
 * and uses substring containment (e.g. "Bunker_Reclass Entry" matches "bunker_reclass").
 * Update this array to add/remove visible options.
 */
const ALLOWED_JOURNAL_TYPES: readonly string[] = ["bunker_reclass"];

type PostingState =
  | {
      journalType: "JOURNAL_ENTRY";
      postingData: JePostingRecord[];
      proofOfWork?: JEProofOfWork[];
    }
  | {
      journalType: "INVESTMENT_ACCOUNTING";
      postingData: InvestmentAccountingPostingRecord[];
      proofOfWork?: IAProofOfWork[];
    };
/** ──────────────────────────────────────────────────────────────────────────
 *  Component
 *  ──────────────────────────────────────────────────────────────────────────
 */
export default function JournalEntryForm() {
  // Selections / inputs
  const [journalType, setJournalType] = useState<string>("");
  const [journalText, setJournalText] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = useParams<{ result?: string }>();
  const [dynamicInputColumns, setDynamicInputColumns] = useState<ColumnMeta[]>(
    [],
  );
  const [isInvestmentAccounting, setIsInvestmentAccounting] =
    useState<boolean>(false);
  const [postingState, setPostingState] = useState<PostingState | null>(null);
  // View content state
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [variant, setVariant] = useState<ResultVariant | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Options
  const [journalTypeOptions, setJournalTypeOptions] = useState<JournalType[]>(
    [],
  );

  // Data (paged)
  const [allInputData, setAllInputData] = useState<InputDataRecord[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTableHidden, setIsTableHidden] = useState(false);
  const [allBusinessRules, setAllBusinessRules] = useState<BusinessRule[]>([]);

  // Posting data from /api/je/posting (populated after workflow run)
  const [postingDocumentName, setPostingDocumentName] = useState<string>("");

  // Workflow loader state
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStep, setLoaderStep] = useState<
    "initializing" | "validating" | "processing" | "analyzing" | "finalizing"
  >("initializing");
  const [loaderError, setLoaderError] = useState<
    "timeout" | "cancelled" | "network" | "unknown" | "workflow_failed" | null
  >(null);
  const [loaderErrorDetail, setLoaderErrorDetail] = useState<string | null>(
    null,
  );

  // Status flags
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<JournalEntryStatus>({
    dataLoaded: false,
    rulesValidated: false,
    readyForExecution: false,
  });
  const [filterToast, setFilterToast] = useState<FilterToastState>(null);

  // Cache for rules + input data to avoid refetch
  const rulesAndDataRef = useRef<RulesAndDataCache>({});

  const isViewDataAndRulesEnabled = useMemo(
    () => Boolean(journalType?.trim()),
    [journalType],
  );

  /** Helper: fetch posting data (best-effort, never throws) */
  const fetchPostingData = useCallback(
    async (docName: string): Promise<JePostingRecord[]> => {
      try {
        return await journalEntryService.getPostingData(docName);
      } catch (err) {
        console.error("Failed to fetch posting data:", err);
        return [];
      }
    },
    [],
  );

  /** ────────────────────────────────────────────────────────────────────────
   *  Handlers
   *  ────────────────────────────────────────────────────────────────────────
   */
  const handleRunJournalEntry = useCallback(async () => {
    setShowLoader(true);
    setLoaderError(null);
    setLoaderErrorDetail(null);
    setLoaderStep("initializing");

    const totalDuration =
      journalType === INVESTMENT_ACCOUNTING_ID ? 8500 : 4500;
    const stepDelay = totalDuration / 2;
    try {
      // Simulate step progression
      setLoaderStep("validating");
      await new Promise((r) => setTimeout(r, stepDelay));

      setLoaderStep("processing");
      const response = await journalEntryService.runWorkflow(journalType);
      setLoaderStep("analyzing");
      await new Promise((r) => setTimeout(r, stepDelay));

      if (response.success) {
        // ── SUCCESS: fetch posting data & navigate to success page ──
        setLoaderStep("finalizing");
        let posting;
        if (journalType === INVESTMENT_ACCOUNTING_ID) {
          posting =
            await journalEntryService.getInvestmentAccountingPostingData();
        } else {
          posting = await fetchPostingData(journalType);
        }

        await new Promise((r) => setTimeout(r, 1500));

        setShowLoader(false);
        navigate(`/journal-entry/success`, {
          state: {
            postingData: posting,
            documentName: journalType,
          },
        });
        setIsTableHidden(false);
      } else {
        // ── FAILURE: show error in the AI workflow loader ──
        setLoaderError("workflow_failed");
        setLoaderErrorDetail(response.failureDetails || null);
      }
    } catch (error) {
      console.error("runWorkflow error:", error);

      if (error instanceof JournalEntryWorkflowInvocationError) {
        setLoaderError(error.kind);
        return;
      }

      setLoaderError("unknown");
    }
  }, [journalType, navigate, fetchPostingData]);

  const handleClearResult = useCallback(() => {
    navigate("/journal-entry");
    setFilterToast(null);
  }, [navigate]);

  /** Centralized filtering using cached payload if available */
  const handleViewDataAndRules = useCallback(async () => {
    if (!journalType) return;
    setLoading(true);
    try {
      if (journalType === INVESTMENT_ACCOUNTING_ID) {
        setIsInvestmentAccounting(true);
        // if (!rulesAndDataRef.current.investmentAccounting) {
        const response =
          await journalEntryService.fetchInvestmentAccountingInputData();
        rulesAndDataRef.current.investmentAccounting = {
          fundStatementRows: response.fund_statement ?? [],
          bankStatementRows: response.bank_statement ?? [],
          businessRulesRows: response.business_rules ?? [],
        };
        // }
      } else {
        setIsInvestmentAccounting(false);
        if (!rulesAndDataRef.current.journalEntry) {
          const response =
            await journalEntryService.getJournalEntryRulesAndData();

          rulesAndDataRef.current.journalEntry = {
            jeRows: response.je_preparation?.rows ?? [],
            rulesRows: response.business_rules_staging?.rows ?? [],
          };
        }
      }

      setIsTableHidden(true);

      const { jeRows, rulesRows } = rulesAndDataRef.current.journalEntry ?? {
        jeRows: [],
        rulesRows: [],
      };

      // Filter rules for selected journalType
      const filteredRules = rulesRows.filter(
        (item) => item.document_name === journalType,
      );

      const sourcing = filteredRules.find((r) => r.rule_type === "Sourcing");

      const conditions = extractSafeConditions(sourcing?.conditions);
      const inputColumnKeys = new Set(
        INPUT_DATA_COLUMNS.map((c) => normalizeKey(c.key)),
      );

      const missingFields = conditions
        .filter((c) => c.field)
        .map((c) => normalizeKey(c.field as string))
        .filter((field) => !inputColumnKeys.has(field));

      const dynamicColumns: ColumnMeta[] = missingFields.map((field) => ({
        key: field,
        header: field.replace(/_/g, " ").toUpperCase(),
      }));

      setDynamicInputColumns(dynamicColumns);

      const filteredInput =
        conditions?.length > 0
          ? filterRowsByConditions(jeRows, conditions)
          : [];
      setAllBusinessRules(filteredRules);
      setAllInputData(filteredInput);
      setVariant(null);
      setContent(null);
      /**
       * ============================
       * Toast + Status Handling
       * ============================
       */

      if (journalType === INVESTMENT_ACCOUNTING_ID) {
        const fundCount =
          rulesAndDataRef.current.investmentAccounting?.fundStatementRows
            .length ?? 0;

        const bankCount =
          rulesAndDataRef.current.investmentAccounting?.bankStatementRows
            .length ?? 0;

        const hasInvestmentData = fundCount > 0 || bankCount > 0;

        setStatus({
          dataLoaded: hasInvestmentData,
          rulesValidated: true, // Rules are not applicable for IA
          readyForExecution: hasInvestmentData,
        });

        /**
         * IMPORTANT:
         * Stop here so Journal Entry logic does NOT execute.
         */
        return;
      }

      setStatus({
        dataLoaded: filteredInput.length > 0,
        rulesValidated: filteredRules.length > 0,
        readyForExecution: filteredInput.length > 0,
      });
    } catch (err) {
      console.error(err);
      setStatus({
        dataLoaded: false,
        rulesValidated: false,
        readyForExecution: false,
      });
    } finally {
      setLoading(false);
    }
  }, [journalType]);

  /** ────────────────────────────────────────────────────────────────────────
   *  Effects
   *  ────────────────────────────────────────────────────────────────────────
   */
  useEffect(() => {
    if (variant && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [variant]);

  useEffect(() => {
    if (result === "success" || result === "failure") {
      setVariant(result);
      setContent(RESULT_CONTENT[result]);

      const state = location.state as
        | {
            postingData?: unknown;
            documentName?: string;
            proofOfWork?: unknown;
          }
        | undefined;

      if (state?.postingData) {
        if (state.documentName === INVESTMENT_ACCOUNTING_ID) {
          setPostingState({
            journalType: "INVESTMENT_ACCOUNTING",
            postingData:
              state.postingData as InvestmentAccountingPostingRecord[],
            proofOfWork: state.proofOfWork as IAProofOfWork[],
          });
        } else {
          setPostingState({
            journalType: "JOURNAL_ENTRY",
            postingData: state.postingData as JePostingRecord[],
            proofOfWork: state.proofOfWork as JEProofOfWork[],
          });
        }
      } else {
        setPostingState(null);
      }

      setPostingDocumentName(state?.documentName ?? "");
      return;
    }

    setVariant(null);
    setContent(null);
    setPostingState(null);
    setPostingDocumentName("");
  }, [result, location.state, journalType]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [names, response] = await Promise.all([
          journalEntryService.fetchJournalEntryType(),
          journalEntryService.getJournalEntryRulesAndData(),
        ]);
        if (cancelled) return;

        const stringNames = (names ?? []).filter(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        );
        const options: JournalType[] = stringNames
          .filter((name) => {
            const lower = name.toLowerCase();
            return ALLOWED_JOURNAL_TYPES.some((allowed) =>
              lower.includes(allowed),
            );
          })
          .map((name, index) => ({
            id: name,
            name: name.replaceAll("_", " "),
            code: index % 2 === 0,
          }))
          .concat({
            id: "INVESTMENT_ACCOUNTING",
            name: "Investment Accounting",
            code: true,
          });

        setJournalTypeOptions(options);

        rulesAndDataRef.current = {
          journalEntry: {
            jeRows: response?.je_preparation?.rows ?? [],
            rulesRows: response?.business_rules_staging?.rows ?? [],
          },
          investmentAccounting: {
            fundStatementRows: [],
            bankStatementRows: [],
            businessRulesRows: [],
          },
        };
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsInitialLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const breadcrumbItems = useMemo(
    () => getJournalEntryBreadcrumbs(content, handleClearResult),
    [content, handleClearResult],
  );

  const activeModule =
    location.state?.documentName === INVESTMENT_ACCOUNTING_ID
      ? "investmentAccounting"
      : "journalEntry";

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="bg-white dark:bg-[#1a252f] border-b border-[#dbe0e6] dark:border-slate-700 shrink-0 z-10">
        <header className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
          <div>
            {/* Title row */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-6">
              <JournalEntryTopNav
                title={
                  content
                    ? ACCOUNTING_CONFIG[activeModule].title
                    : ACCOUNTING_CONFIG[activeModule].breadcrumb
                }
                description={
                  content
                    ? ACCOUNTING_CONFIG[activeModule].description
                    : "Review the results of the journal entry processing."
                }
                items={breadcrumbItems}
              />
              <div>
                {variant === "success" && (
                  <>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      STATUS <span className="text-green-700">SUCCESS</span>
                    </div>
                    {/* Export Proof of Work - commented out */}
                    {/* {postingState?.journalType === "INVESTMENT_ACCOUNTING" ? (
                      <div className="mb-2 sm:mb-3 mt-8">
                        <InvestmentAccountProofOfWorkExport
                          data={postingState.proofOfWork ?? []}
                        />
                      </div>
                    ) : postingState?.journalType === "JOURNAL_ENTRY" ? (
                      <div className="mb-2 sm:mb-3 mt-8">
                        <JournalProofOfWork
                          data={postingState.proofOfWork ?? []}
                        />
                      </div>
                    ) : null} */}
                  </>
                )}
              </div>
            </div>

            {/* Filters */}
            {!variant && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0 flex-1 lg:max-w-xl">
                    <AutoCompleteInput<JournalType>
                      label="Journal Type"
                      required
                      placeholder="Choose a journal type"
                      options={journalTypeOptions}
                      value={journalType}
                      onChange={(value, selectedOption) => {
                        setJournalType(value);
                        setStatus({
                          dataLoaded: false,
                          rulesValidated: false,
                          readyForExecution: false,
                        });
                        if (!selectedOption) {
                          setJournalText("");
                        }
                      }}
                      inputValue={journalText}
                      onInputChange={setJournalText}
                      getOptionValue={(o) => o.id}
                      getOptionLabel={(o) => o.name}
                      size="sm"
                      clearable
                      renderOption={(o) => (
                        <span className="truncate max-w-full">
                          <span className="font-medium">{o.name}</span>
                        </span>
                      )}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Select a journal type, then click{" "}
                      <span className="font-semibold">View Data & Rules</span>{" "}
                      to display the data.
                    </p>
                  </div>

                  <div className="flex min-w-0 lg:w-auto lg:shrink-0">
                    <IconTextButton
                      text={"View Data & Rules"}
                      icon={Eye}
                      variant="default"
                      className="h-11 px-6 bg-primary text-white font-bold rounded-lg"
                      iconSize={20}
                      onClick={handleViewDataAndRules}
                      disabled={!isViewDataAndRulesEnabled || loading}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* Main content */}
      <div
        className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-5"
        ref={scrollRef}
      >
        <div className="w-full space-y-6">
          {!variant && isInitialLoading && (
            <TableSkeletonLoader columns={6} rows={10} showToolbar showTitle />
          )}

          {/* Empty state: shown on initial page before user applies rules */}
          {!variant && !isInitialLoading && !isTableHidden && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <Eye className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-600 mb-1">
                No Data Loaded
              </h3>
              <p className="text-sm text-slate-500 text-center max-w-sm">
                Select a journal type above and click{" "}
                <span className="font-semibold">View Data & Rules</span> to
                display data and business rules.
              </p>
            </div>
          )}

          {isTableHidden && (
            <>
              {filterToast ? (
                <StatusToast
                  key={filterToast.key}
                  variant={filterToast.variant}
                  title={filterToast.title}
                  description={filterToast.description}
                  autoHideDuration={4000}
                  className="rounded-xl shadow-sm"
                />
              ) : null}
              {!isInvestmentAccounting ? (
                <JournalDataTables
                  key={`${journalType}-${allInputData.length}-${allBusinessRules.length}`}
                  loading={loading}
                  inputData={allInputData}
                  rulesData={allBusinessRules}
                  dynamicInputColumns={dynamicInputColumns}
                />
              ) : (
                <>
                  <InvestmentAccountDataTables
                    fundStatementData={
                      rulesAndDataRef.current?.investmentAccounting
                        ?.fundStatementRows ?? []
                    }
                    bankStatementData={
                      rulesAndDataRef.current?.investmentAccounting
                        ?.bankStatementRows ?? []
                    }
                    businessRulesData={
                      rulesAndDataRef.current?.investmentAccounting
                        ?.businessRulesRows ?? []
                    }
                  />
                </>
              )}

              {/* Action Button and Status */}
              <div className="flex flex-col items-center gap-6 py-6 sm:py-8">
                <Button
                  onClick={handleRunJournalEntry}
                  disabled={!status.readyForExecution || showLoader}
                  className="h-12 sm:h-14 px-8 sm:px-12 bg-(--sidebar-menu-active) text-white font-bold text-base sm:text-lg rounded-xl shadow-lg transition-all"
                >
                  {showLoader ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                      {journalType === INVESTMENT_ACCOUNTING_ID
                        ? "RUN INVESTMENT ACCOUNTING"
                        : "RUN JOURNAL ENTRY"}
                    </>
                  )}
                </Button>

                <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5",
                        status.dataLoaded ? "text-green-500" : "text-slate-300",
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium uppercase tracking-wide",
                        status.dataLoaded ? "text-green-600" : "text-slate-400",
                      )}
                    >
                      Data Loaded
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5",
                        status.rulesValidated
                          ? "text-green-500"
                          : "text-slate-300",
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium uppercase tracking-wide",
                        status.rulesValidated
                          ? "text-green-600"
                          : "text-slate-400",
                      )}
                    >
                      Rules Validated
                    </span>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-500 max-w-md text-center">
                  AGENT READY FOR EXECUTION
                </p>
              </div>
            </>
          )}

          {variant === "success" &&
            content &&
            postingState &&
            (postingState.journalType === "INVESTMENT_ACCOUNTING" ? (
              <InvestmentAccountResult
                content={content}
                variant={variant}
                postingData={postingState.postingData}
              />
            ) : (
              <JournalEntryResult
                content={content}
                variant={variant}
                postingData={postingState.postingData}
                documentName={postingDocumentName}
              />
            ))}
        </div>
      </div>

      <AIAgentWorkflowLoader
        isVisible={showLoader}
        currentStep={loaderStep}
        workflowConfig={JE_WORKFLOW_CONFIG}
        documentName={journalType}
        errorKind={loaderError}
        errorDetail={loaderErrorDetail}
        onRetry={handleRunJournalEntry}
        onClose={() => {
          setShowLoader(false);
          setLoaderError(null);
          setLoaderErrorDetail(null);
        }}
      />
    </div>
  );
}
