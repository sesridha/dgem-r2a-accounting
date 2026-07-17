import type { Column } from "@/components/shared/data-table";
import type {
  EmailJePreparation,
  EmailBusinessRule,
  EmailJePosting,
} from "./types";

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  // Handle dd-mm-yyyy format → yyyy-mm-dd
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length <= 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

export const PREPARATION_COLUMNS: Column<EmailJePreparation>[] = [
  {
    key: "company_code",
    header: "COMPANY CODE",
    sortable: true,
    width: "w-28",
  },
  { key: "document_type", header: "DOC TYPE", sortable: true, width: "w-24" },
  {
    key: "posting_date",
    header: "POSTING DATE",
    sortable: true,
    width: "w-28",
    render: (r) => <span>{formatDate(r.posting_date)}</span>,
  },
  { key: "gl_account", header: "GL ACCOUNT", sortable: true, width: "w-28" },
  {
    key: "posting_amount",
    header: "AMOUNT",
    sortable: true,
    width: "w-28",
    align: "right",
    render: (r) => (
      <span className="font-semibold">
        {r.posting_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    key: "debit_credit_indicator",
    header: "DR/CR",
    sortable: true,
    width: "w-20",
    render: (r) => {
      const isDebit = r.debit_credit_indicator === "DR";
      const badgeColor = isDebit
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";
      return (
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeColor}`}
        >
          {isDebit ? "DEBIT" : "CREDIT"}
        </span>
      );
    },
  },
  { key: "currency", header: "CURRENCY", sortable: true, width: "w-20" },
  { key: "gl_account_description", header: "DESCRIPTION", sortable: true },
  {
    key: "cost_center",
    header: "COST CENTER",
    sortable: true,
    width: "w-28",
    render: (r) => (
      <span>{r.cost_center === "null" ? "—" : r.cost_center}</span>
    ),
  },
  {
    key: "validation_status",
    header: "STATUS",
    sortable: true,
    width: "w-28",
    render: (r) => {
      const isValidated = r.validation_status === "VALIDATED";
      const isFailed = r.validation_status === "FAILED";
      const color = isValidated
        ? "bg-green-100 text-green-700"
        : isFailed
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700";
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
        >
          {r.validation_status}
        </span>
      );
    },
  },
];

export const BUSINESS_RULE_COLUMNS: Column<EmailBusinessRule>[] = [
  {
    key: "title",
    header: "RULE TITLE",
    sortable: true,
    width: "w-64",
    render: (r) => <span className="font-medium">{r.title}</span>,
  },
  { key: "description", header: "DESCRIPTION", width: "w-90", sortable: true },
  {
    key: "rule_type",
    header: "TYPE",
    sortable: true,
    width: "w-28",
    render: (r) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
          r.rule_type === "Validation"
            ? "bg-purple-100 text-purple-700"
            : r.rule_type === "Calculation"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
        }`}
      >
        {r.rule_type}
      </span>
    ),
  },
  { key: "order_of_execution", header: "ORDER", sortable: true, width: "w-20" },
];

export const POSTING_COLUMNS: Column<EmailJePosting>[] = [
  {
    key: "company_code",
    header: "COMPANY CODE",
    sortable: true,
    width: "w-28",
  },
  { key: "document_type", header: "DOC TYPE", sortable: true, width: "w-24" },
  {
    key: "posting_date",
    header: "POSTING DATE",
    sortable: true,
    width: "w-28",
    render: (r) => <span>{formatDate(r.posting_date)}</span>,
  },
  { key: "gl_account", header: "GL ACCOUNT", sortable: true, width: "w-28" },
  {
    key: "posting_amount",
    header: "AMOUNT",
    sortable: true,
    width: "w-28",
    align: "right",
    render: (r) => (
      <span className="font-semibold">
        {r.posting_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    key: "debit_credit_indicator",
    header: "DR/CR",
    sortable: true,
    width: "w-20",
    render: (r) => {
      const isDebit = r.debit_credit_indicator === "DR";
      const badgeColor = isDebit
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";
      return (
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeColor}`}
        >
          {isDebit ? "DEBIT" : "CREDIT"}
        </span>
      );
    },
  },
  { key: "currency", header: "CURRENCY", sortable: true, width: "w-20" },
  { key: "gl_account_description", header: "DESCRIPTION", sortable: true },
  {
    key: "cost_center",
    header: "COST CENTER",
    sortable: true,
    width: "w-28",
    render: (r) => (
      <span>{r.cost_center === "null" ? "—" : r.cost_center}</span>
    ),
  },
  {
    key: "posting_status",
    header: "STATUS",
    sortable: true,
    width: "w-24",
    render: (r) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        {r.posting_status}
      </span>
    ),
  },
  { key: "calculation_rule_applied", header: "RULE APPLIED", sortable: true },
];
