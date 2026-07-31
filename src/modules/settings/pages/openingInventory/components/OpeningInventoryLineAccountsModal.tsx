import { Button, Modal, Space } from "antd";
import { useFormik } from "formik";
import { Check, CheckCheck } from "lucide-react";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import type { OpeningInventoryMode, OpeningInventoryRow } from "../types/type";
import { openingInventoryDocumentTypeIds } from "../constants/endpoints";

export interface OpeningInventoryLineAccountValues {
  debitAccountId: number | null;
  debitAccountName: string;
}

interface Props {
  open: boolean;
  line: OpeningInventoryRow | null;
  mode: OpeningInventoryMode;
  onClose: () => void;
  onApply: (values: OpeningInventoryLineAccountValues, applyToAll: boolean) => void;
}

const getInitialValues = (
  line: OpeningInventoryRow | null,
): OpeningInventoryLineAccountValues => ({
  debitAccountId: line?.debitAccountId ?? null,
  debitAccountName: line?.debitAccountName ?? "",
});

export default function OpeningInventoryLineAccountsModal({
  open,
  line,
  mode,
  onClose,
  onApply,
}: Props) {
  const formik = useFormik<OpeningInventoryLineAccountValues>({
    initialValues: getInitialValues(line),
    enableReinitialize: true,
    onSubmit: (values) => onApply(values, false),
  });

  const handleApply = (applyToAll: boolean) => {
    if (!formik.values.debitAccountId) {
      formik.setTouched({ debitAccountId: true });
      return;
    }

    onApply(formik.values, applyToAll);
  };

  return (
    <Modal
      title="Hisobvaraqlarni tanlash"
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
            Faqat shu qatorga
          </Button>
          <Button
            block
            size="large"
            type="primary"
            icon={<CheckCheck className="size-4" />}
            onClick={() => handleApply(true)}
          >
            Hammasiga qo'llash
          </Button>
        </Space>
      }
    >
      <div className="mb-5">
        <div className="text-sm font-semibold text-text">
          {line?.productName ||
            line?.product ||
            (mode === "services" ? "Xizmat" : "Mahsulot")}
        </div>
        <div className="mt-1 text-xs text-secondary-text">
          {mode === "services"
            ? "Ushbu xizmat qatori uchun hisobvaraqlarni tanlang"
            : "Ushbu tovar qatori uchun debet hisobvarag'ini tanlang"}
        </div>
      </div>

      <div className="space-y-1">
        <DocumentAccountSelect
          label="Debet hisobvarag'i"
          fieldName="debitAccountId"
          getFieldName="debitAccountName"
          documentTypeId={openingInventoryDocumentTypeIds[mode]}
          documentRoleCode="purchase_debit"
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
