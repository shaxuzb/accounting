import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, Col, Form, Modal, Radio, Row } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { useFormik } from "formik";

import InputPasword from "@/components/fields/InputPassword";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";

import { useCreateUsers, useGetDetailUsers, useUpdateUsers } from "../hooks";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserOrganizationForm,
  UsersForm,
} from "../types/form";
import { createUserSchema } from "../types/schema";

interface UserAddEditPageProps {
  open: boolean;
  onClose: () => void;
  editId: number | null;
}

const createEmptyOrganization = (isDefault = false): UserOrganizationForm => ({
  organizationId: null,
  roleId: null,
  isDefault,
  isOwner: false,
});

const initialValues: UsersForm = {
  userName: "",
  phoneNumber: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  stateId: null,
  organizations: [createEmptyOrganization(true)],
};

function UserAddEditPage({ open, onClose, editId }: UserAddEditPageProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(editId);
  const createUser = useCreateUsers();
  const updateUser = useUpdateUsers();
  const { data, isSuccess } = useGetDetailUsers(editId ?? "");

  const formik = useFormik<UsersForm>({
    initialValues,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: createUserSchema(isEdit),
    onSubmit: async (values) => {
      const organizations = values.organizations.map((organization) => ({
        organizationId: organization.organizationId as number,
        roleId: organization.roleId as number,
        isDefault: organization.isDefault,
        isOwner: organization.isOwner,
      }));

      const basePayload = {
        userName: values.userName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        emailVerified: false as const,
        timezone: null,
        organizations,
      };

      if (editId) {
        const payload: UpdateUserPayload = {
          ...basePayload,
          stateId: values.stateId,
          ...(values.password ? { password: values.password } : {}),
        };

        await updateUser.mutateAsync({ id: editId, payload });
      } else {
        const payload: CreateUserPayload = {
          ...basePayload,
          password: values.password,
        };

        await createUser.mutateAsync(payload);
      }

      formik.resetForm();
      onClose();
    },
  });
  const { setValues } = formik;

  useEffect(() => {
    if (!open || !isSuccess || !data) return;

    const defaultOrganizationIndex = data.organizations.findIndex(
      (organization) => organization.isDefault,
    );
    const selectedDefaultIndex =
      defaultOrganizationIndex >= 0 ? defaultOrganizationIndex : 0;
    const organizations = data.organizations.map((organization, index) => ({
      organizationId: organization.organizationId,
      roleId: organization.roleId,
      isDefault: index === selectedDefaultIndex,
      isOwner: organization.isOwner ?? false,
    }));

    void setValues({
      userName: data.userName ?? "",
      phoneNumber: data.phoneNumber ?? "",
      email: data.email ?? "",
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      password: "",
      stateId: data.stateId ?? null,
      organizations:
        organizations.length > 0
          ? organizations
          : [createEmptyOrganization(true)],
    });
  }, [data, isSuccess, open, setValues]);

  const setOrganizations = (organizations: UserOrganizationForm[]) =>
    formik.setFieldValue("organizations", organizations, true);

  const handleAddOrganization = () => {
    void setOrganizations([
      ...formik.values.organizations,
      createEmptyOrganization(formik.values.organizations.length === 0),
    ]);
  };

  const handleRemoveOrganization = (index: number) => {
    const organizations = formik.values.organizations.filter(
      (_, organizationIndex) => organizationIndex !== index,
    );

    if (
      organizations.length > 0 &&
      !organizations.some((item) => item.isDefault)
    ) {
      organizations[0] = { ...organizations[0], isDefault: true };
    }

    void setOrganizations(organizations);
  };

  const handleSetDefaultOrganization = (index: number) => {
    void setOrganizations(
      formik.values.organizations.map((organization, organizationIndex) => ({
        ...organization,
        isDefault: organizationIndex === index,
      })),
    );
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      mask={{ closable: false }}
      title={
        isEdit ? t("settings.form.editUser") : t("settings.form.createUser")
      }
      centered
      open={open}
      onCancel={handleClose}
      footer={false}
      destroyOnHidden
      width={900}
    >
      <div className="py-4">
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <InputText
                fieldName="userName"
                formik={formik}
                label="settings.fields.userName"
              />
            </Col>
            <Col span={12}>
              <InputPhoneNumber
                fieldName="phoneNumber"
                formik={formik}
                label="settings.fields.phoneNumber"
              />
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <InputText
                fieldName="firstName"
                formik={formik}
                label="settings.fields.firstName"
              />
            </Col>
            <Col span={12}>
              <InputText
                fieldName="lastName"
                formik={formik}
                label="settings.fields.lastName"
              />
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <InputText
                fieldName="email"
                formik={formik}
                label="settings.fields.email"
              />
            </Col>
            <Col span={12}>
              <InputPasword
                fieldName="password"
                formik={formik}
                label="settings.fields.password"
              />
            </Col>
          </Row>

          {isEdit && (
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <SelectCustom
                  fieldName="stateId"
                  formik={formik}
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />
              </Col>
            </Row>
          )}

          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="m-0 text-base font-semibold text-text">
              {t("settings.entities.organizations")}
            </h3>
            <Button
              icon={<Plus className="size-4" />}
              onClick={handleAddOrganization}
            >
              {t("common.add")}
            </Button>
          </div>

          <div className="mb-6 space-y-3">
            {formik.values.organizations.map((organization, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-background-secondary p-3"
              >
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} md={9}>
                    <SelectCustom
                      fieldName={`organizations[${index}].organizationId`}
                      formik={formik}
                      label="settings.fields.organization"
                      path={selectListEndpoints.organizationsSelectList}
                      marginBottom="mb-0"
                      search
                    />
                  </Col>
                  <Col xs={24} md={7}>
                    <SelectCustom
                      fieldName={`organizations[${index}].roleId`}
                      formik={formik}
                      label="settings.fields.role"
                      path={selectListEndpoints.rolesSelectList}
                      marginBottom="mb-0"
                      search
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Radio
                      checked={organization.isDefault}
                      onChange={() => handleSetDefaultOrganization(index)}
                    >
                      {t("settings.fields.defaultOrganization")}
                    </Radio>
                  </Col>
                  <Col xs={12} md={3}>
                    <Checkbox
                      checked={organization.isOwner}
                      onChange={(event) =>
                        formik.setFieldValue(
                          `organizations[${index}].isOwner`,
                          event.target.checked,
                          true,
                        )
                      }
                    >
                      {t("settings.fields.owner")}
                    </Checkbox>
                  </Col>
                  <Col xs={24} md={2} className="flex justify-end">
                    <Button
                      danger
                      type="text"
                      aria-label={t("common.delete")}
                      icon={<Trash2 className="size-4" />}
                      disabled={formik.values.organizations.length === 1}
                      onClick={() => handleRemoveOrganization(index)}
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={createUser.isPending || updateUser.isPending}
            className="h-12 rounded-xl bg-blue-600! text-base font-semibold hover:bg-blue-700!"
          >
            {t("common.submit")}
          </Button>
        </Form>
      </div>
    </Modal>
  );
}

export default UserAddEditPage;
