// src/renderers/inputDataRenderers.tsx
"use client";

import type {
  InputDataRecord,
  InvestmentAccountingBankStatement,
  InvestmentAccountingFundStatement,
  InvestmentAccountingPostingRecord,
} from "@/types";
import type { JSX } from "react";

import { CATEGORY_COLORS, type BusinessRule } from "@/types";
import {
  cn,
  conditionsToSentence,
  extractSafeConditions,
  normalizeConditions,
  toSentenceInputs,
} from "@/lib/utils";

type IR = InputDataRecord;
type BR = BusinessRule;

type JournalRow =
  | InvestmentAccountingFundStatement
  | InvestmentAccountingBankStatement
  | BusinessRule
  | InvestmentAccountingPostingRecord;

export const inputDataRenderers: Record<string, (row: IR) => JSX.Element> = {
  dateBold: (row) => <span className="text-slate-800">{row.posting_date}</span>,

  costElementMaybe: (row) =>
    row.cost_element ? (
      <span>{row.cost_element}</span>
    ) : (
      <span className="text-slate-400 block text-center">-</span>
    ),

  controllingAreaMaybe: (row) =>
    row.controlling_area ? (
      <span>{row.controlling_area}</span>
    ) : (
      <span className="text-slate-400 block text-center">-</span>
    ),

  documentTypeMaybe: (row) =>
    row.document_type ? (
      <span>{row.document_type}</span>
    ) : (
      <span className="text-slate-400 block text-center">-</span>
    ),

  postingAmount: (row) => {
    const isDebit = row.debit_credit_indicator === "D";
    const amountColor = isDebit ? "text-emerald-700" : "text-rose-700";
    const amount = row.posting_amount;
    const hasAmount = typeof amount === "number" && !Number.isNaN(amount);

    return (
      <span className="inline-flex items-center gap-2">
        {hasAmount ? (
          <span className={`font-semibold ${amountColor}`}>
            {"$"}
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </span>
    );
  },
  gLAccountText: (row) => {
    return (
      <span className="text-blue-600 font-medium">{row.gl_account ?? "-"}</span>
    );
  },
  debitCreditBadge: (row) => {
    const isDebit = row.debit_credit_indicator === "D";
    const badgeColor = isDebit
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-rose-50 text-rose-700 ring-rose-200";

    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeColor}`}
      >
        {isDebit ? "DEBIT" : "CREDIT"}
      </span>
    );
  },
};

/** Renderers keyed by `rendererId` in BUSINESS_RULE_COLUMNS */
export const businessRuleRenderers: Record<string, (row: BR) => JSX.Element> = {
  ruleName: (row) => (
    <span className="font-medium text-slate-800">{row.title}</span>
  ),

  description: (row) => (
    <span className="text-slate-600">{row.description}</span>
  ),

  logicCondition: (row) => {
    const arr = extractSafeConditions(row.conditions);
    const inputs = toSentenceInputs(arr);
    const sentence = conditionsToSentence(inputs);
    return <p className="text-slate-600 leading-6">{sentence}</p>;
  },

  category: (row) => {
    const color =
      CATEGORY_COLORS[
        row.rule_type.toUpperCase() as keyof typeof CATEGORY_COLORS
      ];

    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold",
          color?.bg || "bg-gray-100",
          color?.text || "text-gray-700",
        )}
      >
        {color?.label || row.rule_type.toUpperCase()}
      </span>
    );
  },
};

/** Accessors keyed by `accessorId` in BUSINESS_RULE_COLUMNS */
export const businessRuleAccessors: Record<string, (row: BR) => unknown> = {
  title: (row) => row.title,
  description: (row) => row.description,
  ruleType: (row) => row.rule_type,
};

export const investmentAccountingRenders: Record<
  string,
  (row: JournalRow) => JSX.Element
> = {
  /* ========================== Fund Statement ========================== */

  fundTransactionDate: (row) => {
    const fundRow = row as InvestmentAccountingFundStatement;

    return <span className="text-slate-800">{fundRow.transaction_date}</span>;
  },

  fundAmount: (row) => {
    const record = row as InvestmentAccountingFundStatement;
    const amount = record.amount_inr;

    if (amount == null || String(amount) === "null") {
      return <span> </span>;
    }

    return (
      <span>
        {Number(amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    );
  },

  fundStampDuty: (row) => {
    const record = row as InvestmentAccountingFundStatement;
    const value = record.stamp_duty_charges;

    return (
      <span className="tabular-nums text-slate-700">
        {value != null && String(value) !== "null"
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : " "}
      </span>
    );
  },

  fundUnits: (row) => {
    const record = row as InvestmentAccountingFundStatement;
    const units = record.units;

    if (units == null || String(units) === "null") {
      return <span> </span>;
    }

    return (
      <span>
        {Number(units).toLocaleString("en-IN", { minimumFractionDigits: 3 })}
      </span>
    );
  },

  /* ========================== Bank Statement ========================== */

  bankBalance: (row) => {
    const bankRow = row as InvestmentAccountingBankStatement;
    const value = bankRow.balance;

    return (
      <span className="text-slate-800">
        {value != null && String(value) !== "null"
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : " "}
      </span>
    );
  },

  bankDeposits: (row) => {
    const bankRow = row as InvestmentAccountingBankStatement;
    const value = bankRow.deposits;

    return (
      <span>
        {value != null && String(value) !== "null"
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : " "}
      </span>
    );
  },

  bankWithdrawals: (row) => {
    const bankRow = row as InvestmentAccountingBankStatement;
    const value = bankRow.withdrawals;

    return (
      <span>
        {value != null && String(value) !== "null"
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : " "}
      </span>
    );
  },
  /* =========================== Business Rules ========================== */

  ruleName: (row) => {
    const rule = row as BusinessRule;

    return <span className="font-medium text-slate-800">{rule.title}</span>;
  },

  ruleConditions: (row) => {
    const rule = row as BusinessRule;

    const normalized = normalizeConditions(rule.conditions);
    const inputs = toSentenceInputs(normalized);
    const sentence = conditionsToSentence(inputs);

    return <p className="text-slate-600 leading-6">{sentence}</p>;
  },

  glAccountLink: (row) => {
    const investmentAccounting = row as InvestmentAccountingPostingRecord;
    return <span>{investmentAccounting.gl_account ?? "-"}</span>;
  },

  transactionDateBold: (row) => {
    const investmentAccounting = row as InvestmentAccountingPostingRecord;
    return (
      <span className="text-slate-800">
        {investmentAccounting.transaction_date}
      </span>
    );
  },

  debitCreditBadge: (row) => {
    const investmentAccounting = row as InvestmentAccountingPostingRecord;

    const isDebit = investmentAccounting.dr_cr === "DR";

    const badgeColor = isDebit
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-rose-50 text-rose-700 ring-rose-200";

    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeColor}`}
      >
        {isDebit ? "DEBIT" : "CREDIT"}
      </span>
    );
  },

  postingAmountOutput: (row) => {
    const record = row as InvestmentAccountingPostingRecord;
    const amount = record.posting_amount;

    if (amount == null || String(amount) === "null") {
      return <span> </span>;
    }

    const isDebit = record.dr_cr === "DR";

    return (
      <span
        className={cn(
          "font-semibold tabular-nums",
          isDebit ? "text-emerald-700" : "text-rose-700",
        )}
      >
        {Number(amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    );
  },

  ruleCategory: (row) => {
    const rule = row as BusinessRule;

    const color =
      CATEGORY_COLORS[
        rule.rule_type.toUpperCase() as keyof typeof CATEGORY_COLORS
      ];

    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold",
          color?.bg || "bg-gray-100",
          color?.text || "text-gray-700",
        )}
      >
        {color?.label || rule.rule_type.toUpperCase()}
      </span>
    );
  },
};
