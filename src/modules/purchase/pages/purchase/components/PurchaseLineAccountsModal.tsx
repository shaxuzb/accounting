import { Button, Modal, Space } from "antd";
import { useFormik } from "formik";
import { Check, CheckCheck } from "lucide-react";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { PurchaseImportRow } from "../types/type";

export interface PurchaseLineAccountValues {
  debitAccountId: number | null;
  debitAccountName: string;
  vatAccountId: number | null;
  vatAccountName: string;
}

interface Props {
  open: boolean;
  line: PurchaseImportRow | null;
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
  onClose,
  onApply,
}: Props) {
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
    <Modal
      title="Satr uchun hisobvaraqlar"
      centered
      width={540}
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
          {line?.productName || line?.product || "Mahsulot satri"}
        </div>
        <div className="mt-1 text-xs text-secondary-text">
          Tanlangan hisobvaraqlar xarid hujjatiga qo'shiladi.
        </div>
      </div>

      <div className="space-y-1">
        <SelectCustom
          label="Debet hisobvarag'i"
          fieldName="debitAccountId"
          getFieldName="debitAccountName"
          path={selectListEndpoints.chartAccountsSelectList}
          formik={formik}
          search
          required
          clearable
          optionLabel={chartAccountOptionLabel}
          selectedLabel={chartAccountSelectedLabel}
        />
        <SelectCustom
          label="QQS hisobvarag'i"
          fieldName="vatAccountId"
          getFieldName="vatAccountName"
          path={selectListEndpoints.chartAccountsSelectList}
          formik={formik}
          search
          required
          clearable
          optionLabel={chartAccountOptionLabel}
          selectedLabel={chartAccountSelectedLabel}
        />
      </div>
    </Modal>
  );
}
