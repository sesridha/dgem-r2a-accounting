import FileSaver from "file-saver";
import { Download } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { IconTextButton } from "../shared/IconTextButton";
import type { ExportColumn, ExportFileProps, GroupedHeader } from "@/types/proofOfWork";

// Re-export types for consumer components
export type { ExportColumn, GroupedHeader };

/* ===================== COMPONENT ===================== */

function ProofOfWorkExport<T extends Record<string, unknown>>({
  data,
  fileName,
  columns,
  wscols,
  dropdown = false,
  groupedHeaders,
  title = `Export File`,
  type,
}: ExportFileProps<T>) {
  const getCellValue = (row: T, col: ExportColumn) =>
    typeof col.transform === "function"
      ? col.transform(row, col.key)
      : row[col.key];

  const escapeCsv = (value: unknown) => {
    const s = value == null ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  /* ===================== EXCEL ===================== */
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headerRow1: string[] = [];
    groupedHeaders?.forEach((g) => {
      headerRow1.push(g.title);
      for (let i = 1; i < g.span; i++) headerRow1.push("");
    });

    const headerRow2 = columns.map((c) => c.label);

    const dataRows = data.map((r) => columns.map((c) => getCellValue(r, c)));

    const ws = XLSX.utils.aoa_to_sheet([
      ...(groupedHeaders ? [headerRow1, headerRow2] : [headerRow2]),
      ...dataRows,
    ]);

    /* Merges */
    if (groupedHeaders) {
      let col = 0;
      ws["!merges"] = groupedHeaders.map((g) => {
        const m = { s: { r: 0, c: col }, e: { r: 0, c: col + g.span - 1 } };
        col += g.span;
        return m;
      });
    }

    const range = XLSX.utils.decode_range(ws["!ref"]!);

    /* Styling */
    for (let r = 0; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (!ws[addr]) continue;

        ws[addr].s = {
          alignment: {
            horizontal:
              r < 2 ? "center" : c === 2 || c === 4 ? "left" : "center",
            vertical: "center",
            wrapText: true,
          },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          ...(r === 0 && {
            // fill: { fgColor: { rgb: "4472C4" } },
            font: { bold: true },
          }),
          ...(r === 1 && {
            font: { bold: true },
          }),
        };
      }
    }

    ws["!rows"] = [];
    for (let r = 0; r <= range.e.r; r++) {
      ws["!rows"][r] = r < 2 ? { hpt: 30 } : { hpt: 100 };
    }

    ws["!cols"] = wscols ?? [
      { wch: 22 },
      { wch: 18 },
      { wch: 50 },
      { wch: 18 },
      { wch: 50 },
      { wch: 16 },
      { wch: 16 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Proof of Work");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    FileSaver.saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${fileName}.xlsx`,
    );
  };

  /* ===================== CSV ===================== */
  const exportCsv = () => {
    const header = columns.map((c) => escapeCsv(c.label)).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const value = getCellValue(row, c);
          const stringValue = value == null ? "" : String(value);
          return escapeCsv(stringValue.replace(/\n/g, " "));
        })
        .join(","),
    );

    const csv = [header, ...rows].join("\n");
    FileSaver.saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `${fileName}.csv`,
    );
  };

  const exportFile = (fileType: "excel" | "csv") => {
    if (fileType === "excel") {
      exportExcel();
    } else if (fileType === "csv") {
      exportCsv();
    }
  };

  const resolvedTitle = title || `Export ${type.toUpperCase()}`;
  const resolvedType = type;

  return (
    <>
      {dropdown ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconTextButton
              text={resolvedTitle}
              icon={Download}
              variant="default"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-opacity-90 flex items-center gap-2 transition-all"
              iconSize={20}
              disabled={data.length === 0}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] p-1 bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="px-3 py-2 text-xs text-gray-500 font-semibold tracking-wide border-b border-gray-100 mb-1">
              Export as
            </div>
            <DropdownMenuItem
              onClick={() => exportFile("excel")}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 focus:bg-blue-100 text-gray-800 cursor-pointer transition-colors"
            >
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 2h8v4H8z"
                />
              </svg>
              <span>Excel (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportFile("csv")}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 focus:bg-blue-100 text-gray-800 cursor-pointer transition-colors"
            >
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4h16v16H4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 8h8M8 12h8M8 16h8"
                />
              </svg>
              <span>CSV (.csv)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <IconTextButton
          text={resolvedTitle}
          icon={Download}
          variant="default"
          onClick={() => {
            if (resolvedType === "excel" || resolvedType === "csv") {
              exportFile(resolvedType);
            } else {
              console.error("Unsupported file type: ", resolvedType);
            }
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-opacity-90 flex items-center gap-2 transition-all"
          iconSize={20}
          disabled={data.length === 0}
        />
      )}
    </>
  );
}

export default ProofOfWorkExport;
