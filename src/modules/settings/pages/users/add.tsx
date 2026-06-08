import InputNumberFormat from "@/components/fields/InputNumber";
import InputPasword from "@/components/fields/InputPassword";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import InputText from "@/components/fields/InputText";
import $axiosPrivate from "@/services/AxiosService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Form, Button, Row, Col } from "antd";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import * as yup from "yup";

interface initialValuesTypes {
  userName: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  password: string;
}

interface UsersModalProps {
  open: boolean;
  onClose: () => void;
}

function UsersAddModal({ open, onClose }: UsersModalProps) {
  const queryClient = useQueryClient();
  const schemaAuth = yup.object({
    userName: yup.string().required("User Name kiriting"),
    phoneNumber: yup.string().required("Raqamni kiriting"),
  });
  const addMutation = useMutation({
    mutationFn: (payload: initialValuesTypes) =>
      $axiosPrivate.post("users", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UserData"] });
      toast.success("Foydalanuvchi muvaffaqiyatli qo'shildi!");
      formik.resetForm();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Xatolik yuz berdi: ${error?.message || error}`);
    },
  });

  const formik = useFormik<initialValuesTypes>({
    initialValues: {
      userName: "",
      phoneNumber: "",
      email: "",
      firstName: "",
      lastName: "",
      roleId: null,
      password: "",
    },
    enableReinitialize: true,
    validationSchema: schemaAuth,
    onSubmit: async (values) => {
      addMutation.mutate(values);
    },
  });
  return (
    <Modal
      title="Yangi foydalanuvchi qo'shish"
      centered
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={false}
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
              <InputNumberFormat
                fieldName="roleId"
                formik={formik}
                label="Role id"
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
export default UsersAddModal;
