import { MONTH_SHORT } from "@/lib/utils";

const formatNumber = (value: number) => {
  const num = Number(value) || 0;
  if (num === 0) return "0";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/** Converts PascalCase / camelCase / snake_case keys to spaced Title Case labels */
function toLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Extract document numbers from text like "Doc 190009190" or "doc 12345" */
function extractDocNumbers(text: string): number[] {
  const matches = text.matchAll(/doc\s*(\d+)/gi);
  return Array.from(matches, (match) => Number(match[1])).filter(
    Number.isFinite,
  );
}

const periodLabel = (period: number, year: number) =>
  `${MONTH_SHORT[period - 1]} ${year}`;

const periodValue = (period: number, year: number) => year * 100 + period;

const parsePeriodId = (periodId: string) => {
  const [periodRaw, yearRaw] = periodId.split("_");
  return {
    period: Number(periodRaw),
    year: Number(yearRaw),
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export {
  formatNumber,
  toLabel,
  extractDocNumbers,
  periodLabel,
  periodValue,
  parsePeriodId,
  formatCurrency,
};
