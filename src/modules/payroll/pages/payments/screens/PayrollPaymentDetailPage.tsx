import InputTextArea from "@/components/fields/InputTextArea";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import DocumentActionsCard from "@/components/ui/card/DocumentActionsCard";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollDocumentHeader from "@/modules/payroll/components/PayrollDocumentHeader";
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
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Col, Form, Row, Select, Spin, Tag } from "antd";
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
} from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import PaymentLinesEditor from "../components/PaymentLinesEditor";
import {
  useCancelPayrollPayment,
  useConfirmPayrollPayment,
  useCreatePayrollPayment,
  useGetDetailPayrollPayment,
} from "../hooks";
import type { PayrollPaymentForm } from "../types/form";
import { payrollPaymentSchema } from "../types/schema";
import {
  createDefaultPaymentForm,
  mapPaymentToForm,
  paymentTotal,
} from "../utils/payment";

const LIST_PATH = "/main/payroll/payments";

export default function PayrollPaymentDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;

  const detailQuery = useGetDetailPayrollPayment(id);
  const createMutation = useCreatePayrollPayment();
  const confirmMutation = useConfirmPayrollPayment(id);
  const cancelMutation = useCancelPayrollPayment(id);

  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || isDraftStatus(statusId);

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
        navigate(`${LIST_PATH}/${created.id}`, { replace: true });
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { values } = formik;
  const isFinal = values.paymentKind === "FINAL";

  const { data: postedDocuments, isFetching: isDocumentsFetching } =
    usePayrollDocumentLookup(isFinal ? values.periodId : null);
  const { data: payrollDocument } = useGetDetailPayrollDocument(
    isFinal ? values.payrollDocId : null,
  );

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

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PayrollDocumentHeader
        title="payroll.payments.title"
        docNumber={record?.docNumber}
        docDate={record?.docDate}
        statusId={record?.statusId}
        statusName={record?.statusName}
        isCreate={isCreate}
        onBack={() => navigate(LIST_PATH)}
        extra={
          !isCreate && (
            <Tag
              className="m-0!"
              color={record?.paymentKind === "ADVANCE" ? "gold" : "blue"}
            >
              {t(`payroll.enums.paymentKind.${record?.paymentKind}`, {
                defaultValue: record?.paymentKind ?? "",
              })}
            </Tag>
          )
        }
      />

      {/* {!isCreate && !isDraft && (
        <Alert
          type="success"
          showIcon
          message={t("payroll.payments.postedInfo")}
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
      )} */}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
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
                    resetFields={["payrollDocId"]}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <PayrollPeriodSelect
                    formik={formik}
                    fieldName="periodId"
                    onlyOpen={isCreate}
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
                        options={(postedDocuments ?? []).map((document) => ({
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
        </div>

        <div className="space-y-4">
          <DocumentActionsCard
            actions={[
              {
                key: "save",
                label: "payroll.payments.save",
                icon: <Save className="size-4" />,
                type: "primary",
                onClick: handleSave,
                loading: createMutation.isPending,
                hidden: !isCreate,
                permission: payrollPaymentPermissions.create,
              },
              {
                key: "confirm",
                label: "payroll.actions.confirmAndPay",
                icon: <CheckCircle2 className="size-4" />,
                type: "primary",
                onClick: () =>
                  runMutation(
                    () => confirmMutation.mutateAsync(),
                    "payroll.messages.paymentConfirmed",
                  ),
                loading: confirmMutation.isPending,
                hidden: isCreate || !isDraft,
                permission: payrollPaymentPermissions.confirm,
                confirm: {
                  title: "payroll.payments.confirmTitle",
                  content: "payroll.payments.confirmText",
                  okText: "payroll.actions.confirm",
                },
                hint: "payroll.payments.confirmHint",
              },
              {
                key: "cancel",
                label: "payroll.actions.cancel",
                icon: <CircleX className="size-4" />,
                danger: true,
                onClick: () =>
                  runMutation(
                    () => cancelMutation.mutateAsync(),
                    "payroll.messages.paymentCancelled",
                  ),
                loading: cancelMutation.isPending,
                hidden: isCreate || statusId === 3,
                permission: payrollPaymentPermissions.cancel,
                confirm: {
                  title: "payroll.payments.cancelTitle",
                  content: "payroll.payments.cancelText",
                  okText: "payroll.actions.cancel",
                  danger: true,
                },
              },
            ]}
            footer={
              !isCreate && record?.payrollDocId ? (
                <Link
                  to={`/main/payroll/documents/${record.payrollDocId}`}
                  className="mt-1 block text-center text-sm text-primary"
                >
                  {t("payroll.payments.openPayrollDocument")}
                </Link>
              ) : null
            }
          />
        </div>
      </div>
    </div>
  );
}
