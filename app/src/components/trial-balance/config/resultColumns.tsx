import { Loader2, Search } from "lucide-react";
import type { Column } from "@/components/shared/data-table";
import type { TBAnomalyOutputRecord, TBDrillComparisonRow } from "@/types";
import { formatCurrency } from "@/utils/common";

export type TBResultRow = TBAnomalyOutputRecord & {
  current_amount: number;
  previous_amount: number;
};

type ResultColumnsParams = {
  currPeriodHeader: string;
  prevPeriodHeader: string;
  drillDownAccount: string | null;
  onDrillDown: (accountCode: string, accountName: string) => void;
  isDrillLoading: boolean;
  drillingAccountCode: string | null;
};

export const formatPercent = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export const createTrialBalanceResultColumns = ({
  currPeriodHeader,
  prevPeriodHeader,
  drillDownAccount,
  onDrillDown,
  isDrillLoading,
  drillingAccountCode,
}: ResultColumnsParams): Column<TBResultRow>[] => [
  {
    key: "account_code",
    header: "ACCOUNT CODE",
    width: "w-20",
    render: (row) => (
      <span className="text-xs text-slate-600">{row.account_code}</span>
    ),
  },
  {
    key: "account_name",
    header: "ACCOUNT NAME",
    width: "w-28",
    render: (row) => (
      <span className="block truncate" title={row.account_name}>
        {row.account_name}
      </span>
    ),
  },
  {
    key: "line_item_description",
    header: "LINE ITEM DESCRIPTION",
    width: "w-36",
    render: (row) => (
      <span className="block truncate" title={row.line_item_description}>
        {row.line_item_description}
      </span>
    ),
  },
  {
    key: "current_amount",
    header: currPeriodHeader,
    align: "right",
    width: "w-28",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-800 tabular-nums whitespace-nowrap">
        {formatCurrency(row.current_amount)}
      </span>
    ),
    accessor: (row) => row.current_amount,
  },
  {
    key: "previous_amount",
    header: prevPeriodHeader,
    align: "right",
    width: "w-28",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-500 tabular-nums whitespace-nowrap">
        {formatCurrency(row.previous_amount)}
      </span>
    ),
    accessor: (row) => row.previous_amount,
  },
  {
    key: "percent_deviation",
    header: "% DEVIATION",
    align: "right",
    width: "w-20",
    render: (row) => {
      const pct = Number(row.percent_deviation);
      const isAnomaly = row.anomaly_flag === "Y";
      return (
        <span
          className={`text-xs font-bold ${
            isAnomaly ? "text-red-600" : "text-slate-600"
          }`}
        >
          {formatPercent(pct)}
        </span>
      );
    },
    accessor: (row) => row.percent_deviation,
  },
  {
    key: "anomaly_flag",
    header: "ANOMALY",
    align: "center",
    width: "w-20",
    render: (row) =>
      row.anomaly_flag === "Y" ? (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
          Anomaly
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
          Normal
        </span>
      ),
  },
  {
    key: "drill_process",
    header: "DRILL PROCESS",
    align: "center",
    width: "w-24",
    sortable: false,
    render: (row) => {
      const isDrilled = drillDownAccount === row.account_code;
      const isLoading =
        isDrillLoading && drillingAccountCode === row.account_code;
      if (row.anomaly_flag !== "Y") return null;

      return (
        <button
          onClick={() => onDrillDown(row.account_code, row.account_name)}
          disabled={isDrillLoading}
          className={`group relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all duration-200 ${
            isLoading
              ? "bg-linear-to-r from-cyan-400 to-blue-500 text-white shadow-sm opacity-80 cursor-wait"
              : isDrilled
                ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-200 ring-2 ring-cyan-200"
                : isDrillLoading
                  ? "bg-linear-to-r from-sky-500 to-blue-600 text-white/60 shadow-sm cursor-not-allowed"
                  : "bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-blue-200 hover:from-cyan-500 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-200"
          }`}
        >
          {!isLoading && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-200 opacity-90" />
          )}
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Search
              className={`w-3 h-3 transition-transform duration-200 ${
                isDrilled
                  ? "scale-110"
                  : "group-hover:scale-110 group-hover:rotate-3"
              }`}
            />
          )}
          <span className="tracking-wide">
            {isLoading ? "Loading…" : "Drill"}
          </span>
        </button>
      );
    },
  },
];

export const createTrialBalanceDrillColumns = (
  highlightedDocNumbers: Set<number> = new Set(),
): Column<TBDrillComparisonRow>[] => [
  {
    key: "CompanyCode",
    header: "COMPANY CODE",
    width: "w-24",
    render: (row) => (
      <span className="text-xs text-slate-700">{row.CompanyCode}</span>
    ),
  },
  {
    key: "GLAccount",
    header: "GL ACCOUNT",
    width: "w-24",
    render: (row) => (
      <span className="text-xs text-slate-700">{row.GLAccount}</span>
    ),
  },
  {
    key: "DocumentNumber",
    header: "DOCUMENT NUMBER",
    width: "w-32",
    render: (row) => {
      const isHighlighted = highlightedDocNumbers.has(row.DocumentNumber);
      return (
        <span
          className={`inline-flex rounded-md px-2 py-1 font-mono text-xs ${
            isHighlighted
              ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
              : "text-slate-700"
          }`}
        >
          {row.DocumentNumber}
        </span>
      );
    },
  },
  {
    key: "AccountName",
    header: "ACCOUNT NAME",
    width: "w-36",
    render: (row) => (
      <span className="block truncate" title={row.AccountName}>
        {row.AccountName}
      </span>
    ),
  },
  {
    key: "AccountType",
    header: "ACCOUNT TYPE",
    width: "w-24",
  },
  {
    key: "DebitCredit",
    header: "DEBIT CREDIT",
    width: "w-24",
    render: (row) => {
      const isCredit = row.DebitCredit.toLowerCase().startsWith("c");

      const badgeColor = isCredit
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200";
      return (
        <span
          className={`inline-flex uppercase items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeColor}`}
        >
          {isCredit ? "Credit" : "Debit"}
        </span>
      );
    },
  },
  {
    key: "AmountLC",
    header: "AMOUNT LC",
    align: "right",
    width: "w-28",
    render: (row) => (
      <span className="tabular-nums">{formatCurrency(row.AmountLC)}</span>
    ),
    accessor: (row) => row.AmountLC,
  },
  {
    key: "CostCenter",
    header: "COST CENTER",
    width: "w-24",
  },
  {
    key: "ProfitCenter",
    header: "PROFIT CENTER",
    width: "w-24",
  },
  {
    key: "VendorName",
    header: "VENDOR NAME",
    width: "w-36",
    render: (row) => (
      <span className="block truncate" title={row.VendorName || "-"}>
        {row.VendorName || "-"}
      </span>
    ),
  },
  {
    key: "LineItemText",
    header: "LINE ITEM DESCRIPTION",
    width: "w-44",
    render: (row) => (
      <span className="whitespace-normal wrap-break-word leading-5">
        {row.LineItemText}
      </span>
    ),
  },
];
