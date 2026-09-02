import { Descriptions } from "antd";
import { useTranslation } from "react-i18next";
import RentalStatusBadge from "@/modules/rental/shared/components/RentalStatusBadge";
import {
  formatRentalAmount,
  formatRentalDate,
} from "@/modules/rental/shared/utils/formatters";
import type { RentalAccrualDetail } from "../types/type";
import SectionCard from "@/components/ui/card/SectionCard";

interface AccrualSummaryCardProps {
  data: RentalAccrualDetail;
}

export default function AccrualSummaryCard({
  data,
}: AccrualSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <SectionCard
      title={t("rental.accruals.detail")}
      bodyClassName="p-4 sm:p-5"
    >
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
        <Descriptions.Item label={t("rental.fields.docNumber")}>
          {data.docNumber}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.contractNumber")}>
          {data.contractNumber}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.lessorFullName")}>
          {data.lessorFullName}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.docDate")}>
          {formatRentalDate(data.docDate)}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.currency")}>
          {data.currencyCode || data.currencyId}
        </Descriptions.Item>
        <Descriptions.Item label={t("common.status")}>
          <RentalStatusBadge
            statusId={data.statusId}
            statusName={data.statusName}
          />
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.contractAmount")}>
          {formatRentalAmount(data.contractAmount)}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.taxBaseAmount")}>
          {formatRentalAmount(data.taxBaseAmount)}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.taxAmount")}>
          {formatRentalAmount(data.taxAmount)}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.payableAmount")}>
          {formatRentalAmount(data.payableAmount)}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.amount")}>
          {formatRentalAmount(data.amount)}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.exchangeRate")}>
          {data.exchangeRate}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.lessorPayableAccount")}>
          {[
            data.lessorPayableAccountNumber,
            data.lessorPayableAccountName,
          ]
            .filter(Boolean)
            .join(" - ") || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.taxPayableAccount")}>
          {[data.taxPayableAccountNumber, data.taxPayableAccountName]
            .filter(Boolean)
            .join(" - ") || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("rental.fields.comment")} span={3}>
          {data.comment || "-"}
        </Descriptions.Item>
      </Descriptions>
    </SectionCard>
  );
}
