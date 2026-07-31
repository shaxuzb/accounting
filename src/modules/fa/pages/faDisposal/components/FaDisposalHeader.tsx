import { Col, Row } from "antd";
import SelectDate from "@/components/fields/SelectDate";
import InputText from "@/components/fields/InputText";
import type { FormikProps } from "formik";
import type { FaDisposalFormValues } from "../types/form";

interface FaDisposalHeaderProps {
  formik: FormikProps<FaDisposalFormValues>;
}

export default function FaDisposalHeader({ formik }: FaDisposalHeaderProps) {
  return (
    <Row gutter={[20, 8]}>
      <Col span={8}>
        <SelectDate
          formik={formik}
          fieldName="disposalDate"
          label="fa.fields.disposalDate"
        />
      </Col>
      <Col span={8}>
        <InputText
          formik={formik}
          fieldName="disposalType"
          label="fa.fields.disposalType"
        />
      </Col>
      <Col span={8}>
        <InputText
          formik={formik}
          fieldName="reason"
          label="fa.fields.reason"
        />
      </Col>
    </Row>
  );
}
