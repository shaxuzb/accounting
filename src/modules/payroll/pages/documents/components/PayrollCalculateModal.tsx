import InputNumber from "@/components/fields/InputNumber";
import InputTextArea from "@/components/fields/InputTextArea";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import PayrollComponentSelect from "@/modules/payroll/components/PayrollComponentSelect";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import PayrollPeriodSelect from "@/modules/payroll/components/PayrollPeriodSelect";
import {
  correctionPayoutModeOptions,
  documentKindOptions,
} from "@/modules/payroll/constants/options";
import { DATE_TIME_FORMAT } from "@/modules/payroll/utils/format";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Button, Col, Empty, Form, Modal, Row, Select } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useCalculatePayrollDocument,
  usePayrollDocumentLookup,
} from "../hooks";
import type { PayrollCalculateForm } from "../types/form";
import { payrollCalculateSchema } from "../types/schema";
import {
  PAYROLL_ACCRUAL_DOCUMENT_TYPE_ID,
  payrollDocumentAccountFields,
} from "../constants/accounts";

const defaultValues: PayrollCalculateForm = {
  periodId: null,
  docDate: dayjs().format(DATE_TIME_FORMAT),
  documentKind: "REGULAR",
  correctionOfDocId: null,
  correctionPayoutMode: "SEPARATE",
  salaryExpenseAccountId: null,
  salaryPayableAccountId: null,
  note: null,
  adjustments: [],
};

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: number) => void;
}

/**
 * Maoshni hisoblash oynasi.
 * Backend tasdiqlangan tabel va komponentlar asosida qoralama hujjat yaratadi.
 */
export default function PayrollCalculateModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const { t } = useTranslation();
  const calculateMutation = useCalculatePayrollDocument();

  const formik = useFormik<PayrollCalculateForm>({
    initialValues: defaultValues,
    validationSchema: payrollCalculateSchema,
    onSubmit: async (values, helpers) => {
      try {
        const created = await calculateMutation.mutateAsync({
          ...values,
          correctionOfDocId:
            values.documentKind === "CORRECTION"
              ? values.correctionOfDocId
              : null,
          adjustments:
            values.documentKind === "CORRECTION" ? values.adjustments : [],
        });
        toast.success(t("payroll.messages.documentCalculated"));
        helpers.resetForm({ values: defaultValues });
        onClose();
        const createdId =
          typeof created === "number" ? created : Number(created.id);
        if (Number.isFinite(createdId) && createdId > 0) onCreated?.(createdId);
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm, setFieldValue, values } = formik;
  const isCorrection = values.documentKind === "CORRECTION";

  const { data: postedDocuments, isFetching: isDocumentsFetching } =
    usePayrollDocumentLookup(isCorrection ? values.periodId : null);

  useEffect(() => {
    if (open) resetForm({ values: defaultValues });
  }, [open, resetForm]);

  const addAdjustment = () =>
    setFieldValue(
      "adjustments",
      [
        ...values.adjustments,
        { employeeId: null, componentId: null, amount: null, note: null },
      ],
      false,
    );

  const removeAdjustment = (index: number) =>
    setFieldValue(
      "adjustments",
      values.adjustments.filter((_, current) => current !== index),
      false,
    );

  const handleClose = () => {
    resetForm({ values: defaultValues });
    onClose();
  };

  return (
    <Modal maskClosable={false}
      title={t("payroll.documents.calculateTitle")}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={860}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        {/* <Alert
          type="info"
          showIcon
          className="mb-4"
          message={t("payroll.documents.calculateHintTitle")}
          description={t("payroll.documents.calculateHintText")}
        /> */}

        <Row gutter={[16, 0]}>
          <Col xs={24} md={8}>
            <SelectStatic
              formik={formik}
              fieldName="documentKind"
              label="payroll.fields.documentKind"
              options={documentKindOptions}
              required
              marginBottom="mb-4"
              resetFields={["correctionOfDocId"]}
            />
          </Col>
          <Col xs={24} md={8}>
            <PayrollPeriodSelect
              formik={formik}
              fieldName="periodId"
              onlyOpen
              required
            />
          </Col>
          <Col xs={24} md={8}>
            <SelectDate
              formik={formik}
              fieldName="docDate"
              label="payroll.fields.docDate"
              required
            />
          </Col>

          {isCorrection && (
            <Col xs={24} md={12}>
              <Form.Item
                className="flex! flex-col! mb-4"
                label={
                  <span>
                    {t("payroll.fields.correctionOfDoc")}{" "}
                    <span className="text-red-500">*</span>
                  </span>
                }
                validateStatus={
                  formik.touched.correctionOfDocId &&
                  formik.errors.correctionOfDocId
                    ? "error"
                    : ""
                }
                help={
                  formik.touched.correctionOfDocId
                    ? formik.errors.correctionOfDocId
                    : undefined
                }
              >
                <Select
                  value={values.correctionOfDocId ?? undefined}
                  onChange={(value) =>
                    setFieldValue("correctionOfDocId", value ?? null, true)
                  }
                  loading={isDocumentsFetching}
                  disabled={!values.periodId}
                  placeholder={t("payroll.placeholders.selectDocument")}
                  options={(postedDocuments ?? []).map((document) => ({
                    value: document.id,
                    label: document.docNumber ?? String(document.id),
                  }))}
                  style={{ height: 38, width: "100%" }}
                />
              </Form.Item>
            </Col>
          )}

          {isCorrection && (
            <Col xs={24} md={12}>
              <SelectStatic
                formik={formik}
                fieldName="correctionPayoutMode"
                label="payroll.fields.correctionPayoutMode"
                options={correctionPayoutModeOptions}
                required
                marginBottom="mb-4"
              />
            </Col>
          )}

          <Col span={24}>
            <InputTextArea
              formik={formik}
              fieldName="note"
              label="payroll.fields.note"
            />
          </Col>
        </Row>

        <div className="mb-4 rounded-xl border border-border p-3">
          <div className="mb-3">
            <div className="text-sm font-semibold">
              {t("payroll.documents.accountsTitle")}
            </div>
            <div className="text-xs text-secondary-text">
              {t("payroll.documents.accountsHint")}
            </div>
          </div>
          <Row gutter={[16, 0]}>
            {payrollDocumentAccountFields.map((account) => (
              <Col xs={24} md={12} key={account.fieldName}>
                <DocumentAccountSelect
                  formik={formik}
                  fieldName={account.fieldName}
                  label={account.label}
                  documentTypeId={PAYROLL_ACCRUAL_DOCUMENT_TYPE_ID}
                  documentRoleCode={account.roleCode}
                  allowUserSelection
                  fallbackToAllAccounts
                  search
                  required
                  clearable
                  marginBottom="mb-4"
                />
              </Col>
            ))}
          </Row>
        </div>

        {isCorrection && (
          <div className="mb-4 rounded-xl border border-border p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">
                  {t("payroll.documents.adjustmentsTitle")}
                </div>
                <div className="text-xs text-secondary-text">
                  {t("payroll.documents.adjustmentsHint")}
                </div>
              </div>
              <Button
                type="dashed"
                icon={<Plus className="size-4" />}
                onClick={addAdjustment}
              >
                {t("common.add")}
              </Button>
            </div>

            {!values.adjustments.length && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("payroll.documents.noAdjustments")}
              />
            )}

            {values.adjustments.map((_, index) => (
              <Row
                gutter={[12, 0]}
                key={`adjustment-${index}`}
                className="mb-1 items-end"
              >
                <Col xs={24} md={7}>
                  <PayrollEmployeeSelect
                    formik={formik}
                    fieldName={`adjustments[${index}].employeeId`}
                    label="payroll.fields.employee"
                    marginBottom="mb-3"
                  />
                </Col>
                <Col xs={24} md={7}>
                  <PayrollComponentSelect
                    formik={formik}
                    fieldName={`adjustments[${index}].componentId`}
                    label="payroll.fields.component"
                    marginBottom="mb-3"
                  />
                </Col>
                <Col xs={24} md={5}>
                  <InputNumber
                    formik={formik}
                    fieldName={`adjustments[${index}].amount`}
                    label="payroll.fields.amount"
                    precision={2}
                  />
                </Col>
                <Col xs={20} md={4}>
                  <InputTextArea
                    formik={formik}
                    fieldName={`adjustments[${index}].note`}
                    label="payroll.fields.note"
                    rows={1}
                  />
                </Col>
                <Col xs={4} md={1}>
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 className="size-4" />}
                    onClick={() => removeAdjustment(index)}
                    className="mb-6"
                  />
                </Col>
              </Row>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} size="large" className="h-11!">
            {t("common.cancel")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={calculateMutation.isPending}
            className="h-11! min-w-48 font-semibold"
          >
            {t("payroll.documents.calculate")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
