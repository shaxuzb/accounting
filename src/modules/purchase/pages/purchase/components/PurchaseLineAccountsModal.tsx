import { Button, Modal, Space } from "antd";
import { useFormik } from "formik";
import { Check, CheckCheck } from "lucide-react";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import type { PurchaseImportRow } from "../types/type";
import type { PurchaseMode } from "../types/type";
import { purchaseDocumentTypeIds } from "../constants/endpoints";
import { useTranslation } from "react-i18next";

export interface PurchaseLineAccountValues {
  debitAccountId: number | null;
  debitAccountName: string;
  vatAccountId: number | null;
  vatAccountName: string;
}

interface Props {
  open: boolean;
  line: PurchaseImportRow | null;
  purchaseMode: PurchaseMode;
  onClose: () => void;
  onApply: (values: PurchaseLineAccountValues, applyToAll: boolean) => void;
}

const getInitialValues = (
  line: PurchaseImportRow | null,
): PurchaseLineAccountValues => ({
  debitAccountId: line?.debitAccountId ?? null,
  debitAccountName: line?.debitAccountName ?? "",
  vatAccountId: line?.vatAccountId ?? null,
  vatAccountName: line?.vatAccountName ?? "",
});

export default function PurchaseLineAccountsModal({
  open,
  line,
  purchaseMode,
  onClose,
  onApply,
}: Props) {
  const { t } = useTranslation();
  const formik = useFormik<PurchaseLineAccountValues>({
    initialValues: getInitialValues(line),
    enableReinitialize: true,
    onSubmit: (values) => onApply(values, false),
  });

  const handleApply = (applyToAll: boolean) => {
    if (!formik.values.debitAccountId || !formik.values.vatAccountId) {
      formik.setTouched({ debitAccountId: true, vatAccountId: true });
      return;
    }

    onApply(formik.values, applyToAll);
  };

  return (
    <Modal maskClosable={false}
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
      </div>
    </Modal>
  );
}
