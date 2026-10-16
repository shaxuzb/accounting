import { Button, Col, Form, Modal, Row, Select, Switch } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { accountLabel, useProductKinds } from "@/shared/productAccounts";
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

// inv_product_kind: goods and services, the kinds a product saved without one is read as
const GOODS_KIND_ID = 1;
const SERVICE_KIND_ID = 7;

const emptyProductItem = (isService: boolean): ProductItem => ({
  // code: "",
  // sku: "",
  // article: "",
  name: "",
  mxik: "",
  packageCode: "",
  packageName: "",
  description: "",
  isService,
  productKindId: isService ? SERVICE_KIND_ID : GOODS_KIND_ID,
  // Most goods sold here carry a marking; an unmarked item is switched off by hand.
  isPieceTracked: !isService,
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
  const { data: kinds = [], isLoading: kindsLoading } = useProductKinds();
  const stockKinds = kinds.filter((kind) => !kind.isService);

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

  const selectedKind = kinds.find((kind) => kind.id === (productFormik.values.productKindId ?? GOODS_KIND_ID));

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
          <Col span={24} md={6}>
            <InputText
              label="products.fields.packageCode"
              formik={productFormik}
              fieldName="packageCode"
            />
          </Col>
          <Col span={24} md={6}>
            <InputText
              label="products.fields.packageName"
              formik={productFormik}
              fieldName="packageName"
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
          {/* The kind (1C «Вид номенклатуры») says which account keeps the item: goods 2910,
              materials 1010, finished products 2810 ... A service is always a service. */}
          {!isService && (
            <Col span={24} md={12}>
              <Form.Item
                label={t("products.fields.productKind")}
                tooltip={t("products.fields.productKindHint")}
                extra={
                  selectedKind?.stockAccount
                    ? t("products.fields.productKindAccount", { account: accountLabel(selectedKind.stockAccount) })
                    : selectedKind?.stockAccountNumber
                      ? t("products.fields.productKindAccountMissing", { number: selectedKind.stockAccountNumber })
                      : undefined
                }
              >
                <Select
                  loading={kindsLoading}
                  value={productFormik.values.productKindId ?? GOODS_KIND_ID}
                  onChange={(value: number) => productFormik.setFieldValue("productKindId", value)}
                  options={stockKinds.map((kind) => ({ value: kind.id, label: kind.name }))}
                />
              </Form.Item>
            </Col>
          )}

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
          {/* Marked goods keep one row per unit, each with its own code; unmarked goods
              are kept by quantity. A service has no units, so it is not asked. */}
          {!isService && (
            <Col span={12}>
              <Form.Item label={t("products.fields.pieceTracked")}>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={Boolean(productFormik.values.isPieceTracked)}
                    onChange={(checked) =>
                      productFormik.setFieldValue("isPieceTracked", checked, true)
                    }
                  />
                  <span className="text-xs text-secondary-text">
                    {t(
                      productFormik.values.isPieceTracked
                        ? "products.messages.pieceTrackedOn"
                        : "products.messages.pieceTrackedOff",
                    )}
                  </span>
                </div>
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
