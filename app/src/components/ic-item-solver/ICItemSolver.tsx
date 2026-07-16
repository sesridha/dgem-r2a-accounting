"use client";

import {
  AIAgentWorkflowLoader,
  type WorkflowStep,
} from "@/components/shared/AIAgentWorkflowLoader";
import { AutoCompleteInput } from "@/components/shared/AutocompleteInput";
import { StatusToast } from "@/components/shared/StatusToast";
import { icItemSolverService } from "@/services/api/icItemSolverService";
import type {
  ICTransactionRecord,
  ReviewDecision,
  SelectOption,
  TBDrillComparisonRow,
} from "@/types";
import type { DrillState, ICInvoiceRecordProps } from "@/types/icItemSolver";
import { getICItemSolverBreadcrumbs } from "@/utils/breadcrumb.utils";
import { IC_WORKFLOW_CONFIG } from "@/utils/constants.ts";
import { FileChartColumnIncreasing } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TableSkeletonLoader } from "@/components/shared";
import { IconTextButton } from "../shared/IconTextButton";
import ICItemSolverTable from "./ICItemSolverTable.tsx";
import ICItemSolverTopNav from "./ICItemSolverTopNav";
import { getInputSupplierEntityName } from "./useICItemSolverColumns.ts";

export default function ICItemSolver() {
  const [inputData, setInputData] = useState<ICTransactionRecord[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialInputData, setInitialInputData] = useState<
    ICTransactionRecord[]
  >([]);
  const [drillState, setDrillState] = useState<DrillState>({
    entityCode: null,
    entityName: null,
    transactionNumber: null,
  });
  const [selectedSupplierEntity, setSelectedSupplierEntity] = useState("");
  const [selectedReconciliationsStatus, setSelectedReconciliationsStatus] =
    useState("");

  const [companyCodeText, setCompanyCodeText] = useState("");
  const [reconciliationStatusText, setReconciliatioStatusnCodeText] =
    useState("");

  const [results, setResults] = useState<ICTransactionRecord[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [drillDownRows, setDrillDownRows] = useState<TBDrillComparisonRow[]>(
    [],
  );
  const [isDrillLoading, setIsDrillLoading] = useState(false);
  const [resultPage, setResultPage] = useState(1);
  const [selectedDrillResult, setSelectedDrillResult] =
    useState<ICTransactionRecord | null>(null);

  const [invoiceData, setInvoiceData] = useState<ICInvoiceRecordProps | null>(
    null,
  );
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

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const inputRows = await icItemSolverService.getInputData();
        if (!isMounted) return;

        setInputData(inputRows);
        setInitialInputData(inputRows);
      } catch (error) {
        console.error("Failed to load input data", error);
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const isRunEnabled =
    Boolean(selectedReconciliationsStatus) && inputData.length > 0;

  const resetResults = () => {
    setShowResults(false);
    setResults([]);
    setDrillDownRows([]);
    setSelectedDrillResult(null);
    setReviewDecisions({});
    setDrillState({
      entityCode: null,
      entityName: null,
      transactionNumber: null,
    });
  };

  const handleRun = async () => {
    if (!isRunEnabled) return;

    setShowLoader(true);
    setLoaderError(null);
    setLoaderErrorDetail(null);
    setLoaderStep("initializing");

    setDrillState({
      entityCode: null,
      entityName: null,
      transactionNumber: null,
    });

    setDrillDownRows([]);
    setSelectedDrillResult(null);
    setReviewDecisions({});
    setShowResults(false);

    try {
      setLoaderStep("validating");
      await new Promise((r) => setTimeout(r, 800));

      setLoaderStep("processing");
      await icItemSolverService.runSolver();

      setLoaderStep("analyzing");
      await new Promise((r) => setTimeout(r, 500));

      setLoaderStep("finalizing");
      const transactionType = ["IPB", "ICB", "PA MANUAL", "AR MANUAL"];
      const results = filteredInputData.filter((inputRow) =>
        transactionType.includes(inputRow.transactionType),
      );
      const data: ICTransactionRecord[] = results.map((row) => ({
        ...row,
        mismatchType: row.reconciliationStatus === "Auto Reconciled" ? "Auto Reconciled" : "Invoice Missing",
        transactionType: row.transactionType,
      }));
      setResults(data);
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

  const handleDrillDown = async (data: ICTransactionRecord) => {
    setIsDrillLoading(true);

    try {
      const invoiceData = await icItemSolverService.getInvoiceData();

      setDrillState({
        entityCode: data.supplierEntityCode,
        entityName: data.supplierEntityName,
        transactionNumber: data.transactionNumber,
      });

      setDrillDownRows([]);

      const filteredInvoiceBook = invoiceData.ap_invoice_book.filter(
        (item) =>
          String(item.invoice_num) === String(data.transactionNumber) &&
          String(item.ics_code) === String(data.supplierEntityCode),
      );

      const filteredUnaccountedInvoices =
        invoiceData.un_accounted_invoices.filter(
          (item) =>
            String(item.invoice_number) === String(data.transactionNumber),
        );

      const filteredInputRow = inputData.find(
        (row) =>
          String(row.transactionNumber) === String(data.transactionNumber) &&
          String(row.supplierEntityCode) === String(data.supplierEntityCode),
      );

      let explanation: string;

      if (filteredInvoiceBook.length > 0) {
        explanation = `Invoice ${data.transactionNumber} is missing. The transaction has been accounted for in GFS, but the corresponding entry is missing in ICS.`;
      } else {
        const isWorkbenchIssue =
          filteredInputRow &&
          ["IPB", "ICB"].includes(filteredInputRow.transactionType);

        explanation = isWorkbenchIssue
          ? `Invoice ${data.transactionNumber} is missing. Contact IT team to solve workbench issue`
          : `Invoice ${data.transactionNumber} is missing. The invoice needs to be accounted based on ISOW information.`;
      }

      setSelectedDrillResult({
        ...data,
        explanation,
      });

      setInvoiceData({
        un_accounted_invoices: filteredUnaccountedInvoices,
        ap_invoice_book: filteredInvoiceBook,
      });
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
    }
  };

  const handleExplanationChange = (
    accountCode: string | number,
    explanation: string,
  ) => {
    setSelectedDrillResult((prev) =>
      prev?.supplierEntityCode === accountCode
        ? { ...prev, explanation }
        : prev,
    );
  };

  const handleReviewDecision = (
    accountCode: string | number,
    decision: ReviewDecision,
  ) => {
    setReviewDecisions((prev) => ({
      ...prev,
      [accountCode]: decision,
    }));
  };

  const breadcrumbItems = getICItemSolverBreadcrumbs(showResults, resetResults);

  const filteredInputData = useMemo(() => {
    return initialInputData.filter((row) => {
      return (
        (!selectedSupplierEntity ||
          getInputSupplierEntityName(row) === selectedSupplierEntity) &&
        (!selectedReconciliationsStatus ||
          row.reconciliationStatus === selectedReconciliationsStatus)
      );
    });
  }, [initialInputData, selectedSupplierEntity, selectedReconciliationsStatus]);

  const handleChange = (value: string | null) => {
    const supplier = value ?? "";
    setSelectedSupplierEntity(supplier);
  };

  const handleReconciliationStatusChange = (value: string | null) => {
    const status = value ?? "";
    setSelectedReconciliationsStatus(status);
  };

  const companyCodeOptions = useMemo<SelectOption[]>(() => {
    const uniqueCodes = new Set(
      initialInputData.map(getInputSupplierEntityName).filter(Boolean),
    );
    return [...uniqueCodes].sort().map((code) => ({ id: code, name: code }));
  }, [initialInputData]);

  const reconciliationStatusOptions = useMemo<SelectOption[]>(() => {
    const statuses = new Set(
      initialInputData.map((r) => r.reconciliationStatus),
    );
    return [...statuses].sort().map((status) => ({ id: status, name: status }));
  }, [initialInputData]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-[#1a252f] border-b border-[#dbe0e6] dark:border-slate-700 shrink-0 z-10">
        <header className="px-8 py-6">
          <ICItemSolverTopNav
            title={showResults ? "IC Item Solver Results" : "IC Item Solver"}
            description={
              showResults
                ? "Intercompany invoice reconciliation results."
                : "Run intercompany invoice reconciliation."
            }
            variant={showResults ? "success" : null}
            breadcrumbItems={breadcrumbItems}
          />

          {!showResults ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1 lg:max-w-xl">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6">
                    <div className="flex flex-col gap-2">
                      <AutoCompleteInput<SelectOption>
                        label="Supplier Entity"
                        required
                        placeholder="Select supplier entity..."
                        options={companyCodeOptions}
                        value={selectedSupplierEntity}
                        onChange={(value) => {
                          handleChange(value);
                          setResultPage(1);
                        }}
                        inputValue={companyCodeText}
                        onInputChange={setCompanyCodeText}
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.name}
                        size="sm"
                        clearable
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      {" "}
                      <AutoCompleteInput<SelectOption>
                        label="Reconciliation Status"
                        required
                        placeholder="Select reconciliation status..."
                        options={reconciliationStatusOptions}
                        value={selectedReconciliationsStatus}
                        onChange={(value) => {
                          handleReconciliationStatusChange(value);
                          setResultPage(1);
                        }}
                        inputValue={reconciliationStatusText}
                        onInputChange={setReconciliatioStatusnCodeText}
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.name}
                        size="sm"
                        clearable
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Select a supplier entity, then run item solver to analyze
                    it.
                  </p>
                </div>

                <div className="flex min-w-0 lg:w-auto lg:shrink-0">
                  <IconTextButton
                    text="Run Item Solver"
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
                Supplier Name: {selectedSupplierEntity || "-"}
              </span>
              <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                Reconciliation Status: {selectedReconciliationsStatus || "-"}
              </span>
            </div>
          )}
        </header>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-5">
        <div className="w-full space-y-6">
          {isInitialLoading ? (
            <TableSkeletonLoader columns={7} rows={10} showToolbar showTitle />
          ) : (
          <ICItemSolverTable
            results={showResults ? results : filteredInputData}
            drillDownAccountCode={drillState.entityCode}
            drillDownAccountName={drillState.entityName}
            drillDownRows={drillDownRows}
            selectedDrillResult={selectedDrillResult}
            selectedReviewDecision={
              drillState.entityCode
                ? (reviewDecisions[drillState.entityCode] ?? null)
                : null
            }
            onDrillDown={handleDrillDown}
            isDrillLoading={isDrillLoading}
            onExplanationChange={handleExplanationChange}
            onReviewDecision={handleReviewDecision}
            invoiceData={invoiceData}
            drillDownTransactionNumber={drillState.transactionNumber}
            showResults={showResults}
            setResultPage={setResultPage}
            resultPage={resultPage}
          />
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
        workflowConfig={IC_WORKFLOW_CONFIG}
        documentName={selectedSupplierEntity ? `IC Resolution: ${selectedSupplierEntity}` : "IC Item Resolution"}
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
