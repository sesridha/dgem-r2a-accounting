import { delay } from "@/lib/utils.ts";
import type {
  ICAPInvoiceRecord,
  ICInvoiceExceptionRecord,
  ICTransactionRecord,
  UnaccountedRow,
} from "@/types";
import type { ICInvoiceRecordProps } from "@/types/icItemSolver.ts";
import { USE_IC_ITEM_SOLVER_MOCK } from "@/utils/constants";
import {
  icJsonInputData,
  icJsonInvoiceBookData,
  icJsonUnaccountedInvoicesData,
} from "../../../data/icItemSolver.mock.ts";
import apiClient from "./client";

// ---------------------------------------------------------------------------
// Normalizers – map raw API snake_case → TypeScript interfaces
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toNum = (v: any, fallback = 0): number => {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const parsed = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** t1602 record → ICTransactionRecord */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeT1602Row = (r: Record<string, any>): ICTransactionRecord => ({
  supplierEntityCode: r.supplier_entity_code ?? "",
  supplierEntityName: String(r.supplier_entity_name ?? ""),
  supplierEntityRegion: String(r.supplier_entity_region ?? ""),
  clientEntityCode: r.client_entity_code ?? "",
  clientEntityName: String(r.client_entity_name ?? ""),
  clientEntityRegion: String(r.client_entity_region ?? ""),
  transactionDate: String(r.transaction_date ?? ""),
  transactionNumber: String(r.transaction_number ?? ""),
  transactionCurrency: String(r.transaction_currency ?? ""),
  transactionAmount: toNum(r.transaction_amount),
  amountInEuro: toNum(r.amount_in_euro),
  transactionType: String(r.transaction_type ?? ""),
  sourceSystem: String(r.source_system ?? ""),
  intraInter: String(r["intra/inter"] ?? r.intra_inter ?? "") as
    | "Intra"
    | "Inter",
  bsAccountType: r["b/s_account_type"] ?? r.bs_account_type ?? undefined,
  plAccountType: r["p&l_account_type"] ?? r.pl_account_type ?? undefined,
  transactionCreationDate: r.transaction_creation_date ?? undefined,
  paymentDueDate: r.payment_due_date ?? undefined,
  paymentClosureDate:
    r["payment/closure_date"] ?? r.payment_closure_date ?? undefined,
  reconciliationStatus: String(r.reconciliation_status ?? "Unreconciled") as
    | "Auto Reconciled"
    | "Unreconciled",
  reconciliationBy: r.reconciliation_by ?? undefined,
  reconciliationDate: r.reconciliation_date ?? undefined,
});

/** ap_booked record → ICAPInvoiceRecord */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeApBookedRow = (r: Record<string, any>): ICAPInvoiceRecord => ({
  org_operating_unit_name: String(r.org_operating_unit_name ?? ""),
  supplier_number: String(r.supplier_number ?? ""),
  supplier_name: String(r.supplier_name ?? ""),
  ics_code: String(r.ics_code ?? ""),
  supplier_type_name: String(r.supplier_type_name ?? ""),
  voucher_number: String(r.voucher_number ?? ""),
  voucher_name: String(r.voucher_name ?? ""),
  invoice_type_name: String(r.invoice_type_name ?? ""),
  invoice_num: String(r.invoice_num ?? ""),
  invoice_status: String(r.invoice_status ?? ""),
  external_reference: r.external_reference ?? null,
  po_number: r.po_number ?? null,
  invoice_received_date: String(r.invoice_received_date ?? ""),
  invoice_source: String(r.invoice_source ?? ""),
  invoice_desc: r.invoice_desc ?? null,
  invoice_date: String(r.invoice_date ?? ""),
  creation_date: String(r.creation_date ?? ""),
  gl_date: String(r.gl_date ?? ""),
  due_date: String(r.due_date ?? ""),
  payment_term_name: String(r.payment_term_name ?? ""),
  payment_method: String(r.payment_method ?? ""),
  payment_status_name: String(r.payment_status_name ?? ""),
  exchange_rate_inv: toNum(r.exchange_rate_inv),
  exchange_date: String(r.exchange_date ?? ""),
  curr_code_inv: String(r.curr_code_inv ?? ""),
  invoice_amount_inv: toNum(r.invc_amount_inv ?? r.invoice_amount_inv),
  invoice_amount_inv_without_tax: toNum(
    r["invc_amount_inv_(without_tax)"] ?? r.invoice_amount_inv_without_tax,
  ),
  tax_amount_inv: toNum(r.tax_amount_inv),
  amount_paid_inv: toNum(r.amount_paid_inv),
  balance_amount_inv: toNum(r.balance_amount_inv),
  curr_code_fnc: String(r.curr_code_fnc ?? ""),
  invoice_amount_fnc: toNum(r.invc_amount_fnc ?? r.invoice_amount_fnc),
  invoice_amount_fnc_without_tax: toNum(
    r["invc_amount_fnc_(without_tax)"] ?? r.invoice_amount_fnc_without_tax,
  ),
  tax_amount_fnc: toNum(r.tax_amount_fnc),
  amount_paid_fnc: toNum(r.amount_paid_fnc),
  balance_amount_fnc: toNum(r.balance_amount_fnc),
  curr_code_pmt: String(r.curr_code_pmt ?? ""),
  invoice_amount_pmt: toNum(r.invc_amount_pmt ?? r.invoice_amount_pmt),
  amount_paid_pmt: toNum(r.amount_paid_pmt),
  balance_amount_pmt: toNum(r.balance_amount_pmt),
});

const normalizeUnaccountedRow = (
  r: UnaccountedRow,
): ICInvoiceExceptionRecord => ({
  supplier_name: String(r.supplier_name ?? ""),
  supplier_number: String(r.supplier_number ?? ""),
  invoice_number: String(r.invoice_number ?? ""),
  voucher_number: String(r.voucher_number ?? ""),
  invoice_date: String(r.invoice_date ?? ""),
  invoice_currency: String(r.inv_curr ?? r.invoice_currency ?? ""),
  invoice_amount: toNum(r.invoice_amount),
  po_number: r.po_number != null ? String(r.po_number) : null,
  exceptions: String(r.exceptions ?? ""),
});

// ---------------------------------------------------------------------------
// Fetch all raw files from the backend proxy (cached per session)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedRawFiles: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchRawFiles = async (): Promise<any> => {
  if (cachedRawFiles) return cachedRawFiles;
  // Calls the FastAPI backend proxy at /api/ic-item-solver/raw-files
  // which authenticates with the Databricks App using service principal OAuth
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await apiClient.get("/ic-item-solver/raw-files");
  cachedRawFiles = response;
  return cachedRawFiles;
};

// ---------------------------------------------------------------------------
// Public service
// ---------------------------------------------------------------------------
export const icItemSolverService = {
  /**
   * Get IC transaction input data (t1602)
   */
  getInputData: async (): Promise<ICTransactionRecord[]> => {
    try {
      if (USE_IC_ITEM_SOLVER_MOCK) {
        return icJsonInputData as ICTransactionRecord[];
      }

      const raw = await fetchRawFiles();
      const records = raw?.files?.t1602?.records ?? [];
      return records.map(normalizeT1602Row);
    } catch (error) {
      console.error("getInputData error:", error);
      throw error;
    }
  },
  runSolver: async (): Promise<ICTransactionRecord[]> => {
    try {
      if (USE_IC_ITEM_SOLVER_MOCK) {
        await delay(1000); // Simulate network delay
        return icJsonInputData as ICTransactionRecord[];
      }

      // Invalidate cache so we get fresh data
      cachedRawFiles = null;
      const raw = await fetchRawFiles();
      const records = raw?.files?.t1602?.records ?? [];
      return records.map(normalizeT1602Row);
    } catch (error) {
      console.error("runSolver error:", error);
      throw error;
    }
  },

  /**
   * Get AP booked invoices + unaccounted invoices
   */
  getInvoiceData: async (): Promise<ICInvoiceRecordProps> => {
    try {
      if (USE_IC_ITEM_SOLVER_MOCK) {
        return {
          ap_invoice_book: icJsonInvoiceBookData as ICAPInvoiceRecord[],
          un_accounted_invoices:
            icJsonUnaccountedInvoicesData as ICInvoiceExceptionRecord[],
        };
      }

      const raw = await fetchRawFiles();
      const apRecords = raw?.files?.ap_booked?.records ?? [];
      const unaccountedRecords = raw?.files?.unaccounted?.records ?? [];

      return {
        ap_invoice_book: apRecords.map(normalizeApBookedRow),
        un_accounted_invoices: unaccountedRecords.map(normalizeUnaccountedRow),
      };
    } catch (error) {
      console.error("getInvoiceData error:", error);
      throw error;
    }
  },
};
