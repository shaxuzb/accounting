import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import ReadonlyFieldGrid from "@/components/ui/card/ReadonlyFieldGrid";
import SectionCard from "@/components/ui/card/SectionCard";
import { formatDate, numberSpacing } from "@/utils/utils";
import type { RentalAccrualDetail } from "../../types/type";
import AccrualItemsTable from "../AccrualItemsTable";
import AccrualSummaryCard from "../AccrualSummaryCard";

interface AccrualReadonlyViewProps {
  data: RentalAccrualDetail;
  actions?: ReactNode;
}

export default function AccrualReadonlyView({
  data,
  actions,
}: AccrualReadonlyViewProps) {
  const { t } = useTranslation();
  const currency = data.currencyCode || data.currencyId || "-";

  return (
    <div className="space-y-2">
      <AccrualSummaryCard data={data} />
      <SectionCard title={t("rental.accruals.detail")} bodyClassName="sm:p-3">
        <ReadonlyFieldGrid
          columns="md:grid-cols-2 xl:grid-cols-6"
          items={[
            {
              label: t("rental.fields.contractNumber"),
              value: data.contractNumber,
            },
            {
              label: t("rental.fields.lessorFullName"),
              value: data.lessorFullName,
              className: "xl:col-span-2",
            },
            {
              label: t("rental.fields.lessorInn"),
              value: data.lessorInn,
            },
            {
              label: t("rental.fields.lessorPinfl"),
              value: data.lessorPinfl,
            },
            {
              label: t("rental.fields.docDate"),
              value: formatDate(data.docDate),
            },
            {
              label: t("rental.fields.currency"),
              value: currency,
            },
            // {
            //   label: t("rental.fields.exchangeRate"),
            //   value: data.exchangeRate,
            // },

            {
              label: t("rental.fields.lessorPayableAccount"),
              value: [
                data.lessorPayableAccountNumber,
                data.lessorPayableAccountName,
              ]
                .filter(Boolean)
                .join(" - "),
              className: "xl:col-span-2",
            },
            {
              label: t("rental.fields.taxPayableAccount"),
              value: [data.taxPayableAccountNumber, data.taxPayableAccountName]
                .filter(Boolean)
                .join(" - "),
              className: "xl:col-span-2",
            },
            {
              label: t("rental.fields.contractAmount"),
              value: numberSpacing(data.contractAmount),
            },
            {
              label: t("rental.fields.taxBaseAmount"),
              value: numberSpacing(data.taxBaseAmount),
            },
            {
              label: t("rental.fields.taxAmount"),
              value: numberSpacing(data.taxAmount),
            },
            {
              label: t("rental.fields.payableAmount"),
              value: numberSpacing(data.payableAmount),
            },
          ]}
        />
      </SectionCard>
      <SectionCard title={t("rental.fields.comment")} bodyClassName="sm:p-3">
        <ReadonlyFieldGrid
          items={[
            {
              label: t("rental.fields.comment"),
              value: data.comment,
              className: "md:col-span-2 xl:col-span-4",
            },
          ]}
        />
      </SectionCard>
      <AccrualItemsTable data={data} />
      {actions}
    </div>
  );
}
