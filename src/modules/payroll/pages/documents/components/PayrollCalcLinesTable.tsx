import {
  componentTypeColor,
  type PayrollComponentType,
} from "@/modules/payroll/constants/options";
import { money } from "@/modules/payroll/utils/format";
import type { DocumentAccountOption } from "@/shared/documentAccounts";
import { Empty, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import type { PayrollCalcLine } from "../types/type";

interface Props {
  lines?: PayrollCalcLine[];
  accountById?: ReadonlyMap<number, DocumentAccountOption>;
}

/** Xodim bo'yicha hisoblash tafsiloti (komponentlar kesimi). */
export default function PayrollCalcLinesTable({ lines, accountById }: Props) {
  const { t } = useTranslation();

  const renderAccount = (accountId: number | null | undefined) => {
    if (accountId == null) return "—";
    const account = accountById?.get(accountId);
    const number = account?.number ?? account?.code;
    const name = account?.name;

    return (
      <div className="flex min-w-28 flex-col text-left">
        <span className="font-medium">{number ?? `#${accountId}`}</span>
        {name && <span className="text-xs text-secondary-text">{name}</span>}
      </div>
    );
  };

  const columns: TableColumnsType<PayrollCalcLine> = [
    {
      dataIndex: "componentCode",
      title: t("payroll.fields.componentCode"),
      width: 120,
      render: (value: string | null) => value ?? "—",
    },
    {
      dataIndex: "componentName",
      title: t("payroll.fields.componentName"),
      minWidth: 200,
      render: (value: string | null) => value ?? "—",
    },
    {
      dataIndex: "componentType",
      title: t("payroll.fields.componentType"),
      align: "center",
      width: 150,
      render: (value: PayrollComponentType | null) =>
        value ? (
          <Tag className="m-0!" color={componentTypeColor[value] ?? "default"}>
            {t(`payroll.enums.componentType.${value}`, { defaultValue: value })}
          </Tag>
        ) : (
          "—"
        ),
    },
    {
      dataIndex: "calculationMethod",
      title: t("payroll.fields.calculationMethod"),
      width: 190,
      render: (value: string | null) =>
        value
          ? t(`payroll.enums.calculationMethod.${value}`, {
              defaultValue: value,
            })
          : "—",
    },
    {
      dataIndex: "baseAmount",
      title: t("payroll.fields.baseAmount"),
      align: "center",
      width: 150,
      render: (value: number | null) => money(value),
    },
    {
      dataIndex: "quantity",
      title: t("payroll.fields.quantity"),
      align: "center",
      width: 110,
      render: (value: number | null) => (value == null ? "—" : value),
    },
    {
      dataIndex: "rate",
      title: t("payroll.fields.rate"),
      align: "center",
      width: 100,
      render: (value: number | null) => (value == null ? "—" : value),
    },
    {
      dataIndex: "amount",
      title: t("payroll.fields.amount"),
      align: "center",
      width: 160,
      render: (value: number, record) => (
        <span
          className={
            record.componentType === "DEDUCTION"
              ? "font-semibold text-red-500"
              : "font-semibold"
          }
        >
          {record.componentType === "DEDUCTION" ? "−" : ""}
          {money(value)}
        </span>
      ),
    },
    {
      dataIndex: "debitAccountId",
      title: t("payroll.fields.debitAccount"),
      width: 150,
      render: (value: number | null) => renderAccount(value),
    },
    {
      dataIndex: "creditAccountId",
      title: t("payroll.fields.creditAccount"),
      width: 150,
      render: (value: number | null) => renderAccount(value),
    },
    {
      dataIndex: "note",
      title: t("payroll.fields.note"),
      minWidth: 140,
      render: (value: string | null) => value ?? "—",
    },
  ];

  return (
    <Table<PayrollCalcLine>
      columns={columns}
      dataSource={(lines ?? []).map((line, index) => ({
        ...line,
        key: line.id ?? index,
      }))}
      className="[&_.ant-table]:ml-0!"
      pagination={false}
      size="small"
      scroll={{ x: 1380 }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("payroll.documents.noCalcLines")}
          />
        ),
      }}
    />
  );
}
