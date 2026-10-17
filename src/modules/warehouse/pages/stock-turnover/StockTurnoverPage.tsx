import { useMemo, useState } from "react";
import { DatePicker, Input, Select, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import { getJson } from "@/modules/accountings/services/request";
import { selectListEndpoints } from "@/shared/constants/selectLists";

interface StockTurnoverRow {
  accountId: number;
  accountNumber: string;
  isOffBalance: boolean;
  warehouseId: number;
  warehouseName: string;
  productId: number;
  productName: string;
  productCode?: string | null;
  unitName?: string | null;
  openingQuantity: number;
  openingAmount: number;
  inQuantity: number;
  inAmount: number;
  outQuantity: number;
  outAmount: number;
  closingQuantity: number;
  closingAmount: number;
}

type Line = StockTurnoverRow & { key: string; total?: boolean };

const money = (value: number) => value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = (value: number) => value.toLocaleString("ru-RU", { maximumFractionDigits: 3 });
const sumFields = ["openingQuantity", "openingAmount", "inQuantity", "inAmount", "outQuantity", "outAmount", "closingQuantity", "closingAmount"] as const;

/**
 * 1C «Ведомость по товарам на складах»: for the period, by warehouse and item (and the account the
 * goods stand on) — the opening balance, in, out and the closing balance, in quantity and sum. Read
 * from the general ledger, so it agrees with the trial balance; the off-balance 004 (a
 * committent's goods) is shown apart.
 */
export default function StockTurnoverPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf("month"), dayjs().endOf("month")]);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [productGroupId, setProductGroupId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data = [], isFetching } = useQuery({
    queryKey: ["stock-turnover", range[0].format("YYYY-MM-DD"), range[1].format("YYYY-MM-DD"), warehouseId, productGroupId, accountId, search],
    queryFn: () =>
      getJson<StockTurnoverRow[]>("/reports/warehouse/stock-turnover", {
        dateFrom: range[0].format("YYYY-MM-DD"),
        dateTo: range[1].format("YYYY-MM-DD"),
        warehouseId,
        productGroupId,
        accountId,
        search: search.trim() || undefined,
      }),
  });

  // the warehouse's rows under its totals, then the grand total of what stands on the balance sheet
  const lines = useMemo(() => {
    const result: Line[] = [];
    const total = (key: string, name: string, rows: StockTurnoverRow[]): Line => {
      const line = { key, total: true, productName: name } as Line;
      for (const field of sumFields) line[field] = rows.reduce((sum, row) => sum + row[field], 0);
      return line;
    };
    const warehouses = [...new Set(data.map((x) => x.warehouseId))];
    for (const id of warehouses) {
      const rows = data.filter((x) => x.warehouseId === id);
      result.push(total(`w${id}`, rows[0].warehouseName, rows.filter((x) => !x.isOffBalance)));
      result.push(...rows.map((x) => ({ ...x, key: `${x.warehouseId}-${x.productId}-${x.accountId}` })));
    }
    if (warehouses.length > 1) result.push(total("all", t("stockTurnover.total"), data.filter((x) => !x.isOffBalance)));
    return result;
  }, [data, t]);

  const pair = (q: keyof StockTurnoverRow, a: keyof StockTurnoverRow, title: string) => ({
    title,
    children: [
      { title: t("stockTurnover.quantity"), dataIndex: q, width: 100, align: "right" as const, render: (value: number, row: Line) => (row.total && row.key.startsWith("w") ? "" : qty(value)) },
      { title: t("stockTurnover.sum"), dataIndex: a, width: 140, align: "right" as const, render: (value: number) => money(value) },
    ],
  });

  const columns: TableColumnsType<Line> = [
    {
      title: t("stockTurnover.item"),
      dataIndex: "productName",
      fixed: "left",
      width: 300,
      render: (value: string, row) =>
        row.total ? (
          <b>{value}</b>
        ) : (
          <Space size={4}>
            <span className="pl-4">{value}</span>
            {row.unitName && <span className="text-xs text-secondary-text">({row.unitName})</span>}
            {row.isOffBalance && <Tag color="purple">{t("stockTurnover.offBalance")}</Tag>}
          </Space>
        ),
    },
    { title: t("stockTurnover.account"), dataIndex: "accountNumber", width: 90, render: (value?: string) => value ?? "" },
    pair("openingQuantity", "openingAmount", t("stockTurnover.opening")),
    pair("inQuantity", "inAmount", t("stockTurnover.in")),
    pair("outQuantity", "outAmount", t("stockTurnover.out")),
    pair("closingQuantity", "closingAmount", t("stockTurnover.closing")),
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-end gap-3 border border-border p-3">
        <DatePicker.RangePicker format="DD.MM.YYYY" allowClear={false} value={range}
          onChange={(value) => value?.[0] && value[1] && setRange([value[0], value[1]])} />
        <div className="w-56">
          <SelectCustom label="" placeholder="stockTurnover.allWarehouses" path={selectListEndpoints.warehousesSelectList} marginBottom="mb-0!" clearable value={warehouseId}
            onChange={(value) => setWarehouseId((value as number | null) ?? null)} />
        </div>
        <div className="w-56">
          <SelectCustom label="" placeholder="stockTurnover.allGroups" path={selectListEndpoints.productGroupsSelectList} marginBottom="mb-0!" clearable search value={productGroupId}
            onChange={(value) => setProductGroupId((value as number | null) ?? null)} />
        </div>
        <Select allowClear className="w-40" placeholder={t("stockTurnover.account")} value={accountId}
          options={[...new Map(data.map((x) => [x.accountId, x.accountNumber])).entries()].map(([value, label]) => ({ value, label }))}
          onChange={(value?: number) => setAccountId(value ?? null)} />
        <Input.Search allowClear className="w-64" placeholder={t("stockTurnover.search")} onSearch={setSearch} />
      </Card>
      <div className="text-sm text-secondary-text">{t("stockTurnover.hint")}</div>
      <Card className="overflow-hidden border border-border">
        <Table<Line>
          rowKey="key"
          size="small"
          bordered
          loading={isFetching}
          columns={columns}
          dataSource={lines}
          pagination={false}
          scroll={{ x: 1400 }}
          rowClassName={(row) => (row.total ? "bg-surface-secondary font-semibold" : "")}
          locale={{ emptyText: t("stockTurnover.empty") }}
        />
      </Card>
    </div>
  );
}
