/**
 * Journal Entry Related Types
 */

import type { Condition } from "@/lib/conditions";
import type { ResultVariant } from "./common";
import type { JePostingRecord } from "./jePosting";

export type InputReviewRow = {
  date: string;
  description: string;
  source: string;
  amount: number;
  status: "FAILED" | "PASSED";
  errorDetail?: string;
};

/** Input Data Record */
export interface InputDataRecord {
  je_preparation_id: number | string;
  document_number: string;
  company_code: string;
  document_type: string;
  posting_date: string | null;
  document_date: string | null;
  currency: string;
  gl_account: string;
  posting_amount: number;
  debit_credit_indicator: string;
  cost_center: string;
  profit_center: string;
  ledger_group: string;
  gl_account_description?: string;
  vendor_number?: string | null;
  customer_number?: string | null;
  document_name?: string;
  validation_status?: string;
  controlling_area?: string | null;
  cost_element?: string | null;

  quantity?: string | number | null;
  material_number?: string | null;
  reversal_indicator?: string | null;
  reference_document?: string | null;
}

/** Business Rule */
export interface BusinessRule {
  rule_id: string;
  title: string;
  description: string;
  conditions: string | Condition[];
  rule_type: string;
  actions?: string;
  document_name: string;
}

export interface InvestmentAccountingFundStatement {
  document_name: string;
  amc_name: string;
  scheme_code: number;
  isin_code: string;
  fund_type: string;
  transaction_date: string;
  transaction_type: string;
  amount_inr: number;
  stamp_duty_charges: number | string | null;
  nav_inr: number;
  price_inr: number;
  units: number;
  balance_units: number | string;
  source_file: string;
  extraction_timestamp: string;
}

export interface InvestmentAccountingBankStatement {
  operation_date: string;
  value_date: string | null;
  reference_number: string | null;
  narration: string;
  deposits: number | null | string;
  withdrawals: number | null | string;
  balance: number | null | string;
  nature: string | null;
  source_file: string;
  source_sheet: string;
  extraction_timestamp: string;
}

export interface JournalEntryResultProps {
  variant: ResultVariant;
  content: Record<string, string>;
  postingData?: JePostingRecord[];
  inputData?: InputDataRecord[];
  documentName?: string;
}

export interface InvestmentAccResultProps {
  variant: ResultVariant;
  content: Record<string, string>;
  postingData?: InvestmentAccountingPostingRecord[];
}

export interface InvestmentAccountingPostingRecord {
  transaction_date: string;
  line_item_text: string;
  dr_cr: string;
  gl_account: string;
  posting_amount: number;
  gl_account_description: string;
}

/** Journal Entry Status */
export interface JournalEntryStatus {
  dataLoaded: boolean;
  rulesValidated: boolean;
  readyForExecution: boolean;
}

/** Category Badge Colors */
export type CategoryColor = {
  bg: string;
  text: string;
  label: string;
};

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  COMPLIANCE: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "COMPLIANCE",
  },
  VALIDATION: { bg: "bg-blue-100", text: "text-blue-700", label: "VALIDATION" },
  SOURCING: { bg: "bg-teal-100", text: "text-teal-700", label: "SOURCING" },
  WORKFLOW: { bg: "bg-amber-100", text: "text-amber-700", label: "WORKFLOW" },
  CALCULATION: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "CALCULATION",
  },
};

export const DEFAULT_CATEGORY_COLOR: CategoryColor = {
  bg: "bg-slate-100",
  text: "text-slate-700",
  label: "OTHER",
};

export function getCategoryColor(ruleType?: string): CategoryColor {
  if (!ruleType) return DEFAULT_CATEGORY_COLOR;
  const key = ruleType.toUpperCase();
  return CATEGORY_COLORS[key] ?? { ...DEFAULT_CATEGORY_COLOR, label: ruleType };
}

export interface JournalEntry {
  je_preparation_id: number;
  document_number: string;
  company_code: string;
  document_type: string;
  posting_date: string;
  document_date: string;
  currency: string;
  gl_account: string;
  posting_amount: number;
  debit_credit_indicator: string;
  cost_center: string;
  profit_center: string;
  ledger_group: string;
  gl_account_description: string;
  vendor_number: string | null;
  customer_number: string | null;
  document_name: string;
  validation_status: string;
  controlling_area: string;
  cost_element: string;
  quantity: number | null;
  material_number: string | null;
  reversal_indicator: string | null;
  reference_document: string | null;
}

export interface PaginatedRows<T> {
  rows: T[];
  count: number;
}

export interface JournalEntriesPayload {
  je_preparation: PaginatedRows<JournalEntry>;
  business_rules_staging: PaginatedRows<BusinessRule>;
  proof_of_work?: PaginatedRows<unknown>;
}

export interface InvestmentAccountingInputData {
  fund_statement: InvestmentAccountingFundStatement[];
  bank_statement: InvestmentAccountingBankStatement[];
  business_rules: BusinessRule[];
}

export interface JEProofOfWork {
  [key: string]: unknown;

  je_preparation_id?: string;
  sourcing_rule_id?: string;
  sourcing_condition?: string;
  calculation_rule_id?: string;
  calculation_condition?: string;
  gl_account?: string;
  cost_center?: string;
}

// export interface IAProofOfWork {
//   input_fund_bank_statement: string;
//   sourcing_validation_rule: string;
//   validation_calculation_rule: string;
//   create_journal_entry: string;
// }
export interface InputSection {
  fund_statement_display: string;
  bank_statement_display: string;
}

export interface SourcingValidationSection {
  [key: string]: unknown;
}

export interface ValidationCalculationSection {
  [key: string]: unknown;
}
export interface JournalEntryRuleSection {
  [ruleId: string]: string;
}
export type RuleSection = Record<string, string>;

export type DebitCredit = "DR" | "CR";
export interface JournalEntryOutput {
  transaction_date: string; // ISO format: YYYY-MM-DD
  gl_account: string;
  dr_cr: DebitCredit;
  total_posting_amount: number;
}

export interface IAProofOfWork {
  input: InputSection;
  sourcing_validation_section: RuleSection;
  validation_calculation_section: RuleSection;
  journal_entry: RuleSection;
  output?: JournalEntryOutput[];
}
