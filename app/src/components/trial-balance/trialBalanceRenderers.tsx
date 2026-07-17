"use client";

import { cn, amountClass, fmtAmount } from "@/lib/utils";
import type { TrialBalanceRecord } from "@/types";
import type { JSX } from "react";

type TR = TrialBalanceRecord;

export const trialBalanceRenderers: Record<string, (row: TR) => JSX.Element> = {
  reportingPeriod: (row) => (
    <span
      className={cn(
        "font-semibold",
        amountClass(row.reporting_period_amount_in_local_currency),
      )}
    >
      {fmtAmount(row.reporting_period_amount_in_local_currency)}
    </span>
  ),

  comparisonPeriod: (row) => (
    <span
      className={cn(
        "font-semibold",
        amountClass(row.comparison_period_amount_in_local_currency),
      )}
    >
      {fmtAmount(row.comparison_period_amount_in_local_currency)}
    </span>
  ),

  varianceAmount: (row) => (
    <span
      className={cn(
        "font-semibold",
        amountClass(row.deviation_amount_in_local_currency),
      )}
    >
      {fmtAmount(row.deviation_amount_in_local_currency)}
    </span>
  ),
};

const makeAmountRenderer =
  (field: keyof TrialBalanceRecord) => (row: TrialBalanceRecord) => {
    const value = row[field];
    return (
      <span className={cn("font-semibold", amountClass(value))}>
        {fmtAmount(value)}
      </span>
    );
  };

export const trialBalanceKeyRenderers: Record<
  string,
  (row: TrialBalanceRecord) => JSX.Element
> = {
  reportingPeriod: makeAmountRenderer(
    "reporting_period_amount_in_local_currency",
  ),
  comparisonPeriod: makeAmountRenderer(
    "comparison_period_amount_in_local_currency",
  ),
  varianceAmount: makeAmountRenderer("deviation_amount_in_local_currency"),
};
