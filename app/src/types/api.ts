/**
 * API Request/Response Types
 */
// export interface JournalEntry {
//   id: string;
//   date: string;
//   description: string;
//   reference?: string;
//   createdAt: string;
//   updatedAt: string;
//   lines: JournalEntryLine[];
// }

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountName: string;
  description: string;
  debit?: number;
  credit?: number;
}

export interface CreateJournalEntryRequest {
  date: string;
  description: string;
  reference?: string;
  lines: Omit<JournalEntryLine, "id">[];
}

export interface TrialBalance {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceRecord {
  company_code: number;
  account_number: number;
  account_group: string;
  bs_pl_item_text: string;
  reporting_period_amount_in_local_currency: number;
  comparison_period_amount_in_local_currency: number;
  deviation_amount_in_local_currency: number;
  business_rules: string;
  anomaly_description: string | null;
  created_on: string;
}

export interface TrialBalanceAnomaly {
  type: "threshold_exceeded" | "unusual_balance" | "missing_entries";
  accountId: string;
  accountName: string;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  status: "active" | "inactive";
}

export type TrialBalanceField =
  | "tb_preparation_id"
  | "company_code"
  | "account_number"
  | "account_group"
  | "bs_pl_item_text"
  | "cost_center_code"
  | "cost_center_name"
  | "profit_center_code"
  | "profit_center_name"
  | "fiscal_year"
  | "fiscal_period"
  | "local_currency_code"
  | "amount_in_local_currency"
  | "reporting_currency_code"
  | "amount_in_reporting_currency"
  | "file_reference_id"
  | "source_system"
  | "created_on"
  | "updated_on"
  | "created_by"
  | "updated_by";

// The API returns a list (array) of records
export type TrialBalanceResponse = TrialBalanceRecord[];

// ─── TB JSON data types (real API: r2a.trial_balance.tb_preparation) ─────────

export interface TBInputRecord {
  // Real API fields (snake_case from tb_preparation)
  company_code?: string;
  account_number?: string;
  account_name?: string;
  fiscal_year?: number;
  period?: number;
  starting_balance_amt_in_co_code_crcy?: number;
  credit_amount_in_co_code_crcy?: number;
  debit_amount_in_co_code_crcy?: number;
  closing_balance_amount?: number;
  tb_preparation_id?: string;
  created_by?: string;
  created_on?: string;
  account_source?: string;
  account_group?: string;

  // Legacy mock fields (kept for backward compatibility)
  "Company Code"?: string;
  "Account Code"?: string;
  "Account Name"?: string;
  "Line Item Description"?: string;
  CompanyCode?: string;
  GLAccount?: string;
  AccountName?: string;
  FiscalYear?: number;
  Period?: number;
  OpeningBalance?: number;
  PeriodCredit?: number;
  PeriodDebit?: number;
  ClosingBalance?: number;
  Year?: number;
  Currency?: string;
  Amount?: number;
}

export interface TBAnomalyOutputRecord {
  company_code: string;
  account_code: string;
  account_name: string;
  fiscal_year: number;
  period: number;
  line_item_description: string;
  percent_deviation: number;
  anomaly_flag: "Y" | "N";
  explanation: string;
  anomaly_type?: string;
  correction_impact?: string;
  [key: string]: string | number | undefined;
}

export interface TBPostingDetail {
  Line_Items: number;
  CompanyCode: number;
  GLAccount: number;
  AccountName: string;
  AccountType: string;
  FiscalYear: number;
  Period: number;
  DocumentNumber: number;
  DocumentType: string;
  PostingDate: string;
  PostingKey: number;
  DebitCredit: "D" | "C";
  AmountLC: number;
  Currency: string;
  CostCenter: string;
  ProfitCenter: string;
  BusinessArea: string;
  Vendor: string;
  VendorName: string;
  ServiceCode: string;
  Reference: string;
  Assignment: number | null;
  LineItemText: string;
  User: string;
  ClearingDoc: number;
  ClearingDate: string;
  ErrorLabel: string;
}

export interface ICTransactionRecord {
  supplierEntityCode: string | number; // e.g. "1750", "1731"
  supplierEntityName: string; // "Capgemini Espana S.L."
  supplierEntityRegion: string; // "IBERIA"
  clientEntityCode: string | number; // "199"
  clientEntityName: string; // "Capgemini America Inc"
  clientEntityRegion: string; // "NORTH AMERICA"
  transactionDate: string; // "31-Mar-23"
  transactionNumber: string; // can be numeric or alphanumeric
  transactionCurrency: string; // "EUR"

  transactionAmount: number; // can be positive or negative
  amountInEuro: number; // same sign as transactionAmount

  transactionType: string; // "IPB" | "ICB" | "PA MANUAL" | others
  sourceSystem: string; // "GFS"
  intraInter: "Intra" | "Inter";

  bsAccountType?: string;
  plAccountType?: string;
  transactionCreationDate?: string;
  paymentDueDate?: string;
  paymentClosureDate?: string;
  reconciliationStatus: "Auto Reconciled" | "Unreconciled";
  reconciliationBy?: string;
  reconciliationDate?: string;
  mismatchType?: string;
  explanation?: string;
}

export interface ICItemSolverResultRecord {
  accountCode?: string | number;
  accountName?: string;
  mismatchType:
    | "No mismatch"
    | "Invoice amount mismatch"
    | "Invoice date mismatch"
    | "Missing invoice"
    | "Invoice Missing";
}

export interface ICAPInvoiceRecord {
  // Organization & Supplier
  org_operating_unit_name: string;
  supplier_number: string;
  supplier_name: string;
  ics_code: string;
  supplier_type_name: string;

  // Voucher / Document references
  voucher_number: string;
  voucher_name: string;
  invoice_type_name: string;
  invoice_num: string;
  invoice_status: string;
  external_reference?: string | null;
  po_number?: string | null;

  // Invoice dates & source
  invoice_received_date: string;
  invoice_source: string;
  invoice_desc?: string | null;
  invoice_date: string;
  creation_date: string;
  gl_date: string;
  due_date: string;

  // Payment details
  payment_term_name: string;
  payment_method: string;
  payment_status_name: string;

  // Exchange details
  exchange_rate_inv: number;
  exchange_date: string;

  // Amounts in transactional currency
  curr_code_inv: string;
  invoice_amount_inv: number;
  invoice_amount_inv_without_tax: number;
  tax_amount_inv: number;
  amount_paid_inv: number;
  balance_amount_inv: number;

  // Amounts in functional currency
  curr_code_fnc: string;
  invoice_amount_fnc: number;
  invoice_amount_fnc_without_tax: number;
  tax_amount_fnc: number;
  amount_paid_fnc: number;
  balance_amount_fnc: number;

  // Amounts in payment currency
  curr_code_pmt: string;
  invoice_amount_pmt: number;
  amount_paid_pmt: number;
  balance_amount_pmt: number;
}

export interface ICInvoiceExceptionRecord {
  supplier_name: string;
  supplier_number: string;

  invoice_number: string;
  voucher_number: string;

  invoice_date: string; // e.g. "29-MAR-23"
  invoice_currency?: string; // e.g. "EUR"
  invoice_amount: number; // can be negative

  po_number?: string | null | number; // null when not available
  exceptions?: string; // e.g. "Not Validated"
}

export interface UnaccountedRow {
  supplier_name?: string;
  supplier_number?: string;
  invoice_number?: string | number;
  voucher_number?: string | number;
  invoice_date?: string;
  inv_curr?: string;
  invoice_currency?: string;
  invoice_amount?: string | number;
  po_number?: string | number | null;
  exceptions?: string;
}

export interface InvoiceMissingResult {
  supplierEntityCode: string | number;
  supplierEntityName: string;
  transactionNumber: string;
  mismatchType: "Invoice Missing";
  transactionType: string;
  explanation?: string;
}

// ─── Balance Sheet Item Solver Types ───────────────────────────────────────

export interface BalanceSheetRecord {
  ou: string;
  apBalance: number;
  glBalance: number;
  diff: number;
  revaluation: number;
  manualEntries: number;
  adjustedDiff: number;
  remarks: string;
  accountCode?: string;
}

export interface APInvoiceRecord {
  gpsCodeInvoiceNumber: string;
  ou: string;
  orgOperatingUnitName: string;
  supplierNumber: string;
  supplierName: string;
  paymentMethodName: string;
  icsNumber: string;
  supplierTypeName: string;
  currencyCodePmt: string;
  voucherNumber: string;
  accountCode: string;
  batchName: string;
  invoiceTypeName: string;
  externalReference: string;
  invoiceNum: string;
  invoiceDesc: string;
  invoiceDate: string;
  creationDate: string;
  glPeriodDate: string;
  dueDate: string;
  paymentPriority: number;
  paymentNum: string;
  paymentTermName: string;
  exchangeRateInv: number;
  exchangeDate: string;
  currencyCodeInv: string;
  invcAmountInv: number;
  invcAmountInvWithoutTax: number;
  taxAmountInv: number;
  amountPaidInv: number;
  balanceAmountInv: number;
  funcCur: string;
  invoiceAmountFnc: number;
  invcAmountFncWithoutTax: number;
  taxAmountFnc: number;
  amountPaidFnc: number;
  balanceAccountedFnc: number;
  amtCurrentFnc: number;
  amtPastDue030Fnc: number;
  amtPastDue3160Fnc: number;
  amtPastDue6190Fnc: number;
  amtPastDue91120Fnc: number;
  amtPastDue121150Fnc: number;
  amtPastDue151180Fnc: number;
  amtPastDue180PlusFnc: number;
  daysOverdue: number;
  daysOpen: number;
  holdsCount: number;
}

export interface TrialBalanceDetailRecord {
  ou: string;
  localAccount: string;
  description: string;
  beginningBalance: number;
  debits: number;
  credits: number;
  endingBalance: number;
}

export interface ManualJournalEntryRecord {
  ou: string;
  jePeriodName: string;
  journalSourceName: string;
  jeNumber: string;
  journalCategName: string;
  jrnBatchName: string;
  jeHeaderId: string;
  jeName: string;
  jeLineNum: number;
  jeLineDescription: string;
  status: string;
  effectiveDate: string;
  postedDate: string;
  apInvoiceNumber: string;
  lineDesc: string;
  poNumber: string;
  supplierName: string;
  supplierNumber: string;
  apLineEntryType: string;
  transactionCurrencyCode: string;
  transactionLineDebit: number;
  transactionLineCredit: number;
  accountCode: string;
  accountDesc: string;
  functionalLineDebit: number;
  functionalLineCredit: number;
  netBalance: number;
  concatAccount: string;
  buCode: string;
  sbuName: string;
}

// RevaluationEntryRecord shares the same structure as ManualJournalEntryRecord
export type RevaluationEntryRecord = ManualJournalEntryRecord;

export interface APEntryRecord {
  supplierName: string;
  supplierNumber: string;
  employeeNumber: string;
  supplierSiteName: string;
  supplierSiteOperatingUnitName: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  invoiceDate: string;
  invoiceNum: string;
  voucherNumber: string;
  tdsTax: string;
  taxClassificationCode: string;
  invoiceValidationStatus: string;
  poNumber: string;
  paymentStatusName: string;
  paymentTermName: string;
  paymentMethodCode: string;
  paymentMethodName: string;
  paymentDate: string;
  batchName: string;
  expenditureType: string;
  expOrgName: string;
  invoiceLineAmt: number;
  totalInvoiceAmt: number;
  currencyCodeInv: string;
  exchangeRateInv: number;
  lineDesc: string;
  accountingDate: string;
  glDate: string;
  segment1CompanyCode: string;
  accountCode: string;
  analyticalAccountCode: string;
  segment4ProdUnit: string;
  segment5ProjectCode: string;
  taskNumber: string;
  taskName: string;
  segment6CustomerCode: string;
  segment7JobFunctionCode: string;
  segment9TradingProdUnit: string;
  intercompanyDesc: string;
  createdBy: string;
  creationDate: string;
}
