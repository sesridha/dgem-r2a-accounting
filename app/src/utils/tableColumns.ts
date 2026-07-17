import type {
  APInvoiceRendererId,
  icTransactionRenderers,
  UnAccountedInvoiceRendererId,
} from "@/components/ic-item-solver/ICTransactionRenderers";

// src/constants/tableColumns.ts
export type ColumnMeta = {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  /** Link to a render function name from a renderer map */
  rendererId?: string;
  /** Link to an accessor function name from a renderer/accessor map */
  accessorId?: string;
};

export type ColumnMetaForIC = {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;

  rendererId?: keyof typeof icTransactionRenderers;

  /** Optional accessor */
  accessorId?: string;
};

/* -----------------------------------------------------------
   TRIAL BALANCE (TrialBalanceRecord)
----------------------------------------------------------- */
export const TRIAL_BALANCE_COLUMNS: ColumnMeta[] = [
  { key: "company_code", header: "Company Code" },
  { key: "account_number", header: "Account Number" },
  { key: "account_group", header: "Account Group" },
  { key: "bs_pl_item_text", header: "Account Description" },
  {
    key: "reporting_period_amount_in_local_currency",
    header: "Reporting Period Amount",
    rendererId: "reportingPeriod",
  },
  {
    key: "comparison_period_amount_in_local_currency",
    header: "Comparison Period Amount",
    rendererId: "comparisonPeriod",
  },
  {
    key: "deviation_amount_in_local_currency",
    header: "Variance Amount",
    rendererId: "varianceAmount",
  },
  { key: "business_rules", header: "Business Rule Applied" },
  { key: "anomaly_description", header: "Anomaly Description" },
];

/* -----------------------------------------------------------
   INPUT DATA (InputDataRecord)
----------------------------------------------------------- */
export const INPUT_DATA_COLUMNS: ColumnMeta[] = [
  {
    key: "controlling_area",
    header: "CONTROLLING AREA",
    rendererId: "controllingAreaMaybe",
    sortable: true,
  },
  { key: "company_code", header: "COMPANY CODE", sortable: true },
  { key: "profit_center", header: "PROFIT CENTER", sortable: true },
  {
    key: "posting_date",
    header: "POSTING DATE",
    rendererId: "dateBold",
    sortable: true,
  },
  {
    key: "posting_amount",
    header: "AMOUNT",
    rendererId: "postingAmount",
    sortable: true,
  },
  {
    key: "debit_credit_indicator",
    header: "DEBIT / CREDIT",
    rendererId: "debitCreditBadge",
    sortable: true,
  },
  { key: "currency", header: "CURRENCY", sortable: true },
  { key: "gl_account_description", header: "DESCRIPTION", sortable: true },
  { key: "cost_center", header: "COST CENTER", sortable: true },
  {
    key: "cost_element",
    header: "COST ELEMENT",
    rendererId: "costElementMaybe",
    sortable: true,
  },
  {
    key: "document_type",
    header: "DOCUMENT TYPE",
    rendererId: "documentTypeMaybe",
    sortable: true,
  },
];

/* -----------------------------------------------------------
   BUSINESS RULES (BusinessRule)
----------------------------------------------------------- */
export const BUSINESS_RULE_COLUMNS: ColumnMeta[] = [
  {
    key: "ruleName",
    header: "RULE Title",
    width: "w-68",
    accessorId: "title",
    rendererId: "ruleName",
  },
  {
    key: "description",
    header: "RULE DESCRIPTION",
    width: "w-200",
    accessorId: "description",
    rendererId: "description",
  },
  {
    key: "order_of_execution",
    header: "ORDER OF EXECUTION",
  },
  {
    key: "category",
    header: "CATEGORY",
    width: "w-36",
    accessorId: "ruleType",
    rendererId: "category",
  },
];

export const FUND_STATEMENT_COLUMNS: ColumnMeta[] = [
  { header: "AMC NAME", key: "amc_name" },
  { header: "FUND TYPE", key: "fund_type", width: "w-80" },
  { header: "ISIN CODE", key: "isin_code" },
  {
    header: "TRANSACTION DATE",
    key: "transaction_date",
    rendererId: "fundTransactionDate",
  },
  { header: "TRANSACTION TYPE", key: "transaction_type" },
  { header: "AMOUNT", key: "amount_inr", rendererId: "fundAmount" },
  {
    header: "STAMP DUTY",
    key: "stamp_duty_charges",
    rendererId: "fundStampDuty",
  },
  { header: "NAV", key: "nav_inr" },
  { header: "UNITS", key: "units", rendererId: "fundUnits" },
];

export const BANK_STATEMENT_COLUMNS: ColumnMeta[] = [
  { header: "OPERATION DATE", key: "operation_date" },
  { header: "VALUE DATE", key: "value_date" },
  { header: "REFERENCE NUMBER", key: "reference_number" },
  { header: "NARRATION", key: "narration", width: "w-90" },
  { header: "DEPOSITS", key: "deposits", rendererId: "bankDeposits" },
  { header: "WITHDRAWALS", key: "withdrawals", rendererId: "bankWithdrawals" },
  {
    header: "BALANCE",
    key: "balance",
    rendererId: "bankBalance",
  },
  { header: "NATURE", key: "nature" },
];

export const BUSINESS_RULE_IA_COLUMNS: ColumnMeta[] = [
  {
    header: "RULE NAME",
    key: "title",
    rendererId: "ruleName",
    width: "w-70",
  },
  { header: "RULE DESCRIPTION", key: "description", width: "w-130" },
  {
    header: "ORDER OF EXECUTION",
    key: "order_of_execution",
  },
  {
    header: "CATEGORY",
    key: "rule_type",
    rendererId: "ruleCategory",
  },
];

export const IA_OUTPUT_COLUMNS: ColumnMeta[] = [
  {
    key: "gl_account",
    header: "GL ACCOUNT",
    rendererId: "glAccountLink",
  },
  {
    key: "gl_account_description",
    header: "GL ACCOUNT NAME",
  },
  {
    key: "posting_amount",
    header: "AMOUNT",
    rendererId: "postingAmountOutput",
  },
  {
    key: "dr_cr",
    header: "DEBIT / CREDIT",
    rendererId: "debitCreditBadge",
  },
  {
    key: "transaction_date",
    header: "TRANSACTION DATE",
    rendererId: "transactionDateBold",
  },
  {
    key: "line_item_text",
    header: "LINE ITEM TEXT",
    width: "w-100",
  },
];

export const IC_ITEM_SOLVER_RESULT_COLUMNS: ColumnMetaForIC[] = [
  {
    key: "transactionNumber",
    header: "TRANSACTION #",
    rendererId: "transactionNumber",
  },
  {
    key: "supplierEntityName",
    header: "SUPPLIER ENTITY",
    rendererId: "supplierEntity",
  },
  {
    key: "clientEntityName",
    header: "CLIENT ENTITY",
    rendererId: "clientEntity",
  },
  {
    key: "reconciliationStatus",
    header: "RECONCILIATION STATUS",
    rendererId: "reconciliationStatus",
    sortable: false,
  },
  {
    key: "transactionDate",
    header: "TRANSACTION DATE",
    rendererId: "transactionDate",
  },
  {
    key: "transactionType",
    header: "TRANSACTION TYPE",
    rendererId: "transactionType",
  },
  {
    key: "transactionCurrency",
    header: "CURRENCY",
    rendererId: "transactionCurrency",
  },
  {
    key: "transactionAmount",
    header: "AMOUNT",
    rendererId: "transactionAmount",
  },
  {
    key: "mismatchType",
    header: "MISMATCH TYPE",
    rendererId: "mismatchType",
  },
  {
    key: "drillProcess",
    header: "DRILL",
    rendererId: "drillButton",
    sortable: false,
  },
];

export type APInvoiceColumnMeta = {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  rendererId?: APInvoiceRendererId;
};

export const AP_INVOICE_BOOK_COLUMNS: APInvoiceColumnMeta[] = [
  {
    key: "supplier_name",
    header: "SUPPLIER",
    width: "w-40",
    rendererId: "supplierName",
  },
  {
    key: "invoice_num",
    header: "INVOICE #",
    width: "w-28",
    rendererId: "invoiceNumber",
  },
  { key: "invoice_type_name", header: "TYPE", width: "w-24" },
  {
    key: "invoice_status",
    header: "STATUS",
    width: "w-24",
    rendererId: "invoiceStatus",
  },
  { key: "invoice_date", header: "INVOICE DATE", width: "w-24" },
  { key: "due_date", header: "DUE DATE", width: "w-24" },
  { key: "curr_code_inv", header: "CURRENCY", width: "w-16" },
  {
    key: "invoice_amount_inv",
    header: "INVOICE AMOUNT",
    align: "right",
    width: "w-28",
    rendererId: "invoiceAmount",
  },
  {
    key: "amount_paid_inv",
    header: "PAID",
    align: "right",
    width: "w-28",
    rendererId: "paidAmount",
  },
  {
    key: "balance_amount_inv",
    header: "BALANCE",
    align: "right",
    width: "w-28",
    rendererId: "balanceAmount",
  },
];

export const UNACCOUNTED_INVOICE_COLUMNS: {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  rendererId?: UnAccountedInvoiceRendererId;
}[] = [
  {
    key: "supplier_name",
    header: "SUPPLIER",
    width: "w-40",
    rendererId: "supplierName",
  },
  {
    key: "supplier_number",
    header: "SUPPLIER #",
    width: "w-24",
    rendererId: "supplierNumber",
  },
  {
    key: "invoice_number",
    header: "INVOICE #",
    width: "w-28",
    rendererId: "invoiceNumber",
  },
  {
    key: "voucher_number",
    header: "VOUCHER #",
    width: "w-24",
    rendererId: "voucherNumber",
  },
  {
    key: "invoice_date",
    header: "INVOICE DATE",
    width: "w-24",
  },
  {
    key: "invoice_amount",
    header: "AMOUNT",
    align: "right",
    width: "w-28",
    rendererId: "invoiceAmount",
  },
  {
    key: "exceptions",
    header: "EXCEPTIONS",
    width: "w-32",
    rendererId: "exceptionBadge",
  },
];
