import type {
  TBAnomalyOutputRecord,
  TBPostingDetail,
  TrialBalanceRecord,
} from "./api";

// export interface TrialBalanceRecord {
//   company_code: number;
//   account_number: number;
//   account_group: string;
//   bs_pl_item_text: string;
//   reporting_period_amount_in_local_currency: number;
//   comparison_period_amount_in_local_currency: number;
//   deviation_amount_in_local_currency: number;
//   business_rules: string;
//   anomaly_description: string | null;
// }

export type FieldKey =
  | "tbType"
  | "period"
  | "compPeriod"
  | "legalEntity"
  | "hierarchy";
export type TrialBalanceType = {
  id: string;
  name: string;
  value?: string;
};
export type MetricCard = {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  description: string;
};

export type TBSelectOption = {
  id: string;
  name: string;
};

export type TBPeriodOption = TBSelectOption;

/** All raw posting fields from the API plus a UI-only period label for grouping. */
export type TBDrillComparisonRow = TBPostingDetail & { period_label: string };

export type ReviewDecision =
  | "accepted"
  | "rejected"
  | "accept_no_action"
  | "accept_action_required"
  | "further_investigation";

export type TrialBalanceResultProps = {
  results: TBAnomalyOutputRecord[];
  currKey: string;
  prevKey: string;
  currPeriodHeader: string;
  prevPeriodHeader: string;
  currPeriodLabel: string;
  drillDownAccountCode: string | null;
  drillDownAccountName: string | null;
  drillDownRows: TBDrillComparisonRow[];
  selectedDrillResult: TBAnomalyOutputRecord | null;
  selectedReviewDecision: ReviewDecision | null;
  onDrillDown: (accountCode: string, accountName: string) => void;
  isDrillLoading: boolean;
  drillingAccountCode: string | null;
  onExplanationChange: (accountCode: string, explanation: string) => void;
  onReviewDecision: (accountCode: string, decision: ReviewDecision) => void;
};

export type ExportMeta = {
  rows: Record<string, unknown>[];
  columns: { key: string; label: string }[];
};

export type TrialBalanceTableProps = {
  data: TrialBalanceRecord[];
  loading?: boolean;
  pageSizeOptions?: number[];
  onExportMetaChange?: (meta: ExportMeta) => void;
  initialPageSize?: number;
};
