import InputNumber from "@/components/fields/InputNumber";
import InputTextArea from "@/components/fields/InputTextArea";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import { advanceMethodOptions, employmentTypeOptions } from "@/modules/payroll/constants/options";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { Col, Row } from "antd";
import type { FormikProps } from "formik";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikProps<any>;
  /** Formikdagi maydon prefiksi, masalan "employment." */
  prefix?: string;
  disabled?: boolean;
}

/**
 * Ish sharti maydonlari. Xodim yaratish modalida ham,
 * alohida ish sharti modalida ham bir xil ishlatiladi.
 */
export default function EmploymentFormFields({
  formik,
  prefix = "",
  disabled = false,
}: Props) {
  const field = (name: string) => `${prefix}${name}`;

  return (
    <Row gutter={[16, 0]}>
      <Col xs={24} md={12}>
        <SelectCustom
          formik={formik}
          fieldName={field("departmentId")}
          label="payroll.fields.department"
          path={selectListEndpoints.departmentsSelectList}
          search
          clearable
          disabled={disabled}
          marginBottom="mb-4"
        />
      </Col>
      <Col xs={24} md={8}>
        <SelectStatic
          formik={formik}
          fieldName={field("advanceMethod")}
          label="payroll.fields.advanceMethod"
          options={advanceMethodOptions}
          disabled={disabled}
          marginBottom="mb-4"
        />
      </Col>
      <Col xs={24} md={8}>
        <InputNumber
          formik={formik}
          fieldName={field("advanceValue")}
          label={formik.values[field("advanceMethod")] === "PERCENT" ? "payroll.fields.advancePercent" : "payroll.fields.advanceAmount"}
          min={0}
          max={formik.values[field("advanceMethod")] === "PERCENT" ? 100 : undefined}
          precision={2}
          disabled={disabled}
        />
      </Col>
      <Col xs={24} md={8}>
        <InputTextArea formik={formik} fieldName={field("note")} label="payroll.fields.note" rows={1} disabled={disabled} />
      </Col>
      <Col xs={24} md={12}>
        <SelectCustom
          formik={formik}
          fieldName={field("positionId")}
          label="payroll.fields.position"
          path={selectListEndpoints.positionsSelectList}
          search
          clearable
          disabled={disabled}
          marginBottom="mb-4"
        />
      </Col>

      <Col xs={24} md={8}>
        <SelectStatic
          formik={formik}
          fieldName={field("employmentType")}
          label="payroll.fields.employmentType"
          options={employmentTypeOptions}
          required
          disabled={disabled}
          marginBottom="mb-4"
        />
      </Col>
      <Col xs={24} md={8}>
        <SelectDate
          formik={formik}
          fieldName={field("startDate")}
          label="payroll.fields.startDate"
          valueFormat="YYYY-MM-DD"
          required
          disabled={disabled}
        />
      </Col>
      <Col xs={24} md={8}>
        <SelectDate
          formik={formik}
          fieldName={field("endDate")}
          label="payroll.fields.endDate"
          valueFormat="YYYY-MM-DD"
          clearable
          disabled={disabled}
        />
      </Col>

      <Col xs={24} md={8}>
        <InputNumber
          formik={formik}
          fieldName={field("monthlySalary")}
          label="payroll.fields.monthlySalary"
          min={0}
          precision={2}
          disabled={disabled}
        />
      </Col>
      <Col xs={24} md={8}>
        <InputNumber
          formik={formik}
          fieldName={field("employmentRate")}
          label="payroll.fields.employmentRate"
          min={0}
          max={2}
          precision={2}
          disabled={disabled}
        />
      </Col>
      <Col xs={24} md={8}>
        <InputNumber
          formik={formik}
          fieldName={field("weeklyHours")}
          label="payroll.fields.weeklyHours"
          min={0}
          max={168}
          precision={1}
          disabled={disabled}
        />
      </Col>

      <Col xs={24} md={12}>
        <SelectCustom
          formik={formik}
          fieldName={field("currencyId")}
          label="payroll.fields.currency"
          path={selectListEndpoints.currenciesSelectList}
          disabled={disabled}
          marginBottom="mb-4"
        />
      </Col>
      <Col xs={24} md={12}>
        <SelectCustom
          formik={formik}
          fieldName={field("expenseAccountId")}
          label="payroll.fields.expenseAccountOverride"
          path={selectListEndpoints.chartAccountsSelectList}
          displayConfig={chartAccountSelectDisplayConfig}
          search
          clearable
          disabled={disabled}
          marginBottom="mb-4"
        />
      </Col>
    </Row>
  );
}
