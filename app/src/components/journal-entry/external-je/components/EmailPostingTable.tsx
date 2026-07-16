import { useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { useTanstackDataTableState } from "@/hooks/useTanstackDataTableState";
import { EmptyState } from "@/components/shared/EmptyState";
import { POSTING_COLUMNS } from "../columns";
import type { EmailJePosting } from "../types";

type Props = {
  data: EmailJePosting[];
};

function sanitizeFileNamePart(value: string | undefined): string {
  const normalized = (value ?? "").trim();
  if (!normalized) return "adhoc_je_postings";

  return (
    normalized
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase() || "adhoc_je_postings"
  );
}

export function EmailPostingTable({ data }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const exportFileName = `${sanitizeFileNamePart(data[0]?.document_name)}_posting`;

  const model = useTanstackDataTableState<EmailJePosting>({
    data,
    columns: POSTING_COLUMNS,
    currentPage: page,
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    enableSorting: true,
    enableColumnVisibility: true,
    title: `Posting Results (${data.length} rows)`,
  });

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-3 sm:p-4 lg:p-5">
      <DataTable
        model={model}
        showPagination={data.length > 0}
        pageSizeOptions={[5, 10, 20]}
        emptyState={<EmptyState message="No posting data found." />}
        isDownload={true}
        downloadData={data}
        downloadColumns={POSTING_COLUMNS.map((col) => ({
          key: col.key,
          label: col.header,
        }))}
        downloadFileName={exportFileName}
      />
    </div>
  );
}
