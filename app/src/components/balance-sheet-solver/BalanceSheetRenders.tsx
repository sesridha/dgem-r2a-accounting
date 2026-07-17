import type {
  APInvoiceRecord,
  APEntryRecord,
  ManualJournalEntryRecord,
  TrialBalanceDetailRecord,
} from "@/types";
import type { Column } from "../shared/data-table";
import { formatNumber } from "@/utils/common";

export function createAPInvoiceColumns(): Column<APInvoiceRecord>[] {
  return [
    {
      key: "invoiceNum",
      header: "INVOICE NUMBER",
      accessor: (row) => row.invoiceNum,
      render: (row) => (
        <span className="font-medium text-sm">{row.invoiceNum}</span>
      ),
      width: "w-40",
    },
    {
      key: "supplierName",
      header: "SUPPLIER NAME",
      accessor: (row) => row.supplierName,
      render: (row) => <span className="text-sm ">{row.supplierName}</span>,
      width: "w-48",
    },
    {
      key: "invoiceDate",
      header: "INVOICE DATE",
      accessor: (row) => row.invoiceDate,
      render: (row) => <span className="text-sm">{row.invoiceDate}</span>,
      width: "w-28",
    },
    {
      key: "dueDate",
      header: "DUE DATE",
      accessor: (row) => row.dueDate,
      render: (row) => <span className="text-sm">{row.dueDate}</span>,
      width: "w-28",
    },
    {
      key: "invcAmountInv",
      header: "INVOICE AMOUNT",
      accessor: (row) => row.invcAmountInv,
      render: (row) => {
        const rawValue = row.invcAmountInv;
        const amount =
          typeof rawValue === "number"
            ? rawValue
            : parseFloat(String(rawValue).replace(/[^0-9.-]/g, ""));

        return (
          <span className="text-sm text-right">
            {Number.isNaN(amount) ? "0" : formatNumber(amount)}
          </span>
        );
      },
      align: "right",
      width: "w-40",
    },
    {
      key: "balanceAmountInv",
      header: "BALANCE AMOUNT",
      accessor: (row) => row.balanceAmountInv,
      render: (row) => {
        const rawValue = row.balanceAmountInv;
        const amount =
          typeof rawValue === "number"
            ? rawValue
            : parseFloat(String(rawValue).replace(/[^0-9.-]/g, ""));

        return (
          <span className="text-sm font-normal">
            {Number.isNaN(amount) ? "0" : formatNumber(amount)}
          </span>
        );
      },
      align: "right",
      width: "w-40",
    },
    {
      key: "daysOverdue",
      header: "DAYS OVERDUE",
      accessor: (row) => row.daysOverdue,
      render: (row) => (
        <span
          className={`text-sm ${row.daysOverdue > 0 ? "font-semibold" : "text-gray-600"}`}
        >
          {row.daysOverdue}
        </span>
      ),
      align: "center",
      width: "w-24",
    },
    {
      key: "paymentTermName",
      header: "PAYMENT TERMS",
      accessor: (row) => row.paymentTermName,
      render: (row) => <span className="text-sm">{row.paymentTermName}</span>,
      width: "w-28",
    },
  ];
}

export function createTrialBalanceColumns(): Column<TrialBalanceDetailRecord>[] {
  return [
    {
      key: "localAccount",
      header: "LOCAL CODE",
      accessor: (row) => row.localAccount,
      render: (row) => (
        <span className="font-medium text-sm">{row.localAccount}</span>
      ),
      width: "w-28",
    },
    {
      key: "description",
      header: "DESCRIPTION",
      accessor: (row) => row.description,
      render: (row) => (
        <span className="text-sm line-clamp-2">{row.description}</span>
      ),
      width: "w-64",
    },
    {
      key: "beginningBalance",
      header: "BEGINNING BALANCE",
      accessor: (row) => row.beginningBalance,
      render: (row) => (
        <span className="text-sm">{formatNumber(row.beginningBalance)}</span>
      ),
      align: "right",
      width: "w-40",
    },
    {
      key: "debits",
      header: "DEBITS",
      accessor: (row) => row.debits,
      render: (row) => (
        <span className="text-sm text-blue-600">
          {formatNumber(row.debits)}
        </span>
      ),
      align: "right",
      width: "w-32",
    },
    {
      key: "credits",
      header: "CREDITS",
      accessor: (row) => row.credits,
      render: (row) => (
        <span className="text-sm font-semibold">
          {formatNumber(row.credits)}
        </span>
      ),
      align: "right",
      width: "w-32",
    },
    {
      key: "endingBalance",
      header: "ENDING BALANCE",
      accessor: (row) => row.endingBalance,
      render: (row) => (
        <span className="text-sm">{formatNumber(row.endingBalance)}</span>
      ),
      align: "right",
      width: "w-40",
    },
  ];
}

export function createJournalEntryColumns(): Column<ManualJournalEntryRecord>[] {
  return [
    {
      key: "ou",
      header: "OU",
      accessor: (row) => row.ou,
      render: (row) => (
        <span
          className={
            row.ou === "Total" || row.ou === "Subtotal"
              ? "font-bold text-sm text-gray-900"
              : "text-sm"
          }
        >
          {row.ou}
        </span>
      ),
      width: "w-20",
    },
    {
      key: "jePeriodName",
      header: "JE PERIOD",
      accessor: (row) => row.jePeriodName,
      render: (row) => <span className="text-sm">{row.jePeriodName}</span>,
      width: "w-28",
    },
    {
      key: "journalSourceName",
      header: "SOURCE",
      accessor: (row) => row.journalSourceName,
      render: (row) => <span className="text-sm">{row.journalSourceName}</span>,
      width: "w-28",
    },
    {
      key: "jeNumber",
      header: "JE NUMBER",
      accessor: (row) => row.jeNumber,
      render: (row) => (
        <span className="font-medium text-sm">{row.jeNumber}</span>
      ),
      width: "w-28",
    },
    {
      key: "journalCategName",
      header: "CATEGORY",
      accessor: (row) => row.journalCategName,
      render: (row) => <span className="text-sm ">{row.journalCategName}</span>,
      width: "w-44",
    },
    {
      key: "status",
      header: "STATUS",
      accessor: (row) => row.status,
      render: (row) => {
        if (!row.status) return null;
        return (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              row.status === "Posted"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {row.status}
          </span>
        );
      },
      width: "w-24",
    },
    {
      key: "accountCode",
      header: "ACCOUNT CODE",
      accessor: (row) => row.accountCode,
      render: (row) => (
        <span className="text-sm font-semibold">{row.accountCode}</span>
      ),
      width: "w-28",
    },
    {
      key: "accountDesc",
      header: "ACCOUNT DESCRIPTION",
      accessor: (row) => row.accountDesc,
      render: (row) => <span className="text-sm">{row.accountDesc}</span>,
      width: "w-48",
    },
    {
      key: "transactionLineDebit",
      header: "TXN DEBIT",
      accessor: (row) => row.transactionLineDebit,
      render: (row) => (
        <span
          className={`text-sm font-semibold text-gray-600 ${
            row.ou === "Subtotal" ? "font-bold" : ""
          }`}
        >
          {formatNumber(row.transactionLineDebit)}
        </span>
      ),
      align: "right",
      width: "w-32",
    },
    {
      key: "transactionLineCredit",
      header: "TXN CREDIT",
      accessor: (row) => row.transactionLineCredit,
      render: (row) => (
        <span
          className={`text-sm font-semibold ${
            row.ou === "Subtotal" ? "font-bold" : ""
          }`}
        >
          {formatNumber(row.transactionLineCredit)}
        </span>
      ),
      align: "right",
      width: "w-32",
    },
    {
      key: "netBalance",
      header: "NET BALANCE",
      accessor: (row) => row.netBalance,
      render: (row) => (
        <span
          className={`text-sm font-semibold ${
            row.ou === "Subtotal" ? "font-bold" : ""
          }`}
        >
          {formatNumber(row.netBalance)}
        </span>
      ),
      align: "right",
      width: "w-32",
    },
  ];
}

export function createAPEntryColumns(): Column<APEntryRecord>[] {
  return [
    {
      key: "invoiceNum",
      header: "INVOICE NUMBER",
      accessor: (row) => row.invoiceNum,
      render: (row) => {
        const isSubtotal = !row.invoiceNum;
        return (
          <span
            className={`font-medium text-sm ${isSubtotal ? "font-bold" : ""}`}
          >
            {isSubtotal ? "Subtotal" : row.invoiceNum}
          </span>
        );
      },
      width: "w-40",
    },
    {
      key: "supplierName",
      header: "SUPPLIER NAME",
      accessor: (row) => row.supplierName,
      render: (row) => <span className="text-sm ">{row.supplierName}</span>,
      width: "w-48",
    },
    {
      key: "invoiceDate",
      header: "INVOICE DATE",
      accessor: (row) => row.invoiceDate,
      render: (row) => <span className="text-sm">{row.invoiceDate}</span>,
      width: "w-28",
    },
    {
      key: "paymentDate",
      header: "PAYMENT DATE",
      accessor: (row) => row.paymentDate,
      render: (row) => <span className="text-sm">{row.paymentDate}</span>,
      width: "w-28",
    },
    {
      key: "invoiceLineAmt",
      header: "INVOICE AMOUNT",
      accessor: (row) => row.invoiceLineAmt,
      render: (row) => {
        const amount = typeof row.invoiceLineAmt === "number"
          ? row.invoiceLineAmt
          : parseFloat(String(row.invoiceLineAmt).replace(/[^0-9.-]/g, ""));
        const isSubtotal = !row.invoiceNum;

        return (
          <span
            className={`text-sm text-right ${isSubtotal ? "font-bold" : ""}`}
          >
            {Number.isNaN(amount) ? "0" : formatNumber(amount)}
          </span>
        );
      },
      align: "right",
      width: "w-40",
    },
    {
      key: "paymentStatusName",
      header: "PAYMENT STATUS",
      accessor: (row) => row.paymentStatusName,
      render: (row) => {
        if (!row.paymentStatusName) return null;
        return (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              row.paymentStatusName === "Fully Paid"
                ? "bg-green-100 text-green-800"
                : row.paymentStatusName === "Partially Paid"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {row.paymentStatusName}
          </span>
        );
      },
      width: "w-32",
    },
    {
      key: "paymentTermName",
      header: "PAYMENT TERMS",
      accessor: (row) => row.paymentTermName,
      render: (row) => <span className="text-sm">{row.paymentTermName}</span>,
      width: "w-28",
    },
    {
      key: "paymentMethodName",
      header: "PAYMENT METHOD",
      accessor: (row) => row.paymentMethodName,
      render: (row) => <span className="text-sm">{row.paymentMethodName}</span>,
      width: "w-28",
    },
    {
      key: "accountCode",
      header: "ACCOUNT CODE",
      accessor: (row) => row.accountCode,
      render: (row) => (
        <span className="font-medium text-sm">{row.accountCode}</span>
      ),
      width: "w-28",
    },
  ];
}
