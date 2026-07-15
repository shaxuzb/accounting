import { Button, Modal, Space } from "antd";
import { useFormik } from "formik";
import type { FormikProps } from "formik";
import { Check, CheckCheck } from "lucide-react";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import type { SaleSelectedProduct } from "../types/type";
import {
  saleDocumentAccountRoleCodes,
  saleDocumentTypeId,
} from "../constants/documentAccount";

export interface SaleLineAccountValues {
  inventoryAccountId: number | null;
  inventoryAccountName: string;
  incomeAccountId: number | null;
  incomeAccountName: string;
  costAccountId: number | null;
  costAccountName: string;
}

interface Props {
  open: boolean;
  line: SaleSelectedProduct | null;
  onClose: () => void;
  onApply: (values: SaleLineAccountValues, applyToAll: boolean) => void;
}

const getInitialValues = (
  line: SaleSelectedProduct | null,
): SaleLineAccountValues => ({
  inventoryAccountId: line?.inventoryAccountId ?? null,
  inventoryAccountName: line?.inventoryAccountName ?? "",
  incomeAccountId: line?.incomeAccountId ?? null,
  incomeAccountName: line?.incomeAccountName ?? "",
  costAccountId: line?.costAccountId ?? null,
  costAccountName: line?.costAccountName ?? "",
});

export default function SaleLineAccountsModal({
  open,
  line,
  onClose,
  onApply,
}: Props) {
  const formik = useFormik<SaleLineAccountValues>({
    initialValues: getInitialValues(line),
    enableReinitialize: true,
    onSubmit: (values) => onApply(values, false),
  });

  const handleApply = (applyToAll: boolean) => {
    if (
      !formik.values.inventoryAccountId ||
      !formik.values.incomeAccountId ||
      !formik.values.costAccountId
    ) {
      formik.setTouched({
        inventoryAccountId: true,
        incomeAccountId: true,
        costAccountId: true,
      });
      return;
    }

    onApply(formik.values, applyToAll);
  };

  return (
    <Modal
      title="Satr uchun hisobvaraqlar"
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
            Faqat shu satrga qo'llash
          </Button>
          <Button
            block
            size="large"
            type="primary"
            icon={<CheckCheck className="size-4" />}
            onClick={() => handleApply(true)}
          >
            Barcha satrlarga qo'llash
          </Button>
        </Space>
      }
    >
      <div className="mb-5">
        <div className="text-sm font-semibold text-text">
          {line?.productName || "Mahsulot satri"}
        </div>
        <div className="mt-1 text-xs text-secondary-text">
          Tanlangan hisobvaraqlar sotuv hujjatiga qo'shiladi.
        </div>
      </div>

      <div className="space-y-1">
        <DocumentAccountSelect
          label="Tovarlar hisobvarag'i"
          fieldName="inventoryAccountId"
          getFieldName="inventoryAccountName"
          formik={formik as unknown as FormikProps<object>}
          search
          required
          clearable
          documentTypeId={saleDocumentTypeId}
          documentRoleCode={saleDocumentAccountRoleCodes.inventory}
          getFirst
        />
        <DocumentAccountSelect
          label="Sotuv daromadi hisobvarag'i"
          fieldName="incomeAccountId"
          getFieldName="incomeAccountName"
          formik={formik as unknown as FormikProps<object>}
          search
          required
          clearable
          documentTypeId={saleDocumentTypeId}
          documentRoleCode={saleDocumentAccountRoleCodes.income}
          getFirst
        />
        <DocumentAccountSelect
          label="Sotuv tannarxi hisobvarag'i"
          fieldName="costAccountId"
          getFieldName="costAccountName"
          formik={formik as unknown as FormikProps<object>}
          search
          required
          clearable
          documentTypeId={saleDocumentTypeId}
          documentRoleCode={saleDocumentAccountRoleCodes.cost}
          getFirst
        />
      </div>
    </Modal>
  );
}
