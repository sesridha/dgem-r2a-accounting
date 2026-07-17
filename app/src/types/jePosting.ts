export interface JePostingRecord {
  je_preparation_id: number;

  document_type: string;
  document_date: string;
  posting_date: string;

  fiscal_period: string; // comes as "" (empty string)

  document_header_text: string;
  reference_document: string;
  reversal_reason: string;
  reversal_date: string;

  company_code: number;
  document_currency: string;

  translation_date: string;
  exchange_rate: string; // comes as ""

  vat_date: string;
  tax_code: string;

  tax_base_amount_document_currency: string;
  tax_base_amount_local_currency_1: string;
  tax_base_amount_local_currency_2: string;
  tax_base_amount_local_currency_3: string;
  calculated_tax_base_amount: string;

  posting_key: string;

  gl_account: number;
  amount_document_currency: number;
  amount_local_currency: string;

  special_gl_indicator: string;

  cost_center: number;
  wbs_element: string;

  line_item_text: string;
  assignment_number: string;

  purchase_order_number: string;
  material_number: string;
  plant: string;

  base_unit_of_measure: string;
  quantity: string;

  sales_organization: string;
  division: string;
  sub_division_2: string;
  sold_to_group: string;

  payment_block_key: string;
  payment_method: string;
  payment_method_supplement: string;

  baseline_date: string;
  payment_terms: string;
  partner_bank_type: string;

  country: string;
  secondary_country: string;
  scb_indicator: string;

  load_timestamp: string;
  update_timestamp: string;

  [key: string]: unknown;
}

export const POSTING_EXPORT_FIELDS = [
  "je_preparation_id",
  "document_type",
  "document_date",
  "posting_date",
  "fiscal_period",
  "document_header_text",
  "reference_document",
  "reversal_reason",
  "reversal_date",
  "company_code",
  "document_currency",
  "translation_date",
  "exchange_rate",
  "vat_date",
  "tax_code",
  "tax_base_amount_document_currency",
  "tax_base_amount_local_currency_1",
  "tax_base_amount_local_currency_2",
  "tax_base_amount_local_currency_3",
  "calculated_tax_base_amount",
  "posting_key",
  "gl_account",
  "amount_document_currency",
  "amount_local_currency",
  "special_gl_indicator",
  "cost_center",
  "wbs_element",
  "line_item_text",
  "assignment_number",
  "purchase_order_number",
  "material_number",
  "plant",
  "base_unit_of_measure",
  "quantity",
  "sales_organization",
  "division",
  "sub_division_2",
  "sold_to_group",
  "payment_block_key",
  "payment_method",
  "payment_method_supplement",
  "baseline_date",
  "payment_terms",
  "partner_bank_type",
  "country",
  "secondary_country",
  "scb_indicator",
  "load_timestamp",
  "update_timestamp",
] as const;
