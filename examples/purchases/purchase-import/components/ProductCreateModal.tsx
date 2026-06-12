import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants";
import { useCreateProduct } from "@/modules/warehouses/hooks/useCreateProduct";
import { ProductsInitialValues } from "@/modules/warehouses/types/initialValues";
import { productsSchema } from "@/utils/validations/warehouses";
import { Button, Col, Form, Modal, Row, Switch } from "antd";
import { useFormik } from "formik";
import { FC, useEffect } from "react";
import toast from "react-hot-toast";
import { ExcelDataProductIncomeType } from "..";

interface ModalPros {
  open?: boolean;
  refetch: () => void;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  editData?: ExcelDataProductIncomeType | null;
  setEditData?: React.Dispatch<
    React.SetStateAction<ExcelDataProductIncomeType[]>
  >;
}

const ProductCreateModal: FC<ModalPros> = (props) => {
  const { open, setOpen, refetch, editData, setEditData } = props;
  const mutation = useCreateProduct();
  const formik = useFormik<ProductsInitialValues>({
    initialValues: {
      name: "",
      sapCode: "",
      description: "",
      productTypeId: null,
      supplierId: null,
      supplier: "",
      unitPrice: null,
      isSerial: true,
      currencyId: null,
      productUom: {
        clientUomId: null,
        stockToClientFactor: 1,
        stockUomId: null,
        supplierToStockFactor: 1,
        supplierUomId: null,
      },
      charasteristics: [],
    },
    validationSchema: productsSchema(true),
    onSubmit: async (values) => {
      mutation.mutate(values, {
        onSuccess: () => {
          toast.success("Mahsulot muvaffaqiyatli yaratildi");
          handleClose();
          refetch();
        },
      });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setEditData?.([]);
    setOpen?.(false);
  };

  useEffect(() => {
    if (editData) {
      formik.setValues({
        productTypeId: null,
        name: editData.productName || editData.name || "",
        sapCode: editData.sapCode.toString(),
        description: editData.description,
        supplierId: editData.supplierId,
        unitPrice: null,
        currencyId: null,
        isSerial: editData.isSerial,
        charasteristics: [],
        productUom: {
          clientUomId: null,
          stockToClientFactor: 1,
          stockUomId: null,
          supplierToStockFactor: 1,
          supplierUomId: null,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  return (
    <Modal
      title={"Mahsulot yaratish"}
      footer={false}
      open={open}
      width={500}
      onCancel={handleClose}
    >
      <Form onFinish={formik.handleSubmit} layout="vertical" className="!mt-3">
        <Row gutter={10}>
          <Col span={24}>
            <SelectCustom
              path={selectListEndpoints.producTypeSelectList}
              label="Mahsulot turi"
              formik={formik}
              search
              fieldName="productTypeId"
            />
          </Col>
          <Col span={24}>
            <SelectCustom
              fieldName="currencyId"
              label="Valyuta turi"
              path={selectListEndpoints.currencySelectList}
              formik={formik}
            />
          </Col>
          <Col span={24} className="relative">
            <InputText label="Sab kod" formik={formik} fieldName="sapCode" />
            <div className="absolute right-2 top-0">
              <span>Seriyali: </span>
              <Switch
                checked={formik.values.isSerial}
                onChange={(e) => {
                  formik.setFieldValue("isSerial", e, true);
                }}
                size="small"
              />
            </div>
          </Col>
          {/* {!formik.values.isSerial && (
            <> */}
          <Col span={8}>
            <SelectCustom
              label="Xariddagi birlik"
              path={selectListEndpoints.uomSelectList}
              search
              formik={formik}
              fieldName="productUom.supplierUomId"
            />
          </Col>
          <Col span={8}>
            <SelectCustom
              label="Ombordagi birlik"
              search
              path={selectListEndpoints.uomSelectList}
              formik={formik}
              fieldName="productUom.stockUomId"
            />
          </Col>
          <Col span={8}>
            <SelectCustom
              label="Sotuvdagi birlik "
              path={selectListEndpoints.uomSelectList}
              formik={formik}
              search
              fieldName="productUom.clientUomId"
            />
          </Col>
          {/* </>
          )} */}
          <Col span={24}>
            <Button
              loading={formik.isSubmitting}
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

export default ProductCreateModal;
