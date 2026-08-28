import { Button, Empty, Table, Tag } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { Key } from "react";
import type { ChartAccountPresetAccount } from "../types/preset";
import { useTranslation } from "react-i18next";
import ListPagination from "@/components/ui/table/ListPagination";

interface ChartAccountPresetTableProps {
  rows: ChartAccountPresetAccount[];
  selectedIds: number[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  onSelectionChange: (ids: number[]) => void;
}

type PresetRowSelection = NonNullable<
  TableProps<ChartAccountPresetAccount>["rowSelection"]
>;

export default function ChartAccountPresetTable({
  rows,
  selectedIds,
  pagination,
  onSelectionChange,
}: ChartAccountPresetTableProps) {
  const { t } = useTranslation();
  const rowSelection: PresetRowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (keys: Key[]) => onSelectionChange(keys.map(Number)),
    getCheckboxProps: (record) => ({
      disabled: record.hasChartAccount,
    }),
  };

  const columns: TableColumnsType<ChartAccountPresetAccount> = [
    {
      title: t("settings.fields.accountNumber"),
      dataIndex: "number",
      width: 130,
      render: (value: string, record) => (
        <div className={record.hasChartAccount ? "text-muted-second" : ""}>
          <div className="font-medium">{value}</div>
          {record.code && (
            <div className="text-xs text-muted-second">{record.code}</div>
          )}
        </div>
      ),
    },
    {
      title: t("settings.fields.name"),
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: t("settings.fields.accountType"),
      dataIndex: "accountTypeName",
      width: 150,
      render: (value: string, record) => (
        <Tag color={record.hasChartAccount ? "default" : "blue"}>{value}</Tag>
      ),
    },
  ];

  if (!rows.length) {
    return (
      <Empty
        description={t("settings.chartAccounts.accountsNotFound")}
        className="py-10"
      />
    );
  }

  return (
    <>
      <Table<ChartAccountPresetAccount>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={rows}
        rowSelection={rowSelection}
        pagination={false}
        scroll={{ y: 430 }}
        rowClassName={(record) => (record.hasChartAccount ? "opacity-60" : "")}
      />
      <ListPagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page) => pagination.onChange(page)}
      />
    </>
  );
}

export function PresetSelectionActions({
  rows,
  selectedIds,
  onSelectionChange,
}: {
  rows: ChartAccountPresetAccount[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}) {
  const { t } = useTranslation();
  const availableIds = rows
    .filter((row) => !row.hasChartAccount)
    .map((row) => row.id);

  const selectAll = () => {
    onSelectionChange(Array.from(new Set([...selectedIds, ...availableIds])));
  };

  const clearSelection = () => {
    onSelectionChange(selectedIds.filter((id) => !availableIds.includes(id)));
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="small" onClick={selectAll}>
        {t("settings.chartAccounts.selectCurrentPage")}
      </Button>
      <Button size="small" onClick={clearSelection}>
        {t("settings.chartAccounts.clearCurrentPage")}
      </Button>
    </div>
  );
}
