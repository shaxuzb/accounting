import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Form, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { ProductGroupsForm } from "../types/form";
import { productGroupsSchema } from "../types/schema";
import { useUpdateProductGroups } from "../hooks";
import { useCreateProductGroups } from "../hooks";
import { useGetDetailProductGroups } from "../hooks";

const defaultValues: ProductGroupsForm = {
  organizationId: null,
  parentId: null,
  code: "",
  name: "",
  stateId: null,
};

interface ProductGroupsModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function ProductGroupsAddPage({
  open,
  onClose,
  id,
}: ProductGroupsModalProps) {
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: ProductGroups, isLoading: isOrgonizationsLoading } =
    useGetDetailProductGroups(editId ?? "");
  const createMutation = useCreateProductGroups();
  const updateMutation = useUpdateProductGroups();

  const formik = useFormik<ProductGroupsForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
      parentId: null
    },
    enableReinitialize: true,
    validationSchema: productGroupsSchema(isEdit),
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
    if (ProductGroups && isEdit) {
      formik.setValues({
        organizationId: ProductGroups.organizationId ?? null,
        parentId: ProductGroups.parentId ?? null,
        code: ProductGroups.code ?? "",
        name: ProductGroups.name ?? "",
        stateId: ProductGroups.stateId ?? null,
      });
    }
  }, [ProductGroups, isEdit]);
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
          <SelectCustom
            formik={formik}
            fieldName="organizationId"
            label="organization"
            path={selectListEndpoints.operationTypesSelectList}
          />
         <InputText
            formik={formik}
            fieldName="name"  
            label="Name"
          />

          <InputText
            formik={formik}
            fieldName="code"
            label="Code"
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
