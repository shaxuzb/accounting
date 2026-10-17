import { useState } from "react";
import { DatePicker, Input, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { money, useMaterialsInUseBalance, type MaterialsInUseBalance } from "./api";

/**
 * 1C «Материалы в эксплуатации»: what is in use on a date — by off-balance account (014.x), item,
 * the transfer it was given out by and the person — from the general ledger.
 */
export default function MaterialsInUseBalancePage() {
  const { t } = useTranslation();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [search, setSearch] = useState("");
  const { data = [], isFetching } = useMaterialsInUseBalance(date.endOf("day").add(1, "second").format("YYYY-MM-DDTHH:mm:ss"), null);
  const needle = search.trim().toLowerCase();
  const rows = data.filter((x) => !needle || x.productName.toLowerCase().includes(needle) || (x.employeeName ?? "").toLowerCase().includes(needle));

  const columns: TableColumnsType<MaterialsInUseBalance> = [
    { dataIndex: "productName", title: t("materialsInUse.product") },
    { dataIndex: "accountNumber", title: t("materialsInUse.inUseAccount"), width: 110 },
    {
      key: "source",
      title: t("materialsInUse.transfer"),
      width: 170,
      render: (_, row) => `№${row.sourceDocNumber ?? row.sourceDocId}${row.sourceDocDate ? ` ${dayjs(row.sourceDocDate).format("DD.MM.YYYY")}` : ""}`,
    },
    { dataIndex: "employeeName", title: t("materialsInUse.employee"), render: (value?: string | null) => value ?? "-" },
    { dataIndex: "quantity", title: t("materialsInUse.quantity"), width: 120, align: "right", render: (value: number, row) => `${value} ${row.unitName ?? ""}` },
    { dataIndex: "amount", title: t("materialsInUse.amount"), width: 150, align: "right", render: (value: number) => money(value) },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-end gap-3 border border-border p-3">
        <DatePicker format="DD.MM.YYYY" allowClear={false} value={date} onChange={(value) => value && setDate(value)} />
        <Input.Search allowClear className="w-72" placeholder={t("materialsInUse.search")} onSearch={setSearch} />
      </Card>
      <div className="text-sm text-secondary-text">{t("materialsInUse.balanceHint")}</div>
      <Card className="overflow-hidden border border-border">
        <Table<MaterialsInUseBalance>
          rowKey={(row) => `${row.accountId}-${row.productId}-${row.sourceDocId}-${row.employeeId ?? 0}`}
          size="small"
          bordered
          loading={isFetching}
          columns={columns}
          dataSource={rows}
          pagination={false}
          locale={{ emptyText: t("materialsInUse.balanceEmpty") }}
          summary={(page) =>
            page.length > 0 ? (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}><b>{t("materialsInUse.total")}</b></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right"><b>{money(page.reduce((sum, x) => sum + x.amount, 0))}</b></Table.Summary.Cell>
              </Table.Summary.Row>
            ) : null
          }
        />
      </Card>
    </div>
  );
}
