/**
 * App Constants
 */

import type { WorkflowConfig } from "@/components/shared/AIAgentWorkflowLoader";
import type { FieldKey, ResultVariant } from "@/types";
import { type MetricCard, type TrialBalanceType } from "@/types";
export interface TrialBalanceFormField {
  key: FieldKey;
  label: string;
  placeholder: string;
  // options come from API so we pass them later from the component
  options?: TrialBalanceType[] | string[];
}
export const MESSAGES = {
  SUCCESS: "Operation completed successfully",
  ERROR: "An error occurred. Please try again.",
  LOADING: "Loading...",
  CONFIRM_DELETE: "Are you sure you want to delete this item?",
};

// Trial Balance data source toggle.
// true  => use data/trialBalance.mock.ts
// false => use /trial-balance API
export const USE_TRIAL_BALANCE_MOCK = true;
export const USE_IC_ITEM_SOLVER_MOCK = true;

// Journal Entry data source toggle.
// true  => use data/journalEntry.mock.ts
// false => use /journal-entries and related APIs
export const USE_JOURNAL_ENTRY_MOCK = true;

// Investment Accounting data source toggle.
// true  => use mock data from data/journalEntry.mock.ts
// false => use live Investment Accounting APIs
export const USE_INVESTMENT_ACCOUNTING_MOCK = true;

// Balance Sheet Item Solver data source toggle.
// true  => use data/balanceSheetSolver.mock.ts
// false => use /balance-sheet-solver API
export const USE_BALANCE_SHEET_SOLVER_MOCK = true;

export const RESULT_CONTENT: Record<
  ResultVariant,
  {
    title: string;
    description: string;
    breadcrumb: string;
    statusLabel: string;
    toastTitle: string;
    toastDescription: string;
  }
> = {
  success: {
    title: "Journal Entry Output",
    description: "Review processed ledger entries before exporting to ERP.",
    breadcrumb: "Output",
    statusLabel: "Success",
    toastTitle: "Calculation Successful",
    toastDescription:
      "Agentic AI has finalized the ledger allocations based on the provided business rules.",
  },
  failure: {
    title: "JE Validation Results",
    description:
      "Review identified critical errors. Corrections are managed offline for this demo.",
    breadcrumb: "Error Details",
    statusLabel: "Validation Errors",
    toastTitle: "Calculation Failed - Validation Errors Found",
    toastDescription: "Please review the highlighted issues below.",
  },
};

const metrics: MetricCard[] = [
  {
    title: "Detection Accuracy",
    value: "TBD",
    delta: "",
    deltaPositive: true,
    description: "Confidence level of the R2A Agentic Engine.",
  },
  {
    title: "Total Net Impact",
    value: "-$1.24M",
    delta: undefined,
    deltaPositive: false,
    description: "Aggregated variance across flagged accounts.",
  },
  {
    title: "Rules Processed",
    value: "124",
    description: "Across 8,420 transaction line items.",
  },
];

const TRAIL_BALANCE_TYPE: TrialBalanceType[] = [
  { id: "V-1", name: "Version1", value: "V1" },
  { id: "V-2", name: "Version2", value: "V2" },
  { id: "V-3", name: "Version3", value: "V3" },
];

const PERIOD: TrialBalanceType[] = [
  { id: "P-DEC-2023", name: "December 2023", value: "12/2023" },
  { id: "P-NOV-2023", name: "November 2023", value: "11/2023" },
  { id: "P-OCT-2023", name: "October 2023", value: "10/2023" },
];

const TB_RESULT_CONTENT: Record<
  ResultVariant,
  {
    title?: string;
    description?: string;
    breadcrumb: string;
    statusLabel: string;
    toastTitle: string;
    toastDescription: string;
  }
> = {
  success: {
    breadcrumb: "Output",
    statusLabel: "Success",
    toastTitle: "Calculation Successful",
    toastDescription:
      "Agentic AI has finalized the trial balance based on the provided rules.",
  },
  failure: {
    breadcrumb: "Detection Results",
    statusLabel: "Validation Errors",
    toastTitle: "Anomalies Detected",
    toastDescription:
      "8 critical issues and 12 warnings require your attention.",
  },
};

export const TRIAL_BALANCE_FORM_FIELDS: TrialBalanceFormField[] = [
  {
    key: "legalEntity",
    label: "Legal Entity",
    placeholder: "Legal entity",
  },
  {
    key: "hierarchy",
    label: "Hierarchy",
    placeholder: "Hierarchy",
  },
  {
    key: "period",
    label: "Reporting Period Range",
    placeholder: "Reporting Period Range",
  },
  {
    key: "tbType",
    label: "Comparison Period Range",
    placeholder: "Comparison Period Range",
  },
];
const ACCOUNTING_CONFIG = {
  journalEntry: {
    title: "Journal Entry Output",
    description: "Review the results of the journal entry processing.",
    breadcrumb: "Journal Entry",
  },
  investmentAccounting: {
    title: "Investment Accounting Output",
    description:
      "Review processed investment accounting entries before exporting to ERP.",
    breadcrumb: "Investment Accounting",
  },
} as const;

const BS_WORKFLOW_CONFIG: WorkflowConfig = {
  steps: ["initializing", "validating", "processing", "finalizing"],
  messages: {
    initializing: {
      title: "Initializing Balance Sheet Solver",
      detail:
        "Setting up the balance sheet reconciliation process and preparing solver context.",
      rotatingMessages: [
        "Starting the balance sheet resolution session.",
        "Loading reconciliation rules and matching logic.",
        "Preparing balance sheet analysis environment.",
      ],
    },
    validating: {
      title: "Validating balance sheet data",
      detail:
        "Ensuring AP, GL, and trial balance data are aligned before reconciliation.",
      rotatingMessages: [
        "Validating accounts payable data.",
        "Checking general ledger consistency.",
        "Verifying trial balance completeness.",
      ],
    },
    processing: {
      title: "Processing balance sheet reconciliation",
      detail:
        "Comparing AP and GL balances, identifying differences, and analyzing discrepancies. This stage may take the longest.",
      rotatingMessages: [
        "Comparing AP balances with GL balances.",
        "Evaluating amount and date differences.",
        "Identifying unreconciled items.",
        "Applying reconciliation rules.",
        "Processing large balance sheet datasets. This may take a few minutes.",
      ],
    },
    analyzing: {
      title: "Analyzing balance sheet reconciliation",
      detail:
        "Examining patterns and insights from the reconciliation process.",
      rotatingMessages: [
        "Analyzing reconciliation patterns.",
        "Evaluating discrepancies and anomalies.",
        "Preparing insights and recommendations.",
      ],
    },
    finalizing: {
      title: "Finalizing balance sheet reconciliation",
      detail: "Preparing the reconciliation results and insights for review.",
      rotatingMessages: [
        "Organizing reconciled and unreconciled items.",
        "Finalizing reconciliation output.",
        "Completing the balance sheet solver process.",
      ],
    },
  },
};

const IC_WORKFLOW_CONFIG: WorkflowConfig = {
  steps: [
    "initializing",
    "validating",
    "processing",
    "analyzing",
    "finalizing",
  ],
  messages: {
    initializing: {
      title: "Initializing IC Item Resolver",
      detail:
        "Setting up the intercompany item resolution process and preparing reconciliation context.",
      rotatingMessages: [
        "Starting the intercompany resolution session.",
        "Loading reconciliation rules and matching logic.",
        "Preparing intercompany analysis environment.",
      ],
    },

    validating: {
      title: "Validating intercompany data",
      detail:
        "Ensuring intercompany invoices, accounts, and periods are aligned before resolution.",
      rotatingMessages: [
        "Validating supplier and counterparty data.",
        "Checking invoice and accounting period consistency.",
        "Verifying intercompany posting completeness.",
      ],
    },

    processing: {
      title: "Resolving intercompany items",
      detail:
        "Matching intercompany invoices, identifying mismatches, and applying resolution rules. This stage may take the longest.",
      rotatingMessages: [
        "Matching invoices between entities.",
        "Evaluating amount, date, and currency differences.",
        "Identifying unaccounted and missing invoices.",
        "Applying intercompany resolution rules.",
        "Processing large intercompany datasets. This may take a few minutes.",
      ],
    },

    analyzing: {
      title: "Analyzing resolution results",
      detail:
        "Reviewing unresolved intercompany items and preparing detailed explanations.",
      rotatingMessages: [
        "Classifying reconciliation mismatches.",
        "Preparing drill-down details for invoices.",
        "Compiling intercompany resolution insights.",
      ],
    },

    finalizing: {
      title: "Finalizing IC resolution",
      detail:
        "Preparing the intercompany resolution results and insights for review.",
      rotatingMessages: [
        "Organizing resolved and unresolved items.",
        "Finalizing intercompany resolution output.",
        "Completing the IC item resolution process.",
      ],
    },
  },
};

/** Workflow configuration for Journal Entry */
const JE_WORKFLOW_CONFIG: WorkflowConfig = {
  steps: [
    "initializing",
    "validating",
    "processing",
    "analyzing",
    "finalizing",
  ],
  messages: {
    initializing: {
      title: "Initializing AI agent",
      detail:
        "Preparing the workflow context and loading the execution pipeline.",
      rotatingMessages: [
        "Opening the orchestration session.",
        "Loading configuration for this journal entry run.",
        "Warming up the execution context.",
      ],
    },
    validating: {
      title: "Validating journal entries",
      detail: "Checking input completeness before the main workflow continues.",
      rotatingMessages: [
        "Reviewing required document attributes.",
        "Checking rule prerequisites before execution.",
        "Verifying the dataset is ready for processing.",
      ],
    },
    processing: {
      title: "Processing business rules",
      detail:
        "The workflow is applying sourcing, validation, and posting logic. This is usually the longest stage.",
      rotatingMessages: [
        "Evaluating rule branches for the selected document type.",
        "Comparing input records against workflow conditions.",
        "Resolving posting combinations and account mappings.",
        "Aggregating workflow output for downstream analysis.",
        "Still running. Large datasets can take several minutes here.",
      ],
    },
    analyzing: {
      title: "Analyzing posting records",
      detail:
        "Reviewing generated output and extracting the final workflow summary.",
      rotatingMessages: [
        "Inspecting the workflow response structure.",
        "Extracting posting results and summary signals.",
        "Preparing output records for the success screen.",
      ],
    },
    finalizing: {
      title: "Finalizing results",
      detail: "Fetching posting data and preparing the result experience.",
      rotatingMessages: [
        "Fetching posting records for display.",
        "Composing the result payload for navigation.",
        "Wrapping up the journal entry run.",
      ],
    },
  },
};

/** Workflow configuration for Trial Balance Anomaly Detection */
const TB_WORKFLOW_CONFIG: WorkflowConfig = {
  steps: [
    "initializing",
    "validating",
    "processing",
    "analyzing",
    "finalizing",
  ],
  errorMessages: {
    no_data: {
      title: "No Data Found For Selected Periods",
      message:
        "We could not find records for the selected company and period combination. Please choose another comparison/current period pair and try again.",
    },
  },
  messages: {
    initializing: {
      title: "Initializing AI agent",
      detail:
        "Preparing the anomaly detection workflow and loading the analysis pipeline.",
      rotatingMessages: [
        "Opening the analysis session.",
        "Loading anomaly detection rules.",
        "Warming up the execution context.",
      ],
    },
    validating: {
      title: "Validating trial balance data",
      detail:
        "Checking data completeness and consistency across periods before analysis.",
      rotatingMessages: [
        "Verifying company and account data.",
        "Validating period comparisons.",
        "Checking data integrity across datasets.",
      ],
    },
    processing: {
      title: "Analyzing anomalies",
      detail:
        "Comparing periods, detecting deviations, and running business rules. This stage typically takes the longest.",
      rotatingMessages: [
        "Comparing current period against historical data.",
        "Evaluating deviation thresholds and anomaly criteria.",
        "Processing posting detail analysis.",
        "Aggregating anomaly detection results.",
        "Still analyzing. Large datasets can take several minutes here.",
      ],
    },
    analyzing: {
      title: "Analyzing results",
      detail:
        "Reviewing detected anomalies and preparing detailed analysis output.",
      rotatingMessages: [
        "Extracting anomaly records and classifications.",
        "Preparing drill-down posting details.",
        "Compiling the analysis summary.",
      ],
    },
    finalizing: {
      title: "Finalizing analysis",
      detail: "Preparing the results dashboard and anomaly insights.",
      rotatingMessages: [
        "Organizing anomaly details for display.",
        "Finalizing the result payload.",
        "Completing the trial balance anomaly run.",
      ],
    },
  },
};

export {
  metrics,
  PERIOD,
  TRAIL_BALANCE_TYPE,
  TB_RESULT_CONTENT,
  ACCOUNTING_CONFIG,
  BS_WORKFLOW_CONFIG,
  IC_WORKFLOW_CONFIG,
  JE_WORKFLOW_CONFIG,
  TB_WORKFLOW_CONFIG,
};
