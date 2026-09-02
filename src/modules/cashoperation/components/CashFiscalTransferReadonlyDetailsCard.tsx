import { useTranslation } from "react-i18next";
import CashReadonlyLayout from "./CashReadonlyLayout";
import useCashChartAccountLabel from "./useCashChartAccountLabel";
import type { CashFiscalTransfer } from "../pages/cash-fiscal-transfer/types/type";

interface Props {
  record: CashFiscalTransfer;
}

export default function CashFiscalTransferReadonlyDetailsCard({
  record,
}: Props) {
  const { t } = useTranslation();
  const chartAccountLabel = useCashChartAccountLabel();
  const direction =
    record.directionName ??
    (record.directionId === 1
      ? t("cash.fields.income")
      : t("cash.fields.expense"));

  return (
    <CashReadonlyLayout
      record={record}
      items={[
        { label: t("cash.fields.operationType"), value: direction },
        {
          label: t("cash.fields.cashBox"),
          value: record.cashBoxName ?? record.cashBoxId,
        },
        {
          label: t("cash.fiscalTransfer.fiscalCashAccount"),
          value: chartAccountLabel(record.fiscalCashAccountId),
        },
        {
          label: t("cash.fiscalTransfer.cashBoxAccount"),
          value: chartAccountLabel(record.cashBoxAccountId),
        },
        {
          label: t("cash.fields.exchangeRate"),
          value: record.exchangeRate,
        },
        {
          label: t("cash.fields.exchangeRate"),
          value: record.fiscalCashRegisterName,
        },
      ]}
    />
  );
}
