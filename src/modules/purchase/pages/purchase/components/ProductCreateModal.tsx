import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import type { PurchaseImportRow } from "@/modules/purchase/pages/purchase/types/type";
import { productItemSchema } from "@/modules/warehouse/pages/products/types/schema";
import type { ProductItem } from "@/modules/warehouse/pages/products/types/type";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { Button, Col, Form, Modal, Row, Switch } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface ProductCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialRow?: PurchaseImportRow | null;
}

const ProductCreateModal = ({
  open,
  onClose,
  onCreated,
  initialRow,
}: ProductCreateModalProps) => {
  const formik = useFormik<ProductItem>({
    initialValues: {
      name: "",
      barcode: "",
      mxik: "",
      description: "",
      productGroupId: null,
      isService: false,
      isPieceTracked: false,
      unitId: null,
    },
    validationSchema: productItemSchema(false),
    onSubmit: async (values) => {
      await $axiosPrivate.post("products", values);
      toast.success("Mahsulot muvaffaqiyatli yaratildi");
      handleClose();
      onCreated();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  useEffect(() => {
    if (initialRow) {
      formik.setValues({
        productGroupId: null,
        name:
          initialRow.productName ||
          initialRow.name ||
          initialRow.product ||
          "",
        mxik: initialRow.mxik.toString(),
        barcode: initialRow.sapCode || "",
        unitId: null,
        isService: false,
        isPieceTracked: Boolean(initialRow.isPieceTracked),
        description: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRow]);

  return (
    <Modal
      title={"Mahsulot yaratish"}
      footer={false}
      open={open}
      width={500}
      onCancel={handleClose}
    >
      <Form onFinish={formik.handleSubmit} layout="vertical" className="mt-3!">
        <Row gutter={10}>
          <Col span={24}>
            <SelectCustom
              path={selectListEndpoints.productGroupsSelectList}
              label="Mahsulot turi"
              formik={formik}
              search
              fieldName="productGroupId"
            />
          </Col>
          <Col span={24} className="relative">
            <InputText label="Sab kod" formik={formik} fieldName="barcode" />
            <div className="absolute right-2 top-0">
              <span>Markirovkali: </span>
              <Switch
                checked={Boolean(formik.values.isPieceTracked)}
                onChange={(e) => {
                  formik.setFieldValue("isPieceTracked", e, true);
                }}
                size="small"
              />
            </div>
          </Col>
          {/* {!formik.values.isSerial && (
            <> */}
          <Col span={24}>
            <SelectCustom
              label="Birlik"
              path={selectListEndpoints.unitsSelectList}
              search
              formik={formik}
              fieldName="unitId"
            />
          </Col>
          {/* </>
          )} */}
          <Col span={24}>
            <Button
              loading={formik.isSubmitting}
              htmlType="submit"
              className="w-full py-4!"
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
