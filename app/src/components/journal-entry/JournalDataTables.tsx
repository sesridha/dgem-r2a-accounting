"use client";

import type { Column } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import { useMemo, useState } from "react";

import type { BusinessRule, InputDataRecord } from "@/types/journalEntry";
import {
  BUSINESS_RULE_COLUMNS,
  INPUT_DATA_COLUMNS,
  type ColumnMeta,
} from "@/utils/tableColumns";
import { EmptyState } from "../shared/EmptyState";
import {
  businessRuleAccessors,
  businessRuleRenderers,
  inputDataRenderers,
} from "./JournalColumnsRenderer";

type Props = {
  loading: boolean;

  /** Raw arrays; the child will paginate and build models internally */
  inputData: InputDataRecord[];
  rulesData: BusinessRule[];
  /** Optional initial sizes */
  initialInputPageSize?: number;
  initialRulesPageSize?: number;
  dynamicInputColumns?: ColumnMeta[];
};

export default function JournalDataTables({
  loading,
  inputData,
  rulesData,
  initialInputPageSize = 10,
  initialRulesPageSize = 10,
  dynamicInputColumns,
}: Props) {
  /** LOCAL pagination state — resets automatically when component remounts */
  const [inputPage, setInputPage] = useState(1);
  const [inputPageSize, setInputPageSize] = useState(initialInputPageSize);

  const [rulesPage, setRulesPage] = useState(1);
  const [rulesPageSize, setRulesPageSize] = useState(initialRulesPageSize);

  const inputDataColumns = useMemo(() => {
    const baseColumns = INPUT_DATA_COLUMNS.map((c) => ({
      key: c.key,
      header: c.header,
      width: c.width,
      sortable: c.sortable,
      render: c.rendererId ? inputDataRenderers[c.rendererId] : undefined,
    }));

    const extraColumns = (dynamicInputColumns ?? []).map((dc) => ({
      key: dc.key,
      header: dc.header,
      render: undefined,
    }));

    return [...baseColumns, ...extraColumns];
  }, [dynamicInputColumns]);

  const businessRulesColumns: Column<BusinessRule>[] = useMemo(() => {
    return BUSINESS_RULE_COLUMNS.map((c) => ({
      key: c.key,
      header: c.header,
      width: c.width,
      sortable: c.sortable,
      accessor: c.accessorId ? businessRuleAccessors[c.accessorId] : undefined,
      render: c.rendererId ? businessRuleRenderers[c.rendererId] : undefined,
    }));
  }, []);

  /**
   * Pass the FULL arrays to the hook — it handles pagination internally
   * via pagedRows. No manual slicing needed here.
   */
  const inputModel = useTanstackDataTableState<InputDataRecord>({
    data: inputData,
    columns: inputDataColumns,
    currentPage: inputPage,
    pageSize: inputPageSize,
    onPageChange: setInputPage,
    onPageSizeChange: setInputPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    title: "Journal Entry Preparation Data",
  });

  const rulesModel = useTanstackDataTableState<BusinessRule>({
    data: rulesData,
    columns: businessRulesColumns,
    currentPage: rulesPage,
    pageSize: rulesPageSize,
    onPageChange: setRulesPage,
    onPageSizeChange: setRulesPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    title: "Business Rules",
  });

  return (
    <>
      {/* Input Data */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 lg:p-5">
        <DataTable
          model={inputModel}
          showPagination={inputData.length > 0}
          pageSizeOptions={[5, 10, 20]}
          emptyState={
            <EmptyState
              message="No data found."
              action={<span className="font-semibold">View Data & Rules</span>}
            />
          }
          loading={loading}
        />
      </div>

      {/* Business Rules */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 lg:p-5">
        <DataTable
          model={rulesModel}
          showPagination={rulesData.length > 0}
          pageSizeOptions={[5, 10, 20]}
          emptyState={
            <EmptyState
              message="No data found."
              action={<span className="font-semibold">View Data & Rules</span>}
            />
          }
          loading={loading}
        />
      </div>
    </>
  );
}
