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
import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import InOutSelect from "@/components/fields/InOutSelect";
import SelectDate from "@/components/fields/SelectDate";
import InputNumberFormat from "@/components/fields/InputNumber";
import CashFiscalTransferReadonlyDetailsCard from "@/modules/cashoperation/components/CashFiscalTransferReadonlyDetailsCard";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import {
  useCancelCashFiscalTransfer,
  useConfirmCashFiscalTransfer,
  useCreateCashFiscalTransfer,
  useGetCashFiscalTransfer,
  useGetFiscalBalance,
  useUpdateCashFiscalTransfer,
} from "../hooks";
import { toCashFiscalTransferPayload } from "../utils/payload";
import type { CashFiscalTransferForm } from "../types/form";
import { cashFiscalTransferSchema } from "../types/schema";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { useAppSelector } from "@/store/hooks";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import { cashDocumentTypeIds } from "@/modules/cashoperation/constants/documentAccount";

const listPath = "/main/cash-operationses/cash-fiscal-transfers";

/** acc_document_account_type of retail cash payments: its cash account is the till's. */
const RETAIL_PAYMENT_CASH_TYPE_ID = 11;
const CASH_ACCOUNT_ROLE = "cash_account";
/** National currency, as the other money documents start with. */
const DEFAULT_CURRENCY_ID = 1;

type AccountSettings = ReturnType<
  typeof useGetDetailDocumentAccountSettings
>["data"];

const defaultCashAccountId = (settings: AccountSettings) => {
  const role = settings?.accountSettings?.find(
    (item) =>
      item.documentAccountRoleCode.trim().toLowerCase() === CASH_ACCOUNT_ROLE,
  );
  const account =
    role?.accounts?.find((item) => item.isDefault) ?? role?.accounts?.[0];
  return account?.chartAccountId ?? null;
};

const createDefaultValues = (): CashFiscalTransferForm => ({
  fiscalCashRegisterId: null,
  cashBoxId: null,
  directionId: -1,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: DEFAULT_CURRENCY_ID,
  amount: null,
  exchangeRate: 1,
  fiscalCashAccountId: null,
  cashBoxAccountId: null,
  comment: "",
});

const buildTouched = (values: CashFiscalTransferForm) => ({
  fiscalCashRegisterId: values.fiscalCashRegisterId !== null,
  cashBoxId: values.cashBoxId !== null,
  directionId: true,
  docDate: Boolean(values.docDate),
  currencyId: values.currencyId !== null,
  amount: values.amount !== null,
  exchangeRate: values.exchangeRate !== null,
  fiscalCashAccountId: values.fiscalCashAccountId !== null,
  cashBoxAccountId: values.cashBoxAccountId !== null,
  comment: Boolean(values.comment),
});

export default function CashFiscalTransferDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const organizationName = useAppSelector((state) => state.organization.name);
  const isCreate = !id;
  const detailQuery = useGetCashFiscalTransfer(id);
  const createMutation = useCreateCashFiscalTransfer();
  const updateMutation = useUpdateCashFiscalTransfer(id);
  const confirmMutation = useConfirmCashFiscalTransfer(id);
  const cancelMutation = useCancelCashFiscalTransfer(id);
  const record = detailQuery.data;
  const isDraft = isCreate || record?.statusId === 1;
  const isActionBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

  const initialValues = useMemo<CashFiscalTransferForm>(
    () => ({
      fiscalCashRegisterId:
        record?.fiscalCashRegisterId ?? createDefaultValues().fiscalCashRegisterId,
      cashBoxId: record?.cashBoxId ?? createDefaultValues().cashBoxId,
      directionId: record?.directionId === 1 ? 1 : -1,
      docDate: record?.docDate ?? createDefaultValues().docDate,
      currencyId: record?.currencyId ?? createDefaultValues().currencyId,
      amount: record?.amount ?? createDefaultValues().amount,
      exchangeRate: record?.exchangeRate ?? createDefaultValues().exchangeRate,
      fiscalCashAccountId:
        record?.fiscalCashAccountId ?? createDefaultValues().fiscalCashAccountId,
      cashBoxAccountId:
        record?.cashBoxAccountId ?? createDefaultValues().cashBoxAccountId,
      comment: record?.comment ?? createDefaultValues().comment,
    }),
    [record],
  );

  const persistDraft = async (values: CashFiscalTransferForm) => {
    if (isCreate) {
      await createMutation.mutateAsync(toCashFiscalTransferPayload(values));
      toast.success(t("cash.fiscalTransfer.created"));
      navigate(listPath, { replace: true });
      return true;
    }

    await updateMutation.mutateAsync(toCashFiscalTransferPayload(values));
    toast.success(t("cash.fiscalTransfer.saved"));
    formik.resetForm({ values });
    return true;
  };

  const formik = useFormik<CashFiscalTransferForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: cashFiscalTransferSchema(t),
    onSubmit: async (values) => {
      try {
        await persistDraft(values);
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  // A new transfer takes the till's account (where retail cash was posted) and the cash
  // desk's receipt account, as 1C posts «Выемка» and «Поступление из ККМ». Filled once,
  // so a user who clears a field is not overruled.
  const fiscalAccountSettings = useGetDetailDocumentAccountSettings(
    RETAIL_PAYMENT_CASH_TYPE_ID,
    isCreate,
  );
  const cashBoxAccountSettings = useGetDetailDocumentAccountSettings(
    cashDocumentTypeIds.income,
    isCreate,
  );
  const filledAccountsRef = useRef({ fiscal: false, cashBox: false });
  useEffect(() => {
    if (!isCreate) return;
    const filled = filledAccountsRef.current;
    const fiscal = defaultCashAccountId(fiscalAccountSettings.data);
    if (!filled.fiscal && fiscal) {
      filled.fiscal = true;
      if (formik.values.fiscalCashAccountId === null)
        void formik.setFieldValue("fiscalCashAccountId", fiscal, true);
    }
    const cashBox = defaultCashAccountId(cashBoxAccountSettings.data);
    if (!filled.cashBox && cashBox) {
      filled.cashBox = true;
      if (formik.values.cashBoxAccountId === null)
        void formik.setFieldValue("cashBoxAccountId", cashBox, true);
    }
  }, [cashBoxAccountSettings.data, fiscalAccountSettings.data, formik, isCreate]);

  // Handing the till's cash to the cash desk moves what the till holds, so that is the
  // amount offered; an amount the user typed is kept.
  const isHandover = formik.values.directionId === -1;
  const fiscalBalance = useGetFiscalBalance(
    formik.values.fiscalCashRegisterId,
    formik.values.currencyId,
    formik.values.docDate,
    isDraft && isHandover,
  );
  const offeredAmountRef = useRef<number | null>(null);
  useEffect(() => {
    const balance = fiscalBalance.data;
    if (!isDraft || !isHandover || balance == null || balance <= 0) return;
    const amount = formik.values.amount;
    if (amount !== null && amount !== offeredAmountRef.current) return;
    offeredAmountRef.current = balance;
    if (amount !== balance) void formik.setFieldValue("amount", balance, true);
  }, [fiscalBalance.data, formik, isDraft, isHandover]);

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

  const handleAction = async (kind: "confirm" | "cancel") => {
    if (isCreate || !isDraft) return;
    if (!(await ensureSavedBeforeAction())) return;

    try {
      if (kind === "confirm") {
        await confirmMutation.mutateAsync();
        toast.success(t("cash.fiscalTransfer.confirmed"));
      } else {
        await cancelMutation.mutateAsync();
        toast.success(t("cash.fiscalTransfer.cancelled"));
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
      <CashFiscalTransferReadonlyDetailsCard record={record} />
    ) : null;
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
              ? `${numberSpacing(formik.values.amount)} ${record?.currencyName ?? ""}`
              : "-"
          }
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border p-3 sm:p-3">
        <h2 className="mb-6 text-lg font-semibold text-heading">
          {t("bank.readonlySections.general")}
        </h2>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="fiscalCashRegisterId"
                label="settings.entities.fiscalCashRegisters"
                path={selectListEndpoints.fiscalCashRegistersSelectList}
                required
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="cashBoxId"
                label="settings.entities.cashBox"
                path={selectListEndpoints.cashBoxesSelectList}
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
              <SelectCustom
                formik={formik}
                fieldName="fiscalCashAccountId"
                label="cash.fiscalTransfer.fiscalCashAccount"
                path={selectListEndpoints.chartAccountsSelectList}
                displayConfig={chartAccountSelectDisplayConfig}
                search
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="cashBoxAccountId"
                label="cash.fiscalTransfer.cashBoxAccount"
                path={selectListEndpoints.chartAccountsSelectList}
                displayConfig={chartAccountSelectDisplayConfig}
                search
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
              {isHandover && fiscalBalance.data != null && (
                <div className="-mt-4 mb-4 text-xs text-secondary-text">
                  {t("cash.fiscalTransfer.fiscalBalance", {
                    amount: numberSpacing(fiscalBalance.data),
                  })}
                </div>
              )}
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

      <div className="sticky bottom-0 z-20 mx-1 border-t border-border rounded-xl bg-primary-bg/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:py-4">
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
