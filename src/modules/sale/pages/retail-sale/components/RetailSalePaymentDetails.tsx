import Card from "@/components/ui/card/Card";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import { numberSpacing } from "@/utils/utils";
import type { RetailSalePayment } from "../types/type";

interface Props {
  payments: RetailSalePayment[];
  currency: string;
}

export default function RetailSalePaymentDetails({
  payments,
  currency,
}: Props) {
  const { t } = useTranslation();

  const columns: TableColumnsType<RetailSalePayment> = [
    {
      title: t("common.rowNumber"),
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: t("retailSale.fields.paymentMethod"),
      dataIndex: "paymentMethodName",
      render: (value, record) => value || record.paymentMethodId || "-",
    },
    {
      title: t("retailSale.fields.paymentAcceptancePoint"),
      dataIndex: "paymentAcceptancePointName",
      render: (value, record) =>
        value || record.paymentAcceptancePointId || "-",
    },
    {
      title: t("retailSale.fields.debitAccount"),
      dataIndex: "debitAccountName",
      render: (value, record) => value || record.debitAccountId || "-",
    },
    {
      title: t("retailSale.fields.transactionNumber"),
      dataIndex: "transactionNumber",
      render: (value) => value || "-",
    },
    {
      title: t("retailSale.fields.amount"),
      dataIndex: "amount",
      align: "right",
      render: (value) => `${numberSpacing(Number(value ?? 0))} ${currency}`,
    },
  ];

  return (
    <Card className="overflow-hidden border border-border">
      <div className="border-b border-border p-3 font-semibold">
        {t("retailSale.payments.title")}
      </div>
      <Table<RetailSalePayment>
        rowKey={(record, index) => String(record.id ?? index)}
        columns={columns}
        dataSource={payments}
        pagination={false}
        locale={{ emptyText: t("retailSale.payments.empty") }}
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}
