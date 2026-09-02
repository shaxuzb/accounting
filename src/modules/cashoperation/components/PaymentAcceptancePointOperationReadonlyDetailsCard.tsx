import { useTranslation } from "react-i18next";
import CashReadonlyLayout from "./CashReadonlyLayout";
import type { PaymentAcceptancePointOperation } from "../pages/payment-acceptance-point-operation/types/type";

interface Props {
  record: PaymentAcceptancePointOperation;
}

export default function PaymentAcceptancePointOperationReadonlyDetailsCard({
  record,
}: Props) {
  const { t } = useTranslation();
  const direction =
    record.directionName ??
    (record.directionId === 1
      ? t("cash.fields.income")
      : t("cash.fields.expense"));

  return (
    <CashReadonlyLayout
      record={record}
      items={[
        {
          label: t("app.menu.paymentAcceptancePoints"),
          value:
            record.paymentAcceptancePointName ??
            record.paymentAcceptancePointId,
        },
        { label: t("cash.fields.operationType"), value: direction },
        {
          label: t(
            "cash.paymentAcceptancePointOperation.externalTransactionNumber",
          ),
          value: record.externalTransactionNumber,
        },
        {
          label: t("cash.fields.exchangeRate"),
          value: record.exchangeRate,
        },
        {
          label: t("documents.relatedDocument"),
          value: record.relatedDocumentNumber ?? record.relatedDocumentId,
        },
      ]}
    />
  );
}
