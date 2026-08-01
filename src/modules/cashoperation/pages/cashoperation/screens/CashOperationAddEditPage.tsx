import { Button, Form, Modal, Spin } from "antd";
import { useMemo } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCreateCashOperation,
  useGetDetailCashOperation,
  useUpdateCashOperation,
} from "../hooks";
import { cashOperationSchema } from "../types/schema";
import type { CashOperationForm } from "../types/form";
import CashOperationModal from "@/modules/cashoperation/pages/cashoperation/components/CashOperationModal";

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
interface CashOperationAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}
export default function CashOperationAddEditPage({
  open,
  onClose,
  id,
}: CashOperationAddEditPageProps) {
  const { t } = useTranslation();
  const createMutation = useCreateCashOperation();
  const updateMutation = useUpdateCashOperation();
  const { data: record, isLoading: isDetailLoading } =
    useGetDetailCashOperation(id);
  const initialValues = useMemo<CashOperationForm>(
    () => ({
      cashBoxId: record?.cashBoxId ?? null,
      cashChartAccountId: record?.cashChartAccountId ?? null,
      offsetAccountId: record?.offsetAccountId ?? null,
      cashOperationId: record?.cashOperationId ?? null,
      operationTypeId: record?.operationTypeId ?? null,
      paymentTypeId: record?.paymentTypeId ?? null,
      counterpartyId: record?.counterpartyId ?? null,
      docDate: record?.docDate ?? defaultValues.docDate,
      currencyId: record?.currencyId ?? null,
      amount: record?.amount ?? null,
      comment: record?.comment ?? "",
      stateId: record?.stateId ?? null,
    }),
    [record],
  );
  const formik = useFormik<CashOperationForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: cashOperationSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        if (id) {
          await updateMutation.mutateAsync({ id, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(values);
          toast.success(t("settings.messages.created"));
        }

        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  if (!open) return null;
  return (
    <Modal
      title={
        id ? t("settings.form.editTitle") : t("settings.form.createTitle")
      }
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={false}
      width={760}
      destroyOnHidden
    >
      <Spin spinning={isSubmitting || isDetailLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <CashOperationModal formik={formik} />
          <div className="mt-4 w-full">
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
              loading={isSubmitting}
            >
              {t("common.submit")}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
