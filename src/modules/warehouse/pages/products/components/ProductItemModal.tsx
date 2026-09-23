import { Button, Col, Form, Modal, Row, Tag } from "antd";
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
  // code: "",
  // sku: "",
  // article: "",
  name: "",
  mxik: "",
  description: "",
  isService,
  isPieceTracked: false,
  // Backend "sotiladi yoki xarid qilinadi"dan kamida bittasini talab qiladi.
  isSold: true,
  isPurchased: true,
  productGroupId: null,
  defaultVatRateId: null,
  minStock: null,
  stateId: 1,
  unitId: null,
  barcode: ""
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
      if (!values.isSold && !values.isPurchased) {
        toast.error(t("products.validation.soldOrPurchased"));
        return;
      }

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
    <Modal maskClosable={false}
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
          {/* <Col span={24} md={12}>
            <InputText label="Code" formik={productFormik} fieldName="code" />
          </Col>
          <Col span={24} md={12}>
            <InputText label="SKU" formik={productFormik} fieldName="sku" />
          </Col>
          <Col span={24} md={12}>
            <InputText
              label="Article"
              formik={productFormik}
              fieldName="article"
            />
          </Col> */}
          <Col span={24} md={12}>
            <InputText
              label="products.fields.mxik"
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
              clearable
            />
          </Col>
          {/* <Col span={24} md={12}>
            <SelectCustom
              label="products.fields.productType"
              path={selectListEndpoints.productTypesSelectList}
              formik={productFormik}
              fieldName="productTypeId"
              queryParams={{ isService }}
              clearable
            />
          </Col> */}

          <Col span={24} md={12}>
            <SelectCustom
              label="products.fields.defaultVatRate"
              path={selectListEndpoints.vatRatesSelectList}
              formik={productFormik}
              fieldName="defaultVatRateId"
              search
              clearable
              
            />
          </Col>
          <Col span={24}>
            <InputText
              label="products.fields.description"
              formik={productFormik}
              fieldName="description"
            />
          </Col>
          {editItem && (
            <Col span={24}>
              <SelectCustom
                label="products.fields.status"
                path={selectListEndpoints.statesSelectList}
                formik={productFormik}
                fieldName="stateId"
              />
            </Col>
          )}
          {/* <Col span={24} md={12}>
            <InputNumber
              label="Min stock"
              formik={productFormik}
              fieldName="minStock"
              min={0}
            />
          </Col> */}

          <Col span={12}>
            <div className="mb-2 flex flex-wrap gap-2">
              <Button
                type={productFormik.values.isSold ? "primary" : "default"}
                onClick={() =>
                  productFormik.setFieldValue(
                    "isSold",
                    !productFormik.values.isSold,
                    true,
                  )
                }
              >
                {productFormik.values.isSold
                  ? t("products.fields.sold")
                  : t("products.fields.notSold")}
              </Button>
              <Button
                type={productFormik.values.isPurchased ? "primary" : "default"}
                onClick={() =>
                  productFormik.setFieldValue(
                    "isPurchased",
                    !productFormik.values.isPurchased,
                    true,
                  )
                }
              >
                {productFormik.values.isPurchased
                  ? t("products.fields.purchased")
                  : t("products.fields.notPurchased")}
              </Button>
            </div>
          </Col>
          {/* Goods are always tracked one unit at a time — each unit carries its own
              marking — so this is stated, not chosen. Only a service has no units. */}
          {!isService && (
            <Col span={12}>
              <Form.Item label={t("products.fields.pieceTracked")}>
                <Tag color="blue">{t("products.messages.alwaysPieceTracked")}</Tag>
              </Form.Item>
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
