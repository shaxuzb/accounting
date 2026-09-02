import { Button, Form, Input, Spin } from "antd";
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
import CashReadonlyDetailsCard from "@/modules/cashoperation/components/CashReadonlyDetailsCard";
import CashOperationFormFields from "@/modules/cashoperation/pages/cashoperation/components/CashOperationModal";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import { cashOperationSchema } from "../types/schema";
import type { CashOperationForm } from "../types/form";
import {
  useCancelCashOperation,
  useConfirmCashOperation,
  useCreateCashOperation,
  useGetDetailCashOperation,
  useUpdateCashOperation,
} from "../hooks";
import { getCashOperationInitialValues } from "../utils/initialValues";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { useAppSelector } from "@/store/hooks";

const defaultValues: CashOperationForm = {
  cashBoxId: null,
  cashChartAccountId: null,
  offsetAccountId: null,
  cashOperationId: null,
  operationTypeId: null,
  paymentTypeId: null,
  counterpartyId: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  comment: "",
  stateId: null,
};

const buildTouched = (values: CashOperationForm) => ({
  cashBoxId: values.cashBoxId !== null,
  cashChartAccountId: values.cashChartAccountId !== null,
  offsetAccountId: values.offsetAccountId !== null,
  cashOperationId: values.cashOperationId !== null,
  operationTypeId: values.operationTypeId !== null,
  paymentTypeId: values.paymentTypeId !== null,
  counterpartyId: values.counterpartyId !== null,
  docDate: Boolean(values.docDate),
  currencyId: values.currencyId !== null,
  amount: values.amount !== null,
  comment: Boolean(values.comment),
});

export default function CashOperationAddEditPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const organizationName = useAppSelector((state) => state.organization.name);
  const isCreate = !id;
  const detailQuery = useGetDetailCashOperation(id);
  const createMutation = useCreateCashOperation();
  const updateMutation = useUpdateCashOperation();
  const confirmMutation = useConfirmCashOperation(id);
  const cancelMutation = useCancelCashOperation(id);
  const record = detailQuery.data;
  const isDraft = isCreate || record?.statusId === 1;
  const isBusy = detailQuery.isLoading || updateMutation.isPending;
  const isActionBusy =
    confirmMutation.isPending ||
    cancelMutation.isPending ||
    createMutation.isPending ||
    updateMutation.isPending;

  const initialValues = useMemo<CashOperationForm>(
    () => getCashOperationInitialValues(record, defaultValues),
    [record],
  );

  const persistDraft = async (values: CashOperationForm) => {
    if (isCreate) {
      await createMutation.mutateAsync(values);
      toast.success(t("cash.messages.documentCreated"));
      navigate("..", { replace: true });
      return true;
    }

    await updateMutation.mutateAsync({ id, payload: values });
    toast.success(t("cash.messages.documentSaved"));
    formik.resetForm({ values });
    return true;
  };

  const formik = useFormik<CashOperationForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: cashOperationSchema(t),
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
      formik.setTouched(buildTouched(formik.values));
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

  const handleConfirm = async () => {
    if (isCreate || !isDraft) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await confirmMutation.mutateAsync();
      toast.success(t("cash.messages.operationConfirmed"));
      navigate("..");
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancel = async () => {
    if (isCreate || !isDraft) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await cancelMutation.mutateAsync();
      toast.success(t("cash.messages.operationCancelled"));
      navigate("..");
    } catch (error) {
      errorHandlers(error);
    }
  };

  if (isBusy && !isCreate && !record) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (!isDraft) {
    return record ? <CashReadonlyDetailsCard record={record} /> : null;
  }

  return (
    <div className="min-w-0 space-y-2 pb-2">
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
              ? numberSpacing(formik.values.amount) +
                " " +
                (record?.currencyName ?? "")
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
          <CashOperationFormFields formik={formik} />
        </Form>
      </Card>

      <Card className="border border-border p-5 sm:p-3">
        <h2 className="mb-3 text-lg font-semibold text-heading">
          {t("cash.fields.comment")}
        </h2>
        <Form.Item
          // label={t("cash.fields.comment")}
          validateStatus={
            formik.touched.comment && formik.errors.comment ? "error" : ""
          }
          help={
            formik.touched.comment && formik.errors.comment
              ? String(formik.errors.comment)
              : undefined
          }
        >
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

      <div className="sticky bottom-0 z-20 mx-0.5 rounded-xl border border-border bg-primary-bg/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:py-4">
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
                  ? numberSpacing(formik.values.amount) +
                    " " +
                    (record?.currencyName ?? "")
                  : "-"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              size="large"
              icon={<Save className="size-4" />}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={isActionBusy || !isDraft}
              onClick={() => void saveDraft()}
              className="min-w-36"
            >
              {t("common.save")}
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircle2 className="size-4" />}
              loading={confirmMutation.isPending}
              disabled={isActionBusy || isCreate || !isDraft}
              onClick={() => void handleConfirm()}
              className="min-w-44"
            >
              {t("common.confirm")}
            </Button>
            <Button
              danger
              size="large"
              icon={<CircleX className="size-4" />}
              loading={cancelMutation.isPending}
              disabled={isActionBusy || isCreate || !isDraft}
              onClick={() => void handleCancel()}
              className="min-w-40"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
