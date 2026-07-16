import type { Column } from "@/components/shared/data-table";
import type {
  APEntryRecord,
  APInvoiceRecord,
  BalanceSheetRecord,
  ManualJournalEntryRecord,
  RevaluationEntryRecord,
  TrialBalanceDetailRecord,
} from "./api";
import type { ReviewDecision } from "./trialBalance";

export type DrillTab =
  | "ap"
  | "ap_entry"
  | "tb"
  | "mje"
  | "reval"
  | "project_entry";

export interface TabConfig {
  key: DrillTab;
  label: string;
  count: number;
}

export interface OUOption {
  label: string;
  value: string;
  [key: string]: unknown;
}

export interface BalanceSheetTableProps<T> {
  data: T[];
  title: string;
  columns: Column<T>[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}
export interface BalanceSheetSolverResultProps {
  data: BalanceSheetRecord[];
  drillDownOU: string | null;
  onDrillDown: (ou: BalanceSheetRecord | null) => void;
  isDrillLoading: boolean;
  apData: { [key: string]: APInvoiceRecord[] };
  apEntry: APEntryRecord[];
  tbData: { [key: string]: TrialBalanceDetailRecord[] };
  mjeData: { [key: string]: ManualJournalEntryRecord[] };
  revalData: { [key: string]: RevaluationEntryRecord[] };
  projectEntryData: { [key: string]: ManualJournalEntryRecord[] };
  explanation?: string;
  reviewDecision: ReviewDecision | null;
  onExplanationChange: (ou: string, value: string) => void;
  onReviewDecision: (ou: string, decision: ReviewDecision) => void;
  selectedDrillResult: BalanceSheetRecord | null;
  pageByTab: {
    ap: number;
    ap_entry: number;
    tb: number;
    mje: number;
    reval: number;
    project_entry: number;
  };
  setPageByTab: (pageByTab: {
    ap: number;
    ap_entry: number;
    tb: number;
    mje: number;
    reval: number;
    project_entry: number;
  }) => void;
  showDrillButton?: boolean;
}
