import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  Condition,
  ConditionInput,
  Operator,
  Primitive,
  PrimitiveArray,
} from "./conditions";

export type LabelValue = { label: string; value: string };
type DateOption = { id: string; name: string; value: string };
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function normalizeKey(key: string) {
  return key
    .trim()
    .replace(/([A-Z])/g, "_$1") // camelCase → snake_case
    .replace(/__+/g, "_") // remove double underscores
    .replace(/^_/, "") // remove leading underscore
    .toLowerCase();
}

function parseBetweenValue(
  raw: Primitive | PrimitiveArray,
): PrimitiveArray | null {
  // If it's already an array with at least two elements, return first two
  if (Array.isArray(raw)) {
    const a = raw[0];
    const b = raw[1];
    if (a != null && b != null) return [a, b];
    return null;
  }

  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;

  if (s.includes("AND")) {
    const parts = s.split(/AND/i).map((x) => x.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return [parts[0], parts[1]];
    }
  }

  // 1) Try JSON parse directly (if double quoted array)
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const maybeArr = JSON.parse(s);
      if (Array.isArray(maybeArr) && maybeArr.length >= 2) {
        return [maybeArr[0], maybeArr[1]];
      }
    } catch {
      // 2) Try to normalize single quotes -> double quotes and parse again
      try {
        const normalized = s.replace(
          /'([^']*)'/g,
          (_, inner) => `"${inner.replace(/"/g, '\\"')}"`,
        );
        const maybeArr2 = JSON.parse(normalized);
        if (Array.isArray(maybeArr2) && maybeArr2.length >= 2) {
          return [maybeArr2[0], maybeArr2[1]];
        }
      } catch {
        // ignore and continue
      }
    }
  }

  // 3) Try common separators: "a - b", "a ~ b", "a to b"
  {
    const sepMatch = s.match(/^\s*(.+?)\s*(?:-|–|—|~|to)\s*(.+?)\s*$/i);
    if (sepMatch) {
      const a = sepMatch[1]?.trim();
      const b = sepMatch[2]?.trim();
      if (a && b) return [a, b];
    }
  }

  // 4) Try comma separated: "a, b"
  {
    const parts = s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (parts.length >= 2) return [parts[0], parts[1]];
  }

  // 5) Fallbacks for numeric-only scenarios:
  const numTokens = s.match(/-?\d+(?:\.\d+)?/g);
  if (numTokens && numTokens.length >= 2) {
    return [numTokens[0], numTokens[1]];
  }

  return null;
}

function formatBetweenSentence(field: string, a: Primitive, b: Primitive) {
  // You could add date normalization here if you want (e.g., 01.01.2025 -> Jan 01, 2025),
  // but it’s often better to show the user’s original tokens:
  return `${field} is between ${a} and ${b}`;
}

export function normalizeConditions(
  conditions: string | Condition[],
): Condition[] {
  if (Array.isArray(conditions)) {
    return conditions;
  }

  // string → converted to a synthetic Condition
  return [
    {
      field: null,
      operator: null,
      value: conditions,
    },
  ];
}

/** Type guard: narrow a loose Condition to the strict ConditionInput */
function isConditionInput(c: Condition): c is ConditionInput {
  return (
    typeof c.field === "string" &&
    c.field.trim() !== "" &&
    typeof c.operator === "string" &&
    c.operator.length > 0 &&
    c.value !== null &&
    c.value !== undefined
  );
}

/** Adapter: filter and narrow Condition[] → ConditionInput[] */
export function toSentenceInputs(conds: Condition[]): ConditionInput[] {
  return conds.filter(isConditionInput);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Try to parse a JSON-ish array string (accepts single quotes) into a PrimitiveArray.
 */
function tryParseJsonishArray(s: string): PrimitiveArray | null {
  const t = s.trim();
  if (!(t.startsWith("[") && t.endsWith("]"))) return null;
  try {
    const normalized = t.replace(/'/g, '"');
    const arr: unknown = JSON.parse(normalized);
    return Array.isArray(arr)
      ? (arr as unknown[]).map(coerceToPrimitive)
      : null;
  } catch {
    return null;
  }
}

/** Coerce `unknown` to a safe Primitive where possible; otherwise, stringify. */
function coerceToPrimitive(x: unknown): Primitive {
  if (x === null) return null;
  const t = typeof x;
  if (t === "string" || t === "number" || t === "boolean")
    return x as Primitive;
  // As a fallback, stringify complex shapes to keep function total.
  // If you'd rather drop them, return null instead.
  return String(x);
}

/**
 * If the array is entirely numeric-like (string numbers or numbers),
 * coerce all to numbers; else leave them as Primitive.
 */
function coerceNumericArrayIfAllNumeric(arr: PrimitiveArray): PrimitiveArray {
  const allNumeric = arr.every(
    (x) =>
      typeof x === "number" ||
      (typeof x === "string" && /^\d+(\.\d+)?$/.test(x)),
  );
  return allNumeric
    ? arr.map((x) => (typeof x === "number" ? x : Number(x)))
    : arr;
}

/**
 * Parse "array-like" value strings robustly:
 * - Handles complete arrays: "[...]" (single or double quotes inside).
 * - Recovers broken arrays like "['2500000" by scanning ahead within lookaheadWindow.
 * - Returns null if not an array-like value.
 */
function parseBracketsToArray(
  originalRaw: string,
  blockStartIndex: number,
  blockText: string,
  valueRaw: string,
  lookaheadWindow = 300,
): PrimitiveArray | null {
  if (!valueRaw) return null;

  const trimmed = valueRaw.trim();

  // If already looks like a complete array -> parse straightforwardly
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const parsed = tryParseJsonishArray(trimmed);
    return parsed ? coerceNumericArrayIfAllNumeric(parsed) : null;
  }

  // If it starts with "[" but missing a closing "]", try to recover from nearby text
  if (trimmed.startsWith("[") && !trimmed.endsWith("]")) {
    const start = blockStartIndex;
    const lookahead = originalRaw.slice(
      start,
      start + blockText.length + lookaheadWindow,
    );

    // Try to find a well-formed bracket list anywhere in the lookahead
    const m = lookahead.match(
      /\[\s*(?:(?:"[^"]*"|'[^']*'|[\d.]+)\s*,\s*)*(?:"[^"]*"|'[^']*'|[\d.]+)\s*\]/,
    );
    if (m) {
      const recovered = tryParseJsonishArray(m[0]);
      return recovered ? coerceNumericArrayIfAllNumeric(recovered) : null;
    }
  }

  return null;
}

/**
 * Robustly extract the value token after "value": ... inside a block string `b`.
 * It finds the colon after the "value" key, then scans:
 * - bracketed arrays [] (handles commas safely),
 * - quoted strings '' or "" (handles commas safely),
 * - primitives until comma or }.
 */
function extractValueToken(b: string): string | null {
  const keyMatch = b.match(/["']value["']\s*:/);
  if (!keyMatch) return null;
  const afterKeyIdx = keyMatch.index! + keyMatch[0].length;

  // Skip whitespace
  let i = afterKeyIdx;
  while (i < b.length && /\s/.test(b[i])) i++;

  if (i >= b.length) return null;

  const startChar = b[i];

  // Case 1: Bracketed array
  if (startChar === "[") {
    let depth = 0;
    let j = i;
    while (j < b.length) {
      const ch = b[j];
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          // include closing ]
          j++;
          return b.slice(i, j).trim();
        }
      }
      j++;
    }
    // If we didn't find a matching closing ], return what we have (broken array)
    return b.slice(i).trim();
  }

  // Case 2: Quoted string
  if (startChar === "'" || startChar === '"') {
    const quote = startChar;
    let j = i + 1;
    while (j < b.length) {
      const ch = b[j];
      if (ch === "\\" && j + 1 < b.length) {
        j += 2; // skip escaped char
        continue;
      }
      if (ch === quote) {
        j++;
        return b.slice(i, j).trim();
      }
      j++;
    }
    // Unterminated quote: return rest
    return b.slice(i).trim();
  }

  // Case 3: Primitive (null/None/number/identifier) — read until comma or end of object
  let j = i;
  while (j < b.length && b[j] !== "," && b[j] !== "}") j++;
  return b.slice(i, j).trim();
}

/**
 * Safely convert a raw-parsed token to the final `Condition["value"]` type.
 * - If looks like array -> parse to PrimitiveArray (with numeric coercion if applicable).
 * - If quoted -> strip quotes -> string.
 * - If numeric-like -> number.
 * - If "null" or "None" -> null.
 * - Else -> string as-is.
 */
function normalizeValueToken(
  originalRaw: string,
  blockIndex: number,
  blockText: string,
  valueRaw: string | null,
  operator: Operator | null,
): Primitive | PrimitiveArray | null {
  if (valueRaw === null) return null;
  if (valueRaw === "None") return null;

  // If value contains/starts with [ ], parse as array
  if (valueRaw.includes("[")) {
    const parsedArray = parseBracketsToArray(
      originalRaw,
      blockIndex,
      blockText,
      valueRaw,
    );
    if (parsedArray) return parsedArray;
  }

  let v: string = valueRaw.trim();

  // Strip wrapping quotes for non-array
  if (!v.startsWith("[")) {
    v = v.replace(/^['"]/, "").replace(/['"]$/, "");
  }

  // BETWEEN quick rescue for edge broken arrays (kept for compatibility)
  if (
    operator?.toUpperCase() === "BETWEEN" &&
    valueRaw.startsWith("[") &&
    !valueRaw.endsWith("]")
  ) {
    const lookahead = originalRaw.slice(
      blockIndex,
      blockIndex + blockText.length + 200,
    );
    const m = lookahead.match(
      /\[\s*['"]?([\d.]+)['"]?\s*,\s*['"]?([\d.]+)['"]?\s*\]/,
    );
    if (m) {
      return [m[1], m[2]].map((x) =>
        /^\d+(\.\d+)?$/.test(x) ? Number(x) : (x as Primitive),
      );
    }
  }

  // null-like
  if (v.toLowerCase() === "null") return null;

  // number-like
  if (/^\d+(\.\d+)?$/.test(v)) return Number(v);

  // boolean-like
  if (v.toLowerCase() === "true") return true;
  if (v.toLowerCase() === "false") return false;

  // default string
  return v;
}

export const extractSafeConditions = (
  raw?: string | unknown[],
): Condition[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    // If the caller already sent structured data, try to coerce to Condition[]
    return (raw as unknown[]).map((r): Condition => {
      const obj = (r ?? {}) as Record<string, unknown>;
      const field =
        typeof obj.field === "string"
          ? obj.field
          : obj.field == null
            ? null
            : String(obj.field);
      const operator =
        typeof obj.operator === "string" ? (obj.operator as Operator) : null;

      const v = obj.value as unknown;
      let value: Primitive | PrimitiveArray | null = null;
      if (Array.isArray(v)) {
        value = v.map(coerceToPrimitive);
      } else if (v === null || v === undefined) {
        value = null;
      } else {
        value = coerceToPrimitive(v);
      }
      return { field, operator, value };
    });
  }
  if (typeof raw !== "string") return [];

  // Cut off trailing garbage after last } or ]
  const end = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
  const sliced = end >= 0 ? raw.slice(0, end + 1) : raw;

  // Extract each { ... } block
  const blocks = sliced.match(/{[^}]*}/g);
  if (!blocks) return [];

  const out: Condition[] = [];
  let searchFrom = 0; // to find each block's position progressively

  for (const b of blocks) {
    const blockIndex = sliced.indexOf(b, searchFrom);
    if (blockIndex >= 0) searchFrom = blockIndex + b.length;

    const field = b.match(/["']field["']\s*:\s*["']([^"']+)["']/)?.[1] ?? null;
    const operatorRaw =
      b.match(/["']operator["']\s*:\s*["']([^"']+)["']/)?.[1] ?? null;

    const valueRaw = extractValueToken(b);
    const op = operatorRaw ? (operatorRaw.toUpperCase() as Operator) : null;

    const value = normalizeValueToken(sliced, blockIndex, b, valueRaw, op);

    out.push({ field, operator: op, value });
  }

  return out;
};

export function conditionsToSentence(
  conditions: {
    field: string;
    operator: "BETWEEN" | "RELATIVE_DATE" | "=" | "!=" | "IN" | string;
    value: Primitive | PrimitiveArray;
  }[],
) {
  return (
    conditions
      .map((c) => {
        const field = c.field.replace(/_/g, " ").toUpperCase();
        const op = c.operator;
        const value: Primitive | PrimitiveArray = c.value;

        if (op === "BETWEEN") {
          const parsed = parseBetweenValue(value);
          if (parsed && parsed.length >= 2) {
            const [a, b] = parsed;
            return formatBetweenSentence(field, a, b);
          }
          // If parsing failed, still show a reasonable string:
          if (Array.isArray(value) && value.length >= 2) {
            return formatBetweenSentence(field, value[0], value[1]);
          }
          return `${field} BETWEEN ${typeof value === "string" ? value : JSON.stringify(value)}`;
        }

        if (op === "RELATIVE_DATE" && typeof value === "string") {
          return `${field} is in ${value.replace(/_/g, " ")}`;
        }

        // Default (=, !=, IN...)
        return `${field} ${op} ${
          Array.isArray(value) ? `[${value.join(", ")}]` : value
        }`;
      })
      .join(" AND ") + "."
  );
}

export function formatFiscalLabel(
  dateISO: string,
  fiscalYearStartMonth = 0,
): string {
  const d = new Date(dateISO + "T00:00:00Z");
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${dateISO}`);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const shifted = (m - fiscalYearStartMonth + 12) % 12;
  const q = Math.floor(shifted / 3) + 1;
  return `${MONTHS[m]} ${y} (Q${q})`;
}

export function rowsToLabelValue(
  rows: Array<{ posting_date?: string }>,
  fiscalYearStartMonth = 0,
): LabelValue[] {
  return rows
    .filter((r) => !!r.posting_date)
    .map((r) => ({
      label: formatFiscalLabel(r.posting_date!, fiscalYearStartMonth),
      value: r.posting_date!,
    }));
}

export function getUniqueByField<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
) {
  return [...new Set(rows.map((r) => r[field]).filter(Boolean))];
}

/** Optional: map business fields to actual row fields */
const FIELD_ALIASES: Record<string, string> = {
  // cost_element: "cost_element",
  // add more if needed
};

/** Normalize operator text (handles HTML-escaped) */
function normalizeOperator(op: string): Operator {
  const map: Record<string, Operator> = {
    "&lt;": "<",
    "&lt;=": "<=",
    "&gt;": ">",
    "&gt;=": ">=",
  };
  const o = (op || "").trim().toUpperCase();
  return (map[op] as Operator) ?? (map[o] as Operator) ?? (op as Operator);
}

/** Get row value using aliases; supports shallow fields (no deep path here) */
function getRowValue(row: Record<string, unknown>, field: string): unknown {
  const realField = FIELD_ALIASES[field] ?? field;
  return row[realField];
}

/** Is the value numeric-like (number or numeric string)? */
function isNumericLike(x: unknown): boolean {
  return (
    typeof x === "number" ||
    (typeof x === "string" && /^\d+(\.\d+)?$/.test(x.trim()))
  );
}

/** Try to coerce to number if numeric-like; otherwise return original */
function coerceNumberIfNumericLike<T>(x: T): number | T {
  if (isNumericLike(x)) return Number(x as unknown);
  return x;
}

/** Compare with auto numeric coercion; fallback to string comparison */
function compare(a: unknown, b: unknown): number {
  const aNum = coerceNumberIfNumericLike(a);
  const bNum = coerceNumberIfNumericLike(b);
  if (typeof aNum === "number" && typeof bNum === "number") {
    return aNum - bNum;
  }
  const aStr = String(a ?? "");
  const bStr = String(b ?? "");
  return aStr.localeCompare(bStr);
}

/** SQL-like pattern match: % → any*, _ → any single char; case-insensitive by default */
function likeMatch(
  target: unknown,
  pattern: unknown,
  caseInsensitive = true,
): boolean {
  if (target == null || pattern == null) return false;
  let t = String(target);
  let p = String(pattern);
  if (caseInsensitive) {
    t = t.toLowerCase();
    p = p.toLowerCase();
  }
  // Escape regex specials, then replace SQL wildcards
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    "^" + esc(p).replace(/%/g, ".*").replace(/_/g, ".") + "$",
  );
  return regex.test(t);
}

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !isNaN(d.getTime());
}

/** Parse ISO or DD.MM.YYYY date formats safely */
function coerceDateIfDateLike(v: unknown): Date | null {
  if (v == null) return null;

  // Already a Date
  if (v instanceof Date) {
    return isValidDate(v) ? v : null;
  }

  if (typeof v === "number") {
    const d = new Date(v);
    return isValidDate(d) ? d : null;
  }

  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;

    const ddm = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (ddm) {
      const dd = Number(ddm[1]);
      const mm = Number(ddm[2]) - 1; // 0-based
      const yyyy = Number(ddm[3]);
      const d = new Date(yyyy, mm, dd);
      return isValidDate(d) ? d : null;
    }

    const iso = new Date(s);
    if (isValidDate(iso)) return iso;
  }

  return null;
}

function between(val: unknown, min: unknown, max: unknown): boolean {
  // 1) Try dates (inclusive)
  const vDate = coerceDateIfDateLike(val);
  const minDate = coerceDateIfDateLike(min);
  const maxDate = coerceDateIfDateLike(max);
  if (vDate && minDate && maxDate) {
    const t = vDate.getTime();
    return t >= minDate.getTime() && t <= maxDate.getTime();
  }

  // 2) Try numbers (inclusive)
  const vNum = coerceNumberIfNumericLike(val);
  const minNum = coerceNumberIfNumericLike(min);
  const maxNum = coerceNumberIfNumericLike(max);
  if (
    typeof vNum === "number" &&
    typeof minNum === "number" &&
    typeof maxNum === "number"
  ) {
    return vNum >= minNum && vNum <= maxNum;
  }

  // 3) Fallback to strings (inclusive, lexicographic)
  const vStr = String(val ?? "");
  const minStr = String(min ?? "");
  const maxStr = String(max ?? "");
  return vStr >= minStr && vStr <= maxStr;
}

function toArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;

  if (typeof v === "string") {
    const s = v.trim();

    // 1) BETWEEN format: "A AND B"
    const parts = s.split(/\s+AND\s+/i);
    if (parts.length === 2) {
      return parts.map((p) => p.trim());
    }

    // 2) JSON array
    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        return JSON.parse(s.replace(/'/g, '"').replace(/,\s*]/g, "]"));
      } catch {
        const inner = s.slice(1, -1).trim();
        if (!inner) return [];
        return inner
          .split(",")
          .map((p) => p.trim().replace(/^['"]|['"]$/g, ""));
      }
    }

    // 3) Comma-separated
    if (s.includes(",")) {
      return s.split(",").map((p) => p.trim());
    }

    // 4) Scalar string
    return [s];
  }

  if (v == null) return [];
  return [v];
}

/** Parse a 'YYYY-MM-DD' (or ISO) to UTC midnight */
function toUtcDate(d: unknown): Date | null {
  if (typeof d !== "string") return null;
  const dt = new Date(`${d}T00:00:00Z`);
  return isNaN(dt.getTime()) ? null : dt;
}

type DateRange = { start: Date; end: Date };

function startOfUTCYear(dt = new Date()): Date {
  return new Date(Date.UTC(dt.getUTCFullYear(), 0, 1, 0, 0, 0));
}
function endOfUTCYear(dt = new Date()): Date {
  return new Date(Date.UTC(dt.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
}
function startOfUTCMonth(dt = new Date()): Date {
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), 1, 0, 0, 0));
}
function endOfUTCMonth(dt = new Date()): Date {
  return new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
}

function startOfUTCDay(dt = new Date()): Date {
  return new Date(
    Date.UTC(
      dt.getUTCFullYear(),
      dt.getUTCMonth(),
      dt.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function endOfUTCDay(dt = new Date()): Date {
  return new Date(
    Date.UTC(
      dt.getUTCFullYear(),
      dt.getUTCMonth(),
      dt.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

// ISO week (Mon–Sun). Start = Monday 00:00:00.000, End = Sunday 23:59:59.999
function startOfUTCISOWeek(dt = new Date()): Date {
  const d = new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()),
  );
  const day = d.getUTCDay() || 7; // Sunday=0 -> 7
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return startOfUTCDay(d);
}
function endOfUTCISOWeek(dt = new Date()): Date {
  const start = startOfUTCISOWeek(dt);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return endOfUTCDay(end);
}

// Quarters (0-based months): Q1=Jan(0)..Mar(2), Q2=Apr(3)..Jun(5), etc.
function startOfUTCQuarter(dt = new Date()): Date {
  const qStartMonth = Math.floor(dt.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(dt.getUTCFullYear(), qStartMonth, 1, 0, 0, 0, 0));
}
function endOfUTCQuarter(dt = new Date()): Date {
  const qStartMonth = Math.floor(dt.getUTCMonth() / 3) * 3;
  return new Date(
    Date.UTC(dt.getUTCFullYear(), qStartMonth + 3, 0, 23, 59, 59, 999),
  );
}

// Additive helpers (UTC-safe by constructing via UTC fields)
function addUTCDays(dt: Date, days: number): Date {
  const d = new Date(
    Date.UTC(
      dt.getUTCFullYear(),
      dt.getUTCMonth(),
      dt.getUTCDate(),
      dt.getUTCHours(),
      dt.getUTCMinutes(),
      dt.getUTCSeconds(),
      dt.getUTCMilliseconds(),
    ),
  );
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function addUTCMonths(dt: Date, months: number): Date {
  return new Date(
    Date.UTC(
      dt.getUTCFullYear(),
      dt.getUTCMonth() + months,
      dt.getUTCDate(),
      dt.getUTCHours(),
      dt.getUTCMinutes(),
      dt.getUTCSeconds(),
      dt.getUTCMilliseconds(),
    ),
  );
}

/** Build range for supported RELATIVE_DATE tokens */
function getRelativeDateRange(
  token: string,
  now = new Date(),
): DateRange | null {
  const t = token.toLowerCase().trim();

  // Existing tokens (unchanged)
  if (t === "current_year") {
    return { start: startOfUTCYear(now), end: endOfUTCYear(now) };
  }
  if (t === "current_month") {
    return { start: startOfUTCMonth(now), end: endOfUTCMonth(now) };
  }
  if (t === "last_month") {
    const prev = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );
    return { start: startOfUTCMonth(prev), end: endOfUTCMonth(prev) };
  }
  if (t === "last_3_months") {
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1),
    );
    return { start: startOfUTCMonth(start), end: endOfUTCMonth(now) };
  }
  if (t === "ytd") {
    return { start: startOfUTCYear(now), end: now };
  }
  if (t === "mtd") {
    return { start: startOfUTCMonth(now), end: now };
  }

  // 🔹 New tokens

  // Day-based
  if (t === "today") {
    return { start: startOfUTCDay(now), end: now }; // or endOfUTCDay(now) if you prefer full day
  }
  if (t === "yesterday") {
    const y = addUTCDays(startOfUTCDay(now), -1);
    return { start: startOfUTCDay(y), end: endOfUTCDay(y) };
  }
  if (t === "last_7_days") {
    const start = addUTCDays(startOfUTCDay(now), -6); // includes today -> 7 days total
    return { start, end: endOfUTCDay(now) };
  }
  if (t === "last_30_days") {
    const start = addUTCDays(startOfUTCDay(now), -29);
    return { start, end: endOfUTCDay(now) };
  }
  if (t === "last_365_days") {
    const start = addUTCDays(startOfUTCDay(now), -364);
    return { start, end: endOfUTCDay(now) };
  }

  // Week-based (ISO week: Mon–Sun)
  if (t === "current_week" || t === "this_week") {
    return { start: startOfUTCISOWeek(now), end: endOfUTCISOWeek(now) };
  }
  if (t === "last_week") {
    const prevWeek = addUTCDays(startOfUTCISOWeek(now), -7);
    return {
      start: startOfUTCISOWeek(prevWeek),
      end: endOfUTCISOWeek(prevWeek),
    };
  }
  if (t === "wtd") {
    // Week-to-date (Mon 00:00:00.000 → now)
    return { start: startOfUTCISOWeek(now), end: now };
  }

  // Quarter-based
  if (t === "current_quarter" || t === "this_quarter") {
    return { start: startOfUTCQuarter(now), end: endOfUTCQuarter(now) };
  }
  if (t === "last_quarter") {
    const prevQ = addUTCMonths(startOfUTCQuarter(now), -3);
    return { start: startOfUTCQuarter(prevQ), end: endOfUTCQuarter(prevQ) };
  }
  if (t === "qtd") {
    // Quarter-to-date
    return { start: startOfUTCQuarter(now), end: now };
  }

  // Month spans
  if (t === "next_month") {
    const nm = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    return { start: startOfUTCMonth(nm), end: endOfUTCMonth(nm) };
  }
  if (t === "last_12_months") {
    // Full-month semantics: from the 1st of (current month - 11) to end of current month
    const startMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
    );
    return { start: startOfUTCMonth(startMonth), end: endOfUTCMonth(now) };
  }

  // Rolling month window alternative (if you prefer true 12-month window ending today):
  // if (t === "rolling_12_months") {
  //   const start = addUTCMonths(now, -12);
  //   return { start, end: now };
  // }

  // Half-year
  if (t === "last_6_months") {
    const startMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
    );
    return { start: startOfUTCMonth(startMonth), end: endOfUTCMonth(now) };
  }

  // Fallback
  return null;
}

/** Check if a row's date falls within a relative range (inclusive) */
function inRelativeDateRange(
  rowDate: unknown,
  token: string,
  now = new Date(),
): boolean {
  const dt = toUtcDate(rowDate);
  if (!dt) return false;
  const range = getRelativeDateRange(token, now);
  if (!range) return false;
  return (
    dt.getTime() >= range.start.getTime() && dt.getTime() <= range.end.getTime()
  );
}

function contains(haystack: unknown, needle: unknown): boolean {
  if (haystack == null || needle == null) return false;

  // If haystack is an array → check each element
  if (Array.isArray(haystack)) {
    const n = String(needle).toLowerCase();
    return haystack.some((item: unknown) =>
      String(item).toLowerCase().includes(n),
    );
  }

  // Primitives / objects (including Date) → compare as strings
  const H = String(haystack).toLowerCase();
  const N = String(needle).toLowerCase();
  return H.includes(N);
}

function findRowField(
  row: Record<string, unknown>,
  field: string,
): string | null {
  const lower = field.toLowerCase();
  for (const key of Object.keys(row)) {
    if (key.toLowerCase() === lower) return key;
  }
  return null;
}

/** Uses your ConditionInput type from earlier code */
export function evaluateCondition(
  row: Record<string, unknown>,
  cond: ConditionInput,
): boolean {
  const op = normalizeOperator(cond.operator);

  const field = cond.field.toLowerCase();

  const rowVal = getRowValue(row, field);

  const realField = findRowField(row, field);
  if (!realField) {
    return true;
  }

  // ANY: always true (treat as "no-op" filter)
  if (op === "ANY") return true;

  switch (op) {
    case "=":
      return String(rowVal) === String(cond.value);

    case "!=":
      return String(rowVal) !== String(cond.value);

    case "<":
      return compare(rowVal, cond.value) < 0;

    case "<=":
      return compare(rowVal, cond.value) <= 0;

    case ">":
      return compare(rowVal, cond.value) > 0;

    case ">=":
      return compare(rowVal, cond.value) >= 0;

    case "IN": {
      const arr = toArray(cond.value);
      if (arr.length === 0) return false;
      return arr.some((v) => String(v) === String(rowVal));
    }

    case "NOT IN": {
      const arr = toArray(cond.value);
      if (arr.length === 0) return true;
      return arr.every((v) => String(v) !== String(rowVal));
    }

    case "BETWEEN": {
      const arr = toArray(cond.value);
      if (arr.length < 2) return false;
      const [min, max] = arr;
      return between(rowVal, min, max);
    }

    case "LIKE":
      return likeMatch(rowVal, cond.value);

    case "NOT LIKE":
      return !likeMatch(rowVal, cond.value);

    case "RELATIVE_DATE": {
      const token = String(cond.value ?? "");
      return inRelativeDateRange(rowVal, token);
    }

    case "CONTAINS":
      return contains(rowVal, cond.value);

    default:
      // Unknown operator → treat as no match (or return true if you prefer lenient)
      return false;
  }
}

export function filterRowsByConditions<T extends object>(
  rows: T[],
  conditions: Condition[],
): T[] {
  const inputs = toSentenceInputs(conditions);
  if (inputs.length === 0) return rows;
  return rows.filter((row) =>
    inputs.every((cond) =>
      evaluateCondition(row as Record<string, unknown>, cond),
    ),
  );
}

// Small helpers (you can move these outside the component scope)
export const num = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export const fmtAmount = (v: unknown): string => {
  const n = num(v);
  if (n === null) return "-";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const amountClass = (v: unknown): string => {
  const n = num(v);
  if (n === null) return "text-slate-400"; // missing
  if (n > 0) return "text-emerald-700"; // positive
  if (n < 0) return "text-rose-700"; // negative
  return "text-slate-700"; // exactly zero
};

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function toMonthYearOptions(
  dates: string[],
  locale = "en-US",
): DateOption[] {
  return dates
    .filter(Boolean) // remove null/undefined/empty
    .map((iso) => {
      // Use UTC to avoid local timezone shifting dates
      const d = new Date(iso);
      const month = d.toLocaleString(locale, {
        month: "long",
        timeZone: "UTC",
      });
      const year = d.toLocaleString(locale, {
        year: "numeric",
        timeZone: "UTC",
      });
      const name = `${month} ${year}`;
      return { id: iso, name, value: iso };
    });
}

export function toMonthYearOption(years: number[], periods: number[]) {
  // Sort years descending
  const sortedYears = [...years].sort((a, b) => b - a);

  const combined: { value: string; name: string; id: string }[] = [];

  sortedYears.forEach((year) => {
    periods.forEach((period) => {
      const monthName = MONTHS[period - 1];

      const label = `${year} - ${monthName}`;

      combined.push({
        value: `${year}-${String(period).padStart(2, "0")}`, // e.g., 2025-02
        name: label,
        id: `${year}-${String(period).padStart(2, "0")}`,
      });
    });
  });

  return combined;
}
