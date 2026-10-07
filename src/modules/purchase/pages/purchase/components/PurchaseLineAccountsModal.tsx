import { Button, Modal, Select, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useFormik } from "formik";
import { Link } from "react-router";
import { Check, CheckCheck } from "lucide-react";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import type { PurchaseImportRow } from "../types/type";
import type { PurchaseMode } from "../types/type";
import { purchaseDocumentTypeIds } from "../constants/endpoints";
import { useTranslation } from "react-i18next";
import { getJson } from "@/modules/accountings/services/request";
import { useAccountDefinitions } from "@/modules/accountings/pages/manual-entries/useAccountDefinitions";
import type { DeferredExpense } from "@/modules/accountings/pages/deferred-expenses/types";

/** The deferred expenses analytics (31xx). */
const DEFERRED_EXPENSES_SUBKONTO = 20;

export interface PurchaseLineAccountValues {
  debitAccountId: number | null;
  debitAccountName: string;
  vatAccountId: number | null;
  vatAccountName: string;
  deferredExpenseItemId: number | null;
  deferredExpenseName: string | null;
}

interface Props {
  open: boolean;
  line: PurchaseImportRow | null;
  purchaseMode: PurchaseMode;
  onClose: () => void;
  onApply: (values: PurchaseLineAccountValues, applyToAll: boolean) => void;
  /** A non-payer's VAT goes into the cost: no VAT account is asked for. */
  vatPayer?: boolean;
}

const getInitialValues = (
  line: PurchaseImportRow | null,
): PurchaseLineAccountValues => ({
  debitAccountId: line?.debitAccountId ?? null,
  debitAccountName: line?.debitAccountName ?? "",
  vatAccountId: line?.vatAccountId ?? null,
  vatAccountName: line?.vatAccountName ?? "",
  deferredExpenseItemId: line?.deferredExpenseItemId ?? null,
  deferredExpenseName: line?.deferredExpenseName ?? null,
});

export default function PurchaseLineAccountsModal({
  open,
  line,
  purchaseMode,
  onClose,
  onApply,
  vatPayer = true,
}: Props) {
  const { t } = useTranslation();
  const formik = useFormik<PurchaseLineAccountValues>({
    initialValues: getInitialValues(line),
    enableReinitialize: true,
    onSubmit: (values) => onApply(values, false),
  });

  // a service on 31xx (1C сч. 97) names its deferred expense, which the month close writes off
  const { definitions } = useAccountDefinitions(formik.values.debitAccountId);
  const isDeferredAccount =
    purchaseMode === "services" &&
    definitions.some((definition) => definition.id === DEFERRED_EXPENSES_SUBKONTO);
  const deferredExpenses = useQuery({
    queryKey: ["deferred-expenses"],
    queryFn: () => getJson<DeferredExpense[]>("/deferred-expenses"),
    enabled: open && isDeferredAccount,
  });
  const [deferredTouched, setDeferredTouched] = useState(false);

  const handleApply = (applyToAll: boolean) => {
    if (
      !formik.values.debitAccountId ||
      (vatPayer && !formik.values.vatAccountId)
    ) {
      formik.setTouched({ debitAccountId: true, vatAccountId: true });
      return;
    }
    if (isDeferredAccount && !formik.values.deferredExpenseItemId) {
      setDeferredTouched(true);
      return;
    }

    onApply(
      isDeferredAccount
        ? formik.values
        : { ...formik.values, deferredExpenseItemId: null, deferredExpenseName: null },
      applyToAll,
    );
  };

  return (
    <Modal
      maskClosable={false}
      title={t("app.modals.accountSelectionTitle")}
      centered
      width={600}
      open={open}
      onCancel={onClose}
      destroyOnHidden
      footer={
        <Space direction="vertical" className="w-full">
          <Button
            block
            size="large"
            icon={<Check className="size-4" />}
            onClick={() => handleApply(false)}
          >
            {t("app.modals.applyCurrent")}
          </Button>
          <Button
            block
            size="large"
            type="primary"
            icon={<CheckCheck className="size-4" />}
            onClick={() => handleApply(true)}
          >
            {t("app.modals.applyAll")}
          </Button>
        </Space>
      }
    >
      <div className="mb-5">
        <div className="text-sm font-semibold text-text">
          {line?.productName || line?.product || t("app.modals.productLine")}
        </div>
        <div className="mt-1 text-xs text-secondary-text">
          {t("app.modals.purchaseHint")}
        </div>
      </div>

      <div className="space-y-1">
        <DocumentAccountSelect
          label="purchase.fields.debitAccount"
          fieldName="debitAccountId"
          getFieldName="debitAccountName"
          documentTypeId={purchaseDocumentTypeIds[purchaseMode]}
          documentRoleCode="purchase_debit"
          formik={formik}
          getFirst
          search
          required
          clearable
        />
        {vatPayer && (
          <DocumentAccountSelect
            label="purchase.fields.vatAccount"
            fieldName="vatAccountId"
            getFieldName="vatAccountName"
            documentTypeId={purchaseDocumentTypeIds[purchaseMode]}
            documentRoleCode="purchase_vat"
            formik={formik}
            getFirst
            search
            required
            clearable
          />
        )}
        {isDeferredAccount && (
          <div className="pt-2">
            <span className="mb-1 block text-sm">
              {t("deferredExpenses.purchaseLine")} <span className="text-red-500">*</span>
            </span>
            <Select
              className="w-full"
              showSearch
              optionFilterProp="label"
              loading={deferredExpenses.isLoading}
              status={deferredTouched && !formik.values.deferredExpenseItemId ? "error" : undefined}
              value={formik.values.deferredExpenseItemId ?? undefined}
              placeholder={t("deferredExpenses.purchaseLinePlaceholder")}
              options={(deferredExpenses.data ?? []).map((item) => ({
                value: item.itemId,
                label: item.hasSchedule ? item.name : `${item.name} (${t("deferredExpenses.noSchedule")})`,
              }))}
              onChange={(value: number) => {
                const item = deferredExpenses.data?.find((x) => x.itemId === value);
                void formik.setValues({
                  ...formik.values,
                  deferredExpenseItemId: value,
                  deferredExpenseName: item?.name ?? null,
                });
              }}
            />
            <div className="mt-1 text-xs text-secondary-text">
              {t("deferredExpenses.purchaseLineHint")}{" "}
              <Link to="/main/accountings/deferred-expenses" target="_blank">
                {t("deferredExpenses.title")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
