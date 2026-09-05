import { Alert, DatePicker, Empty, Skeleton, Table } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import Card from "@/components/ui/card/Card";
import type { AccountingPolicyHistoryDto, AccountingPolicyVersionDto } from "../types/type";

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
  const columns: TableColumnsType<AccountingPolicyVersionDto> = [
    { title: "Version", dataIndex: "version", width: 90 },
    { title: "Effective from", dataIndex: "effectiveFrom" },
    { title: "Effective to", dataIndex: "effectiveTo", render: (value) => value ?? "—" },
    { title: "Valuation", dataIndex: "inventoryValuationMethod", render: (value) => value ?? "—" },
    { title: "Currency ID", dataIndex: "baseCurrencyId", render: (value) => value ?? "—" },
    { title: "VAT payer", dataIndex: "vatPayer", render: (value) => value === null ? "—" : value ? "Yes" : "No" },
    { title: "VAT period", dataIndex: "vatTaxPeriod", render: (value) => value ?? "—" },
    { title: "Closed period", dataIndex: "closedPeriodPolicy", render: (value) => value ?? "—" },
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
      {isError && <Alert type="error" showIcon message="Policy history could not be loaded." />}
      {!isLoading && !isError && !data?.items?.length && <Empty description="No policy history found." />}
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
