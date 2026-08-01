import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { ArrowLeft, RefreshCw, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetCashBook } from "../hooks";
import type { CashBookEntry } from "../types/type";
import { useTranslation } from "react-i18next";

export default function CashBookDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cashBoxId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } = useGetCashBook(
    cashBoxId,
    searchParams,
  );

  const columns = useMemo<TableColumnsType<CashBookEntry>>(
    () => [
      {
        dataIndex: "indexId",
        title: t("common.rowNumber"),
        align: "center",
      },
      {
        dataIndex: "docDate",
        title: t("cash.fields.date"),
        render: (value) => customDate(value),
      },
      {
        dataIndex: "docNumber",
        title: t("cash.fields.documentNumber"),
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "documentKind",
        title: t("cash.fields.type"),
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "counterpartyName",
        title: t("cash.fields.counterparty"),
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "comment",
        title: t("cash.fields.comment"),
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "currencyName",
        title: t("cash.fields.currency"),
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "receipt",
        title: t("cash.fields.income"),
        align: "center",
        render: (value) => numberSpacing(value ?? 0),
      },
      {
        dataIndex: "payment",
        title: t("cash.fields.expense"),
        align: "center",
        render: (value) => numberSpacing(value ?? 0),
      },
      {
        dataIndex: "runningBalance",
        title: t("cash.fields.balance"),
        align: "center",
        render: (value) => numberSpacing(value ?? 0),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-4">
      <Card className="border-border/50 overflow-hidden bg-gradient-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="size-4 text-primary" />
              <span className="font-semibold">{t("cash.fields.cashBox")}</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {data?.cashBoxName ?? t("cash.book.cashBoxWithId", { id: cashBoxId })}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<RefreshCw className="size-4" />}
              onClick={() => refetch()}
            >
              {t("common.refresh")}
            </Button>
            <Button
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate("..")}
            >
              {t("common.back")}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{t("cash.book.openingBalance")}</div>
          <div className="mt-1 text-xl font-semibold">
            {numberSpacing(data?.openingBalance ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{t("cash.book.totalIncome")}</div>
          <div className="mt-1 text-xl font-semibold text-green-600">
            {numberSpacing(data?.totalReceipt ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{t("cash.book.totalExpense")}</div>
          <div className="mt-1 text-xl font-semibold text-red-600">
            {numberSpacing(data?.totalPayment ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{t("cash.book.closingBalance")}</div>
          <div className="mt-1 text-xl font-semibold">
            {numberSpacing(data?.closingBalance ?? 0)}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<CashBookEntry>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "moneyRegisterEntryId")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 340px)" }}
        />
      </Card>
    </div>
  );
}
