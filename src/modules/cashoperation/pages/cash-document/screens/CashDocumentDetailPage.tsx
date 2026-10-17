import { Button, Form, Input, Popconfirm, Spin } from "antd";
import { useFormik } from "formik";
import {
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CircleX,
  FileText,
  Info,
  Printer,
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
import { cashDocumentPermissions } from "../constants/permissions";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { useAppSelector } from "@/store/hooks";
import { useAutoExchangeRate } from "@/modules/accountings/pages/currency/useAutoExchangeRate";

const createDefaultValues = (): CashDocumentForm => ({
  cashBoxId: null,
  // a cash order is paid in cash
  paymentTypeId: 1,
  counterpartyId: null,
  contractId: null,
  relatedDocumentId: null,
  debtSettlementMode: 1,
  destinationCashBoxId: null,
  employeeId: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  exchangeRate: 1,
  cashChartAccountId: null,
  offsetAccountId: null,
  operationKindId: null,
  cashFlowItemId: null,
  budgetPaymentKindId: null,
  personName: "",
  basis: "",
  attachment: "",
  idDocument: "",
  comment: "",
});

export default function CashDocumentDetailPage() {
  const { t } = useTranslation();
  const { id = "", kind: rawKind } = useParams();
  const navigate = useNavigate();
  const organizationName = useAppSelector((state) => state.organization.name);
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
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
      contractId: record?.contractId ?? createDefaultValues().contractId,
      relatedDocumentId:
        (record as { relatedDocumentId?: number | null } | undefined)?.relatedDocumentId ?? null,
      debtSettlementMode:
        (record as { debtSettlementMode?: number } | undefined)?.debtSettlementMode ?? 1,
      destinationCashBoxId:
        (record as { destinationCashBoxId?: number | null } | undefined)
          ?.destinationCashBoxId ?? null,
      employeeId:
        (record as { employeeId?: number | null } | undefined)?.employeeId ??
        null,
      docDate: record?.docDate ?? createDefaultValues().docDate,
      currencyId: record?.currencyId ?? createDefaultValues().currencyId,
      amount: record?.amount ?? createDefaultValues().amount,
      exchangeRate: record?.exchangeRate ?? createDefaultValues().exchangeRate,
      comment: record?.comment ?? createDefaultValues().comment,
      cashChartAccountId:
        record?.cashChartAccountId ?? createDefaultValues().cashChartAccountId,
      offsetAccountId: record?.offsetAccountId ?? createDefaultValues().offsetAccountId,
      operationKindId:
        (record as { operationKindId?: number | null } | undefined)?.operationKindId ?? null,
      ...(() => {
        const own = record as
          | { cashFlowItemId?: number | null; budgetPaymentKindId?: number | null; personName?: string | null; basis?: string | null; attachment?: string | null; idDocument?: string | null }
          | undefined;
        return {
          cashFlowItemId: own?.cashFlowItemId ?? null,
          budgetPaymentKindId: own?.budgetPaymentKindId ?? null,
          personName: own?.personName ?? "",
          basis: own?.basis ?? "",
          attachment: own?.attachment ?? "",
          idDocument: own?.idDocument ?? "",
        };
      })(),
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
        // a failed save must stop a confirm that follows it, or the old version is posted
        throw error;
      }
    },
  });
  useAutoExchangeRate(formik);

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched({
        cashBoxId: true,
        paymentTypeId: true,
        counterpartyId: true,
        contractId: true,
        docDate: true,
        currencyId: true,
        amount: true,
        exchangeRate: true,
        comment: true,
        cashChartAccountId: true,
        offsetAccountId: true,
        operationKindId: true,
      });
      toast.error(t("cash.messages.fillRequired"));
      return false;
    }

    try {
      await formik.submitForm();
      return true;
    } catch {
      return false;
    }
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
                documentId={record?.id ?? null}
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
                {!isCreate && (
                  <Button
                    size="large"
                    icon={<Printer className="size-4" />}
                    onClick={() => navigate("print")}
                  >
                    {t("cashPrint.print")}
                  </Button>
                )}
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
        record && (
          <div className="space-y-2">
            {/* a posted order is taken back by storno (1C «Отмена проведения»): its
                entries, the money movement and the counterparty's debt or advance */}
            <div className="flex justify-end gap-2">
              <Button
                icon={<Printer className="size-4" />}
                onClick={() => navigate("print")}
              >
                {t("cashPrint.print")}
              </Button>
            {record.statusId === 2 &&
              permissions.includes(cashDocumentPermissions.cancel) && (
                <>
                  <Popconfirm
                    title={t("bank.actions.cancelPosted")}
                    description={
                      <div className="max-w-80">
                        {t("bank.messages.cancelPostedConfirm")}
                      </div>
                    }
                    okText={t("bank.actions.cancelPosted")}
                    okButtonProps={{
                      danger: true,
                      loading: cancelMutation.isPending,
                    }}
                    cancelText={t("common.close")}
                    onConfirm={async () => {
                      try {
                        await cancelMutation.mutateAsync();
                        toast.success(t("cash.messages.documentCancelled"));
                      } catch (error) {
                        errorHandlers(error);
                      }
                    }}
                  >
                    <Button
                      danger
                      icon={<Ban className="size-4" />}
                      loading={cancelMutation.isPending}
                    >
                      {t("bank.actions.cancelPosted")}
                    </Button>
                  </Popconfirm>
                </>
              )}
            </div>
            <CashReadonlyDetailsCard record={record} />
          </div>
        )
      )}
    </div>
  );
}
