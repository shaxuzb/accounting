import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Form, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { BranchesForm } from "../types/form";
import InputPasword from "@/components/fields/InputPassword";
import InputText from "@/components/fields/InputText";
import { useGetDetailBranches } from "../hooks";
import { useUpdateBranches } from "../hooks";
import { useCreateBranches } from "../hooks";
import { branchesSchema } from "../types/schema";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";

const defaultValues: BranchesForm = {
  organizationId: null,
  code: "",
  name: "",
  regionId: null,
  districtId: null,
  phoneNumber: "",
  stateId: null,
  // address: null,
};

interface BranchAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function BranchAddEditPage({
  open,
  onClose,
  id,
}: BranchAddEditPageProps) {
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Branches, isLoading: isOrgonizationsLoading } =
    useGetDetailBranches(editId ?? "");
  const createMutation = useCreateBranches();
  const updateMutation = useUpdateBranches();

  const formik = useFormik<BranchesForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: branchesSchema(isEdit),
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
    if (Branches && isEdit) {
      formik.setValues({
        organizationId: Branches.organizationId ?? null,
        code: Branches.code ?? "",
        name: Branches.name ?? "",
        regionId: Branches.regionId ?? null,
        districtId: Branches.districtId ?? null,
        phoneNumber: Branches.phoneNumber ?? "",
        stateId: Branches.stateId ?? null,
      });
    }
  }, [Branches, isEdit]);
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
          <SelectCustom
            formik={formik}
            fieldName="organizationId"
            label="organization"
            path={selectListEndpoints.operationTypesSelectList}
          />
          <InputPasword formik={formik} fieldName="code" label="code" />

          <SelectCustom
            formik={formik}
            fieldName="regionId"
            label="regionName"
            path={selectListEndpoints.regionsSelectList}
          />
          <SelectCustom
            formik={formik}
            fieldName="districtId"
            label="districtName"
            path={selectListEndpoints.districtsSelectList}
          />
          <InputPhoneNumber
            formik={formik}
            fieldName="phoneNumber"
            label="Tel raqam"
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
