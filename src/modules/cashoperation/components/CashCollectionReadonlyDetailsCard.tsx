import { useTranslation } from "react-i18next";
import CashReadonlyLayout from "./CashReadonlyLayout";
import useCashChartAccountLabel from "./useCashChartAccountLabel";
import type { CashCollectionDocument } from "../pages/cash-collection/types/type";

interface Props {
  record: CashCollectionDocument;
}

export default function CashCollectionReadonlyDetailsCard({ record }: Props) {
  const { t } = useTranslation();
  const chartAccountLabel = useCashChartAccountLabel();

  return (
    <CashReadonlyLayout
      record={record}
      items={[
        {
          label: t("cash.fields.cashBox"),
          value: record.cashBoxName ?? record.cashBoxId,
        },
        {
          label: t("bank.fields.bankAccount"),
          value: record.bankAccountNumber ?? record.bankAccountId,
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
          label: t("cash.collection.cashInTransitAccount"),
          value: chartAccountLabel(record.cashInTransitAccountId),
        },
        {
          label: t("cash.collection.bankChartAccount"),
          value: chartAccountLabel(record.bankChartAccountId),
        },
      ]}
    />
  );
}
