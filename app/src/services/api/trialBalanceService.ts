import type {
  TBInputRecord,
  TBAnomalyOutputRecord,
  TBPostingDetail,
} from "@/types";
import { USE_TRIAL_BALANCE_MOCK } from "@/utils/constants";
import {
  tbJsonInputData,
  tbJsonOutputData,
  tbJsonAnomalyDetails,
} from "../../../data/trialBalance.mock";
import apiClient from "./client";

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const readInputCompanyCode = (row: TBInputRecord): string =>
  String(
    row.company_code ?? row.CompanyCode ?? row["Company Code"] ?? "",
  ).trim();

const readInputAccountCode = (row: TBInputRecord): string =>
  String(
    row.account_number ?? row.GLAccount ?? row["Account Code"] ?? "",
  ).trim();

const readInputPeriod = (row: TBInputRecord): number =>
  toFiniteNumber(row.period);

const readInputYear = (row: TBInputRecord): number =>
  toFiniteNumber(row.fiscal_year ?? row.FiscalYear ?? row.Year);

const readInputClosingBalance = (row: TBInputRecord): number =>
  toFiniteNumber(
    row.closing_balance_amount ?? row.ClosingBalance ?? row.Amount,
  );

const buildInputBalanceLookup = (
  rows: TBInputRecord[],
): Map<string, number> => {
  const lookup = new Map<string, number>();

  rows.forEach((row) => {
    const companyCode = readInputCompanyCode(row);
    const accountCode = readInputAccountCode(row);
    const period = readInputPeriod(row);
    const year = readInputYear(row);

    if (
      !companyCode ||
      !accountCode ||
      !Number.isFinite(period) ||
      !Number.isFinite(year)
    ) {
      return;
    }

    const balance = readInputClosingBalance(row);
    const key = `${companyCode}|${accountCode}|${period}|${year}`;
    lookup.set(key, balance);
  });

  return lookup;
};

// ---------------------------------------------------------------------------
// Normalize anomaly output rows (tb_anomaly_detection → TBAnomalyOutputRecord)
// ---------------------------------------------------------------------------
const normalizeOutputRows = (rows: unknown[]): TBAnomalyOutputRecord[] => {
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    const period = toFiniteNumber(r.period ?? r.Period);
    const fiscalYear = toFiniteNumber(r.fiscal_year ?? r.FiscalYear);

    const prevPeriod = period === 1 ? 12 : period - 1;
    const prevYear = period === 1 ? fiscalYear - 1 : fiscalYear;

    let currentBalance = toFiniteNumber(r.current_period_amount);
    let prevBalance = toFiniteNumber(r.comparison_period_amount);

    if (!currentBalance && !prevBalance) {
      const closingBalancePattern = /^P(\d{1,2})\/(\d{4}) Closing Balance$/i;
      const dynamicBalances = Object.entries(r)
        .map(([key, value]) => {
          const match = key.match(closingBalancePattern);
          if (!match) return null;
          return {
            period: Number(match[1]),
            year: Number(match[2]),
            value: toFiniteNumber(value),
          };
        })
        .filter(
          (e): e is { period: number; year: number; value: number } =>
            e !== null,
        )
        .sort((a, b) => a.year * 100 + a.period - (b.year * 100 + b.period));

      const dynamicCurrent = dynamicBalances.find(
        (e) => e.period === period && e.year === fiscalYear,
      );
      const dynamicPrevious = dynamicBalances
        .filter((e) => e.period !== period || e.year !== fiscalYear)
        .at(-1);

      currentBalance = toFiniteNumber(
        r.CurrentBalance ?? r.current_balance ?? dynamicCurrent?.value,
      );
      prevBalance = toFiniteNumber(
        r.PrevBalance ?? r.prev_balance ?? dynamicPrevious?.value,
      );
    }

    const percentDeviation = toFiniteNumber(
      r.change_in_percentage ??
        r.VariancePct ??
        r.percent_deviation ??
        r["% Change"],
    );

    const rawAnomalyType = String(r.anomaly_type ?? r.AnomalyType ?? "");
    const rawAnomalyFlag = String(r.anomaly_flag ?? r.AnomalyFlag ?? "");
    const anomalyFlag =
      rawAnomalyFlag === "Y" || rawAnomalyFlag === "N"
        ? rawAnomalyFlag
        : rawAnomalyType && rawAnomalyType !== "NONE" && rawAnomalyType !== ""
          ? "Y"
          : "N";

    const explanation = String(
      r.anomaly_explanation ??
        r.Comment ??
        r.AnomalyExplanation ??
        r.explanation ??
        "",
    );

    const accountCode = String(
      r.account_number ?? r.GLAccount ?? r.account_code ?? "",
    );
    const accountName = String(r.account_name ?? r.AccountName ?? "");

    const normalized: TBAnomalyOutputRecord = {
      company_code: String(r.company_code ?? r.CompanyCode ?? ""),
      account_code: accountCode,
      account_name: accountName,
      fiscal_year: fiscalYear,
      period,
      line_item_description: String(
        r.line_item_description ?? r.LineItemDescription ?? accountName,
      ),
      percent_deviation: percentDeviation,
      anomaly_flag: anomalyFlag as "Y" | "N",
      explanation,
      anomaly_type: rawAnomalyType,
      correction_impact: String(
        r.correction_impact ?? r.CorrectionImpact ?? "",
      ),
      [`current_period_${period}_${fiscalYear}`]: currentBalance,
      [`previous_period_${prevPeriod}_${prevYear}`]: prevBalance,
    };

    return normalized;
  });
};

// ---------------------------------------------------------------------------
// Normalize posting rows (tb_transaction_reference → TBPostingDetail)
// Maps real API snake_case → PascalCase expected by drill-down table columns
// ---------------------------------------------------------------------------
const normalizePostingRow = (
  row: Record<string, unknown>,
): TBPostingDetail => ({
  Line_Items: toFiniteNumber(row.line_item_number ?? row.Line_Items),
  CompanyCode: toFiniteNumber(row.company_code ?? row.CompanyCode),
  GLAccount: toFiniteNumber(row.account_number ?? row.GLAccount),
  AccountName: String(row.account_name ?? row.AccountName ?? ""),
  AccountType: String(row.account_type ?? row.AccountType ?? ""),
  FiscalYear: toFiniteNumber(row.fiscal_year ?? row.FiscalYear),
  Period: toFiniteNumber(row.period ?? row.Period),
  DocumentNumber: toFiniteNumber(row.document_number ?? row.DocumentNumber),
  DocumentType: String(row.document_type ?? row.DocumentType ?? ""),
  PostingDate: String(row.posting_date ?? row.PostingDate ?? ""),
  PostingKey: toFiniteNumber(row.posting_key ?? row.PostingKey),
  DebitCredit: String(row.debit_credit_indicator ?? row.DebitCredit ?? "D") as
    | "D"
    | "C",
  AmountLC: toFiniteNumber(row.amount_in_local_currency ?? row.AmountLC),
  Currency: String(row.local_currency_code ?? row.Currency ?? ""),
  CostCenter: String(row.cost_center_code ?? row.CostCenter ?? ""),
  ProfitCenter: String(row.profit_center_code ?? row.ProfitCenter ?? ""),
  BusinessArea: String(row.business_area ?? row.BusinessArea ?? ""),
  Vendor: String(row.vendor_code ?? row.Vendor ?? ""),
  VendorName: String(row.vendor_name ?? row.VendorName ?? ""),
  ServiceCode: String(row.service_code ?? row.ServiceCode ?? ""),
  Reference: String(row.reference ?? row.Reference ?? ""),
  Assignment: row.assignment != null ? toFiniteNumber(row.assignment) : null,
  LineItemText: String(row.line_item_text ?? row.LineItemText ?? ""),
  User: String(row.posting_user ?? row.User ?? ""),
  ClearingDoc: toFiniteNumber(row.clearing_document ?? row.ClearingDoc),
  ClearingDate: String(row.clearing_date ?? row.ClearingDate ?? ""),
  ErrorLabel: String(row.error_label ?? row.ErrorLabel ?? ""),
});

const normalizePostingRows = (rows: unknown[]): TBPostingDetail[] =>
  rows.map((row) => normalizePostingRow(row as Record<string, unknown>));

// ---------------------------------------------------------------------------
// Workflow polling helpers
// ---------------------------------------------------------------------------
const POLL_INTERVAL_MS = 30_000; // 30 seconds between polls
const POLL_TIMEOUT_MS = 5 * 60 * 1_000; // 5 minutes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pollTBWorkflowStatus = async (taskId: string): Promise<any> => {
  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    await delay(POLL_INTERVAL_MS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusRes: any = await apiClient.get(`/tb/workflow/status/${taskId}`);
    if (statusRes.status === "completed") {
      return statusRes.result;
    }
    if (statusRes.status === "failed") {
      throw new Error(statusRes.error || "TB workflow failed");
    }
  }
  throw new Error("TB workflow timed out after 5 minutes");
};

/**
 * Trial Balance Service
 * API calls for trial balance anomaly detection operations
 */

export const trialBalanceService = {
  // =================================================================
  // INPUT DATA
  // =================================================================

  getInputData: async (): Promise<TBInputRecord[]> => {
    try {
      if (USE_TRIAL_BALANCE_MOCK) {
        // In mock mode, only show Dec 2025 (period 12) and Nov 2025 (period 11)
        return (tbJsonInputData as TBInputRecord[]).filter((row) => {
          const period = readInputPeriod(row);
          const year = readInputYear(row);
          return year === 2025 && period;
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.get("/trial-balance");
      return response.data?.tb_preparation?.rows || [];
    } catch (error) {
      console.error("getInputData error:", error);
      throw error;
    }
  },

  getBusinessRules: async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.get(
        "/trial-balance/business-rules",
      );
      return response.data?.rows || [];
    } catch (error) {
      console.error("getBusinessRules error:", error);
      throw error;
    }
  },

  getTransactionReference: async (params: {
    company_code?: string;
    account_number?: string;
    fiscal_year?: number;
    fiscal_period?: number;
  }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.get(
        "/trial-balance/transaction-reference",
        { params },
      );
      return response.data?.rows || [];
    } catch (error) {
      console.error("getTransactionReference error:", error);
      throw error;
    }
  },

  // =================================================================
  // OUTPUT DATA (read-only table queries)
  // =================================================================

  getAnomalyDetection: async (params: {
    company_code?: string;
    fiscal_year?: number;
    current_period?: number;
    comparison_period?: number;
  }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.get(
        "/trial-balance/anomaly-detection",
        { params },
      );
      return response.data || {};
    } catch (error) {
      console.error("getAnomalyDetection error:", error);
      throw error;
    }
  },

  getAnomalyExplanation: async (params: {
    company_code?: string;
    fiscal_year?: number;
    fiscal_period?: number;
  }) => {
    try {
      if (USE_TRIAL_BALANCE_MOCK) {
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.get(
        "/trial-balance/anomaly-explanation",
        { params },
      );
      return response.data?.rows || [];
    } catch (error) {
      console.error("getAnomalyExplanation error:", error);
      throw error;
    }
  },

  // =================================================================
  // WORKFLOW – run anomaly detection via TB agent
  // =================================================================

  runAnomalyDetection: async (params: {
    companyCode: string;
    currentPeriod: number;
    currentYear: number;
    comparisonPeriod: number;
    comparisonYear: number;
  }): Promise<TBAnomalyOutputRecord[]> => {
    try {
      if (USE_TRIAL_BALANCE_MOCK) {
        await delay(1000);

        const normalizedRows = normalizeOutputRows(
          tbJsonOutputData as unknown[],
        );
        const selectedRows = normalizedRows.filter(
          (row) =>
            String(row.company_code) === params.companyCode &&
            Number(row.period) === params.currentPeriod &&
            Number(row.fiscal_year) === params.currentYear,
        );

        const inputBalanceLookup = buildInputBalanceLookup(
          tbJsonInputData as TBInputRecord[],
        );
        const currentKey = `current_period_${params.currentPeriod}_${params.currentYear}`;
        const comparisonKey = `previous_period_${params.comparisonPeriod}_${params.comparisonYear}`;

        return selectedRows.map((row) => {
          const lookupPrefix = `${row.company_code}|${row.account_code}|`;
          const currentLookupKey = `${lookupPrefix}${params.currentPeriod}|${params.currentYear}`;
          const comparisonLookupKey = `${lookupPrefix}${params.comparisonPeriod}|${params.comparisonYear}`;

          const currentBalance = inputBalanceLookup.get(currentLookupKey);
          const comparisonBalance = inputBalanceLookup.get(comparisonLookupKey);

          return {
            ...row,
            [currentKey]: Number.isFinite(currentBalance)
              ? currentBalance
              : Number(row[currentKey] ?? 0),
            [comparisonKey]: Number.isFinite(comparisonBalance)
              ? comparisonBalance
              : Number(row[comparisonKey] ?? 0),
          };
        });
      }

      // ---- REAL API FLOW ----

      const payload = {
        dataframe_split: {
          columns: [
            "request",
            "prev_year",
            "prev_period",
            "curr_year",
            "curr_period",
            "company_code",
          ],
          data: [
            [
              "Run TB anomaly analysis",
              params.comparisonYear,
              params.comparisonPeriod,
              params.currentYear,
              params.currentPeriod,
              params.companyCode,
            ],
          ],
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const submitRes: any = await apiClient.post(
        "/tb/workflow/submit",
        payload,
      );
      const taskId: string = submitRes.task_id;

      await pollTBWorkflowStatus(taskId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detectionRes: any = await apiClient.get(
        "/trial-balance/anomaly-detection",
        {
          params: {
            company_code: params.companyCode,
            fiscal_year: params.currentYear,
            current_period: params.currentPeriod,
            comparison_period: params.comparisonPeriod,
          },
        },
      );

      return normalizeOutputRows(detectionRes.data?.rows || []);
    } catch (error) {
      console.error("runAnomalyDetection error:", error);
      throw error;
    }
  },

  // =================================================================
  // DRILL-DOWN – posting-level anomaly details
  // =================================================================

  getAnomalyDetails: async (params: {
    companyCode: string;
    accountCode: string;
    accountName: string;
    currentPeriod: number;
    currentYear: number;
    comparisonPeriod: number;
    comparisonYear: number;
  }): Promise<TBPostingDetail[]> => {
    try {
      if (USE_TRIAL_BALANCE_MOCK) {
        const normalized = normalizePostingRows(
          tbJsonAnomalyDetails as unknown[],
        );
        return normalized.filter((row) => {
          const sameCompany = String(row.CompanyCode) === params.companyCode;
          const sameAccountName =
            row.AccountName.trim().toLowerCase() ===
            params.accountName.trim().toLowerCase();
          const isCurrentPeriod =
            row.Period === params.currentPeriod &&
            row.FiscalYear === params.currentYear;
          const isComparisonPeriod =
            row.Period === params.comparisonPeriod &&
            row.FiscalYear === params.comparisonYear;

          return (
            sameCompany &&
            sameAccountName &&
            (isCurrentPeriod || isComparisonPeriod)
          );
        });
      }

      // Fetch posting-level data for current period only
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.get(
        "/trial-balance/transaction-reference",
        {
          params: {
            company_code: params.companyCode,
            account_number: params.accountCode,
            fiscal_year: params.currentYear,
            fiscal_period: params.currentPeriod,
          },
        },
      );

      const rows = response.data?.rows || [];

      // Normalize snake_case API fields → PascalCase for drill-down table
      return normalizePostingRows(rows);
    } catch (error) {
      console.error("getAnomalyDetails error:", error);
      throw error;
    }
  },
};
