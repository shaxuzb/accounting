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

interface UsersAddEditModalProps {
  open: boolean;
  onClose: () => void;
  editId: number | null;
}

function UsersAddEditModal({ open, onClose, editId }: UsersAddEditModalProps) {
  const isEdit = Boolean(editId);
  const createUser = useCreateUsers();
  const updateUser = useUpdateUsers();
  const { data } = useGetDetailUsers(editId ?? "");
  const formik = useFormik<UsersForm>({
    initialValues: {
      id: data?.id ?? null,
      userName: data?.userName ?? "",
      phoneNumber: data?.phoneNumber ?? "",
      email: data?.email ?? "",
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      roleId: data?.roleId ?? null,
      password: "xxxxxxxxxxx",
      stateId: data?.stateId ?? null,
    },
    enableReinitialize: true,
    validationSchema: userSchema,
    onSubmit: (values) => {
      if (editId) {
        updateUser.mutate({ id: editId, payload: values });
      } else {
        createUser.mutate(values);
      }
    },
  });
  if (!open) return null;
  return (
    <Modal
      title={isEdit ? "Foydalanuvchini o'zgartirish" : "Foydalanuvchi qo'shish"}
      centered
      open={open}
      onCancel={onClose}
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
                label="User name"
              />
            </Col>
            <Col span={12}>
              <InputPhoneNumber
                fieldName="phoneNumber"
                formik={formik}
                label="Tel raqam"
              />
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <InputText
                fieldName="firstName"
                formik={formik}
                label="First name"
              />
            </Col>
            <Col span={12}>
              <InputText
                fieldName="lastName"
                formik={formik}
                label="Last name"
              />
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <SelectCustom
                fieldName="roleId"
                formik={formik}
                label="Role id"
                path={selectListEndpoints.rolesSelectList}
              />
            </Col>
            <Col span={12}>
              <InputPasword
                fieldName="password"
                formik={formik}
                label="Password"
              />
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <InputText fieldName="email" formik={formik} label="Email" />
            </Col>
          </Row>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            onClick={() => console.log(formik)}
          >
            Yakunlash
          </Button>
        </Form>
      </div>
    </Modal>
  );
}
export default UsersAddEditModal;
