import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import type { ProductItem } from "@/modules/products";
import { productItemSchema } from "@/modules/products/pages/products/types/schema";
import type { PurchaseImportRow } from "@/modules/purchase/types/type";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { Button, Col, Form, Modal, Row, Switch } from "antd";
import { useFormik } from "formik";
import { useEffect, type FC } from "react";
import toast from "react-hot-toast";

interface ModalPros {
  open?: boolean;
  refetch: () => void;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  editData?: PurchaseImportRow | null;
  setEditData?: React.Dispatch<React.SetStateAction<PurchaseImportRow[]>>;
}

const ProductCreateModal: FC<ModalPros> = (props) => {
  const { open, setOpen, refetch, editData, setEditData } = props;
  const formik = useFormik<ProductItem>({
    initialValues: {
      name: "",
      barcode: "",
      description: "",
      productGroupId: null,
      isService: true,
      unitId: null,
    },
    validationSchema: productItemSchema(false),
    onSubmit: async (values) => {
      await $axiosPrivate.post("products", values);
      toast.success("Mahsulot muvaffaqiyatli yaratildi");
      handleClose();
      refetch();
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
        productGroupId: null,
        name: editData.productName || editData.name || editData.product || "",
        barcode: editData.sapCode.toString(),
        unitId: null,
        isService: editData.isSerial,
        description: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);
  console.log(editData);

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
              <span>Seriyali: </span>
              <Switch
                checked={formik.values.isService}
                onChange={(e) => {
                  formik.setFieldValue("isService", e, true);
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
