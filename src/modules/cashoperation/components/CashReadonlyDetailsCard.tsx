import { useTranslation } from "react-i18next";
import CashReadonlyLayout from "./CashReadonlyLayout";
import useCashChartAccountLabel from "./useCashChartAccountLabel";
import type { CashOperation } from "../pages/cashoperation/types/type";

interface CashReadonlyDetailsCardProps {
  record: CashOperation;
}

export default function CashReadonlyDetailsCard({
  record,
}: CashReadonlyDetailsCardProps) {
  const { t } = useTranslation();
  const chartAccountLabel = useCashChartAccountLabel();
  const operationType =
    record.operationTypeName ??
    (record.operationTypeId === 2
      ? t("cash.fields.expense")
      : t("cash.fields.income"));

  return (
    <CashReadonlyLayout
      record={record}
      items={[
        { label: t("cash.fields.operationType"), value: operationType },
        {
          label: t("cash.fields.cashBox"),
          value: record.cashBoxName ?? record.cashBoxId,
        },
        {
          label: t("cash.fields.paymentType"),
          value: record.paymentTypeName ?? record.paymentTypeId,
        },
        {
          label: t("cash.fields.exchangeRate"),
          value: record.exchangeRate,
        },
        {
          label: t("cash.fields.cashChartAccount"),
          value: chartAccountLabel(record.cashChartAccountId),
        },
        {
          label: t("cash.fields.offsetAccount"),
          value: chartAccountLabel(record.offsetAccountId),
        },
        {
          label: t("cash.fields.counterparty"),
          value: record.counterpartyName ?? record.counterpartyId,
        },
      ]}
    />
  );
}
