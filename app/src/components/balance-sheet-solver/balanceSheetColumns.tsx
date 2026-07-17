import type { Column } from "@/components/shared/data-table/types";
import type { BalanceSheetRecord } from "@/types";
import { formatNumber } from "@/utils/common";

export function createBalanceSheetColumns(): Column<BalanceSheetRecord>[] {
  return [
    {
      key: "ou",
      header: "OU",
      accessor: (row) => row.ou,
      render: (row) => (
        <span
          className={
            row.ou === "Total" || row.ou === "Subtotal"
              ? "font-bold text-sm text-gray-900"
              : ""
          }
        >
          {row.ou}
        </span>
      ),
      width: "w-20",
    },
    {
      key: "apBalance",
      header: "AP BALANCE",
      accessor: (row) => row.apBalance,
      render: (row) => (
        <span className={row.ou === "Total" ? "font-bold text-gray-900" : ""}>
          {formatNumber(row.apBalance)}
        </span>
      ),
      align: "right",
      width: "w-40",
    },
    {
      key: "glBalance",
      header: "GL BALANCE",
      accessor: (row) => row.glBalance,
      render: (row) => (
        <span className={row.ou === "Total" ? "font-bold text-gray-900" : ""}>
          {formatNumber(row.glBalance)}
        </span>
      ),
      align: "right",
      width: "w-40",
    },
    {
      key: "diff",
      header: "DIFF (AP-GL)",
      accessor: (row) => row.diff,
      render: (row) => (
        <span
          className={
            row.ou === "Total"
              ? "font-bold text-gray-900"
              : row.diff !== 0
                ? ""
                : ""
          }
        >
          {formatNumber(row.diff)}
        </span>
      ),
      align: "right",
      width: "w-40",
    },
    {
      key: "revaluation",
      header: "REVALUATION",
      accessor: (row) => row.revaluation,
      render: (row) => (
        <span className={row.ou === "Total" ? "font-bold text-gray-900" : ""}>
          {formatNumber(row.revaluation)}
        </span>
      ),
      align: "right",
      width: "w-40",
    },
    {
      key: "manualEntries",
      header: "MANUAL ENTRIES",
      accessor: (row) => row.manualEntries,
      render: (row) => (
        <span className={row.ou === "Total" ? "font-bold text-gray-900" : ""}>
          {formatNumber(row.manualEntries)}
        </span>
      ),
      align: "right",
      width: "w-40",
    },
    {
      key: "adjustedDiff",
      header: "DIFF (AP-GL-(Reval+Manual))",
      accessor: (row) => row.adjustedDiff,
      render: (row) => (
        <span
          className={
            row.ou === "Total"
              ? "font-bold text-gray-900"
              : row.adjustedDiff !== 0
                ? ""
                : ""
          }
        >
          {formatNumber(row.adjustedDiff)}
        </span>
      ),
      align: "right",
      width: "w-48",
    },
    {
      key: "remarks",
      header: "ACTION",
      accessor: (row) => row.remarks,
      render: (row) => row.remarks || "-",
      width: "w-32",
    },
  ];
}
