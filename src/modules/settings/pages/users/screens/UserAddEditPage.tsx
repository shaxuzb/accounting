import { useTranslation } from "react-i18next";
import InputPasword from "@/components/fields/InputPassword";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import InputText from "@/components/fields/InputText";
import { Modal, Form, Button, Row, Col } from "antd";
import { useFormik } from "formik";
import { useCreateUsers } from "../hooks";
import { useUpdateUsers } from "../hooks";
import type { UsersForm } from "../types/form";
import { userSchema } from "../types/schema";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useGetDetailUsers } from "../hooks";
import toast from "react-hot-toast";
import { useEffect } from "react";

interface UserAddEditPageProps {
  open: boolean;
  onClose: () => void;
  editId: number | null;
}

function UserAddEditPage({ open, onClose, editId }: UserAddEditPageProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(editId);
  const createUser = useCreateUsers();
  const updateUser = useUpdateUsers();
  const { data, isSuccess } = useGetDetailUsers(editId ?? "");
  const formik = useFormik<UsersForm>({
    initialValues: {
      id: null,
      userName: "",
      phoneNumber: "",
      email: "",
      firstName: "",
      lastName: "",
      roleId: null,
      password: "",
      stateId: null,
    },
    enableReinitialize: true,
    validationSchema: userSchema,
    onSubmit: (values) => {
      if (editId) {
        updateUser.mutate({ id: editId, payload: values });
        toast.success(t("settings.messages.userUpdated"));
      } else {
        createUser.mutate(values);
        toast.success(t("settings.messages.userCreated"));
      }
      formik.resetForm();
      onClose();
    },
  });
  useEffect(() => {
    if (isSuccess) {
      formik.setValues({
        id: data?.id ?? null,
        userName: data?.userName ?? "",
        phoneNumber: data?.phoneNumber ?? "",
        email: data?.email ?? "",
        firstName: data?.firstName ?? "",
        lastName: data?.lastName ?? "",
        roleId: data?.roleId ?? null,
        password: "xxxxxxxxxxx",
        stateId: data?.stateId ?? null,
      });
    }
  }, [isSuccess, data]);
  if (!open) return null;

  return (
    <Modal
      title={isEdit ? t("settings.form.editUser") : t("settings.form.createUser")}
      centered
      open={open}
      onCancel={() => {
        onClose();
        formik.resetForm();
      }}
      footer={false}
      destroyOnHidden
      // width={500}
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
              <SelectCustom
                fieldName="roleId"
                formik={formik}
                label="settings.fields.role"
                path={selectListEndpoints.rolesSelectList}
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

          {isEdit ? (
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <InputText fieldName="email" formik={formik} label="settings.fields.email" />
              </Col>

              <Col span={12}>
                <SelectCustom
                  fieldName="stateId"
                  formik={formik}
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <InputText fieldName="email" formik={formik} label="settings.fields.email" />
              </Col>
            </Row>
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
          >{t("common.submit")}</Button>
        </Form>
      </div>
    </Modal>
  );
}
export default UserAddEditPage;
