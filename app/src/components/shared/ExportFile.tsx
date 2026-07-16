import FileSaver from "file-saver";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { IconTextButton } from "./IconTextButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface ExportColumn {
  /** Property name on each data row */
  key: string;
  /** Header to show in exported file */
  label: string;
  /**
   * Optional transform: given a row and key, return the exported cell value.
   * Useful when display value differs from raw value (e.g., number formatting).
   */
  transform?: (row: Record<string, unknown>, key: string) => unknown;
}

export interface ExportFileProps<T extends Record<string, unknown>> {
  /** Export data rows. Keys should align to `columns[].key` */
  data: T[];
  fileName: string;
  /** Column metadata (key + header label) */
  columns: ExportColumn[];
  /** Column widths for Excel (optional) */
  wscols?: XLSX.ColInfo[];
  /** Export format */
  type: "excel" | "csv" | "pdf";
  /** Button label (defaults to `Export <TYPE>` ) */
  title?: string;
  dropdown?: boolean; // if true, shows export options in a dropdown instead of a single button
}

function ExportFile<T extends Record<string, unknown>>({
  data,
  fileName,
  columns,
  wscols,
  type,
  title = `Export ${type.toUpperCase()}`,
  dropdown = false,
}: ExportFileProps<T>) {
  /** Get a cell's export value using transform (if any) or raw value */
  const getCellValue = (
    row: Record<string, unknown>,
    col: ExportColumn,
  ): unknown => {
    if (typeof col.transform === "function") {
      return col.transform(row, col.key);
    }
    return row[col.key];
  };

  /** CSV escaping per RFC 4180 basic rules */
  const escapeCsv = (value: unknown): string => {
    const s = value == null ? "" : String(value);
    // If contains special chars, wrap in quotes and escape embedded quotes
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const exportExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    // 1) Create a header row mapping key->label for the first row
    const headerRow = columns.reduce<Record<string, string>>((acc, col) => {
      acc[col.key] = col.label;
      return acc;
    }, {});

    // 2) Create formatted data rows in key order
    const formattedData: Record<string, unknown>[] = data.map((row) => {
      const out: Record<string, unknown> = {};
      for (const col of columns) {
        out[col.key] = getCellValue(row, col);
      }
      return out;
    });

    // 3) Build sheet: add header row, then data rows
    const ws = XLSX.utils.json_to_sheet([headerRow], {
      header: columns.map((c) => c.key),
      skipHeader: true,
    });
    if (wscols) ws["!cols"] = wscols;

    XLSX.utils.sheet_add_json(ws, formattedData, {
      header: columns.map((c) => c.key),
      skipHeader: true,
      origin: -1,
    });

    // 4) Write workbook
    const wb: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(blob, fileName + fileExtension);
  };

  const exportCsv = () => {
    const header = columns.map((col) => escapeCsv(col.label)).join(",");

    const rows = data.map((row) =>
      columns.map((col) => escapeCsv(getCellValue(row, col))).join(","),
    );

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, `${fileName}.csv`);
  };

  const exportPdf = () => {
    // Stub for now. Consider jsPDF or pdfmake for production.
    // Kept intentionally empty to satisfy lint rules.
    // Example: open a printable HTML table in a new window and call .print()
  };

  const exportFile = (type: string) => {
    if (type === "excel") {
      exportExcel();
    } else if (type === "csv") {
      exportCsv();
    } else if (type === "pdf") {
      exportPdf();
    }
  };

  return (
    <>
      {dropdown ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconTextButton
              text={title || "Export Report"}
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
          text={title}
          icon={Download}
          variant="default"
          onClick={() => exportFile(type)}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-opacity-90 flex items-center gap-2 transition-all"
          iconSize={20}
          disabled={data.length === 0}
        />
      )}
    </>
  );
}

export default ExportFile;
