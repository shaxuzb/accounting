import InputTextArea from "@/components/fields/InputTextArea";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollPeriodSelect from "@/modules/payroll/components/PayrollPeriodSelect";
import {
  isDraftStatus,
  paymentKindOptions,
  sourceTypeOptions,
} from "@/modules/payroll/constants/options";
import { payrollPaymentPermissions } from "@/modules/payroll/constants/permissions";
import { money } from "@/modules/payroll/utils/format";
import {
  useGetDetailPayrollDocument,
  usePayrollDocumentLookup,
} from "@/modules/payroll/pages/documents/hooks";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Button, Col, Form, Popconfirm, Row, Select, Spin } from "antd";
import { useFormik } from "formik";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Landmark,
  Save,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import PaymentLinesEditor from "../components/PaymentLinesEditor";
import {
  useCancelPayrollPayment,
  useConfirmPayrollPayment,
  useCreatePayrollPayment,
  useGetDetailPayrollPayment,
  useGetPayrollAdvanceSuggestion,
} from "../hooks";
import type { PayrollPaymentForm } from "../types/form";
import { payrollPaymentSchema } from "../types/schema";
import {
  createDefaultPaymentForm,
  mapPaymentToForm,
  paymentTotal,
  mapAdvanceSuggestionToPaymentLines,
  filterDocumentsForFinalPayment,
} from "../utils/payment";

const LIST_PATH = "/main/payroll/payments";

export default function PayrollPaymentDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );

  const detailQuery = useGetDetailPayrollPayment(id);
  const createMutation = useCreatePayrollPayment();
  const confirmMutation = useConfirmPayrollPayment(id);
  const cancelMutation = useCancelPayrollPayment(id);

  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || isDraftStatus(statusId);
  const canSave =
    isCreate && permissions.includes(payrollPaymentPermissions.create);
  const canConfirm =
    !isCreate &&
    isDraft &&
    permissions.includes(payrollPaymentPermissions.confirm);
  const canCancel =
    !isCreate &&
    statusId !== 3 &&
    permissions.includes(payrollPaymentPermissions.cancel);

  const initialValues = useMemo<PayrollPaymentForm>(
    () => (isCreate ? createDefaultPaymentForm() : mapPaymentToForm(record)),
    [isCreate, record],
  );

  const formik = useFormik<PayrollPaymentForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: payrollPaymentSchema,
    onSubmit: async (values) => {
      const payload: PayrollPaymentForm = {
        ...values,
        payrollDocId:
          values.paymentKind === "FINAL" ? values.payrollDocId : null,
        bankAccountId:
          values.sourceType === "BANK" ? values.bankAccountId : null,
        cashBoxId: values.sourceType === "CASH" ? values.cashBoxId : null,
        lines: values.lines.map((line) => ({
          employeeId: line.employeeId,
          amount: line.amount,
          note: line.note,
        })),
      };
      try {
        const created = await createMutation.mutateAsync(payload);
        toast.success(t("payroll.messages.paymentCreated"));
        const createdId =
          typeof created === "number" ? created : Number(created.id);
        if (Number.isFinite(createdId) && createdId > 0) {
          navigate(`${LIST_PATH}/${createdId}`, { replace: true });
        }
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { values } = formik;
  const isFinal = values.paymentKind === "FINAL";
  const { data: advanceSuggestion } = useGetPayrollAdvanceSuggestion(
    isCreate && values.paymentKind === "ADVANCE" ? values.periodId : null,
  );
  const prefilledAdvancePeriod = useRef<number | null>(null);
  useEffect(() => {
    if (values.paymentKind !== "ADVANCE") {
      prefilledAdvancePeriod.current = null;
      return;
    }
    if (!isCreate || !values.periodId || !advanceSuggestion || prefilledAdvancePeriod.current === values.periodId) return;
    formik.setFieldValue("lines", mapAdvanceSuggestionToPaymentLines(advanceSuggestion.lines ?? []), false);
    prefilledAdvancePeriod.current = values.periodId;
  }, [advanceSuggestion, formik, isCreate, values.paymentKind, values.periodId]);

  const { data: postedDocuments, isFetching: isDocumentsFetching } =
    usePayrollDocumentLookup(isFinal ? values.periodId : null);
  const { data: payrollDocument } = useGetDetailPayrollDocument(
    isFinal ? values.payrollDocId : null,
  );

  // A final payment settles one payroll document: its liability account and currency are
  // the document's (1C «Ведомость» takes both from the accrual), so they are taken from it
  // rather than picked again by hand.
  useEffect(() => {
    if (!isCreate || !isFinal || !payrollDocument) return;
    if (payrollDocument.id !== values.payrollDocId) return;
    if (payrollDocument.salaryPayableAccountId && !values.offsetAccountId)
      formik.setFieldValue("offsetAccountId", payrollDocument.salaryPayableAccountId, false);
    if (payrollDocument.currencyId && !values.currencyId)
      formik.setFieldValue("currencyId", payrollDocument.currencyId, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreate, isFinal, payrollDocument, values.payrollDocId]);

  const total = useMemo(
    () => (isCreate ? paymentTotal(values.lines) : (record?.totalAmount ?? 0)),
    [isCreate, values.lines, record?.totalAmount],
  );

  const handleSave = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        {
          periodId: true,
          payrollDocId: true,
          docDate: true,
          paymentKind: true,
          sourceType: true,
          bankAccountId: true,
          cashBoxId: true,
          sourceChartAccountId: true,
          offsetAccountId: true,
          currencyId: true,
          lines: values.lines.map(() => ({ employeeId: true, amount: true })),
        },
        false,
      );
      toast.error(t("payroll.messages.fillRequired"));
      return;
    }
    await formik.submitForm();
  };

  const runMutation = async (
    action: () => Promise<unknown>,
    successKey: string,
  ) => {
    try {
      await action();
      toast.success(t(successKey));
    } catch (error) {
      errorHandlers(error);
    }
  };

  const isBusy =
    createMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      {!isCreate && record && (
        <Alert
          type={isDraft ? "warning" : "success"}
          showIcon
          message={
            isDraft
              ? t("payroll.payments.draftInfo", { defaultValue: "Payment is a draft and has not been posted." })
              : t("payroll.payments.postedInfo", { defaultValue: "Payment is posted." })
          }
          description={
            record?.bankOperationId || record?.cashOperationId ? (
              <span>
                {record.bankOperationId
                  ? `${t("payroll.fields.bankOperation")}: #${record.bankOperationId}`
                  : `${t("payroll.fields.cashOperation")}: #${record.cashOperationId}`}
              </span>
            ) : undefined
          }
        />
      )}

      <SectionCard
        title="payroll.payments.headerTitle"
        description="payroll.payments.headerHint"
        icon={<CalendarDays className="size-4" />}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
                <Col xs={24} md={8}>
                  <SelectStatic
                    formik={formik}
                    fieldName="paymentKind"
                    label="payroll.fields.paymentKind"
                    options={paymentKindOptions}
                    required
                    disabled={!isCreate}
                    marginBottom="mb-4"
                    resetFields={["payrollDocId", "offsetAccountId"]}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <PayrollPeriodSelect
                    formik={formik}
                    fieldName="periodId"
                    // A final payment settles a closed month's salary — that is the usual
                    // case, not an exception — so only an advance needs an open period.
                    onlyOpen={isCreate && !isFinal}
                    required
                    disabled={!isCreate}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <SelectDate
                    formik={formik}
                    fieldName="docDate"
                    label="payroll.fields.docDate"
                    required
                    disabled={!isCreate}
                  />
                </Col>

                {isFinal && (
                  <Col xs={24} md={8}>
                    <Form.Item
                      className="flex! flex-col! mb-4"
                      label={
                        <span>
                          {t("payroll.fields.payrollDocument")}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      }
                      validateStatus={
                        formik.touched.payrollDocId && formik.errors.payrollDocId
                          ? "error"
                          : ""
                      }
                      help={
                        formik.touched.payrollDocId
                          ? formik.errors.payrollDocId
                          : undefined
                      }
                    >
                      <Select
                        value={values.payrollDocId ?? undefined}
                        onChange={(value) =>
                          formik.setFieldValue("payrollDocId", value, true)
                        }
                        loading={isDocumentsFetching}
                        disabled={!isCreate || !values.periodId}
                        placeholder={t("payroll.placeholders.selectDocument")}
                        options={filterDocumentsForFinalPayment(postedDocuments ?? []).map((document) => ({
                          value: document.id,
                          label: `${document.docNumber ?? document.id} · ${money(
                            document.outstandingAmount ?? document.payableAmount,
                          )}`,
                        }))}
                        style={{ height: 38, width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                )}

                <Col xs={24} md={8}>
                  <SelectStatic
                    formik={formik}
                    fieldName="sourceType"
                    label="payroll.fields.sourceType"
                    options={sourceTypeOptions}
                    required
                    disabled={!isCreate}
                    marginBottom="mb-4"
                    resetFields={["bankAccountId", "cashBoxId"]}
                  />
                </Col>

                {values.sourceType === "BANK" ? (
                  <Col xs={24} md={8}>
                    <SelectCustom
                      formik={formik}
                      fieldName="bankAccountId"
                      label="payroll.fields.bankAccount"
                      path={selectListEndpoints.orgBankAccountsSelectList}
                      search
                      required
                      disabled={!isCreate}
                      marginBottom="mb-4"
                    />
                  </Col>
                ) : (
                  <Col xs={24} md={8}>
                    <SelectCustom
                      formik={formik}
                      fieldName="cashBoxId"
                      label="payroll.fields.cashBox"
                      path={selectListEndpoints.cashBoxesSelectList}
                      search
                      required
                      disabled={!isCreate}
                      marginBottom="mb-4"
                    />
                  </Col>
                )}

                <Col xs={24} md={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="sourceChartAccountId"
                    label="payroll.fields.sourceChartAccount"
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    search
                    required
                    disabled={!isCreate}
                    marginBottom="mb-4"
                  />
                </Col>
                <Col xs={24} md={8}>
                  <DocumentAccountSelect
                    formik={formik}
                    fieldName="offsetAccountId"
                    label="payroll.fields.offsetAccount"
                    documentTypeId={9}
                    documentRoleCode={
                      values.paymentKind === "ADVANCE"
                        ? "advance_receivable"
                        : "salary_payable"
                    }
                    allowUserSelection
                    fallbackToAllAccounts
                    search
                    required
                    clearable
                    disabled={!isCreate}
                    marginBottom="mb-4"
                  />
                </Col>
                <Col xs={24} md={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="currencyId"
                    label="payroll.fields.currency"
                    path={selectListEndpoints.currenciesSelectList}
                    required
                    disabled={!isCreate}
                    marginBottom="mb-4"
                  />
                </Col>
                <Col xs={24} md={16}>
                  <InputTextArea
                    formik={formik}
                    fieldName="note"
                    label="payroll.fields.note"
                    rows={1}
                    disabled={!isCreate}
                  />
                </Col>
          </Row>
        </Form>
      </SectionCard>

      <DocumentSummary>
            <DocumentSummaryItem
              icon={<Users className="size-5" />}
              label={t("payroll.fields.employeeCount")}
              value={
                isCreate
                  ? values.lines.length
                  : (record?.employeeCount ?? record?.lines?.length ?? "—")
              }
            />
            <DocumentSummaryItem
              icon={<Wallet className="size-5" />}
              label={t("payroll.fields.totalAmount")}
              value={`${money(total)} ${record?.currencyName ?? ""}`}
              emphasized
            />
            <DocumentSummaryItem
              icon={
                values.sourceType === "BANK" ? (
                  <Landmark className="size-5" />
                ) : (
                  <Banknote className="size-5" />
                )
              }
              label={t("payroll.fields.source")}
              value={
                record?.bankAccountName ??
                record?.cashBoxName ??
                t(`payroll.enums.sourceType.${values.sourceType}`)
              }
            />
            <DocumentSummaryItem
              icon={<CalendarDays className="size-5" />}
              label={t("payroll.fields.paymentKind")}
              value={t(`payroll.enums.paymentKind.${values.paymentKind}`)}
            />
            <DocumentSummaryItem
              icon={<Wallet className="size-5" />}
              label={t("payroll.fields.payrollDocument")}
              value={
                record?.payrollDocNumber ??
                (payrollDocument?.docNumber ?? "—")
              }
            />
      </DocumentSummary>

      <PaymentLinesEditor
        formik={formik}
        disabled={!isCreate}
        payrollDocument={payrollDocument}
        currencyName={record?.currencyName}
      />

      {(isCreate || canSave || canConfirm || canCancel || record?.payrollDocId) && (
        <Card className="sticky bottom-0 z-20 border border-border bg-primary-bg/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {!isCreate && record?.payrollDocId ? (
              <Link
                to={`/main/payroll/documents/${record.payrollDocId}`}
                className="text-sm text-primary"
              >
                {t("payroll.payments.openPayrollDocument")}
              </Link>
            ) : (
              <span />
            )}

            <div className="flex flex-wrap justify-end gap-3">
              {isCreate && (
                <Button
                  icon={<X className="size-4" />}
                  disabled={isBusy}
                  onClick={() => navigate(LIST_PATH)}
                >
                  {t("common.cancel")}
                </Button>
              )}

              {canCancel && (
                <Popconfirm
                  title={t("payroll.payments.cancelTitle")}
                  description={t("payroll.payments.cancelText")}
                  okText={t("payroll.actions.cancel")}
                  cancelText={t("common.cancel")}
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    runMutation(
                      () => cancelMutation.mutateAsync(),
                      "payroll.messages.paymentCancelled",
                    )
                  }
                >
                  <Button
                    danger
                    icon={<CircleX className="size-4" />}
                    loading={cancelMutation.isPending}
                    disabled={
                      createMutation.isPending || confirmMutation.isPending
                    }
                  >
                    {t("payroll.actions.cancel")}
                  </Button>
                </Popconfirm>
              )}

              {canSave && (
                <Button
                  type="primary"
                  icon={<Save className="size-4" />}
                  loading={createMutation.isPending}
                  disabled={
                    confirmMutation.isPending || cancelMutation.isPending
                  }
                  onClick={handleSave}
                >
                  {t("common.save")}
                </Button>
              )}

              {canConfirm && (
                <Popconfirm
                  title={t("payroll.payments.confirmTitle")}
                  description={t("payroll.payments.confirmText")}
                  okText={t("payroll.actions.confirm")}
                  cancelText={t("common.cancel")}
                  onConfirm={() =>
                    runMutation(
                      () => confirmMutation.mutateAsync(),
                      "payroll.messages.paymentConfirmed",
                    )
                  }
                >
                  <Button
                    type="primary"
                    icon={<CheckCircle2 className="size-4" />}
                    loading={confirmMutation.isPending}
                    disabled={
                      createMutation.isPending || cancelMutation.isPending
                    }
                  >
                    {t("payroll.actions.confirmAndPay")}
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
