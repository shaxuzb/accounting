import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Form, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { WarehouseForm } from "../types/form";
import { useGetDetailWarehouses } from "../hooks/useGetDetailWarehouses";
import { useCreateWarehouses } from "../hooks/useCreateWarehouses";
import { useUpdateWarehouses } from "../hooks/useUpdateWarehouses";
import { warehouseSchema } from "../types/schema";

const defaultValues: WarehouseForm = {
  organizationId: null,
  branchId: null,
  code: "",
  name: "",
  responsibleUserId: null,
  stateId: null,
};

interface WarehousesModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function WarehousesAddPage({
  open,
  onClose,
  id,
}: WarehousesModalProps) {
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Warehouses, isLoading: isOrgonizationsLoading } =
    useGetDetailWarehouses(editId ?? "");
  const createMutation = useCreateWarehouses();
  const updateMutation = useUpdateWarehouses();

  const formik = useFormik<WarehouseForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: warehouseSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success("Tashkilot muvaffaqiyatli o'zgartirildi");
        } else {
          await createMutation.mutateAsync(values);
          toast.success("Tashkilot muvaffaqiyatli yaratildi");
        }
        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (Warehouses && isEdit) {
      formik.setValues({
        organizationId: Warehouses.organizationId ?? null,
        branchId: Warehouses.branchId ?? null,
        code: Warehouses.code ?? "",
        name: Warehouses.name ?? "",
        responsibleUserId: Warehouses.responsibleUserId ?? null,
        stateId: Warehouses.stateId ?? null,
      });
    }
  }, [Warehouses, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={isEdit ? "Tashkilotni tahrirlash" : "Yangi tashkilot qo'shish"}
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={450}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <InputText formik={formik} fieldName="name" label="Name" />
          <InputText formik={formik} fieldName="code" label="code" />
          <SelectCustom
            formik={formik}
            fieldName="organizationId"
            label="organization"
            path={selectListEndpoints.operationTypesSelectList}
          />
          <SelectCustom
            formik={formik}
            fieldName="branchId"
            label="branchId"
            path={selectListEndpoints.branchesSelectList}
          />
          <SelectCustom
            formik={formik}
            fieldName="responsibleUserId"
            label="responsibleUserId"
            path={selectListEndpoints.usersSelectList}
          />

          {isEdit && (
            <SelectCustom
              formik={formik}
              fieldName="stateId"
              label="Holati"
              path={selectListEndpoints.statesSelectList}
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            onClick={() => console.log(formik)}
            loading={isSubmitting}
          >
            Yakunlash
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
