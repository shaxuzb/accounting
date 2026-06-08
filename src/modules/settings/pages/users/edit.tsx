import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import InputText from "@/components/fields/InputText";
import { Modal, Form, Button, Row, Col } from "antd";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import $axiosPrivate from "@/services/AxiosService";
import toast from "react-hot-toast";
import InputNumberFormat from "@/components/fields/InputNumber";

interface EditUserValues {
  userName: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  stateId: number;
}

interface UsersEditModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: any | null;
}

function UsersEditModal({ open, onClose, currentUser }: UsersEditModalProps) {
  const queryClient = useQueryClient();

  const schemaAuth = yup.object({
    userName: yup.string().required("User name kiritilishi shart"),
    firstName: yup.string().required("Ism kiritilishi shart"),
    lastName: yup.string().required("Familiya kiritilishi shart"),
  });
  const editMutation = useMutation({
    mutationFn: (payload: EditUserValues) => {
      return $axiosPrivate.put(`users/${currentUser?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UserData"] });
      toast.success("Ma'lumotlar muvaffaqiyatli yangilandi!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Xatolik yuz berdi: ${error?.message || error}`);
    },
  });

  const formik = useFormik<EditUserValues>({
    initialValues: {
      userName: currentUser?.userName || "",
      phoneNumber: currentUser?.phoneNumber || "",
      email: currentUser?.email || "",
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      roleId: currentUser?.roleId || 1,
      stateId: currentUser?.stateId || 1,
    },
    enableReinitialize: true,
    validationSchema: schemaAuth,
    onSubmit: (values) => {
      editMutation.mutate(values);
    },
  });

  return (
    <Modal
      title="Foydalanuvchini tahrirlash"
      centered
      open={open}
      onCancel={onClose}
      footer={false}
      width={650}
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
                label="First Name"
              />
            </Col>
            <Col span={12}>
              <InputText
                fieldName="lastName"
                formik={formik}
                label="Last Name"
              />
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <InputNumberFormat
                fieldName="roleId"
                formik={formik}
                label="Role Id"
              />
            </Col>
            <Col span={12}>
              <InputText fieldName="stateId" formik={formik} label="State Id" />
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <InputText fieldName="email" formik={formik} label="Email" />
            </Col>
          </Row>
          <div className="mt-5">
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={editMutation.isPending}
              className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-base"
            >
              O'zgarishlarni saqlash
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default UsersEditModal;
