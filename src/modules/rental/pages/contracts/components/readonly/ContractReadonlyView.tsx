import { Table } from "antd";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ReadonlyFieldGrid from "@/components/ui/card/ReadonlyFieldGrid";
import type {
  RentalContractDetail,
  RentalContractObject,
} from "../../types/type";
import SectionCard from "@/components/ui/card/SectionCard";
import { formatDate, numberSpacing } from "@/utils/utils";
import { formatRentalLessors } from "../../utils/lessor";
import RentalUtilityServiceCards from "../RentalUtilityServiceCards";

interface ContractReadonlyViewProps {
  data: RentalContractDetail;
}

export default function ContractReadonlyView({
  data,
}: ContractReadonlyViewProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector((state) => state.organization.name);
  const currency = data.currencyCode || data.currencyId || "-";

  return (
    <div className="space-y-2">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("rental.fields.contractNumber")}
          value={data.contractNumber || "-"}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("rental.fields.contractDate")}
          value={formatDate(data.contractDate)}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("rental.fields.currency")}
          value={currency}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("rental.fields.amount")}
          value={
            data.totalContractAmount == null
              ? "-"
              : `${numberSpacing(data.totalContractAmount)} ${currency}`
          }
          emphasized
        />
      </DocumentSummary>

      <SectionCard title={t("rental.contracts.general")} bodyClassName="sm:p-3">
        <ReadonlyFieldGrid
          columns="md:grid-cols-2 xl:grid-cols-6"
          items={[
            // {
            //   label: t("rental.fields.contractNumber"),
            //   value: data.contractNumber,
            // },
            {
              label: t("rental.fields.lessors"),
              value: formatRentalLessors(data.lessors),
              className: "xl:col-span-2",
            },
            {
              label: t("rental.fields.rentalType"),
              value: data.isFreeOfCharge
                ? t("rental.modes.free")
                : t("rental.modes.paid"),
            },
            {
              label: t("rental.fields.contractDate"),
              value: formatDate(data.contractDate),
            },
            {
              label: t("rental.fields.startDate"),
              value: formatDate(data.startDate),
            },
            {
              label: t("rental.fields.endDate"),
              value: formatDate(data.endDate ?? undefined),
            },
            {
              label: t("rental.fields.confirmationDate"),
              value: formatDate(data.confirmationDate ?? undefined),
            },
            {
              label: t("rental.fields.terminationDate"),
              value: formatDate(data.terminationDate ?? undefined),
            },
            {
              label: t("rental.fields.currency"),
              value: currency,
            },
            // {
            //   label: t("common.status"),
            //   value: (
            //     <ProcessStatusBadge
            //       statusId={data.statusId}
            //       statusName={data.statusName}
            //     />
            //   ),
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

      <SectionCard title={t("rental.contracts.objects")} bodyClassName="sm:p-3">
        <Table<RentalContractObject>
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content" }}
          dataSource={data.objects}
          columns={[
            {
              title: t("common.rowNumber"),
              render: (_: unknown, __: unknown, index: number) => index + 1,
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
                `${formatDate(record.startDate)} — ${formatDate(record.endDate ?? undefined)}`,
            },
            {
              title: t("rental.fields.period"),
              render: (_: unknown, record) =>
                `${numberSpacing(record.periodAmount)} ${t(
                  `rental.period.${record.periodUnit === "DAY" ? "day" : "month"}`,
                )}`,
            },
            {
              title: t("rental.fields.contractAmount"),
              align: "right",
              render: (_: unknown, record) =>
                record.contractAmount == null
                  ? "-"
                  : numberSpacing(record.contractAmount),
            },
            {
              title: t("rental.fields.totalArea"),
              align: "right",
              render: (_: unknown, record) => record.totalArea ?? "-",
            },
            {
              title: t("rental.fields.rentedArea"),
              align: "right",
              render: (_: unknown, record) => record.rentedArea ?? "-",
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
        <div className="mt-4 space-y-3">
          {data.objects.map((object, index) => (
            <SectionCard
              key={object.id ?? `rental-object-${index}`}
              title={`${t("rental.contracts.objectNumber", {
                number: index + 1,
              })}${object.objectName ? ` — ${object.objectName}` : ""}`}
              bodyClassName="p-3! sm:p-4!"
            >
              <RentalUtilityServiceCards
                utilities={object.utilities ?? []}
                readOnly
              />
            </SectionCard>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
