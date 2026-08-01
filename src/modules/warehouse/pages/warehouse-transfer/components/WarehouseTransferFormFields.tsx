import type { FormikProps } from "formik";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { WarehouseTransferForm } from "../types/form";
import { Col, Form, Row } from "antd";
import { useTranslation } from "react-i18next";

interface Props {
  formik: FormikProps<WarehouseTransferForm>;
  disabled?: boolean;
}

export default function WarehouseTransferFormFields({
  formik,
  disabled = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="p-4">
      <Form layout="vertical">
        <Row gutter={[16, 0]}>
          <Col span={8}>
            <SelectDate
              formik={formik}
              fieldName="docDate"
              label="bank.fields.date"
              disabled={disabled}
            />
          </Col>
          <Col span={8}>
            <SelectCustom
              formik={formik}
              fieldName="sourceWarehouseId"
              label={t("warehouse.fields.sourceWarehouse")}
              path={selectListEndpoints.warehousesSelectList}
              disabled={disabled}
            />
          </Col>
          <Col span={8}>
            <SelectCustom
              formik={formik}
              fieldName="destinationWarehouseId"
              label={t("warehouse.fields.destinationWarehouse")}
              path={selectListEndpoints.warehousesSelectList}
              disabled={disabled}
            />
          </Col>
          <Col span={24}>
            <InputText
              formik={formik}
              fieldName="comment"
              label="bank.fields.comment"
              disabled={disabled}
            />
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
