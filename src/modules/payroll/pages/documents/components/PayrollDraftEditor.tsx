import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import { PAYROLL_ACCRUAL_DOCUMENT_TYPE_ID } from "../constants/accounts";
import { chartAccountSelectDisplayConfig, selectListEndpoints } from "@/shared/constants/selectLists";
import { Button, Col, Form, Row } from "antd";
import { useFormik } from "formik";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PayrollDraftUpdateForm } from "../types/form";
import type { PayrollDocument } from "../types/type";

interface Props {
  record: PayrollDocument;
  onSubmit: (payload: PayrollDraftUpdateForm) => Promise<void>;
  loading?: boolean;
}

const buildValues = (record: PayrollDocument): PayrollDraftUpdateForm => ({
  salaryExpenseAccountId: record.salaryExpenseAccountId ?? null,
  salaryPayableAccountId: record.salaryPayableAccountId ?? null,
  lines: (record.lines ?? []).filter((line): line is typeof line & { id: number } => line.id != null).map((line) => ({
    lineId: line.id,
    calcLines: (line.calcLines ?? []).filter((calc): calc is typeof calc & { id: number } => calc.id != null).map((calc) => ({
      calcLineId: calc.id,
      amount: calc.amount,
      debitAccountId: calc.debitAccountId ?? null,
      creditAccountId: calc.creditAccountId ?? null,
    })),
    taxLines: (line.taxLines ?? []).filter((tax): tax is typeof tax & { id: number } => tax.id != null).map((tax) => ({
      taxLineId: tax.id,
      amount: tax.amount,
      liabilityAccountId: tax.liabilityAccountId,
    })),
  })),
});

export default function PayrollDraftEditor({ record, onSubmit, loading }: Props) {
  const { t } = useTranslation();
  const formik = useFormik<PayrollDraftUpdateForm>({ initialValues: buildValues(record), enableReinitialize: true, onSubmit });
  return (
    <Form layout="vertical" onFinish={formik.handleSubmit} className="space-y-4">
      <Row gutter={[16, 0]}>
        <Col xs={24} md={12}><DocumentAccountSelect formik={formik} fieldName="salaryExpenseAccountId" label="payroll.fields.salaryExpenseAccount" documentTypeId={PAYROLL_ACCRUAL_DOCUMENT_TYPE_ID} documentRoleCode="salary_expense" allowUserSelection fallbackToAllAccounts search clearable marginBottom="mb-4" /></Col>
        <Col xs={24} md={12}><DocumentAccountSelect formik={formik} fieldName="salaryPayableAccountId" label="payroll.fields.salaryPayableAccount" documentTypeId={PAYROLL_ACCRUAL_DOCUMENT_TYPE_ID} documentRoleCode="salary_payable" allowUserSelection fallbackToAllAccounts search clearable marginBottom="mb-4" /></Col>
      </Row>
      <div className="space-y-3">
        {formik.values.lines.map((line, lineIndex) => {
          const source = record.lines?.find((item) => item.id === line.lineId);
          return <div key={line.lineId} className="rounded-xl border border-border p-3">
            <div className="mb-2 text-sm font-semibold">{source?.employeeName ?? line.lineId}</div>
            {line.calcLines?.map((calc, calcIndex) => {
              const sourceCalc = source?.calcLines?.find((item) => item.id === calc.calcLineId);
              return <Row key={calc.calcLineId} gutter={[12, 0]} className="items-end">
                <Col xs={24} md={6}><div className="mb-4 text-xs text-secondary-text">{sourceCalc?.componentName ?? sourceCalc?.componentCode ?? "Component"}</div></Col>
                <Col xs={24} md={5}><InputNumber formik={formik} fieldName={`lines[${lineIndex}].calcLines[${calcIndex}].amount`} label="payroll.fields.amount" precision={2} min={0} /></Col>
                <Col xs={24} md={6}><SelectCustom formik={formik} fieldName={`lines[${lineIndex}].calcLines[${calcIndex}].debitAccountId`} label="payroll.fields.debitAccount" path={selectListEndpoints.chartAccountsSelectList} displayConfig={chartAccountSelectDisplayConfig} search clearable marginBottom="mb-4" /></Col>
                <Col xs={24} md={6}><SelectCustom formik={formik} fieldName={`lines[${lineIndex}].calcLines[${calcIndex}].creditAccountId`} label="payroll.fields.creditAccount" path={selectListEndpoints.chartAccountsSelectList} displayConfig={chartAccountSelectDisplayConfig} search clearable marginBottom="mb-4" /></Col>
              </Row>;
            })}
            {line.taxLines?.map((tax, taxIndex) => <Row key={tax.taxLineId} gutter={[12, 0]} className="items-end"><Col xs={24} md={11}><div className="mb-4 text-xs text-secondary-text">{source?.taxLines?.find((item) => item.id === tax.taxLineId)?.taxName ?? "Tax"}</div></Col><Col xs={24} md={6}><InputNumber formik={formik} fieldName={`lines[${lineIndex}].taxLines[${taxIndex}].amount`} label="payroll.fields.amount" precision={2} min={0} /></Col><Col xs={24} md={7}><SelectCustom formik={formik} fieldName={`lines[${lineIndex}].taxLines[${taxIndex}].liabilityAccountId`} label="payroll.fields.liabilityAccount" path={selectListEndpoints.chartAccountsSelectList} displayConfig={chartAccountSelectDisplayConfig} search clearable marginBottom="mb-4" /></Col></Row>)}
          </div>;
        })}
      </div>
      <div className="flex justify-end"><Button type="primary" htmlType="submit" loading={loading} icon={<Save className="size-4" />}>{t("common.save")}</Button></div>
    </Form>
  );
}
