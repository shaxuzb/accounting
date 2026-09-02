import { Descriptions, Table } from "antd";
import { useTranslation } from "react-i18next";
import {
  formatRentalAmount,
  formatRentalDate,
} from "@/modules/rental/shared/utils/formatters";
import RentalStatusBadge from "@/modules/rental/shared/components/RentalStatusBadge";
import type {
  RentalContractDetail,
  RentalContractObject,
} from "../../types/type";
import SectionCard from "@/components/ui/card/SectionCard";

interface ContractReadonlyViewProps {
  data: RentalContractDetail;
}

export default function ContractReadonlyView({
  data,
}: ContractReadonlyViewProps) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 space-y-4">
      <SectionCard
        title={t("rental.contracts.general")}
        bodyClassName="p-4 sm:p-5"
      >
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label={t("rental.fields.contractNumber")}>
            {data.contractNumber}
          </Descriptions.Item>
          <Descriptions.Item label={t("rental.fields.lessorFullName")}>
            {data.lessorFullName}
          </Descriptions.Item>
          <Descriptions.Item label={t("rental.fields.lessorInn")}>
            {data.lessorInn || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("rental.fields.lessorPinfl")}>
            {data.lessorPinfl || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("rental.fields.contractDate")}>
            {formatRentalDate(data.contractDate)}
          </Descriptions.Item>
          <Descriptions.Item label={t("rental.fields.startDate")}>
            {formatRentalDate(data.startDate)}
          </Descriptions.Item>
          <Descriptions.Item label={t("rental.fields.endDate")}>
            {formatRentalDate(data.endDate)}
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
          <Descriptions.Item label={t("rental.fields.lessorPayableAccount")}>
            {[data.lessorPayableAccountNumber, data.lessorPayableAccountName]
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

      <SectionCard
        title={t("rental.contracts.objects")}
        bodyClassName="p-4 sm:p-5"
      >
        <Table<RentalContractObject>
          rowKey="id"
          pagination={false}
          scroll={{ x: 1100 }}
          dataSource={data.objects}
          columns={[
            {
              title: t("common.rowNumber"),
              render: (_: unknown, __: unknown, index: number) => index + 1,
              width: 65,
            },
            {
              title: t("rental.fields.objectType"),
              render: (_: unknown, record) =>
                record.rentalObjectTypeName ||
                record.rentalObjectTypeCode ||
                record.rentalObjectTypeId,
            },
            { title: t("rental.fields.objectName"), dataIndex: "objectName" },
            {
              title: t("rental.fields.identifier"),
              dataIndex: "objectIdentifier",
            },
            {
              title: t("rental.fields.address"),
              dataIndex: "objectAddress",
            },
            {
              title: t("rental.fields.dates"),
              render: (_: unknown, record) =>
                `${formatRentalDate(record.startDate)} — ${formatRentalDate(record.endDate)}`,
            },
            {
              title: t("rental.fields.period"),
              render: (_: unknown, record) =>
                `${record.periodValue} ${t(
                  `rental.period.${record.periodUnit === "DAY" ? "day" : "month"}`,
                )}`,
            },
            {
              title: t("rental.fields.contractAmount"),
              align: "right",
              render: (_: unknown, record) =>
                formatRentalAmount(record.contractAmount),
            },
            {
              title: t("rental.fields.taxRate"),
              align: "right",
              render: (_: unknown, record) => `${record.taxRate}%`,
            },
            {
              title: t("rental.fields.expenseAccount"),
              render: (_: unknown, record) =>
                [record.expenseAccountNumber, record.expenseAccountName]
                  .filter(Boolean)
                  .join(" - ") || "-",
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}
