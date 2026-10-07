import { Alert, DatePicker, Empty, Skeleton, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import type { AccountingPolicyHistoryDto, AccountingPolicyVersionDto } from "../types/type";

const formatDay = (value?: string | null) =>
  value ? dayjs(value).format("DD.MM.YYYY") : "—";

export default function PolicyHistoryTab({
  dateFrom,
  dateTo,
  data,
  isLoading,
  isError,
  onFilter,
}: {
  dateFrom: string;
  dateTo: string;
  data?: AccountingPolicyHistoryDto;
  isLoading: boolean;
  isError: boolean;
  onFilter: (dateFrom: string, dateTo: string) => void;
}) {
  const { t } = useTranslation();
  const columns: TableColumnsType<AccountingPolicyVersionDto> = [
    { title: t("accountingPolicy.view.version"), dataIndex: "version", width: 90 },
    { title: t("accountingPolicy.form.effectiveFrom"), dataIndex: "effectiveFrom", render: formatDay },
    {
      title: t("accountingPolicy.form.effectiveTo"),
      dataIndex: "effectiveTo",
      render: (value) => (value ? formatDay(value) : t("accountingPolicy.view.openEnded")),
    },
    {
      title: t("accountingPolicy.form.vatPayer"),
      dataIndex: "vatPayer",
      render: (value) =>
        value === null ? (
          "—"
        ) : (
          <Tag color={value ? "green" : "orange"}>
            {value ? t("accountingPolicy.view.yes") : t("accountingPolicy.view.no")}
          </Tag>
        ),
    },
    {
      title: t("taxRegime.field"),
      dataIndex: "payrollTaxRegimeName",
      render: (value?: string | null) => value ?? t("taxRegime.none"),
    },
    { title: t("accountingPolicy.view.valuation"), dataIndex: "inventoryValuationMethod", render: (value) => value ?? "—" },
  ];

  return (
    <div className="space-y-4">
      <Card className="border border-border p-4">
        <DatePicker.RangePicker
          value={[dateFrom ? dayjs(dateFrom) : null, dateTo ? dayjs(dateTo) : null]}
          format="DD.MM.YYYY"
          onChange={(values) => {
            onFilter(
              values?.[0]?.format("YYYY-MM-DD") ?? "",
              values?.[1]?.format("YYYY-MM-DD") ?? "",
            );
          }}
        />
      </Card>
      {isLoading && <Skeleton active paragraph={{ rows: 6 }} />}
      {isError && <Alert type="error" showIcon message={t("accountingPolicy.view.loadError")} />}
      {!isLoading && !isError && !data?.items?.length && (
        <Empty description={t("accountingPolicy.view.noHistory")} />
      )}
      {!isLoading && !isError && Boolean(data?.items?.length) && (
        <Card className="overflow-hidden border border-border">
          <Table<AccountingPolicyVersionDto>
            rowKey={(record) => `${record.version}-${record.effectiveFrom}`}
            columns={columns}
            dataSource={data?.items ?? []}
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}
    </div>
  );
}
