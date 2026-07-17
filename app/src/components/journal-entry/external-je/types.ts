export type EmailJePreparation = {
  je_preparation_id: number;
  document_name: string;
  /** Present on Accrual_Details records; absent on email_journal records. */
  journal_type?: string;
  company_code: number;
  document_type: string;
  posting_date: string;
  document_date: string;
  currency: string;
  gl_account: number;
  posting_amount: number;
  debit_credit_indicator: string;
  cost_center: number | string;
  gl_account_description: string;
  validation_status: string;
  source_type: string;
  load_timestamp: string;
  update_timestamp: string;
};

export type EmailBusinessRule = {
  sub_system_id: string | number;
  document_name: string;
  sub_system_name: string;
  rule_id: string;
  title: string;
  description: string;
  rule_type: string;
  order_of_execution: number | string;
  enabled: string | number;
  [key: string]: unknown;
};

export type EmailJePosting = {
  /** Present in email_je_posting; absent in email_attachments_posting. */
  je_posting_id?: number;
  je_preparation_id: number;
  session_id: string;
  document_name: string;
  company_code: number;
  document_type: string;
  posting_date: string;
  document_date: string;
  currency: string;
  gl_account: number;
  posting_amount: number;
  debit_credit_indicator: string;
  cost_center: number | string;
  gl_account_description: string;
  source_type: string;
  posting_status: string;
  calculation_rule_applied: string;
  posted_timestamp: string;
};

export type ExternalJEData = {
  /** Body parser preparation records (document_name: "email_journal") */
  email_je_preparation: EmailJePreparation[];
  /** Business rules for the Email Body Parser */
  email_business_rules: EmailBusinessRule[];
  /** Business rules for the Email Attachment Parser */
  email_attachments_business_rules: EmailBusinessRule[];
  /** Body parser posting results */
  email_je_posting: EmailJePosting[];
  /** Attachment parser posting results */
  email_attachments_posting: EmailJePosting[];
  /**
   * Attachment parser input/preparation records (document_name: "Accrual_Details").
   * Same shape as EmailJePreparation with an additional journal_type field.
   */
  email_attachments_input_data: EmailJePreparation[];
};

// ---------- Parser Configuration ----------

export interface EmailParserConfig {
  id: "body" | "attachment";
  label: string;
  description: string;
  emailFilePath: string;
  /**
   * Path to the downloadable attachment file (e.g. .xlsx).
   * When present, a download card is rendered above the email body in step 1.
   */
  attachmentFilePath?: string;
  /**
   * Display name shown in the download link and used as the browser's
   * suggested save-as filename (via the HTML download attribute).
   * Defaults to the bare filename from attachmentFilePath when omitted.
   */
  attachmentLabel?: string;
  /**
   * Path to the SOP .docx file. When provided, the parser will convert
   * this .docx to Markdown for display in the SOP viewer, and the
   * download button will serve the original .docx file.
   */
  sopDocxPath?: string; /** Path to the SOP PDF file. When provided, the validation UI will open this
   * PDF in a new tab instead of downloading the DOCX source file.
   */
  sopPdfPath?: string;
}
