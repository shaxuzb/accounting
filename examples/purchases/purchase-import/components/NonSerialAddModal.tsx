import InputNumberFormat from "@/components/fields/InputNumberFormat";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants";
import { Button, Col, Form, Modal, Row } from "antd";
import { FormikProps, useFormik } from "formik";
import { FC } from "react";
import * as yup from "yup";

type FormValues = object;

interface ParentFormValues {
  newProducts?: Array<{ indexId: number } & Record<string, unknown>>;
}

interface ModalPros {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  formik: FormikProps<ParentFormValues>;
}

const schemaAuth = yup.object({
  name: yup.string().required("Nomi majburiy"),
  productId: yup.number().required("Yetkazib beruvchi majburiy"),
  pricePerUom: yup.number().required("Yetkazib beruvchi majburiy"),
  qty: yup.number().required("Yetkazib beruvchi majburiy"),
});

interface InitialValuesProps {
  name: string;
  productId: number | null;
  pricePerUom: number | null;
  qty: number | null;
  productUom?: {
    supplierUom: string;
  };
}

const NonSerialAddModal: FC<ModalPros> = (props) => {
  const { open, setOpen, formik } = props;
  const formikProduct = useFormik<InitialValuesProps>({
    initialValues: {
      name: "",
      productId: null,
      pricePerUom: null,
      qty: null,
      productUom: {
        supplierUom: "",
      },
    },
    validationSchema: schemaAuth,
    onSubmit: async (values) => {
      const list =
        (formik.values.newProducts as Array<{ indexId: number }> | undefined) ??
        [];
      formik.setFieldValue("newProducts", [
        ...list,
        {
          ...values,
          indexId: list.length > 0 ? list[list.length - 1].indexId + 1 : 1,
        },
      ]);
      setOpen?.(false);
      formikProduct.resetForm();
    },
  });

  const handleClose = () => {
    formikProduct.resetForm();
    setOpen?.(false);
  };

  return (
    <Modal
      title={"Mahsulot yaratish"}
      footer={false}
      open={open}
      width={400}
      onCancel={handleClose}
    >
      <Form
        onFinish={formikProduct.handleSubmit}
        layout="vertical"
        className="!mt-3"
      >
        <Row gutter={10}>
          <Col span={24}>
            <SelectCustom
              label="Nomi"
              path={selectListEndpoints.productSelectList + "?isSerial=false"}
              formik={formikProduct as unknown as FormikProps<FormValues>}
              fieldName="productId"
              getFieldNames={["currencyId", "currency", "productUom"]}
              search={true}
              // disabledValue={formik.values.newProducts.filter}
              getFieldName={"name"}
            />
          </Col>
          <Col span={24}>
            <InputNumberFormat
              label="Narxi"
              formik={formikProduct as unknown as FormikProps<FormValues>}
              fieldName="pricePerUom"
            />
          </Col>
          <Col span={24}>
            <InputNumberFormat
              label={`Miqdori (${formikProduct.values.productUom?.supplierUom ?? "Dona"})`}
              formik={formikProduct as unknown as FormikProps<FormValues>}
              fieldName="qty"
            />
          </Col>
          <Col span={24}>
            <Button
              loading={formikProduct.isSubmitting}
              htmlType="submit"
              className="w-full !py-4"
              type="primary"
            >
              Qo'shish
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default NonSerialAddModal;
