import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Form, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { DepartmentsForm } from "../types/form";
import { departmentsSchema } from "../types/schema";
import { useGetDetailDepartments } from "../hooks";
import { useCreateDepartments } from "../hooks";
import { useUpdateDepartments } from "../hooks";
import InputPasword from "@/components/fields/InputPassword";
import InputText from "@/components/fields/InputText";

const defaultValues: DepartmentsForm = {
  organizationId: null,
  branchId: null,
  code: "",
  name: "",
};

interface DepartmentAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function DepartmentAddEditPage({
  open,
  onClose,
  id,
}: DepartmentAddEditPageProps) {
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Departments, isLoading: isOrgonizationsLoading } =
    useGetDetailDepartments(editId ?? "");
  const createMutation = useCreateDepartments();
  const updateMutation = useUpdateDepartments();

  const formik = useFormik<DepartmentsForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: departmentsSchema(isEdit),
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
    if (Departments && isEdit) {
      formik.setValues({
        organizationId: Departments.organizationId ?? null,
        branchId: Departments.branchId ?? null,
        code: Departments.code ?? "",
        name: Departments.name ?? "",
        stateId: Departments.stateId ?? null,
      });
    }
  }, [Departments, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={isEdit ? "Tashkilotni tahrirlash" : "Yangi tashkilot qo'shish"}
      open={open}
      onCancel={onClose}
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
          <InputPasword formik={formik} fieldName="code" label="code" />
       
          <SelectCustom
            formik={formik}
            fieldName="branchId"
            label="branchName"
            path={selectListEndpoints.branchesSelectList}
          />

       <InputText formik={formik} fieldName="name" label="Name"/>

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
