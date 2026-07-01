import { Button, Col, Form, Modal, Row, Switch } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { productItemSchema } from "../types/schema";
import type { ProductItem, ProductTypeForm } from "../types/type";
import type { FormikProps } from "formik";

interface ProductItemModalProps {
  open: boolean;
  onClose: () => void;
  formik: FormikProps<ProductTypeForm>;
  editItem?: ProductItem;
  onClearEdit: () => void;
}

const emptyProductItem = (isService: boolean): ProductItem => ({
  name: "",
  barcode: "",
  mxik: "",
  description: "",
  isService,
  isPieceTracked: false,
  stateId: 1,
  unitId: null,
});

export default function ProductItemModal({
  open,
  onClose,
  formik,
  editItem,
  onClearEdit,
}: ProductItemModalProps) {
  const { t } = useTranslation();
  const isService = formik.values.isService;

  const productFormik = useFormik<ProductItem>({
    initialValues: emptyProductItem(isService),
    validationSchema: productItemSchema(),
    enableReinitialize: true,
    onSubmit: (values) => {
      const payload = { ...values, isService };
      if (editItem?.idIndex) {
        formik.setFieldValue(
          "products",
          formik.values.products.map((item) =>
            item.idIndex === editItem.idIndex ? { ...item, ...payload } : item,
          ),
          true,
        );
        toast.success(
          isService
            ? t("products.messages.serviceItemUpdated")
            : t("products.messages.itemUpdated"),
        );
      } else {
        const maxIndex = formik.values.products.reduce(
          (max, item) => Math.max(max, item.idIndex ?? 0),
          0,
        );
        formik.setFieldValue(
          "products",
          [
            ...formik.values.products,
            { ...payload, new: true, idIndex: maxIndex + 1 },
          ],
          true,
        );
        toast.success(
          isService
            ? t("products.messages.serviceItemCreated")
            : t("products.messages.itemCreated"),
        );
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
      editItem
        ? { ...emptyProductItem(isService), ...editItem, isService }
        : emptyProductItem(isService),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem, open, isService]);

  const titleKey = editItem
    ? isService
      ? "products.modal.editService"
      : "products.modal.editProduct"
    : isService
      ? "products.modal.createService"
      : "products.modal.createProduct";

  return (
    <Modal
      title={t(titleKey)}
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
          <Col span={24} md={12}>
            <InputText
              label="Mxik"
              formik={productFormik}
              fieldName="mxik"
            />
          </Col>
          {/* <Col span={24} md={12}>
            <InputText
              label="SAP kod"
              formik={productFormik}
              fieldName="barcode"
            />
          </Col> */}
          <Col span={24} md={12}>
            <SelectCustom
              label="products.fields.unit"
              path={selectListEndpoints.unitsSelectList}
              formik={productFormik}
              fieldName="unitId"
              getFieldName="unit"
            />
          </Col>
          <Col span={24} md={12}>
            <InputText
              label="products.fields.description"
              formik={productFormik}
              fieldName="description"
            />
          </Col>
          {!isService && (
            <Col span={24} md={12}>
              <Form.Item label="Markirovkali">
                <Switch
                  checked={Boolean(productFormik.values.isPieceTracked)}
                  checkedChildren="Ha"
                  unCheckedChildren="Yo'q"
                  onChange={(checked) =>
                    productFormik.setFieldValue(
                      "isPieceTracked",
                      checked,
                      true,
                    )
                  }
                />
              </Form.Item>
            </Col>
          )}
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
        </Row>
        <div className="flex justify-end">
          <Button type="primary" htmlType="submit">
            {t("common.save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
