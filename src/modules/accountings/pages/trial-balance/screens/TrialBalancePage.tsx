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

export default function TrialBalancePage() {
  const [filters, setFilters] = useState<TrialBalanceQuery | null>(null);
  const query = useGetTrialBalance(filters ?? undefined);
  const data = query.data as TrialBalanceResult | undefined;

  const columns: ColumnsType<TrialBalanceItem> = useMemo(
    () => [
      { title: "Hisob kodi", dataIndex: "accountCode", width: 140 },
      { title: "Hisob nomi", dataIndex: "accountName" },
      {
        title: "Boshlang'ich debet",
        dataIndex: "openingDebit",
        align: "right", 
        width: 170,
        render: (value) => numberSpacing(value),
      },
      {
        title: "Boshlang'ich kredit",
        dataIndex: "openingCredit",
        align: "right",
        width: 170,
        render: (value) => numberSpacing(value),
      },
      {
        title: "Davr debeti",
        dataIndex: "periodDebit",
        align: "right",
        width: 160,
        render: (value) => numberSpacing(value),
      },
      {
        title: "Davr krediti",
        dataIndex: "periodCredit",
        align: "right",
        width: 160,
        render: (value) => numberSpacing(value),
      },
      {
        title: "Yopilish debeti",
        dataIndex: "closingDebit",
        align: "right",
        width: 170,
        render: (value) => numberSpacing(value),
      },
      {
        title: "Yopilish krediti",
        dataIndex: "closingCredit",
        align: "right",
        width: 170,
        render: (value) => numberSpacing(value),
      },
    ],
    [],
  );

  const isLoading = query.isLoading || query.isFetching;

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="mb-1! text-text!">
          Trial balance
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          Swagger endpoint: <code>/api/register/trial-balance</code>
        </p>
      </div>

      <TrialBalanceFilters
        loading={query.isFetching}
        onSubmit={(values) => setFilters(values)}
      />

      <Card className="border border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-secondary-text">
            Ma'lumotni yangilash
          </div>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void query.refetch()}
          >
            Yangilash
          </Button>
        </div>
      </Card>

      {data && (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                Boshlang'ich debet jami
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.openingDebitTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                Boshlang'ich kredit jami
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.openingCreditTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                Davr debeti jami
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.periodDebitTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                Davr krediti jami
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.periodCreditTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                Yakuniy debet jami
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.closingDebitTotal, undefined, true)}
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="text-xs text-secondary-text">
                Yakuniy kredit jami
              </div>
              <div className="mt-1 text-lg font-semibold">
                {numberSpacing(data.closingCreditTotal, undefined, true)}
              </div>
            </Card>
          </div>

          <Card className="border border-border p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-xs text-secondary-text">Period ID</div>
                <div className="font-semibold">{data.periodId ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">Date from</div>
                <div className="font-semibold">{data.dateFrom ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">Date to</div>
                <div className="font-semibold">{data.dateTo ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">Currency ID</div>
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
          <div className="text-sm text-secondary-text">Yuklanmoqda...</div>
        </Card>
      )}

      {!data && !isLoading && (
        <Card className="border border-border p-4">
          <div className="text-sm text-secondary-text">
            Trial balance natijasi yo'q
          </div>
        </Card>
      )}
    </div>
  );
}
