import { useMemo, useState } from "react";
import { Button, Table, Typography } from "antd";
import { RefreshCw } from "lucide-react";
import Card from "@/components/ui/card/Card";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import TrialBalanceFilters from "../components/TrialBalanceFilters";
import { useGetTrialBalance } from "../hooks";
import type {
  TrialBalanceItem,
  TrialBalanceQuery,
  TrialBalanceResult,
} from "../types/type";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

export default function TrialBalancePage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TrialBalanceQuery | null>(null);
  const query = useGetTrialBalance(filters ?? undefined);
  const data = query.data as TrialBalanceResult | undefined;

  const columns: ColumnsType<TrialBalanceItem> = useMemo(
    () => [
      { title: t("app.trial.accountCode"), dataIndex: "accountCode", width: 140 },
      { title: t("app.trial.accountName"), dataIndex: "accountName" },
      {
        title: t("app.trial.openingDebit"),
        dataIndex: "openingDebit",
        align: "right", 
        width: 170,
        render: (value) => numberSpacing(value),
      },
      {
        title: t("app.trial.openingCredit"),
        dataIndex: "openingCredit",
        align: "right",
        width: 170,
        render: (value) => numberSpacing(value),
      },
      {
        title: t("app.trial.periodDebit"),
        dataIndex: "periodDebit",
        align: "right",
        width: 160,
        render: (value) => numberSpacing(value),
      },
      {
        title: t("app.trial.periodCredit"),
        dataIndex: "periodCredit",
        align: "right",
        width: 160,
        render: (value) => numberSpacing(value),
      },
      {
        title: t("app.trial.closingDebit"),
        dataIndex: "closingDebit",
        align: "right",
        width: 170,
        render: (value) => numberSpacing(value),
      },
      {
        title: t("app.trial.closingCredit"),
        dataIndex: "closingCredit",
        align: "right",
        width: 170,
        render: (value) => numberSpacing(value),
      },
    ],
    [t],
  );

  const isLoading = query.isLoading || query.isFetching;

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="mb-1! text-text!">
          {t("app.trial.title")}
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          {t("accountings.endpoint")}: <code>/api/register/trial-balance</code>
        </p>
      </div>

      <TrialBalanceFilters
        loading={query.isFetching}
        onSubmit={(values) => setFilters(values)}
      />

      <Card className="border border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-secondary-text">
            {t("app.trial.refreshData")}
          </div>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void query.refetch()}
          >
            {t("common.refresh")}
          </Button>
        </div>
      </Card>

      {data && (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                {t("app.trial.openingDebit")} {t("common.total").toLowerCase()}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.openingDebitTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                {t("app.trial.openingCredit")} {t("common.total").toLowerCase()}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.openingCreditTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                {t("app.trial.periodDebit")} {t("common.total").toLowerCase()}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.periodDebitTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                {t("app.trial.periodCredit")} {t("common.total").toLowerCase()}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.periodCreditTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                {t("app.trial.closingDebit")} {t("common.total").toLowerCase()}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.closingDebitTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                {t("app.trial.closingCredit")} {t("common.total").toLowerCase()}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.closingCreditTotal, undefined, true)}
              </div>
            </Card>
          </div>

          <Card className="border border-border p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-xs text-secondary-text">{t("accountings.fields.periodId")}</div>
                <div className="font-semibold">{data.periodId ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">{t("accountings.fields.dateFrom")}</div>
                <div className="font-semibold">{data.dateFrom ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">{t("accountings.fields.dateTo")}</div>
                <div className="font-semibold">{data.dateTo ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">{t("bank.fields.currencyId")}</div>
                <div className="font-semibold">{data.currencyId ?? "-"}</div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border border-border">
            <Table<TrialBalanceItem>
              columns={columns}
              loading={isLoading}
              dataSource={generateKeyTable(data.items)}
              pagination={false}
              scroll={{ x: "max-content", y: "calc(100vh - 440px)" }}
              rowKey="accountId"
            />
          </Card>
        </>
      )}

      {!data && isLoading && (
        <Card className="border border-border p-4">
          <div className="text-sm text-secondary-text">{t("common.loading")}...</div>
        </Card>
      )}

      {!data && !isLoading && (
        <Card className="border border-border p-4">
          <div className="text-sm text-secondary-text">
            {t("app.trial.resultEmpty")}
          </div>
        </Card>
      )}
    </div>
  );
}
