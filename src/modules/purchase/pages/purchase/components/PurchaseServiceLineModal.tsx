import { Button, Form, Modal } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import InputNumberFormat from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { PurchaseServiceLineForm } from "./PurchaseServiceLinesTable";

interface ServiceLineDraft {
  serviceId: number | null;
  serviceName: string;
  price: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (line: PurchaseServiceLineForm) => void;
}

const serviceLineSchema = Yup.object({
  serviceId: Yup.number().required("Xizmat majburiy"),
  price: Yup.number().min(0).required("Narxi majburiy"),
});

export default function PurchaseServiceLineModal({
  open,
  onClose,
  onAdd,
}: Props) {
  const formik = useFormik<ServiceLineDraft>({
    initialValues: {
      serviceId: null,
      serviceName: "",
      price: null,
    },
    validationSchema: serviceLineSchema,
    onSubmit: (values, helpers) => {
      if (!values.serviceId || values.price === null) return;
      onAdd({
        serviceId: values.serviceId,
        serviceName: values.serviceName,
        price: values.price,
      });
      helpers.resetForm();
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Serinkasiz mahsulot qo'shish"
      footer={null}
      width={460}
      destroyOnHidden
      onCancel={handleClose}
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <SelectCustom
          label="Xizmat"
          fieldName="serviceId"
          getFieldName="serviceName"
          path={selectListEndpoints.purchaseServicesSelectList}
          formik={formik}
          search
          required
        />
        <InputNumberFormat
          label="Narxi"
          fieldName="price"
          formik={formik}
          min={0}
          precision={2}
        />
        <Button type="primary" htmlType="submit" block>
          Qo'shish
        </Button>
      </Form>
    </Modal>
  );
}
