import type {
  ApiResponse,
  CreateJournalEntryRequest,
  IAProofOfWork,
  InvestmentAccountingInputData,
  JePostingRecord,
  JEProofOfWork,
  JournalEntriesPayload,
  JournalEntry,
} from "@/types";
import {
  USE_JOURNAL_ENTRY_MOCK,
  USE_INVESTMENT_ACCOUNTING_MOCK,
} from "@/utils/constants";
import axios from "axios";
import {
  InvestmentAccInputMockData,
  InvestmentAccJsonOutputData,
  InvestmentAccProofOfWork,
  journalEntryProofOfWork,
  journalEntryServiceMock,
} from "../../../data/journalEntry.mock";
import postingMock from "../../../data/response_posting.json";
import apiClient from "./client";
import { delay } from "./trialBalanceService";

const WORKFLOW_SUBMIT_ENDPOINT = "/api/workflow/submit";
const WORKFLOW_STATUS_ENDPOINT = "/api/workflow/status";
const POLL_INTERVAL_MS = 30000;

export type WorkflowInvocationErrorKind =
  | "timeout"
  | "cancelled"
  | "network"
  | "unknown";

export class JournalEntryWorkflowInvocationError extends Error {
  kind: WorkflowInvocationErrorKind;

  constructor(kind: WorkflowInvocationErrorKind, message: string) {
    super(message);
    this.name = "JournalEntryWorkflowInvocationError";
    this.kind = kind;
  }
}

interface InvestmentAccountingInputResponse {
  data: InvestmentAccountingInputData;
}

// Shared cache for /journal-entries to avoid duplicate concurrent requests.
let journalEntriesCache: JournalEntriesPayload | null = null;
let journalEntriesInFlight: Promise<JournalEntriesPayload> | null = null;

async function getJournalEntriesPayload(): Promise<JournalEntriesPayload> {
  if (USE_JOURNAL_ENTRY_MOCK) {
    const payload = journalEntryServiceMock as unknown as JournalEntriesPayload;
    journalEntriesCache = payload;
    return payload;
  }

  if (journalEntriesCache) return journalEntriesCache;
  if (journalEntriesInFlight) return journalEntriesInFlight;

  journalEntriesInFlight = (async () => {
    // Axios interceptor unwraps AxiosResponse; keep existing `response.data` usage.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await apiClient.get("/journal-entries");
    const payload = response.data as JournalEntriesPayload;
    journalEntriesCache = payload;
    return payload;
  })();

  try {
    return await journalEntriesInFlight;
  } finally {
    journalEntriesInFlight = null;
  }
}

async function fetchInvestmentAccountingInputData(): Promise<InvestmentAccountingInputResponse> {
  if (USE_INVESTMENT_ACCOUNTING_MOCK) {
    return {
      data: InvestmentAccInputMockData,
    };
  }

  return {
    data: {
      fund_statement: [],
      bank_statement: [],
      business_rules: [],
    },
  };
}

export interface JournalEntryWorkflowResult {
  success: boolean;
  payload: unknown;
  /** Human-readable summary extracted from the response (e.g. final_results). */
  summary?: string;
  /** Failure details extracted from the response, if any. */
  failureDetails?: string;
}

/**
 * Walk the serving-endpoint response to find a boolean success/status flag.
 *
 * The response shape is:
 *   { predictions: [{ result: "<stringified JSON with status: true/false>" }] }
 *
 * This function:
 *   1. Tries JSON.parse on string values (handles stringified payloads).
 *   2. Checks both "success" and "status" boolean fields.
 *   3. Recurses into common nested keys.
 */
function extractSuccessFlag(payload: unknown): boolean | undefined {
  if (payload == null) return undefined;

  // If it's a string, try to parse it as JSON first
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return extractSuccessFlag(parsed);
    } catch {
      return undefined;
    }
  }

  if (typeof payload !== "object") return undefined;

  const record = payload as Record<string, unknown>;

  // Check "success" boolean
  if (typeof record.success === "boolean") return record.success;
  // Check "status" boolean (serving endpoint uses this)
  if (typeof record.status === "boolean") return record.status;

  const commonNestedKeys = ["predictions", "data", "result", "outputs"];
  for (const key of commonNestedKeys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const nested = extractSuccessFlag(item);
        if (typeof nested === "boolean") return nested;
      }
    } else {
      const nested = extractSuccessFlag(candidate);
      if (typeof nested === "boolean") return nested;
    }
  }

  return undefined;
}

/**
 * Extract a human-readable summary from the deeply nested response.
 * Looks for "final_results" inside the stringified predictions[0].result.
 */
function extractSummary(payload: unknown): string | undefined {
  if (payload == null) return undefined;

  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return extractSummary(parsed);
    } catch {
      return undefined;
    }
  }

  if (typeof payload !== "object") return undefined;

  const record = payload as Record<string, unknown>;

  if (typeof record.final_results === "string") return record.final_results;

  const nestedKeys = ["predictions", "data", "result", "outputs"];
  for (const key of nestedKeys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const found = extractSummary(item);
        if (found) return found;
      }
    } else {
      const found = extractSummary(candidate);
      if (found) return found;
    }
  }

  return undefined;
}

function toWorkflowInvocationError(
  error: unknown,
): JournalEntryWorkflowInvocationError {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") {
      return new JournalEntryWorkflowInvocationError(
        "cancelled",
        "Journal entry run was cancelled before completion.",
      );
    }

    if (error.code === "ECONNABORTED") {
      return new JournalEntryWorkflowInvocationError(
        "timeout",
        "Journal entry run timed out. Please try again.",
      );
    }

    if (!error.response) {
      return new JournalEntryWorkflowInvocationError(
        "network",
        "Unable to reach the workflow service. Check your connection and retry.",
      );
    }

    return new JournalEntryWorkflowInvocationError(
      "unknown",
      "Workflow service returned an unexpected error.",
    );
  }

  return new JournalEntryWorkflowInvocationError(
    "unknown",
    "Unexpected issue while calling workflow service.",
  );
}

/** Resolve the correct mock flag based on the document type. */
const isDocumentMocked = (documentName: string): boolean =>
  documentName === "INVESTMENT_ACCOUNTING"
    ? USE_INVESTMENT_ACCOUNTING_MOCK
    : USE_JOURNAL_ENTRY_MOCK;

/**
 * Journal Entry Service
 * API calls for journal entry operations
 */

export const journalEntryService = {
  /**
   * Get all journal entries (input data + business rules + proof-of-work)
   */
  getJournalEntryRulesAndData: async () => {
    try {
      return await getJournalEntriesPayload();
    } catch (error) {
      console.error("getJournalEntryRulesAndData error:", error);
      throw error;
    }
  },

  /**
   * Fetch unique journal entry types (document_name) from business rules
   */
  fetchJournalEntryType: async () => {
    const response = await getJournalEntriesPayload();
    const rows = response?.business_rules_staging?.rows ?? [];
    return [
      ...new Set(
        rows
          .map((row) => row.document_name)
          .filter((value): value is string => typeof value === "string"),
      ),
    ];
  },

  fetchInvestmentAccountingInputData: async () => {
    const response = await fetchInvestmentAccountingInputData();
    return response?.data ?? [];
  },

  getInvestmentAccountingPostingData: async () => {
    if (USE_INVESTMENT_ACCOUNTING_MOCK) {
      await delay(3000);
      return InvestmentAccJsonOutputData;
    }
  },

  /**
   * Get single journal entry by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<JournalEntry>>(
      `/journal-entries/${id}`,
    );
    return response.data;
  },

  /**
   * Create new journal entry
   */
  create: async (data: CreateJournalEntryRequest) => {
    const response = await apiClient.post<ApiResponse<JournalEntry>>(
      "/journal-entries",
      data,
    );
    return response.data;
  },

  /**
   * Update existing journal entry
   */
  update: async (id: string, data: Partial<CreateJournalEntryRequest>) => {
    const response = await apiClient.put<ApiResponse<JournalEntry>>(
      `/journal-entries/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete journal entry
   */
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/journal-entries/${id}`,
    );
    return response.data;
  },

  /**
   * Run workflow via async submit + poll pattern.
   * Submits the job, then polls every 3s until completed or failed.
   * Supports cancellation via AbortController signal.
   */
  runWorkflow: async (
    documentName: string,
    signal?: AbortSignal,
  ): Promise<JournalEntryWorkflowResult> => {
    if (isDocumentMocked(documentName)) {
      return {
        success: true,
        payload: {
          source: "mock",
          success: true,
          documentName,
        },
      };
    }

    try {
      // 1. Submit the workflow task
      const submitResponse = await axios.post(
        WORKFLOW_SUBMIT_ENDPOINT,
        {
          dataframe_split: {
            columns: ["request", "document_name"],
            data: [["run_workflow", documentName]],
          },
        },
        {
          timeout: 30000,
          signal,
        },
      );

      const taskId: string = submitResponse.data.task_id;
      if (!taskId) {
        throw new JournalEntryWorkflowInvocationError(
          "unknown",
          "No task_id returned from workflow submit.",
        );
      }

      // 2. Poll for status until completed or failed
      while (true) {
        if (signal?.aborted) {
          throw new JournalEntryWorkflowInvocationError(
            "cancelled",
            "Journal entry run was cancelled before completion.",
          );
        }

        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, POLL_INTERVAL_MS);
          if (signal) {
            signal.addEventListener(
              "abort",
              () => {
                clearTimeout(timer);
                reject(
                  new JournalEntryWorkflowInvocationError(
                    "cancelled",
                    "Journal entry run was cancelled before completion.",
                  ),
                );
              },
              { once: true },
            );
          }
        });

        const statusResponse = await axios.get(
          `${WORKFLOW_STATUS_ENDPOINT}/${taskId}`,
          { timeout: 15000, signal },
        );

        const { status } = statusResponse.data;

        if (status === "completed") {
          const resultPayload = statusResponse.data.result;
          const success = extractSuccessFlag(resultPayload) ?? false;
          const summary = extractSummary(resultPayload);
          return {
            success,
            payload: resultPayload,
            summary,
            failureDetails: success
              ? undefined
              : summary ||
                "The workflow did not complete successfully. Please review the input data and business rules, then try again.",
          };
        }

        if (status === "failed") {
          const errorMsg =
            statusResponse.data.error || "Workflow execution failed.";
          throw new JournalEntryWorkflowInvocationError("unknown", errorMsg);
        }

        // status === "running" → continue polling
      }
    } catch (error) {
      if (error instanceof JournalEntryWorkflowInvocationError) {
        throw error;
      }
      throw toWorkflowInvocationError(error);
    }
  },

  /**
   * Fetch JE posting output data filtered by document_name.
   * Called after the agent workflow completes successfully.
   */
  getPostingData: async (documentName: string): Promise<JePostingRecord[]> => {
    if (USE_JOURNAL_ENTRY_MOCK) {
      return postingMock.data as JePostingRecord[];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await apiClient.get("/je/posting", {
      params: { document_name: documentName },
    });
    return (response.data ?? []) as JePostingRecord[];
  },
  getProofOfWorkData: async (documentName: string) => {
    if (documentName === "INVESTMENT_ACCOUNTING") {
      if (USE_INVESTMENT_ACCOUNTING_MOCK) {
        return InvestmentAccProofOfWork as IAProofOfWork[];
      }
    } else {
      if (USE_JOURNAL_ENTRY_MOCK) {
        return journalEntryProofOfWork.rows as JEProofOfWork[];
      }
    }
    const response: { data: unknown } = await apiClient.get(
      "/je/proof-of-work",
      {
        params: { document_name: documentName },
      },
    );
    return (response.data ?? []) as JEProofOfWork[];
  },
};
