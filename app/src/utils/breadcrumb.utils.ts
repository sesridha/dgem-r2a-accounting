import { ACCOUNTING_CONFIG } from "./constants";

// If you're using TS, define types for clarity
export type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
};

type ContentLike =
  | {
      breadcrumb?: string;
    }
  | null
  | undefined;

/**
 * Build breadcrumb items for the Trial Balance page.
 */
export function getTrialBalanceBreadcrumbs(
  showResults: boolean,
  handleClearResult?: () => void,
): BreadcrumbItem[] {
  if (showResults) {
    return [
      { label: "Automation" },
      { label: "Trial Balance", onClick: handleClearResult },
      { label: "Anomaly Analysis" },
    ];
  }

  return [{ label: "Automation" }, { label: "Trial Balance" }];
}

export function getJournalEntryBreadcrumbs(
  content: ContentLike | null,
  handleClearResult: () => void,
): BreadcrumbItem[] {
  if (content) {
    return [
      { label: "Automation" },
      { label: "Journal Entry", onClick: handleClearResult },
      { label: content.breadcrumb || "" },
    ];
  }

  return [
    { label: "Automation" },
    { label: "Journal Entry", onClick: handleClearResult },
  ];
}
type AccountingModule = "journalEntry" | "investmentAccounting";
export function getAccountingBreadcrumbs(
  module: AccountingModule,
  content: ContentLike | null,
  handleClearResult: () => void,
): BreadcrumbItem[] {
  const config = ACCOUNTING_CONFIG[module];

  const baseBreadcrumbs = [
    { label: "Automation" },
    {
      label: config.breadcrumb,
      onClick: handleClearResult,
    },
  ];

  if (!content) {
    return baseBreadcrumbs;
  }

  return [...baseBreadcrumbs, { label: content.breadcrumb || "Output" }];
}

/**
 * Build breadcrumb items for the IC Item Solver page.
 */
export function getICItemSolverBreadcrumbs(
  showResults: boolean,
  handleClearResult?: () => void,
): BreadcrumbItem[] {
  if (showResults) {
    return [
      { label: "Automation" },
      { label: "IC Item Solver", onClick: handleClearResult },
      { label: "Results" },
    ];
  }

  return [{ label: "Automation" }, { label: "IC Item Solver" }];
}

/**
 * Build breadcrumb items for the Balance Sheet Item Solver page.
 */
export function getBalanceSheetSolverBreadcrumbs(
  showResults: boolean,
  handleClearResult?: () => void,
): BreadcrumbItem[] {
  if (showResults) {
    return [
      { label: "Automation" },
      { label: "Balance Sheet Item Solver", onClick: handleClearResult },
      { label: "Analysis Results" },
    ];
  }

  return [{ label: "Automation" }, { label: "Balance Sheet Item Solver" }];
}
