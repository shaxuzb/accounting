import { Button, Col, Form, Modal, Row, Switch } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { productItemSchema } from "../types/schema";
import type { ProductItem, ProductTypeForm } from "../types/type";
import type { FormikProps } from "formik";
import toast from "react-hot-toast";

interface ProductItemModalProps {
  open: boolean;
  onClose: () => void;
  formik: FormikProps<ProductTypeForm>;
  editItem?: ProductItem;
  onClearEdit: () => void;
}

const emptyProductItem = () => ({
  name: "",
  barcode: "",
  description: "",
  // isSerial: false,
  isService: false,
  // currencyId: null,
  stateId: 1,
  unitId: null,
  // productUom: {
  //   supplierUomId: null,
  //   stockUomId: null,
  //   clientUomId: null,
  //   supplierToStockFactor: 1,
  //   stockToClientFactor: 1,
  // },
  // characteristics: [],
});

export default function ProductItemModal({
  open,
  onClose,
  formik,
  editItem,
  onClearEdit,
}: ProductItemModalProps) {
  const productFormik = useFormik<ProductItem>({
    initialValues: emptyProductItem(),
    validationSchema: productItemSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (editItem?.idIndex) {
        formik.setFieldValue(
          "products",
          formik.values.products.map((item) =>
            item.idIndex === editItem.idIndex ? { ...item, ...values } : item,
          ),
          true,
        );
        toast.success("Mahsulot o'zgartirildi")
      } else {
        const maxIndex = formik.values.products.reduce(
          (max, item) => Math.max(max, item.idIndex ?? 0),
          0,
        );
        formik.setFieldValue(
          "products",
          [
            ...formik.values.products,
            { ...values, new: true, idIndex: maxIndex + 1 },
          ],
          true,
        );
         toast.success("Mahsulot yaratildi")
      }
      handleClose();
    },
  });

  const handleClose = () => {
    productFormik.resetForm();
    onClearEdit();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    productFormik.setValues(
      editItem ? { ...emptyProductItem(), ...editItem } : emptyProductItem(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem, open]);

  return (
    <Modal
      title={editItem ? "Mahsulotni o'zgartirish" : "Mahsulot yaratish"}
      open={open}
      width={600}
      footer={false}
      onCancel={handleClose}
    >
      <Form layout="vertical" onFinish={productFormik.handleSubmit}>
        <Row gutter={12}>
          <Col span={24} md={12}>
            <InputText
              label="products.fields.name"
              formik={productFormik}
              fieldName="name"
            />
          </Col>
          <Col span={24} md={12} className="relative">
            <InputText
              label="products.fields.sapCode"
              formik={productFormik}
              fieldName="barcode"
            />
            <div className="absolute right-2 top-0">
              <span>Servisli: </span>
              <Switch
                checked={productFormik.values.isService}
                onChange={(value) => {
                  productFormik.setFieldValue("isService", value, true);
                }}
                size="small"
              />
            </div>
          </Col>
          <Col span={24} md={12}>
            <SelectCustom
              label="products.fields.unit"
              path={selectListEndpoints.unitsSelectList}
              formik={productFormik}
              fieldName="unitId"
              getFieldName="unit"
            />
          </Col>
          {/* <Col span={24} md={8}>
            <SelectCustom
              label="products.fields.currency"
              path={selectListEndpoints.currenciesSelectList}
              formik={productFormik}
              fieldName="currencyId"
            />
          </Col>
          <Col span={24} md={8}>
            <SelectCustom
              label="products.fields.supplierUom"
              path={selectListEndpoints.unitsSelectList}
              formik={productFormik}
              fieldName="productUom.supplierUomId"
            />
          </Col>
          <Col span={24} md={8}>
            <SelectCustom
              label="products.fields.stockUom"
              path={selectListEndpoints.unitsSelectList}
              formik={productFormik}
              fieldName="productUom.stockUomId"
            />
          </Col>
          <Col span={24} md={8}>
            <SelectCustom
              label="products.fields.clientUom"
              path={selectListEndpoints.unitsSelectList}
              formik={productFormik}
              fieldName="productUom.clientUomId"
            />
          </Col>
          <Col span={24} md={8}>
            <InputNumberFormat
              label="products.fields.supplierToStockFactor"
              formik={productFormik}
              fieldName="productUom.supplierToStockFactor"
            />
          </Col>
          <Col span={24} md={8}>
            <InputNumberFormat
              label="products.fields.stockToClientFactor"
              formik={productFormik}
              fieldName="productUom.stockToClientFactor"
            />
          </Col> */}
          <Col span={24} md={12}>
            <InputText
              label="products.fields.description"
              formik={productFormik}
              fieldName="description"
            />
          </Col>
          {editItem && (
            <Col span={24} md={12}>
              <SelectCustom
                label="products.fields.status"
                path={selectListEndpoints.statesSelectList}
                formik={productFormik}
                fieldName="stateId"
              />
            </Col>
          )}
          {/* <Col span={24} md={8}>
            <Form.Item label="Seriyali">
              <Switch
                checked={productFormik.values.isSerial}
                onChange={(value) =>
                  productFormik.setFieldValue("isSerial", value, true)
                }
              />
            </Form.Item>
          </Col> */}
        </Row>
        <div className="flex justify-end">
          <Button type="primary" htmlType="submit">
            Saqlash
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
