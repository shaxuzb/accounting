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
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import CashReadonlyDetailsCard from "@/modules/cashoperation/components/CashReadonlyDetailsCard";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import { cashDocumentSchema } from "../types/schema";
import type { CashDocumentForm } from "../types/form";
import {
  useCancelCashDocument,
  useConfirmCashDocument,
  useCreateCashDocument,
  useGetDetailCashDocument,
  useUpdateCashDocument,
} from "../hooks";
import { resolveCashDocumentKind } from "../utils/kind";
import CashDocumentFormFields from "./CashDocumentFormFields";
import { cashDocumentTypeIds } from "@/modules/cashoperation/constants/documentAccount";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { useAppSelector } from "@/store/hooks";

const createDefaultValues = (): CashDocumentForm => ({
  cashBoxId: null,
  paymentTypeId: null,
  counterpartyId: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  exchangeRate: 1,
  cashChartAccountId: null,
  offsetAccountId: null,
  comment: "",
});

export default function CashDocumentDetailPage() {
  const { t } = useTranslation();
  const { id = "", kind: rawKind } = useParams();
  const navigate = useNavigate();
  const organizationName = useAppSelector((state) => state.organization.name);
  const kind = resolveCashDocumentKind(rawKind);
  const isCreate = !id;
  const detailQuery = useGetDetailCashDocument(kind, id);
  const createMutation = useCreateCashDocument(kind);
  const updateMutation = useUpdateCashDocument(kind, id);
  const confirmMutation = useConfirmCashDocument(kind, id);
  const cancelMutation = useCancelCashDocument(kind, id);
  const record = detailQuery.data;
  const isDraft = isCreate || record?.statusId === 1;
  const isActionBusy =
    confirmMutation.isPending ||
    cancelMutation.isPending ||
    createMutation.isPending ||
    updateMutation.isPending;

  const initialValues = useMemo<CashDocumentForm>(
    () => ({
      cashBoxId: record?.cashBoxId ?? createDefaultValues().cashBoxId,
      paymentTypeId: record?.paymentTypeId ?? createDefaultValues().paymentTypeId,
      counterpartyId: record?.counterpartyId ?? createDefaultValues().counterpartyId,
      docDate: record?.docDate ?? createDefaultValues().docDate,
      currencyId: record?.currencyId ?? createDefaultValues().currencyId,
      amount: record?.amount ?? createDefaultValues().amount,
      exchangeRate: record?.exchangeRate ?? createDefaultValues().exchangeRate,
      comment: record?.comment ?? createDefaultValues().comment,
      cashChartAccountId:
        record?.cashChartAccountId ?? createDefaultValues().cashChartAccountId,
      offsetAccountId: record?.offsetAccountId ?? createDefaultValues().offsetAccountId,
    }),
    [record],
  );

  const formik = useFormik<CashDocumentForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: cashDocumentSchema(t),
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          await createMutation.mutateAsync(values);
          toast.success(t("cash.messages.documentCreated"));
          navigate("/main/cash-operationses/cash-documents/" + kind, {
            replace: true,
          });
          return;
        }

        await updateMutation.mutateAsync(values);
        toast.success(t("cash.messages.documentSaved"));
        navigate("/main/cash-operationses/cash-documents/" + kind + "/" + id, {
          replace: true,
        });
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched({
        cashBoxId: true,
        paymentTypeId: true,
        counterpartyId: true,
        docDate: true,
        currencyId: true,
        amount: true,
        exchangeRate: true,
        comment: true,
        cashChartAccountId: true,
        offsetAccountId: true,
      });
      toast.error(t("cash.messages.fillRequired"));
      return false;
    }

    await formik.submitForm();
    return true;
  };

  const ensureSavedBeforeAction = async () => {
    if (!formik.dirty) return true;
    return saveDraft();
  };

  const handleConfirm = async () => {
    if (isCreate) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await confirmMutation.mutateAsync();
      toast.success(t("cash.messages.documentConfirmed"));
      navigate("/main/cash-operationses/cash-documents/" + kind, {
        replace: true,
      });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancel = async () => {
    if (isCreate) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await cancelMutation.mutateAsync();
      toast.success(t("cash.messages.documentCancelled"));
      navigate("/main/cash-operationses/cash-documents/" + kind, {
        replace: true,
      });
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
    <div className="min-w-0 space-y-2 pb-2">
      {isDraft ? (
        <>
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
              <CashDocumentFormFields
                formik={formik}
                documentTypeId={
                  kind === "rko"
                    ? cashDocumentTypeIds.expense
                    : cashDocumentTypeIds.income
                }
              />
            </Form>
          </Card>

          <Card className="border border-border sm:p-3">
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

          <div className="sticky bottom-0 z-20 mx-1 border-t border-border bg-primary-bg/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:py-4 rounded-xl">
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
                      disabled={isActionBusy}
                      onClick={() => void handleCancel()}
                      className="min-w-40"
                    >
                      {t("common.cancel")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        record && <CashReadonlyDetailsCard record={record} />
      )}
    </div>
  );
}
