"use client";

import { useMemo, useState } from "react";

import {
  type BusinessRule,
  type InvestmentAccountingBankStatement,
  type InvestmentAccountingFundStatement,
} from "@/types/journalEntry";
import {
  BANK_STATEMENT_COLUMNS,
  BUSINESS_RULE_IA_COLUMNS,
  FUND_STATEMENT_COLUMNS,
} from "@/utils/tableColumns";
import { useTanstackDataTableState } from "../../../hooks/useTanstackDataTableState";
import { DataTable, type Column } from "../../shared/data-table";
import { EmptyState } from "../../shared/EmptyState";
import { investmentAccountingRenders } from "../JournalColumnsRenderer";

const InvestmentAccountDataTables = ({
  fundStatementData,
  bankStatementData,
  businessRulesData,
}: {
  fundStatementData: InvestmentAccountingFundStatement[];
  bankStatementData: InvestmentAccountingBankStatement[];
  businessRulesData: BusinessRule[];
}) => {
  /** ---------------- Fund Statement Pagination ---------------- */
  const [fundPage, setFundPage] = useState(1);
  const [fundPageSize, setFundPageSize] = useState(10);

  /** ---------------- Bank Statement Pagination ---------------- */
  const [bankPage, setBankPage] = useState(1);
  const [bankPageSize, setBankPageSize] = useState(10);

  const [rulePage, setRulePage] = useState(1);
  const [rulePageSize, setRulePageSize] = useState(10);

  /** ---------------- Fund Statement Columns ---------------- */
  const fundColumns: Column<InvestmentAccountingFundStatement>[] =
    useMemo(() => {
      return FUND_STATEMENT_COLUMNS.map((c) => ({
        key: c.key,
        header: c.header,
        width: c.width,
        sortable: c.sortable,
        accessor: c.accessorId
          ? investmentAccountingRenders[c.accessorId]
          : undefined,
        render: c.rendererId
          ? investmentAccountingRenders[c.rendererId]
          : (row: InvestmentAccountingFundStatement) => {
              const value =
                row[c.key as keyof InvestmentAccountingFundStatement];
              if (
                value === null ||
                value === undefined ||
                String(value) === "null"
              ) {
                return <span> </span>;
              }
              return <span>{String(value)}</span>;
            },
      }));
    }, []);
  /** ---------------- Bank Statement Columns ---------------- */
  const bankColumns: Column<InvestmentAccountingBankStatement>[] =
    useMemo(() => {
      return BANK_STATEMENT_COLUMNS.map((c) => ({
        key: c.key,
        header: c.header,
        width: c.width,
        sortable: c.sortable,
        accessor: c.accessorId
          ? investmentAccountingRenders[c.accessorId]
          : undefined,
        render: c.rendererId
          ? investmentAccountingRenders[c.rendererId]
          : (row: InvestmentAccountingBankStatement) => {
              const value =
                row[c.key as keyof InvestmentAccountingBankStatement];
              if (
                value === null ||
                value === undefined ||
                String(value) === "null"
              ) {
                return <span> </span>;
              }
              return <span>{String(value)}</span>;
            },
      }));
    }, []);

  const businessRulesColumns: Column<BusinessRule>[] = useMemo(() => {
    return BUSINESS_RULE_IA_COLUMNS.map((c) => ({
      key: c.key,
      header: c.header,
      width: c.width,
      sortable: c.sortable,
      accessor: c.accessorId
        ? investmentAccountingRenders[c.accessorId]
        : undefined,
      render: c.rendererId
        ? investmentAccountingRenders[c.rendererId]
        : undefined,
    }));
  }, []);

  /**
   * Pass FULL arrays to the hook — it handles pagination internally
   * via pagedRows. No manual slicing needed here.
   */

  /** ---------------- Fund Table Model ---------------- */
  const fundModel = useTanstackDataTableState({
    data: fundStatementData,
    columns: fundColumns,
    currentPage: fundPage,
    pageSize: fundPageSize,
    onPageChange: setFundPage,
    onPageSizeChange: setFundPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    title: "Fund Statement",
    description: "All amounts are in INR",
  });

  /** ---------------- Bank Table Model ---------------- */
  const bankModel = useTanstackDataTableState({
    data: bankStatementData,
    columns: bankColumns,
    currentPage: bankPage,
    pageSize: bankPageSize,
    onPageChange: setBankPage,
    onPageSizeChange: setBankPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    title: "Bank Statement",
    description: "All amounts are in INR",
  });

  const businessRulesModel = useTanstackDataTableState({
    data: businessRulesData,
    columns: businessRulesColumns,
    currentPage: rulePage,
    pageSize: rulePageSize,
    onPageChange: setRulePage,
    onPageSizeChange: setRulePageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    title: "Business Rules",
  });

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-300 p-5 space-y-6">
      {/* ================= Input Data Header ================= */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-slate-900">Input Data</h1>
      </div>

      {/* ================= Fund Statement ================= */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <DataTable
          model={fundModel}
          showPagination={fundStatementData.length > 0}
          pageSizeOptions={[5, 10, 20]}
          emptyState={<EmptyState message="No fund statements found." />}
        />
      </div>

      {/* ================= Bank Statement ================= */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <DataTable
          model={bankModel}
          showPagination={bankStatementData.length > 0}
          pageSizeOptions={[5, 10, 20]}
          emptyState={<EmptyState message="No bank statements found." />}
        />
      </div>

      {/* ================= Business Rules  ================= */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <DataTable
          model={businessRulesModel}
          showPagination={businessRulesData.length > 0}
          pageSizeOptions={[5, 10, 20]}
          emptyState={<EmptyState message="No business rules found." />}
        />
      </div>
    </div>
  );
};

export default InvestmentAccountDataTables;
