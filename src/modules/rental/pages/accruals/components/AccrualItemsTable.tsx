import { Card, Col, Row, Table } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import RentalAccountSelect from "@/modules/rental/shared/components/RentalAccountSelect";
import {
  formatRentalAmount,
  formatRentalDate,
} from "@/modules/rental/shared/utils/formatters";
import type { RentalAccrualDetail, RentalAccrualItem } from "../types/type";
import type { RentalAccrualForm } from "../types/form";
import SectionCard from "@/components/ui/card/SectionCard";

interface AccrualItemsTableProps {
  data: RentalAccrualDetail;
  formik?: FormikProps<RentalAccrualForm>;
}

export default function AccrualItemsTable({
  data,
  formik,
}: AccrualItemsTableProps) {
  const { t } = useTranslation();
  const editing = Boolean(formik);

  return (
    <SectionCard
      title={t("rental.accruals.items")}
      bodyClassName="p-4 sm:p-5"
    >
      <Table<RentalAccrualItem>
        rowKey="id"
        pagination={false}
        scroll={{ x: "max-content" }}
        dataSource={data.items}
        expandable={{
          expandedRowRender: (item, index) => (
            <Card
              size="small"
              title={t("rental.accruals.itemNumber", { number: index + 1 })}
              className="border-border!"
            >
              {editing && formik ? (
                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <RentalAccountSelect
                      formik={formik}
                      fieldName={`items[${index}].expenseAccountId`}
                      label="rental.fields.expenseAccount"
                    />
                  </Col>
                </Row>
              ) : (
                <div className="text-sm">
                  <span className="text-secondary-text">
                    {t("rental.fields.expenseAccount")}:{" "}
                  </span>
                  {[item.expenseAccountNumber, item.expenseAccountName]
                    .filter(Boolean)
                    .join(" - ") || "-"}
                </div>
              )}
            </Card>
          ),
          rowExpandable: () => true,
        }}
        columns={[
          {
            title: t("common.rowNumber"),
            width: 60,
            render: (_: unknown, __: unknown, index: number) => index + 1,
          },
          {
            title: t("rental.fields.objectName"),
            dataIndex: "objectName",
          },
          {
            title: t("rental.fields.period"),
            render: (_: unknown, item) =>
              `${formatRentalDate(item.periodFrom)} — ${formatRentalDate(item.periodTo)}`,
          },
          {
            title: t("rental.fields.contractAmount"),
            align: "right",
            render: (_: unknown, item) =>
              formatRentalAmount(item.contractAmount),
          },
          {
            title: t("rental.fields.taxAmount"),
            align: "right",
            render: (_: unknown, item) => formatRentalAmount(item.taxAmount),
          },
          {
            title: t("rental.fields.payableAmount"),
            align: "right",
            render: (_: unknown, item) =>
              formatRentalAmount(item.payableAmount),
          },
          {
            title: t("rental.fields.amount"),
            align: "right",
            render: (_: unknown, item) => formatRentalAmount(item.amount),
          },
          {
            title: t("rental.fields.expenseAccount"),
            render: (_: unknown, item) =>
              [item.expenseAccountNumber, item.expenseAccountName]
                .filter(Boolean)
                .join(" - ") || "-",
          },
        ]}
      />
    </SectionCard>
  );
}
