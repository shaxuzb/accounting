import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants";
import {
  ProductTypeInitialValues,
  ProductTypeProductsInitialValues,
} from "@/modules/warehouses/types/initialValues";
import { productsSchema } from "@/utils/validations/warehouses";
import { Button, Col, Form, Modal, Row, Switch } from "antd";
import { FormikProps, useFormik } from "formik";
import { FC, useEffect } from "react";
import ImageSolutionUploadButton from "./ImageSolutionUploadButton";
import InputNumberFormat from "@/components/fields/InputNumberFormat";

type ProductRow = ProductTypeProductsInitialValues & {
  id?: number;
  idIndex?: number;
  new?: boolean;
  state?: string;
};

interface ModalPros {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  formik: FormikProps<ProductTypeInitialValues>;
  editItem?: ProductRow;
  setEditItem?: React.Dispatch<React.SetStateAction<ProductRow | undefined>>;
}

const AddProductTypeModal: FC<ModalPros> = (props) => {
  const { open, setOpen, formik, editItem, setEditItem } = props;
  if (!open) return null;
  const formikProduct = useFormik<ProductTypeProductsInitialValues>({
    enableReinitialize: true,
    initialValues: {
      name: "",
      idIndex: 0,
      description: "",
      sapCode: "",
      supplierId: formik.values.supplierId || null,
      currencyId: null,
      supplier: "",
      stateId: 1,
      isSerial: false,
      productUom: {
        clientUomId: null,
        stockToClientFactor: 1,
        stockUomId: null,
        supplierToStockFactor: 1,
        supplierUomId: null,
      },
      characteristics: [],
    },
    validationSchema: productsSchema(false),
    onSubmit: async (values) => {
      if (editItem?.idIndex) {
        formik.setFieldValue(
          "products",
          formik.values.products.map((oldItem) =>
            oldItem.idIndex === values.idIndex
              ? {
                  ...oldItem,
                  ...values,
                }
              : oldItem,
          ),
        );
      } else {
        const maxIndex = formik.values.products.reduce(
          (max, item) => Math.max(max, item.idIndex ?? 0),
          0,
        );

        formik.setFieldValue("products", [
          ...formik.values.products,
          {
            ...values,
            new: true,
            idIndex: maxIndex + 1,
          },
        ]);
      }

      setOpen?.(false);
      setEditItem?.(undefined);
      formikProduct.resetForm();
    },
  });

  const handleClose = () => {
   
    formikProduct.resetForm();
    setOpen?.(false);
    setEditItem?.(undefined);
  };

  useEffect(() => {
    if (editItem && editItem.idIndex) {
      formikProduct.setValues({
        description: editItem.description ?? "",
        name: editItem.name,
        sapCode: editItem.sapCode,
        stateId: editItem.stateId,
        supplierId: editItem.supplierId,
        supplier: editItem.supplier,
        idIndex: editItem.idIndex,
        isSerial: editItem.isSerial,
        currencyId: editItem.currencyId,
        characteristics: editItem.characteristics,
        productUom: editItem.productUom,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem, open]);

  useEffect(() => {
    if (!editItem) {
      formikProduct.setFieldValue("supplierId", formik.values.supplierId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.supplierId, open, editItem]);

  if (!open) return null;

  return (
    <Modal
      title="Hodim yaratish"
      footer={false}
      open={open}
      width={1000}
      onCancel={handleClose}
    >
      <Form
        onFinish={formikProduct.handleSubmit}
        layout="vertical"
        className="!mt-3"
      >
        <div className="flex items-start gap-5">
          {editItem?.id && (
            <div>
              <ImageSolutionUploadButton productId={editItem.id} />
            </div>
          )}
          <Row gutter={8}>
            <Col span={24}>
              <div className="">
                <h3 className="mb-4 text-base font-semibold">Asosiy</h3>

                <Row gutter={8}>
                  <Col span={8}>
                    <InputText
                      label="Nomi"
                      formik={formikProduct}
                      fieldName="name"
                    />
                  </Col>

                  <Col span={8}>
                    <SelectCustom
                      label="Yetkazib beruvchi"
                      path={selectListEndpoints.supplierSelectList}
                      formik={formikProduct}
                      fieldName="supplierId"
                      getFieldName="supplier"
                    />
                  </Col>
                  <Col span={8}>
                    <InputText
                      label="Ma'lumot"
                      formik={formikProduct}
                      fieldName="description"
                    />
                  </Col>
                  <Col span={8} className="relative">
                    <InputText
                      label="Sab kod"
                      formik={formikProduct}
                      fieldName="sapCode"
                    />
                    <div className="absolute right-2 top-0">
                      <span>Seriyali: </span>
                      <Switch
                        checked={formikProduct.values.isSerial}
                        onChange={(value) => {
                          formikProduct.setFieldValue("isSerial", value, true);
                        }}
                        size="small"
                      />
                    </div>
                  </Col>
                  <Col span={24} sm={{ span: 12 }} md={{ span: 8 }}>
                    <SelectCustom
                      fieldName="currencyId"
                      label="Valyuta turi"
                      path={selectListEndpoints.currencySelectList}
                      formik={formikProduct}
                    />
                  </Col>
                  {editItem?.idIndex && (
                    <Col span={8}>
                      <SelectCustom
                        path={selectListEndpoints.stateSelectList}
                        label="Holati"
                        formik={formikProduct}
                        fieldName="stateId"
                      />
                    </Col>
                  )}
                </Row>
              </div>
            </Col>
            {/* {!formikProduct.values.isSerial && (
              <> */}
            <Col span={24}>
              <div className="">
                <h3 className="mb-4 text-base font-semibold">
                  O'lchov birliklari
                </h3>

                <Row gutter={8}>
                  <Col span={8}>
                    <SelectCustom
                      label="Xarid birligi"
                      path={selectListEndpoints.uomSelectList}
                      formik={formikProduct}
                      fieldName="productUom.supplierUomId"
                    />
                  </Col>

                  <Col span={8}>
                    <SelectCustom
                      label="Ombor birligi"
                      path={selectListEndpoints.uomSelectList}
                      formik={formikProduct}
                      fieldName="productUom.stockUomId"
                    />
                  </Col>

                  <Col span={8}>
                    <SelectCustom
                      label="Sotuv birligi"
                      path={selectListEndpoints.uomSelectList}
                      formik={formikProduct}
                      fieldName="productUom.clientUomId"
                    />
                  </Col>

                  <Col span={12}>
                    <InputNumberFormat
                      label="Kirim konversiyasi"
                      formik={formikProduct}
                      fieldName="productUom.supplierToStockFactor"
                    />
                  </Col>

                  <Col span={12}>
                    <InputNumberFormat
                      label="Sotuv konversiyasi"
                      formik={formikProduct}
                      fieldName="productUom.stockToClientFactor"
                    />
                  </Col>
                </Row>
              </div>
            </Col>
            {/* <Col span={8}>
              <SelectCustom
                label="Xariddagi birlik"
                path={selectListEndpoints.uomSelectList}
                formik={formikProduct}
                fieldName="productUom.supplierUomId"
              />
            </Col>
            <Col span={8}>
              <SelectCustom
                label="Ombordagi birlik"
                path={selectListEndpoints.uomSelectList}
                formik={formikProduct}
                fieldName="productUom.stockUomId"
              />
            </Col>
            <Col span={8}>
              <SelectCustom
                label="Sotuvdagi birlik "
                path={selectListEndpoints.uomSelectList}
                formik={formikProduct}
                fieldName="productUom.clientUomId"
              />
            </Col> */}
            {/* </>
            )} */}

            <Col span={24} className="mb-6">
              <h3 className="font-semibold mb-2">Mahsulot tavsifi</h3>

              {formikProduct.values.characteristics?.map((_, index) => (
                <div key={index} className="flex gap-2 mb-1">
                  <InputText
                    placeholder="Tavsif nomi (masalan: Rang)"
                    formik={formikProduct}
                    fieldName={`characteristics[${index}].key`}
                  />
                  <InputText
                    placeholder="Qiymati (masalan: Qizil)"
                    formik={formikProduct}
                    fieldName={`characteristics[${index}].value`}
                  />
                  <Button
                    danger
                    className="!h-[38px]"
                    onClick={() => {
                      const list = [...formikProduct.values.characteristics];
                      list.splice(index, 1);
                      formikProduct.setFieldValue("characteristics", list);
                    }}
                  >
                    x
                  </Button>
                </div>
              ))}

              <Button
                type="dashed"
                className="w-full mt-0"
                onClick={() =>
                  formikProduct.setFieldValue("characteristics", [
                    ...formikProduct.values.characteristics,
                    { key: "", value: "" },
                  ])
                }
              >
                + Tavsif qo'shish
              </Button>
            </Col>
            <Col span={24}>
              <Button
                loading={formikProduct.isSubmitting}
                htmlType="submit"
                className="w-full !py-4"
                type="primary"
              >
                {editItem ? "O'zgartirish" : "Qo'shish"}
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default AddProductTypeModal;
