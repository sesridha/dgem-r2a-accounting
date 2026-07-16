import type {
  BalanceSheetRecord,
  APInvoiceRecord,
  APEntryRecord,
  TrialBalanceDetailRecord,
  ManualJournalEntryRecord,
  RevaluationEntryRecord,
} from "@/types";
import { USE_BALANCE_SHEET_SOLVER_MOCK } from "@/utils/constants";
import {
  bsMockSummaryData,
  bsMockAPData,
  bsMockAPEntryData,
  bsMockTBData,
  bsMockMJEData,
  bsMockRevalData,
  bsMockProjectEntryData,
} from "../../../data/balanceSheetSolver.mock";
import apiClient from "./client";

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------
export interface BalanceSheetSolverData {
  summary: BalanceSheetRecord[];
  apData: { [key: string]: APInvoiceRecord[] };
  apEntry: APEntryRecord[];
  tbData: { [key: string]: TrialBalanceDetailRecord[] };
  mjeData: { [key: string]: ManualJournalEntryRecord[] };
  revalData: { [key: string]: RevaluationEntryRecord[] };
  projectEntryData: { [key: string]: ManualJournalEntryRecord[] };
}

export interface OUListItem {
  label: string;
  value: string;
  [key: string]: unknown;
}

export interface RunAgentResponse {
  status: string;
  company: string;
  report_title: string;
  ou_filter: string;
  session_id: string;
  iterations: number;
  duration_ms: number;
  count: number;
  records: BalanceSheetRecord[];
}


export interface DrillDownPayload {
  ou_code: string;
  remark: string;
  manual_entries: string;
  diff_ap_gl_reval_manual: string;
}

export interface DrillDownResponse {
  ou_code: string;
  remark: string;
  remark_type: string;
  explanation: string;
  source_file: string;
  count: number;
  records: Record<string, unknown>[];
}

export interface DrillDownResult {
  remarkType: string;
  explanation: string;
  sourceFile: string;
  apEntry: APEntryRecord[];
  mjeData: ManualJournalEntryRecord[];
  projectEntryData: ManualJournalEntryRecord[];
}

export interface InputFilesResponse {
  records: BalanceSheetRecord[];
  ouList: OUListItem[];
}
// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

/**
 * Parse formatted amount strings like "4,640,857", "(4,640,858)", "-", "(0)"
 * Parentheses indicate negative. Dash means zero.
 */
const parseAmount = (v: unknown): number => {
  if (v == null) return 0;
  if (typeof v === "number") return v === 0 ? 0 : v;
  const str = String(v).trim();
  if (str === "-" || str === "") return 0;

  const isNegative = str.startsWith("(") && str.endsWith(")");
  const cleaned = str.replace(/[(),\s]/g, "").replace(/,/g, "");
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num === 0) return 0;
  return isNegative ? -num : num;
};

const toNum = (v: unknown, fallback = 0): number => {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const parsed = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Normalize a record from the /agent/run-narration response */
const normalizeAgentRecord = (r: Record<string, unknown>): BalanceSheetRecord => ({
  ou: String(r["OU"] ?? r.ou ?? ""),
  apBalance: parseAmount(r["AP Balance"] ?? r.ap_balance ?? r.apBalance),
  glBalance: parseAmount(r["GL Balance"] ?? r.gl_balance ?? r.glBalance),
  diff: parseAmount(r["Diff (AP-GL)"] ?? r.diff),
  revaluation: parseAmount(r["Revaluation"] ?? r.revaluation),
  manualEntries: parseAmount(r["Manual Entries"] ?? r.manual_entries ?? r.manualEntries),
  adjustedDiff: parseAmount(r["Diff (AP-GL-(Reval+Manual))"] ?? r.adjusted_diff ?? r.adjustedDiff),
  remarks: String(r["Remarks"] ?? r.remarks ?? ""),
});

const normalizeSummaryRow = (r: Record<string, unknown>): BalanceSheetRecord => ({
  ou: String(r.ou ?? ""),
  apBalance: toNum(r.ap_balance ?? r.apBalance),
  glBalance: toNum(r.gl_balance ?? r.glBalance),
  diff: toNum(r.diff),
  revaluation: toNum(r.revaluation),
  manualEntries: toNum(r.manual_entries ?? r.manualEntries),
  adjustedDiff: toNum(r.adjusted_diff ?? r.adjustedDiff),
  remarks: String(r.remarks ?? ""),
});

const normalizeAPEntry = (r: Record<string, unknown>): APEntryRecord => ({
  supplierName: String(r["Supplier Name"] ?? ""),
  supplierNumber: String(r["Supplier Number"] ?? ""),
  employeeNumber: String(r["Employee Number"] ?? ""),
  supplierSiteName: String(r["Supplier Site Name"] ?? ""),
  supplierSiteOperatingUnitName: String(r["Supplier Site Operating Unit Name"] ?? ""),
  address1: String(r["Address 1"] ?? ""),
  address2: String(r["Address 2"] ?? ""),
  address3: String(r["Address 3"] ?? ""),
  city: String(r["City"] ?? ""),
  state: String(r["State"] ?? ""),
  zip: String(r["Zip"] ?? ""),
  country: String(r["Country"] ?? ""),
  invoiceDate: String(r["Invoice Date"] ?? ""),
  invoiceNum: String(r["Invoice Num"] ?? ""),
  voucherNumber: String(r["Voucher Number"] ?? ""),
  tdsTax: String(r["TDS Tax"] ?? ""),
  taxClassificationCode: String(r["Tax Classification Code"] ?? ""),
  invoiceValidationStatus: String(r["Invoice validation status"] ?? ""),
  poNumber: String(r["PO Number"] ?? ""),
  paymentStatusName: String(r["Payment Status Name"] ?? ""),
  paymentTermName: String(r["Payment Term Name"] ?? ""),
  paymentMethodCode: String(r["Payment Method Code"] ?? ""),
  paymentMethodName: String(r["Payment Method Name"] ?? ""),
  paymentDate: String(r["Payment Date"] ?? ""),
  batchName: String(r["Batch Name"] ?? ""),
  expenditureType: String(r["Expenditure Type"] ?? ""),
  expOrgName: String(r["Exp Org Name"] ?? ""),
  invoiceLineAmt: toNum(r["Invoice Line Amt"]),
  totalInvoiceAmt: toNum(r["Total Invoice Amt"]),
  currencyCodeInv: String(r["Currency Code Inv"] ?? ""),
  exchangeRateInv: toNum(r["Exchange Rate Inv"], 1),
  lineDesc: String(r["Line Desc"] ?? ""),
  accountingDate: String(r["Accounting Date"] ?? ""),
  glDate: String(r["GL Date"] ?? ""),
  segment1CompanyCode: String(r["Segment 1 - Company Code"] ?? ""),
  accountCode: String(r["Account Code"] ?? ""),
  analyticalAccountCode: String(r["Analytical Account Code"] ?? ""),
  segment4ProdUnit: String(r["Segment 4 - Prod Unit Invoice Line.Prod Unit Code"] ?? ""),
  segment5ProjectCode: String(r["Segment 5 - Project Code"] ?? ""),
  taskNumber: String(r["Task Number"] ?? ""),
  taskName: String(r["Task Name"] ?? ""),
  segment6CustomerCode: String(r["Segment 6 - Customer Code"] ?? ""),
  segment7JobFunctionCode: String(r["Segment 7 - Job Function Code"] ?? ""),
  segment9TradingProdUnit: String(r["Segment 9 - Trading Prod Unit Invoice Line.Prod Unit Code"] ?? ""),
  intercompanyDesc: String(r["Intercompany Desc"] ?? ""),
  createdBy: String(r["Created By"] ?? ""),
  creationDate: String(r["Creation Date"] ?? ""),
});


/** Normalize a manual journal / project entry record from the drilldown API */
const normalizeManualJournalEntry = (r: Record<string, unknown>): ManualJournalEntryRecord => ({
  ou: String(r["OU"] ?? r.ou ?? ""),
  jePeriodName: String(r["JE Period Name"] ?? ""),
  journalSourceName: String(r["Journal Source Name"] ?? ""),
  jeNumber: String(r["JE Number"] ?? ""),
  journalCategName: String(r["Journal Categ Name"] ?? ""),
  jrnBatchName: String(r["Jrn Batch Name"] ?? ""),
  jeHeaderId: String(r["JE Header Id"] ?? ""),
  jeName: String(r["JE Name"] ?? ""),
  jeLineNum: toNum(r["JE Line Num"]),
  jeLineDescription: String(r["JE Line Description"] ?? ""),
  status: String(r["Status"] ?? ""),
  effectiveDate: String(r["Effective Date"] ?? ""),
  postedDate: String(r["Posted Date"] ?? ""),
  apInvoiceNumber: String(r["Ap Invoice Number"] ?? ""),
  lineDesc: String(r["Line Desc"] ?? ""),
  poNumber: String(r["PO Number"] ?? ""),
  supplierName: String(r["Supplier Name"] ?? ""),
  supplierNumber: String(r["Supplier Number"] ?? ""),
  apLineEntryType: String(r["Ap Line Entry Type"] ?? ""),
  transactionCurrencyCode: String(r["Transaction Currency Code"] ?? ""),
  transactionLineDebit: toNum(r["Transaction Line Debit"]),
  transactionLineCredit: toNum(r["Transaction Line Credit"]),
  accountCode: String(r["Account Code"] ?? ""),
  accountDesc: String(r["Account Desc"] ?? ""),
  functionalLineDebit: toNum(r["Functional Line Debit"]),
  functionalLineCredit: toNum(r["Functional Line Credit"]),
  netBalance: toNum(r["Net Balance"]),
  concatAccount: String(r["Concat Account"] ?? ""),
  buCode: String(r["Bu Code"] ?? ""),
  sbuName: String(r["Sbu Name"] ?? ""),
});

// ---------------------------------------------------------------------------
// Mock data for agent run (simulates /agent/run-narration response)
// ---------------------------------------------------------------------------
const mockAgentResponse = {
  status: "success",
  company: "Capgemini Technology Services India Ltd",
  report_title: "AP GL RECO (Mock Data)",
  ou_filter: "",
  session_id: "mock-session",
  iterations: 1,
  duration_ms: 0,
  count: 0,
  records: [] as BalanceSheetRecord[],
};

// ---------------------------------------------------------------------------
// Public service
// ---------------------------------------------------------------------------
export const balanceSheetSolverService = {
  /**
   * Fetch summary records from /reco/summary (POST with empty body).
   * Returns normalized records for the summary table AND unique OUs for the dropdown.
   * In mock mode, returns mock summary data directly.
   */
  getInputFiles: async (): Promise<InputFilesResponse> => {
    try {
      if (USE_BALANCE_SHEET_SOLVER_MOCK) {
        // Mock mode: return mock summary data and derive OUs
        const mockSummary = bsMockSummaryData as unknown as BalanceSheetRecord[];
        const ouList = mockSummary.map((r) => ({ label: r.ou, value: r.ou }));
        return { records: mockSummary, ouList };
      }

      // Real API call — POST /reco/summary with empty body
      // Response: { company, report_title, count, records: [...], total: {...} }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.post("/balance-sheet-solver/summary", {});

      const rawRecords: Record<string, unknown>[] = response?.records ?? [];
      const records = rawRecords.map(normalizeAgentRecord);

      // Extract unique OUs from the records (exclude "Total" row)
      const ouSet = new Set<string>();
      for (const r of records) {
        if (r.ou && r.ou !== "Total") ouSet.add(r.ou);
      }
      const ouList: OUListItem[] = Array.from(ouSet)
        .sort()
        .map((ou) => ({ label: ou, value: ou }));

      return { records, ouList };
    } catch (error) {
      console.error("balanceSheetSolverService.getInputFiles error:", error);
      throw error;
    }
  },

  /**
   * Run the Balance Sheet reconciliation agent.
   * Calls /agent/run-narration with { ou_code: "IN01,IN11,IN13" }
   */
  runAgent: async (ouCodes: string[]): Promise<RunAgentResponse> => {
    try {
      if (USE_BALANCE_SHEET_SOLVER_MOCK) {
        // Simulate with mock data
        const mockSummary = bsMockSummaryData as unknown as BalanceSheetRecord[];
        const filtered = ouCodes.length > 0
          ? mockSummary.filter((r) => ouCodes.includes(r.ou))
          : mockSummary;

        return {
          ...mockAgentResponse,
          ou_filter: ouCodes.join(","),
          count: filtered.length,
          records: filtered,
        };
      }

      // Real API call via backend proxy
      const payload = { ou_code: ouCodes.join(",") };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.post("/balance-sheet-solver/run-agent", payload);

      // Normalize the records from the response
      const rawRecords: Record<string, unknown>[] = response?.records ?? [];
      const normalizedRecords = rawRecords.map(normalizeAgentRecord);

      return {
        status: String(response?.status ?? "success"),
        company: String(response?.company ?? ""),
        report_title: String(response?.report_title ?? ""),
        ou_filter: String(response?.ou_filter ?? ouCodes.join(",")),
        session_id: String(response?.session_id ?? ""),
        iterations: toNum(response?.iterations),
        duration_ms: toNum(response?.duration_ms),
        count: toNum(response?.count ?? normalizedRecords.length),
        records: normalizedRecords,
      };
    } catch (error) {
      console.error("balanceSheetSolverService.runAgent error:", error);
      throw error;
    }
  },


  /**
   * Drill down into an OU record.
   * Calls /reco/drilldown with { ou_code, remark, manual_entries, diff_ap_gl_reval_manual }
   * Returns categorized drill-down records based on remark_type.
   */
  drillDown: async (payload: DrillDownPayload): Promise<DrillDownResult> => {
    try {
      if (USE_BALANCE_SHEET_SOLVER_MOCK) {
        // AP entry mock uses title-case keys ("Supplier Name") → needs normalizer.
        // MJE/project mock uses camelCase keys matching TS interfaces → cast directly.
        const ouCode = payload.ou_code;
        const mockAPEntries = (bsMockAPEntryData as unknown as Array<Record<string, unknown>>)
          .map(normalizeAPEntry);

        const mjeByOU = bsMockMJEData as unknown as { [key: string]: ManualJournalEntryRecord[] };
        const projectByOU = bsMockProjectEntryData as unknown as { [key: string]: ManualJournalEntryRecord[] };

        return {
          remarkType: "mock",
          explanation: `Mock drill-down data for OU ${ouCode}.`,
          sourceFile: "Mock Data",
          apEntry: mockAPEntries,
          mjeData: mjeByOU[ouCode] ?? [],
          projectEntryData: projectByOU[ouCode] ?? [],
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.post("/balance-sheet-solver/drilldown", payload);

      const remarkType = String(response?.remark_type ?? "");
      const explanation = String(response?.explanation ?? "");
      const sourceFile = String(response?.source_file ?? "");
      const rawRecords: Record<string, unknown>[] = response?.records ?? [];

      // Route records to the correct category based on remark_type
      const result: DrillDownResult = {
        remarkType,
        explanation,
        sourceFile,
        apEntry: [],
        mjeData: [],
        projectEntryData: [],
      };

      if (remarkType === "invoice_match" || sourceFile === "AP-Entry-Query") {
        result.apEntry = rawRecords.map(normalizeAPEntry);
      } else if (remarkType === "project_balance_nonzero") {
        result.projectEntryData = rawRecords.map(normalizeManualJournalEntry);
      } else if (remarkType === "manual_entries_not_reversed") {
        result.mjeData = rawRecords.map(normalizeManualJournalEntry);
      } else {
        // Default: try to identify by source_file or put in mjeData
        if (sourceFile === "AP-Entry-Query") {
          result.apEntry = rawRecords.map(normalizeAPEntry);
        } else {
          result.mjeData = rawRecords.map(normalizeManualJournalEntry);
        }
      }

      return result;
    } catch (error) {
      console.error("balanceSheetSolverService.drillDown error:", error);
      throw error;
    }
  },

  /**
   * Get the full Balance Sheet summary + drill-down data for all OUs.
   */
  getAllData: async (): Promise<BalanceSheetSolverData> => {
    try {
      if (USE_BALANCE_SHEET_SOLVER_MOCK) {
        return {
          summary: bsMockSummaryData as unknown as BalanceSheetRecord[],
          apData: bsMockAPData as unknown as { [key: string]: APInvoiceRecord[] },
          apEntry: (bsMockAPEntryData as unknown as Array<Record<string, unknown>>).map(normalizeAPEntry),
          tbData: bsMockTBData as unknown as {
            [key: string]: TrialBalanceDetailRecord[];
          },
          mjeData: bsMockMJEData as unknown as {
            [key: string]: ManualJournalEntryRecord[];
          },
          revalData: bsMockRevalData as unknown as {
            [key: string]: RevaluationEntryRecord[];
          },
          projectEntryData: bsMockProjectEntryData as unknown as {
            [key: string]: ManualJournalEntryRecord[];
          },
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.get("/balance-sheet-solver/data");
      const rawSummary = response?.summary ?? [];
      return {
        summary: rawSummary.map(normalizeSummaryRow),
        apData: response?.ap_data ?? {},
        apEntry: (response?.ap_entry ?? []).map(normalizeAPEntry),
        tbData: response?.tb_data ?? {},
        mjeData: response?.mje_data ?? {},
        revalData: response?.reval_data ?? {},
        projectEntryData: response?.project_entry ?? {},
      };
    } catch (error) {
      console.error("balanceSheetSolverService.getAllData error:", error);
      throw error;
    }
  },

  /**
   * Get summary rows only (lightweight call).
   */
  getSummary: async (): Promise<BalanceSheetRecord[]> => {
    try {
      if (USE_BALANCE_SHEET_SOLVER_MOCK) {
        return bsMockSummaryData as BalanceSheetRecord[];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.get("/balance-sheet-solver/summary");
      const records = response?.records ?? [];
      return records.map(normalizeSummaryRow);
    } catch (error) {
      console.error("balanceSheetSolverService.getSummary error:", error);
      throw error;
    }
  },
};
