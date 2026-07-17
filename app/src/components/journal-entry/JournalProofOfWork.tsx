// import ExportFile, { ExportColumn, GroupedHeader } from "@/components/ExportFile";

import type { JEProofOfWork } from "@/types";
// import type { ExportColumn, GroupedHeader } from "../shared/ExportFile";
import ProofOfWorkExport, {
  type ExportColumn,
  type GroupedHeader,
} from "./ProofOfWorkExport";

/* ===================== COLUMN CONFIG ===================== */

const columns: ExportColumn[] = [
  { key: "je_preparation_id", label: "JE Preparation ID" },

  { key: "sourcing_rule_id", label: "Rule" },
  { key: "sourcing_condition", label: "Condition" },

  { key: "calculation_rule_id", label: "Rule" },
  { key: "calculation_condition", label: "Condition" },

  { key: "gl_account", label: "GL Account" },
  { key: "cost_center", label: "Cost Center" },
];

/* ===================== GROUP HEADERS ===================== */

const groupedHeaders: GroupedHeader[] = [
  { title: "JE Preparation", span: 1 },
  { title: "Sourcing", span: 2 },
  { title: "Calculation", span: 2 },
  { title: "Output", span: 2 },
];

/* ===================== COLUMN WIDTHS ===================== */

const wscols = [
  { wch: 24 },
  { wch: 20 },
  { wch: 20 }, // Further reduced width for sourcing_condition
  { wch: 20 },
  { wch: 20 }, // Further reduced width for calculation_condition
  { wch: 18 },
  { wch: 18 },
];

/* ===================== COMPONENT ===================== */

interface ProofOfWorkExportProps {
  data: JEProofOfWork[];
}

export function JournalProofOfWork({ data }: ProofOfWorkExportProps) {
  return (
    <ProofOfWorkExport<JEProofOfWork>
      data={data}
      fileName="Proof_of_Work_Report"
      type="excel"
      columns={columns}
      groupedHeaders={groupedHeaders}
      wscols={wscols}
      dropdown
      title="Export Proof of Work"
    />
  );
}
