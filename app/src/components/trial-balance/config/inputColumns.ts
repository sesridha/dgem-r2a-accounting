import type { Column } from "@/components/shared/data-table";
import type { TBInputRecord } from "@/types";

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

/** Read company code from real API (snake_case) or mock (PascalCase) */
export const getInputCompanyCode = (row: TBInputRecord): string =>
  String(
    row.company_code ?? row.CompanyCode ?? row["Company Code"] ?? "",
  ).trim();

/** Read period from real API or mock */
export const getInputPeriod = (row: TBInputRecord): number => {
  const period = Number(row.period);
  return Number.isFinite(period) ? period : NaN;
};

/** Read fiscal year from real API or mock */
export const getInputYear = (row: TBInputRecord): number => {
  const year = Number(row.fiscal_year ?? row.FiscalYear ?? row.Year);
  return Number.isFinite(year) ? year : NaN;
};

/** Read account number from real API or mock */
export const getInputGLAccount = (row: TBInputRecord): string =>
  String(row.account_number ?? row.GLAccount ?? row["Account Code"] ?? "");

/** Read account name from real API or mock */
export const getInputAccountName = (row: TBInputRecord): string =>
  String(row.account_name ?? row.AccountName ?? row["Account Name"] ?? "");

/** Read opening / starting balance */
export const getInputOpeningBalance = (row: TBInputRecord): number =>
  Number(row.starting_balance_amt_in_co_code_crcy ?? row.OpeningBalance ?? 0);

/** Read period credit amount */
export const getInputPeriodCredit = (row: TBInputRecord): number =>
  Number(row.credit_amount_in_co_code_crcy ?? row.PeriodCredit ?? 0);

/** Read period debit amount */
export const getInputPeriodDebit = (row: TBInputRecord): number =>
  Number(row.debit_amount_in_co_code_crcy ?? row.PeriodDebit ?? 0);

/** Read closing balance from real API or mock */
export const getInputClosingBalance = (row: TBInputRecord): number =>
  Number(row.closing_balance_amount ?? row.ClosingBalance ?? row.Amount ?? 0);

export const createTrialBalanceInputColumns = (): Column<TBInputRecord>[] => [
  {
    key: "company_code",
    header: "COMPANY CODE",
    width: "w-28",
    accessor: (row) => getInputCompanyCode(row),
  },
  {
    key: "account_number",
    header: "GL ACCOUNT",
    width: "w-28",
    accessor: (row) => getInputGLAccount(row),
  },
  {
    key: "account_name",
    header: "ACCOUNT NAME",
    width: "w-40",
    accessor: (row) => getInputAccountName(row),
  },
  {
    key: "fiscal_year",
    header: "FISCAL YEAR",
    align: "right",
    width: "w-24",
    accessor: (row) => getInputYear(row),
  },
  {
    key: "period",
    header: "PERIOD",
    align: "right",
    width: "w-20",
    accessor: (row) => getInputPeriod(row),
  },
  {
    key: "closing_balance_amount",
    header: "CLOSING BALANCE",
    align: "right",
    width: "w-36",
    render: (row) => fmtCurrency(getInputClosingBalance(row)),
    accessor: (row) => getInputClosingBalance(row),
  },
];
