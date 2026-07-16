import type { IAProofOfWork } from "@/types";
import ProofOfWorkExport, {
  type ExportColumn,
  type GroupedHeader,
} from "../ProofOfWorkExport";
import type {
  FormattedDataItem,
  InvestmentProofOfWork,
} from "@/types/investmentProofOfWork";

/* ===================== COLUMN CONFIG ===================== */

const columns: ExportColumn[] = [
  { key: "fund_statement_display", label: "Input Fund" },
  { key: "bank_statement_display", label: "Bank Statement" },
  { key: "sourcing_validation_rule", label: "Sourcing & Validation Rule" },
  {
    key: "validation_calculation_rule",
    label: " Validation Rule & Calculation Rule",
  },
  { key: "journal_entry", label: "Create Journal Entry" },
  { key: "transaction_date", label: "Transaction Date" },
  { key: "gl_account", label: "GL Account" },
  { key: "dr_cr", label: "DR/CR" },
  { key: "total_posting_amount", label: "Total Posting Amount" },
];

/* ===================== GROUP HEADERS ===================== */

const groupedHeaders: GroupedHeader[] = [
  { title: "Input", span: 2 },
  { title: "Agent Process", span: 3 },
  { title: "Output", span: 4 },
];

/* formattedData is an ARRAY of FormattedDataItem */
export type FormattedData = FormattedDataItem[];

/* ===================== COLUMN WIDTHS ===================== */

const wscols = [
  { wch: 24 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 18 },
  { wch: 18 },
  { wch: 10 },
  { wch: 24 },
];

/* ===================== COMPONENT ===================== */

interface InvestmentProofOfWorkExportProps {
  data: IAProofOfWork[];
}
const formatRuleObjectToString = (ruleObj?: Record<string, string>) =>
  ruleObj
    ? Object.entries(ruleObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n\n")
    : "";

export function InvestmentAccountProofOfWorkExport({
  data,
}: InvestmentProofOfWorkExportProps) {
  const formattedData: FormattedData = data.map((entry) => ({
    fund_statement_display: entry.input.fund_statement_display,
    bank_statement_display: entry.input.bank_statement_display,

    sourcing_validation_rule: formatRuleObjectToString(
      entry.sourcing_validation_section,
    ),

    validation_calculation_rule: formatRuleObjectToString(
      entry.validation_calculation_section,
    ),

    // FIX #1: Correct source for journal entry
    journal_entry: formatRuleObjectToString(entry.journal_entry),

    transaction_date:
      (entry.output as InvestmentProofOfWork["output"])
        ?.map((o) => o.transaction_date)
        .join("\n") || "",

    gl_account:
      (entry.output as InvestmentProofOfWork["output"])
        ?.map((o) => o.gl_account)
        .join("\n") || "",

    dr_cr:
      (entry.output as InvestmentProofOfWork["output"])
        ?.map((o) => o.dr_cr)
        .join("\n") || "",

    total_posting_amount:
      entry.output?.map((o) => o.total_posting_amount.toString()).join("\n") ??
      "",

    output: entry.output ?? [],
  }));

  return (
    <ProofOfWorkExport<FormattedDataItem>
      data={formattedData}
      fileName="Investment_Account_Proof_of_Work_Report"
      type="excel"
      columns={columns}
      groupedHeaders={groupedHeaders}
      wscols={wscols}
      dropdown
      title="Export Proof of Work"
    />
  );
}

export default InvestmentAccountProofOfWorkExport;
