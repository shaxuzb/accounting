import { money } from "@/modules/payroll/utils/format";
import { Empty, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import type { PayrollTaxLine } from "../types/type";

interface Props {
  lines?: PayrollTaxLine[];
}

export default function PayrollTaxLinesTable({ lines }: Props) {
  const { t } = useTranslation();
  const columns: TableColumnsType<PayrollTaxLine> = [
    { dataIndex: "taxCode", title: t("payroll.fields.taxCode", { defaultValue: "Soliq kodi" }), width: 130 },
    { dataIndex: "taxName", title: t("payroll.fields.taxName", { defaultValue: "Soliq nomi" }), width: 220 },
    { dataIndex: "taxType", title: t("payroll.fields.taxType", { defaultValue: "Turi" }), width: 130, render: (value: string | null) => <Tag color={value === "EMPLOYER" ? "blue" : "orange"}>{value ?? "—"}</Tag> },
    { dataIndex: "baseAmount", title: t("payroll.fields.baseAmount"), align: "right", width: 140, render: (value: number) => money(value) },
    { dataIndex: "exemptionAmount", title: t("payroll.fields.taxExemption", { defaultValue: "Imtiyoz" }), align: "right", width: 110, render: (value: number) => money(value) },
    { dataIndex: "taxableBase", title: t("payroll.fields.taxableBase", { defaultValue: "Soliq bazasi" }), align: "right", width: 140, render: (value: number) => money(value) },
    { dataIndex: "rate", title: t("payroll.fields.rate"), align: "right", width: 90, render: (value: number) => `${value}%` },
    { dataIndex: "amount", title: t("payroll.fields.amount"), align: "right", width: 140, render: (value: number) => <span className="font-semibold">{money(value)}</span> },
  ];

  return <Table<PayrollTaxLine> columns={columns} dataSource={(lines ?? []).map((line, index) => ({ ...line, key: line.id ?? index }))} pagination={false} size="small" scroll={{ x: 1000 }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("payroll.documents.noTaxLines", { defaultValue: "Soliq qatorlari mavjud emas" })} /> }} />;
}
