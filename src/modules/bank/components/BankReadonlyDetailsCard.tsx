import ReadonlyDetailsCard from "@/components/fields/ReadonlyDetailsCard";
import { customDate, numberSpacing } from "@/utils/utils";
import type { BankOperationData } from "../pages/statement/types/type";

interface BankReadonlyDetailsCardProps {
  record: BankOperationData;
}

export default function BankReadonlyDetailsCard({
  record,
}: BankReadonlyDetailsCardProps) {
  return (
    <ReadonlyDetailsCard
      items={[
        { label: "Sana", value: customDate(record.docDate) },
        { label: "Bank hisobi", value: record.bankAccountName },
        { label: "Amaliyot turi", value: record.operationTypeName },
        { label: "Kontragent", value: record.counterpartyName },
        {
          label: "Hisob-kitob schyotlari",
          value: record.bankChartAccountNumber,
        },
        {
          label: "Hisob-kitoblar bo'yicha avanslar olingan",
          value: record.offsetAccountNumber,
        },
        {
          label: "Kontragent bank hisobi",
          value:
            record.counterpartyBankAccountName ??
            record.counterpartyBankAccountNumber,
        },
        { label: "Valyuta", value: record.currencyName },
        {
          label: "Summa",
          value: `${numberSpacing(record.amount)} ${record.currencyName ?? ""}`,
        },
        { label: "Kurs", value: record.exchangeRate },
        {
          label: "Shartnoma",
          value: record.contractName ?? record.contractNumber,
        },
        {
          label: "Izoh",
          value: record.comment,
          className: "md:col-span-2",
        },
      ]}
    />
  );
}
