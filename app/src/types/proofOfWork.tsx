import * as XLSX from "xlsx-js-style";
export interface ExportColumn {
  key: string;
  label: string;
  transform?: (row: Record<string, unknown>, key: string) => unknown;
}

export interface GroupedHeader {
  title: string;
  span: number;
}

export interface ExportFileProps<T extends Record<string, unknown>> {
  data: T[];
  fileName: string;
  columns: ExportColumn[];
  wscols?: XLSX.ColInfo[];
  type: "excel" | "csv" | "pdf";
  title?: string;
  dropdown?: boolean;
  groupedHeaders?: GroupedHeader[];
}
