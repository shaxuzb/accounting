import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { customDate, generateKeyTable } from "@/utils/utils";
import { useGetCashBookCashBoxes } from "../hooks";
import type { CashBookCashBox } from "../types/type";

export default function CashBookListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } =
    useGetCashBookCashBoxes(searchParams);

  const columns: TableColumnsType<CashBookCashBox> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "name",
      title: t("settings.entities.cashBox"),
      render: (value, record) => <Link to={`${record.id}`}>{value}</Link>,
    },
    {
      dataIndex: "branchName",
      title: t("settings.fields.branchName"),
      render: (value) => value ?? "-",
    },
    {
      dataIndex: "code",
      title: t("settings.fields.code"),
      render: (value) => value ?? "-",
    },
    {
      dataIndex: "currencyName",
      title: t("settings.fields.currency"),
      render: (value) => value ?? "-",
    },
    {
      dataIndex: "createdDate",
      title: t("settings.fields.createdDate"),
      render: (value) => customDate(value),
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3">
        <SearchFilter />
        <Button
          icon={<RefreshCw className="size-4" />}
          onClick={() => void refetch()}
        />
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<CashBookCashBox>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 220px)" }}
        />
      </Card>
    </div>
  );
}
