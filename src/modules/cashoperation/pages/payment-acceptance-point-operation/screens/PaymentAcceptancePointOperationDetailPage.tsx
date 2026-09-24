import { Button, Col, Form, Input, Row, Spin } from "antd";
import { useFormik } from "formik";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CircleX,
  FileText,
  Info,
  Save,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import InOutSelect from "@/components/fields/InOutSelect";
import SelectDate from "@/components/fields/SelectDate";
import InputNumberFormat from "@/components/fields/InputNumber";
import PaymentAcceptancePointOperationReadonlyDetailsCard from "@/modules/cashoperation/components/PaymentAcceptancePointOperationReadonlyDetailsCard";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import {
  useCancelPaymentAcceptancePointOperation,
  useConfirmPaymentAcceptancePointOperation,
  useCreatePaymentAcceptancePointOperation,
  useGetPaymentAcceptancePointOperation,
  useUpdatePaymentAcceptancePointOperation,
} from "../hooks";
import { toPaymentAcceptancePointOperationPayload } from "../utils/payload";
import type { PaymentAcceptancePointOperationForm } from "../types/form";
import { paymentAcceptancePointOperationSchema } from "../types/schema";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { useAppSelector } from "@/store/hooks";

const listPath = "/main/cash-operationses/payment-acceptance-point-operations";

const createDefaultValues = (): PaymentAcceptancePointOperationForm => ({
  paymentAcceptancePointId: null,
  directionId: 1,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  exchangeRate: 1,
  externalTransactionNumber: "",
  comment: "",
});

// Every field is marked touched, so the empty required ones show their error
// (marking only the filled ones hid exactly the fields that were missing).
const buildTouched = () => ({
  paymentAcceptancePointId: true,
  directionId: true,
  docDate: true,
  currencyId: true,
  amount: true,
  exchangeRate: true,
  externalTransactionNumber: true,
  comment: true,
});

export default function PaymentAcceptancePointOperationDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const organizationName = useAppSelector((state) => state.organization.name);
  const isCreate = !id;
  const detailQuery = useGetPaymentAcceptancePointOperation(id);
  const createMutation = useCreatePaymentAcceptancePointOperation();
  const updateMutation = useUpdatePaymentAcceptancePointOperation(id);
  const confirmMutation = useConfirmPaymentAcceptancePointOperation(id);
  const cancelMutation = useCancelPaymentAcceptancePointOperation(id);
  const record = detailQuery.data;
  const isDraft = isCreate || record?.statusId === 1;
  const isActionBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

  const initialValues = useMemo<PaymentAcceptancePointOperationForm>(
    () => ({
      paymentAcceptancePointId:
        record?.paymentAcceptancePointId ??
        createDefaultValues().paymentAcceptancePointId,
      directionId: record?.directionId === -1 ? -1 : 1,
      docDate: record?.docDate ?? createDefaultValues().docDate,
      currencyId: record?.currencyId ?? createDefaultValues().currencyId,
      amount: record?.amount ?? createDefaultValues().amount,
      exchangeRate: record?.exchangeRate ?? createDefaultValues().exchangeRate,
      externalTransactionNumber:
        record?.externalTransactionNumber ??
        createDefaultValues().externalTransactionNumber,
      comment: record?.comment ?? createDefaultValues().comment,
    }),
    [record],
  );

  const persistDraft = async (values: PaymentAcceptancePointOperationForm) => {
    if (isCreate) {
      await createMutation.mutateAsync(
        toPaymentAcceptancePointOperationPayload(values),
      );
      toast.success(t("cash.paymentAcceptancePointOperation.created"));
      navigate(listPath, { replace: true });
      return true;
    }

    await updateMutation.mutateAsync(
      toPaymentAcceptancePointOperationPayload(values),
    );
    toast.success(t("cash.paymentAcceptancePointOperation.saved"));
    formik.resetForm({ values });
    return true;
  };

  const formik = useFormik<PaymentAcceptancePointOperationForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: paymentAcceptancePointOperationSchema(t),
    onSubmit: async (values) => {
      try {
        await persistDraft(values);
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  useEffect(() => {
    if (!detailQuery.error) return;
    errorHandlers(detailQuery.error);
  }, [detailQuery.error]);

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(buildTouched());
      toast.error(t("cash.messages.fillRequired"));
      return false;
    }

    try {
      await persistDraft(formik.values);
      return true;
    } catch (error) {
      errorHandlers(error);
      return false;
    }
  };

  const ensureSavedBeforeAction = async () => {
    if (!formik.dirty) return true;
    return saveDraft();
  };

  const handleAction = async (kind: "confirm" | "cancel") => {
    if (isCreate || !isDraft) return;
    if (!(await ensureSavedBeforeAction())) return;

    try {
      if (kind === "confirm") {
        await confirmMutation.mutateAsync();
        toast.success(t("cash.paymentAcceptancePointOperation.confirm"));
      } else {
        await cancelMutation.mutateAsync();
        toast.success(t("cash.paymentAcceptancePointOperation.cancelled"));
      }
      navigate(listPath, { replace: true });
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

  if (!isDraft) {
    return record ? (
      <PaymentAcceptancePointOperationReadonlyDetailsCard record={record} />
    ) : null;
  }

  return (
    <div className="min-w-0 space-y-2 pb-1">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("cash.fields.documentNumber")}
          value={record?.docNumber ?? record?.id ?? "-"}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("cash.fields.date")}
          value={
            formik.values.docDate ? customDate(formik.values.docDate) : "-"
          }
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("cash.fields.currency")}
          value={record?.currencyName ?? "-"}
        />
        <DocumentSummaryItem
          icon={<WalletCards size={24} strokeWidth={1.8} />}
          label={t("cash.fields.amount")}
          value={
            formik.values.amount != null
              ? `${numberSpacing(formik.values.amount)} ${record?.currencyName ?? ""}`
              : "-"
          }
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border p-5 sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-heading">
          {t("bank.readonlySections.general")}
        </h2>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="paymentAcceptancePointId"
                label="app.menu.paymentAcceptancePoints"
                path={selectListEndpoints.paymentAcceptancePointsSelectList}
                required
              />
            </Col>
            <Col span={4}>
              <InOutSelect
                formik={formik}
                fieldName="directionId"
                label={t("cash.fields.direction")}
                required
              />
            </Col>
            <Col span={4}>
              <SelectDate
                formik={formik}
                fieldName="docDate"
                label="bank.fields.date"
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="currencyId"
                label="settings.fields.currency"
                path={selectListEndpoints.currenciesSelectList}
                required
              />
            </Col>
            <Col span={4}>
              <InputNumberFormat
                formik={formik}
                fieldName="amount"
                label="bank.fields.amount"
                min={0}
                precision={2}
              />
            </Col>
            <Col span={4}>
              <InputNumberFormat
                formik={formik}
                fieldName="exchangeRate"
                label="cash.fields.exchangeRate"
                min={0}
                precision={6}
              />
            </Col>
            <Col xs={24} md={8}>
              <InputNumberFormat
                value={
                  formik.values.externalTransactionNumber === ""
                    ? null
                    : Number(formik.values.externalTransactionNumber)
                }
                onValueChange={(value) =>
                  formik.setFieldValue(
                    "externalTransactionNumber",
                    value == null ? "" : String(value),
                    true,
                  )
                }
                onBlur={() =>
                  formik.setFieldTouched("externalTransactionNumber", true)
                }
                label="cash.paymentAcceptancePointOperation.externalTransactionNumber"
                min={0}
                precision={0}
              />
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className="border border-border p-3 sm:p-3">
        <h2 className="mb-3 text-lg font-semibold text-heading">
          {t("cash.fields.comment")}
        </h2>
        <Form.Item>
          <Input.TextArea
            value={formik.values.comment}
            onChange={(event) =>
              formik.setFieldValue("comment", event.target.value, true)
            }
            onBlur={() => formik.setFieldTouched("comment", true)}
            placeholder={t("cash.fields.comment")}
            // autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </Card>

      <div className="sticky bottom-0 z-20 mx-1 border-t border-border rounded-xl bg-primary-bg/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:py-4 ">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-text">
            <div className="flex items-center gap-2">
              <Info className="size-6 text-primary" />
              <span>{t("cash.fields.status")}:</span>
              <span className="font-semibold text-text">
                {record?.statusName ?? t("processStatuses.draft")}
              </span>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div>
              <span>{t("cash.fields.amount")}:</span>{" "}
              <span className="font-semibold text-primary">
                {formik.values.amount != null
                  ? `${numberSpacing(formik.values.amount)} ${record?.currencyName ?? ""}`
                  : "-"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              size="large"
              icon={<Save className="size-4" />}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={isActionBusy}
              onClick={() => void saveDraft()}
              className="min-w-36"
            >
              {t("common.save")}
            </Button>
            {!isCreate && (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircle2 className="size-4" />}
                  loading={confirmMutation.isPending}
                  disabled={isActionBusy}
                  onClick={() => void handleAction("confirm")}
                  className="min-w-44"
                >
                  {t("common.confirm")}
                </Button>
                <Button
                  danger
                  size="large"
                  icon={<CircleX className="size-4" />}
                  loading={cancelMutation.isPending}
                  disabled={isActionBusy}
                  onClick={() => void handleAction("cancel")}
                  className="min-w-40"
                >
                  {t("common.cancel")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
