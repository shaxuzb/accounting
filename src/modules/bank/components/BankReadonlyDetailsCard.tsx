import ReadonlyDetailsCard from "@/components/fields/ReadonlyDetailsCard";
import { customDate, numberSpacing } from "@/utils/utils";
import type { BankOperationData } from "../pages/statement/types/type";
import { useTranslation } from "react-i18next";

interface BankReadonlyDetailsCardProps {
  record: BankOperationData;
}

export default function BankReadonlyDetailsCard({
  record,
}: BankReadonlyDetailsCardProps) {
  const { t } = useTranslation();
  return (
    <ReadonlyDetailsCard
      items={[
        { label: t("bank.fields.date"), value: customDate(record.docDate) },
        { label: t("bank.fields.bankAccount"), value: record.bankAccountName },
        { label: t("bank.fields.operationType"), value: record.operationTypeName },
        { label: t("bank.fields.counterparty"), value: record.counterpartyName },
        {
          label: t("bank.fields.bankChartAccount"),
          value: record.bankChartAccountNumber,
        },
        {
          label: t("bank.fields.offsetAccount"),
          value: record.offsetAccountNumber,
        },
        {
          label: t("bank.fields.counterpartyBankAccount"),
          value:
            record.counterpartyBankAccountName ??
            record.counterpartyBankAccountNumber,
        },
        { label: t("settings.fields.currency"), value: record.currencyName },
        {
          label: t("bank.fields.amount"),
          value: `${numberSpacing(record.amount)} ${record.currencyName ?? ""}`,
        },
        { label: t("bank.fields.exchangeRate"), value: record.exchangeRate },
        {
          label: t("bank.fields.contract"),
          value: record.contractName ?? record.contractNumber,
        },
        {
          label: t("bank.fields.comment"),
          value: record.comment,
          className: "md:col-span-2",
        },
      ]}
    />
  );
}
