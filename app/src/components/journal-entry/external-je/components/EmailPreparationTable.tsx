import { useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PREPARATION_COLUMNS } from "../columns";
import type { EmailJePreparation } from "../types";

type Props = {
  data: EmailJePreparation[];
};

export function EmailPreparationTable({ data }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const model = useTanstackDataTableState<EmailJePreparation>({
    data,
    columns: PREPARATION_COLUMNS,
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
        emptyState={<EmptyState message="No input data found." />}
      />
    </div>
  );
}
