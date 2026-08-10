import { Button } from "antd";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  useGetAccountCard,
  useGetAccountTurnover,
  useGetBalanceSheet,
  useGetCashFlow,
  useGetIncomeStatement,
  useGetJournal,
} from "../hooks";
import AccountingReportGenericArrayTable from "../components/AccountingReportGenericArrayTable";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import type {
  AccountCardQuery,
  AccountTurnoverQuery,
  BalanceSheetQuery,
  CashFlowQuery,
  IncomeStatementQuery,
  JournalQuery,
} from "../types/type";

type ReportType =
  | "balance-sheet"
  | "income-statement"
  | "cash-flow"
  | "account-turnover"
  | "journal"
  | "account-card";

interface Props {
  reportType: ReportType;
}

interface ReportPageConfig {
  title: string;
  description: string;
  tableTitle: string;
  emptyText: string;
}

const reportConfig: Record<ReportType, ReportPageConfig> = {
  "balance-sheet": {
    title: "app.reports.balance.title",
    description: "app.reports.balance.description",
    tableTitle: "app.reports.balance.table",
    emptyText: "app.reports.balance.empty",
  },
  "income-statement": {
    title: "app.reports.income.title",
    description: "app.reports.income.description",
    tableTitle: "app.reports.income.table",
    emptyText: "app.reports.income.empty",
  },
  "cash-flow": {
    title: "app.reports.cashFlow.title",
    description: "app.reports.cashFlow.description",
    tableTitle: "app.reports.cashFlow.table",
    emptyText: "app.reports.cashFlow.empty",
  },
  "account-turnover": {
    title: "app.reports.turnover.title",
    description: "app.reports.turnover.description",
    tableTitle: "app.reports.turnover.table",
    emptyText: "app.reports.turnover.empty",
  },
  journal: {
    title: "app.reports.journal.title",
    description: "app.reports.journal.description",
    tableTitle: "app.reports.journal.table",
    emptyText: "app.reports.journal.empty",
  },
  "account-card": {
    title: "app.reports.card.title",
    description: "app.reports.card.description",
    tableTitle: "app.reports.card.table",
    emptyText: "app.reports.card.empty",
  },
};

const getNumber = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getString = (value: string | null): string => value ?? "";

const getReportQuery = (
  reportType: ReportType,
  searchParams: URLSearchParams,
):
  | BalanceSheetQuery
  | IncomeStatementQuery
  | CashFlowQuery
  | AccountTurnoverQuery
  | JournalQuery
  | AccountCardQuery => {
  if (reportType === "account-turnover" || reportType === "journal") {
    return {
      periodId: getNumber(searchParams.get("periodId")),
      dateFrom: getString(searchParams.get("dateFrom")),
      dateTo: getString(searchParams.get("dateTo")),
      currencyId: getNumber(searchParams.get("currencyId")),
      documentTypeId: getNumber(searchParams.get("documentTypeId")),
      page: getNumber(searchParams.get("page")) ?? 1,
      pageSize: getNumber(searchParams.get("pageSize")) ?? 50,
    };
  }

  if (reportType === "account-card") {
    return {
      periodId: getNumber(searchParams.get("periodId")),
      dateFrom: getString(searchParams.get("dateFrom")),
      dateTo: getString(searchParams.get("dateTo")),
      currencyId: getNumber(searchParams.get("currencyId")),
      accountId: getNumber(searchParams.get("accountId")),
    };
  }

  return {
    periodId: getNumber(searchParams.get("periodId")),
    dateFrom: getString(searchParams.get("dateFrom")),
    dateTo: getString(searchParams.get("dateTo")),
    currencyId: getNumber(searchParams.get("currencyId")),
  };
};

type ReportRow = Record<string, unknown>;

const toNumberValue = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const extractObject = (value: unknown): Record<string, unknown> | null => {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value instanceof Date
  ) {
    return null;
  }

  return value as Record<string, unknown>;
};

const getFirstNumber = (
  values: (number | null | undefined)[],
): number | null => {
  for (const value of values) {
    if (value !== null && value !== undefined) return value;
  }

  return null;
};

const getCandidateIdFromRecord = (row: ReportRow): number | null => {
  const directIdKeys = [
    "id",
    "documentId",
    "document_id",
    "postingId",
    "posting_id",
    "entryId",
    "entry_id",
    "sourceId",
    "source_id",
    "voucherId",
    "voucher_id",
    "journalId",
    "journal_id",
    "accountingEntryId",
    "accountingEntry_id",
    "docId",
    "doc_id",
    "documentNumberId",
  ];
  const directId = directIdKeys
    .map((key) => toNumberValue(row[key]));

  const foundDirectId = getFirstNumber(directId);
  if (foundDirectId !== null) return foundDirectId;

  for (const nestedKey of [
    "document",
    "entry",
    "posting",
    "journal",
    "source",
    "voucher",
  ]) {
    const nested = extractObject(row[nestedKey]);
    if (!nested) continue;

    const nestedId = getFirstNumber(directIdKeys.map((key) => toNumberValue(nested[key])));
    if (nestedId !== null) return nestedId;
  }

  return null;
};

const getCandidateTypeFromRecord = (row: ReportRow): number | null => {
  const directTypeKeys = [
    "documentTypeId",
    "documentType",
    "accountingDocumentTypeId",
    "typeId",
    "postingTypeId",
    "journalTypeId",
  ];

  const directType = directTypeKeys
    .map((key) => toNumberValue(row[key]));

  const foundDirectType = getFirstNumber(directType);
  if (foundDirectType !== null) return foundDirectType;

  for (const nestedKey of ["document", "entry", "posting", "journal"]) {
    const nested = extractObject(row[nestedKey]);
    if (!nested) continue;

    const nestedType = getFirstNumber(
      directTypeKeys.map((key) => toNumberValue(nested[key])),
    );
    if (nestedType !== null) return nestedType;
  }

  return null;
};

const getReportDetailNavigation = (
  reportType: ReportType,
  row: ReportRow,
): string | null => {
  const id = getCandidateIdFromRecord(row);
  if (id === null) return null;
  const documentTypeId = getCandidateTypeFromRecord(row);

  if (reportType === "account-turnover" || reportType === "journal") {
    const query = new URLSearchParams({ documentId: String(id) });
    if (documentTypeId !== null) {
      query.set("documentTypeId", String(documentTypeId));
    }

    return `/main/accountingentriesreport?${query.toString()}`;
  }

  const fallbackQuery = new URLSearchParams({ documentId: String(id) });
  if (documentTypeId !== null) {
    fallbackQuery.set("documentTypeId", String(documentTypeId));
  }

  if (reportType === "account-card") return null;

  if (reportType === "balance-sheet" || reportType === "income-statement") {
    if (documentTypeId !== null) {
      return `/main/accountingentriesreport?${fallbackQuery.toString()}`;
    }
    return null;
  }

  return null;
};

export default function AccountingReportsPage({ reportType }: Props) {
  const { t } = useTranslation();
  const config = reportConfig[reportType];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParams = useMemo(
    () => getReportQuery(reportType, searchParams),
    [reportType, searchParams],
  );

  const balanceQuery = useGetBalanceSheet(
    reportType === "balance-sheet" ? queryParams : undefined,
  );
  const incomeQuery = useGetIncomeStatement(
    reportType === "income-statement" ? queryParams : undefined,
  );
  const cashFlowQuery = useGetCashFlow(
    reportType === "cash-flow" ? queryParams : undefined,
  );
  const accountTurnoverQuery = useGetAccountTurnover(
    reportType === "account-turnover" ? queryParams : undefined,
  );
  const journalQuery = useGetJournal(reportType === "journal" ? queryParams : undefined);
  const accountCardQuery = useGetAccountCard(
    reportType === "account-card" ? queryParams : undefined,
  );

  const activeQuery = useMemo<UseQueryResult<unknown, unknown>>(() => {
    if (reportType === "balance-sheet") return balanceQuery as UseQueryResult<unknown, unknown>;
    if (reportType === "income-statement")
      return incomeQuery as UseQueryResult<unknown, unknown>;
    if (reportType === "cash-flow") return cashFlowQuery as UseQueryResult<unknown, unknown>;
    if (reportType === "account-turnover")
      return accountTurnoverQuery as UseQueryResult<unknown, unknown>;
    if (reportType === "journal") return journalQuery as UseQueryResult<unknown, unknown>;
    return accountCardQuery as UseQueryResult<unknown, unknown>;
  }, [
    accountCardQuery,
    accountTurnoverQuery,
    balanceQuery,
    cashFlowQuery,
    incomeQuery,
    journalQuery,
    reportType,
  ]);

  return (
    <AccountingReportPageShell>
      <div className="flex items-center justify-end">
        <Button
          icon={<RefreshCw className="size-4" />}
          onClick={() => void activeQuery.refetch()}
        >
          {t("common.refresh")}
        </Button>
      </div>

      <AccountingReportGenericArrayTable
        data={activeQuery.data}
        loading={activeQuery.isLoading || activeQuery.isFetching}
        title={t(config.tableTitle)}
        emptyText={t(config.emptyText)}
        onRowClick={(record) => {
          const detailPath = getReportDetailNavigation(reportType, record);
          if (detailPath) {
            navigate(detailPath);
          }
        }}
      />
    </AccountingReportPageShell>
  );
}
