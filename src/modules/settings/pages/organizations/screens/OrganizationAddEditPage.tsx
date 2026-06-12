import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { organizationsSchema } from "../types/schema";
import type { organizationCreate } from "../types/form";
import { useCreateOrganization } from "../hooks";
import { useUpdateOrganizations } from "../hooks";
import { useGetDetailOrganizations } from "../hooks";
import InputText from "@/components/fields/InputText";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";

const defaultValues: organizationCreate = {
  shortName: "",
  fullName: "",
  inn: "",
  phoneNumber: "",
  address: "",
  director: "",
  isParent: false,
  defaultLanguageId: null,
  regionId: null,
  districtId: null,
  stateId: null,
};

interface OrganizationsModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function OrganizationAddEditPage({
  open,
  onClose,
  id,
}: OrganizationsModalProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: organizations, isLoading: isOrgonizationsLoading } =
    useGetDetailOrganizations(editId ?? "");
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganizations();

  const formik = useFormik<organizationCreate>({
    initialValues: { ...defaultValues, stateId: isEdit ? null : 1 },
    enableReinitialize: true,
    validationSchema: organizationsSchema(isEdit),
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
    if (organizations && isEdit) {
      formik.setValues({
        shortName: organizations.shortName ?? "",
        fullName: organizations.fullName ?? "",
        inn: organizations.inn ?? "",
        phoneNumber: organizations.phoneNumber ?? "",
        address: organizations.address ?? "",
        director: organizations.director ?? "",
        isParent: organizations.isParent ?? false,
        defaultLanguageId: organizations.defaultLanguageId ?? null,
        regionId: organizations.regionId ?? null,
        districtId: organizations.districtId ?? null,
        stateId: organizations.stateId ?? null,
      });
    }
  }, [organizations, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={
        isEdit ? t("settings.form.editTitle") : t("settings.form.createTitle")
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={650}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="fullName"
                label="settings.fields.fullName"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="shortName"
                label="settings.fields.shortName"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="regionId"
                label="settings.fields.region"
                path={selectListEndpoints.regionsSelectList}
                placeholder="region"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="defaultLanguageId"
                label="settings.fields.language"
                path={selectListEndpoints.languagesSelectList}
                placeholder="language"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="districtId"
                label="settings.fields.district"
                path={selectListEndpoints.districtsSelectList}
                placeholder="district"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="inn"
                label="settings.fields.inn"
              />
            </Col>
            <Col span={12}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="settings.fields.phoneNumber"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="director"
                label="settings.fields.director"
              />
            </Col>
            {isEdit ? (
              <>
                <Col span={12}>
                  <InputText
                    formik={formik}
                    fieldName="address"
                    label="settings.fields.address"
                  />
                </Col>
                <Col span={12}>
                  <SelectCustom
                    formik={formik}
                    fieldName="stateId"
                    label="settings.fields.status"
                    path={selectListEndpoints.statesSelectList}
                  />
                </Col>
              </>
            ) : (
              <Col span={24}>
                <InputText
                  formik={formik}
                  fieldName="address"
                  label="settings.fields.address"
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
