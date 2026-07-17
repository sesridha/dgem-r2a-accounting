import type {
  ICAPInvoiceRecord,
  ICInvoiceExceptionRecord,
  ICTransactionRecord,
} from "./api";
import type { ReviewDecision, TBDrillComparisonRow } from "./trialBalance";

export type DrillState = {
  entityCode: string | number | null;
  entityName: string | null;
  transactionNumber: string | null;
};

export type ICItemSolverResultProps = {
  results: ICTransactionRecord[];
  drillDownAccountCode: string | null | number;
  drillDownAccountName: string | null | number;
  drillDownRows: TBDrillComparisonRow[];
  selectedDrillResult: ICTransactionRecord | null;
  selectedReviewDecision: ReviewDecision | null;
  onDrillDown: (data: ICTransactionRecord) => void;
  isDrillLoading: boolean;
  onExplanationChange: (
    accountCode: string | number,
    explanation: string,
  ) => void;
  onReviewDecision: (
    accountCode: string | number,
    decision: ReviewDecision,
  ) => void;
  invoiceData: ICInvoiceRecordProps | null;
  drillDownTransactionNumber: string | null | number;
  showResults: boolean;
  resultPage: number;
  setResultPage: (page: number) => void;
};

export type ICInvoiceRecordProps = {
  ap_invoice_book: ICAPInvoiceRecord[];
  un_accounted_invoices: ICInvoiceExceptionRecord[];
};
