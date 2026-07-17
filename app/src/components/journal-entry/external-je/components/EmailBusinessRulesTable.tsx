import { useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import { EmptyState } from "@/components/shared/EmptyState";
import { BUSINESS_RULE_COLUMNS } from "../columns";
import type { EmailBusinessRule } from "../types";

type Props = {
  data: EmailBusinessRule[];
};

export function EmailBusinessRulesTable({ data }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const model = useTanstackDataTableState<EmailBusinessRule>({
    data,
    columns: BUSINESS_RULE_COLUMNS,
    currentPage: page,
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
  });

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-3 sm:p-4 lg:p-5">
      <DataTable
        model={model}
        showPagination={data.length > 0}
        pageSizeOptions={[5, 10, 20]}
        emptyState={<EmptyState message="No business rules found." />}
      />
    </div>
  );
}
