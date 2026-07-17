export interface InvestmentProofOfWork {
  input: {
    fund_statement_display: string;
    bank_statement_display: string;
  };

  sourcing_validation_section?: Record<string, string>;
  validation_calculation_section?: Record<string, string>;
  journal_entry?: Record<string, string>;

  output: {
    transaction_date: string;
    gl_account: string;
    dr_cr: string;
    total_posting_amount: number;
  }[];
}

export interface FormattedOutputRow {
  transaction_date: string;
  gl_account: string;
  dr_cr: string;
  total_posting_amount: number;
}

export interface FormattedDataItem {
  [key: string]: unknown;
  fund_statement_display: string;
  bank_statement_display: string;
  sourcing_validation_rule: string;
  validation_calculation_rule: string;
  journal_entry: string;
  transaction_date: string;
  gl_account: string;
  dr_cr: string;
  total_posting_amount: string;
  output: FormattedOutputRow[];
}
