import { Card, Col, Row, Table } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { RentalAccrualDetail, RentalAccrualItem } from "../types/type";
import type { RentalAccrualForm } from "../types/form";
import SectionCard from "@/components/ui/card/SectionCard";
import { formatDate, numberSpacing } from "@/utils/utils";

interface AccrualItemsTableProps {
  data: RentalAccrualDetail;
  formik?: FormikProps<RentalAccrualForm>;
  disabled?: boolean;
}

export default function AccrualItemsTable({
  data,
  formik,
  disabled = false,
}: AccrualItemsTableProps) {
  const { t } = useTranslation();
  const editing = Boolean(formik);

  return (
    <SectionCard title={t("rental.accruals.items")} bodyClassName="sm:p-3">
      <Table<RentalAccrualItem>
        rowKey="id"
        pagination={false}
        scroll={{ x: "max-content" }}
        dataSource={data.items}
        expandable={
          editing && formik
            ? {
                expandedRowRender: (_item, index) => (
                  <Card
                    size="small"
                    title={t("rental.accruals.itemNumber", {
                      number: index + 1,
                    })}
                    className="border-border!"
                  >
                    <Row gutter={[16, 0]}>
                      <Col span={4}>
                        <SelectCustom
                          formik={formik as FormikProps<object>}
                          fieldName={`items[${index}].expenseAccountId`}
                          label="rental.fields.expenseAccount"
                          path={selectListEndpoints.chartAccountSelect}
                          search
                          disabled={disabled}
                          displayConfig={chartAccountSelectDisplayConfig}
                        />
                      </Col>
                    </Row>
                  </Card>
                ),
                rowExpandable: () => true,
              }
            : undefined
        }
        columns={[
          {
            title: t("common.rowNumber"),
            render: (_: unknown, __: unknown, index: number) => index + 1,
          },
          {
            title: t("rental.fields.objectName"),
            dataIndex: "objectName",
          },
          {
            title: t("rental.fields.period"),
            render: (_: unknown, item) =>
              `${formatDate(item.periodFrom)} — ${formatDate(item.periodTo)}`,
          },
          {
            title: t("rental.fields.contractAmount"),
            align: "right",
            render: (_: unknown, item) => numberSpacing(item.contractAmount),
          },
          {
            title: t("rental.fields.taxAmount"),
            align: "right",
            render: (_: unknown, item) => numberSpacing(item.taxAmount),
          },
          {
            title: t("rental.fields.payableAmount"),
            align: "right",
            render: (_: unknown, item) => numberSpacing(item.payableAmount),
          },
          {
            title: t("rental.fields.amount"),
            align: "right",
            render: (_: unknown, item) => numberSpacing(item.amount),
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
