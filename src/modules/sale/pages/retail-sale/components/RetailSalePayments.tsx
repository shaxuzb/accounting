import InputNumberFormat from "@/components/fields/InputNumber";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import Card from "@/components/ui/card/Card";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { Button, Input, Modal } from "antd";
import { useQuery } from "@tanstack/react-query";
import type { FormikProps } from "formik";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { $axiosPrivate } from "@/services/AxiosService";
import { numberSpacing } from "@/utils/utils";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import { retailSaleDocumentTypeIds } from "../constants/endpoints";
import type {
  RetailSaleFormValues,
  RetailSalePaymentForm,
} from "../types/form";

interface Props {
  formik: FormikProps<RetailSaleFormValues>;
  totalAmount: number;
  disabled?: boolean;
}

interface PaymentMethodOption {
  id: number;
  name?: string | null;
  code?: string | null;
}

const paymentDocumentTypeIdByMethodCode: Record<string, number> = {
  CASH: retailSaleDocumentTypeIds.paymentCash,
  CARD: retailSaleDocumentTypeIds.paymentCard,
  CLICK: retailSaleDocumentTypeIds.paymentAcquiring,
  PAYME: retailSaleDocumentTypeIds.paymentAcquiring,
  MOBILE_PAYMENT: retailSaleDocumentTypeIds.paymentAcquiring,
  TRANSFER: retailSaleDocumentTypeIds.paymentBankTransfer,
};

const createEmptyPayment = (): RetailSalePaymentForm => ({
  paymentMethodId: null,
  bankTerminalId: null,
  debitAccountId: null,
  amount: null,
  transactionNumber: "",
});

const toNullableId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export default function RetailSalePayments({
  formik,
  totalAmount,
  disabled = false,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [draftPayment, setDraftPayment] =
    useState<RetailSalePaymentForm>(createEmptyPayment);
  const payments = formik.values.payments;

  const { data: paymentMethods = [] } = useQuery<PaymentMethodOption[]>({
    queryKey: ["retail-sale-payment-methods"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<unknown>(
        selectListEndpoints.paymentMethodsSelectList,
      );
      if (Array.isArray(data)) return data as PaymentMethodOption[];
      if (
        data &&
        typeof data === "object" &&
        "items" in data &&
        Array.isArray(data.items)
      ) {
        return data.items as PaymentMethodOption[];
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const getPaymentMethodCode = (paymentMethodId: number | null) =>
    paymentMethods
      .find((method) => method.id === paymentMethodId)
      ?.code?.toUpperCase();

  const cashDocumentTypeId = retailSaleDocumentTypeIds.paymentCash;
  const cardDocumentTypeId = retailSaleDocumentTypeIds.paymentCard;
  const acquiringDocumentTypeId = retailSaleDocumentTypeIds.paymentAcquiring;
  const transferDocumentTypeId = retailSaleDocumentTypeIds.paymentBankTransfer;

  const paymentMethodCodes = new Set(
    [
      ...payments.map((payment) =>
        getPaymentMethodCode(payment.paymentMethodId),
      ),
      getPaymentMethodCode(draftPayment.paymentMethodId),
    ].filter(Boolean),
  );
  const cashAccountSettings = useGetDetailDocumentAccountSettings(
    cashDocumentTypeId ?? 0,
    Boolean(cashDocumentTypeId) && paymentMethodCodes.has("CASH"),
  );
  const cardAccountSettings = useGetDetailDocumentAccountSettings(
    cardDocumentTypeId ?? 0,
    Boolean(cardDocumentTypeId) && paymentMethodCodes.has("CARD"),
  );
  const acquiringAccountSettings = useGetDetailDocumentAccountSettings(
    acquiringDocumentTypeId ?? 0,
    Boolean(acquiringDocumentTypeId) &&
      ["CLICK", "PAYME", "MOBILE_PAYMENT"].some((code) =>
        paymentMethodCodes.has(code),
      ),
  );
  const transferAccountSettings = useGetDetailDocumentAccountSettings(
    transferDocumentTypeId ?? 0,
    Boolean(transferDocumentTypeId) && paymentMethodCodes.has("TRANSFER"),
  );

  const getDebitRoleCode = (
    settings:
      | {
          accountSettings?: Array<{
            accountSide: string;
            documentAccountRoleCode: string;
          }>;
        }
      | undefined,
  ) =>
    settings?.accountSettings.find(
      (role) => role.accountSide.toLowerCase() === "debit",
    )?.documentAccountRoleCode;

  const debitRoleCodes = new Map<number, string>();
  [
    [cashDocumentTypeId, getDebitRoleCode(cashAccountSettings.data)],
    [cardDocumentTypeId, getDebitRoleCode(cardAccountSettings.data)],
    [acquiringDocumentTypeId, getDebitRoleCode(acquiringAccountSettings.data)],
    [transferDocumentTypeId, getDebitRoleCode(transferAccountSettings.data)],
  ].forEach(([documentTypeId, roleCode]) => {
    if (typeof documentTypeId === "number" && typeof roleCode === "string") {
      debitRoleCodes.set(documentTypeId, roleCode);
    }
  });
  const saleTotal = Number(totalAmount ?? 0);
  const paidTotal = payments.reduce(
    (total, payment) => total + Number(payment.amount ?? 0),
    0,
  );
  const remainingTotal = saleTotal - paidTotal;
  const isFullyPaid = saleTotal > 0 && remainingTotal <= 0.01;

  const getPaymentKey = (payment: RetailSalePaymentForm, index: number) =>
    payment.id ? `id-${payment.id}` : `index-${index}`;

  const renderDebitAccount = (
    payment: RetailSalePaymentForm,
    onChange: (patch: Partial<RetailSalePaymentForm>) => void,
  ) => {
    const methodCode = getPaymentMethodCode(payment.paymentMethodId);
    const documentTypeId = methodCode
      ? paymentDocumentTypeIdByMethodCode[methodCode]
      : undefined;
    const documentRoleCode = documentTypeId
      ? debitRoleCodes.get(documentTypeId)
      : undefined;
    const commonProps = {
      value: payment.debitAccountId,
      marginBottom: "mb-0",
      height: "38px",
      disabled: disabled || !payment.paymentMethodId,
      search: true,
      required: true,
      clearable: true,
      onChange: (value: unknown) =>
        onChange({ debitAccountId: toNullableId(value) }),
    };

    if (documentTypeId) {
      return (
        <DocumentAccountSelect
          {...commonProps}
          documentTypeId={documentTypeId ?? 0}
          documentRoleCode={documentRoleCode ?? "debit"}
          enabled={Boolean(documentTypeId && documentRoleCode)}
          getFirst
        />
      );
    }

    return (
      <SelectCustom
        {...commonProps}
        path={selectListEndpoints.chartAccountsSelectList}
        displayConfig={chartAccountSelectDisplayConfig}
      />
    );
  };

  const paymentFieldClass =
    "w-full [&_.ant-form-item]:mb-0 [&_.ant-form-item]:w-full [&_.ant-select]:w-full";

  const openPaymentModal = () => {
    setDraftPayment(createEmptyPayment());
    setPaymentModalOpen(true);
  };

  const saveDraftPayment = () => {
    void formik.setFieldValue("payments", [...payments, draftPayment], true);
    setPaymentModalOpen(false);
  };

  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-3">
        <div className="flex shrink-0 items-center gap-2 text-base font-semibold text-text">
          <WalletCards className="size-5 text-primary" />
          {t("retailSale.payments.title")}
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 divide-y divide-border rounded-lg border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-2">
            <div className="text-xs text-secondary-text">
              {t("retailSale.payments.saleTotal")}
            </div>
            <div className="mt-0.5 font-semibold text-primary tabular-nums">
              {numberSpacing(saleTotal, undefined, true)}
            </div>
          </div>
          <div className="px-4 py-2">
            <div className="text-xs text-secondary-text">
              {t("retailSale.payments.paid")}
            </div>
            <div className="mt-0.5 font-semibold text-success tabular-nums">
              {numberSpacing(paidTotal, undefined, true)}
            </div>
          </div>
          <div className="px-4 py-2">
            <div className="text-xs text-secondary-text">
              {t("retailSale.payments.remaining")}
            </div>
            <div
              className={`mt-0.5 font-semibold tabular-nums ${
                remainingTotal > 0.01 ? "text-warning" : "text-success"
              }`}
            >
              {numberSpacing(Math.max(remainingTotal, 0), undefined, true)}
            </div>
          </div>
        </div>

        {saleTotal > 0 && (
          <div
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              isFullyPaid
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning"
            }`}
          >
            <CheckCircle2 className="size-4" />
            {t(
              isFullyPaid
                ? "retailSale.payments.fullyPaid"
                : "retailSale.payments.partiallyPaid",
            )}
          </div>
        )}

        <Button
          type="text"
          size="small"
          aria-label={expanded ? t("common.close") : t("common.view")}
          icon={
            expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )
          }
          onClick={() => setExpanded((value) => !value)}
        />
      </div>

      {expanded && (
        <>
          <div className="border-t border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {payments.map((payment, index) => {
                const methodLabel =
                  paymentMethods.find(
                    (method) => method.id === payment.paymentMethodId,
                  )?.name ??
                  getPaymentMethodCode(payment.paymentMethodId) ??
                  t("retailSale.payments.empty");

                return (
                  <div
                    key={getPaymentKey(payment, index)}
                    className="flex min-h-46 flex-col rounded-xl border border-border bg-primary-bg p-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <WalletCards className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-text">
                          {methodLabel}
                        </div>
                        <div className="mt-2 text-base font-bold text-text tabular-nums">
                          {numberSpacing(Number(payment.amount ?? 0), undefined, true)} {t("retailSale.payments.currency", { defaultValue: "so'm" })}
                        </div>
                        <div className="mt-1 truncate text-xs text-secondary-text">
                          {payment.debitAccountId ?? "—"} — {t("retailSale.fields.debitAccount")}
                        </div>
                        {payment.bankTerminalId && (
                          <div className="mt-1 truncate text-xs text-secondary-text">
                            {t("retailSale.fields.bankTerminal")}: {payment.bankTerminalId}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto flex gap-2 border-t border-border pt-3">
                      <Button
                        danger
                        type="text"
                        className="flex-1"
                        icon={<Trash2 className="size-4" />}
                        disabled={disabled}
                        onClick={() => {
                          void formik.setFieldValue(
                            "payments",
                            payments.filter(
                              (_, paymentIndex) => paymentIndex !== index,
                            ),
                            true,
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                className="flex min-h-46 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-primary-bg p-4 text-secondary-text transition-colors hover:border-primary hover:text-primary"
                disabled={disabled}
                onClick={openPaymentModal}
              >
                <Plus className="size-6" />
                <span className="mt-2 text-sm font-semibold">
                  {t("retailSale.payments.add")}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      <Modal maskClosable={false}
        title={t("retailSale.payments.add")}
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        destroyOnHidden
        width={620}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        onOk={saveDraftPayment}
        okButtonProps={{ disabled: !draftPayment.paymentMethodId }}
      >
        <div className="space-y-3 pt-2">
          <div className={paymentFieldClass}>
            <SelectCustom
              label="retailSale.fields.paymentMethod"
              path={selectListEndpoints.paymentMethodsSelectList}
              value={draftPayment.paymentMethodId}
              marginBottom="mb-0"
              height="38px"
              disabled={disabled}
              search
              required
              onChange={(value) =>
                setDraftPayment((current) => ({
                  ...current,
                  paymentMethodId: toNullableId(value),
                  bankTerminalId: null,
                  debitAccountId: null,
                }))
              }
            />
          </div>
          <div className={paymentFieldClass}>
            <SelectCustom
              label="retailSale.fields.bankTerminal"
              path={selectListEndpoints.bankTerminalsSelectList}
              value={draftPayment.bankTerminalId}
              marginBottom="mb-0"
              height="38px"
              disabled={disabled || !draftPayment.paymentMethodId}
              clearable
              optional
              search
              onChange={(value) =>
                setDraftPayment((current) => ({
                  ...current,
                  bankTerminalId: toNullableId(value),
                }))
              }
            />
          </div>
          <div className={paymentFieldClass}>
            {renderDebitAccount(draftPayment, (patch) =>
              setDraftPayment((current) => ({ ...current, ...patch })),
            )}
          </div>
          <InputNumberFormat
            label="retailSale.fields.amount"
            value={draftPayment.amount}
            min={0}
            precision={2}
            emptyZero
            disabled={disabled}
            onValueChange={(amount) =>
              setDraftPayment((current) => ({ ...current, amount }))
            }
          />
          <Input
            addonBefore={t("retailSale.fields.transactionNumber")}
            placeholder={t("common.optional")}
            value={draftPayment.transactionNumber}
            disabled={disabled}
            onChange={(event) =>
              setDraftPayment((current) => ({
                ...current,
                transactionNumber: event.target.value,
              }))
            }
          />
        </div>
      </Modal>
    </Card>
  );
}
