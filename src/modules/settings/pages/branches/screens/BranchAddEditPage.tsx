import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
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
  const { t } = useTranslation();
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
      title={
        isEdit ? t("settings.form.editTitle") : t("settings.form.createTitle")
      }
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={600}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="name"
                label="settings.fields.name"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="settings.fields.organization"
                path={selectListEndpoints.operationTypesSelectList}
              />
            </Col>
            <Col span={12}>
              <InputPasword
                formik={formik}
                fieldName="code"
                label="settings.fields.code"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="regionId"
                label="settings.fields.region"
                path={selectListEndpoints.regionsSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="districtId"
                label="settings.fields.district"
                path={selectListEndpoints.districtsSelectList}
              />
            </Col>
            <Col span={12}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="settings.fields.phoneNumber"
              />
            </Col>

            {isEdit && (
              <Col span={12}>
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />
              </Col>
            )}
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            onClick={() => console.log(formik)}
            loading={isSubmitting}
          >
            {t("common.submit")}
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
