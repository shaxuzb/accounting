import { Button, Col, Form, Modal, Row, Switch } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import * as Yup from "yup";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { PurchaseImportRow } from "../types/type";
import { getRowMxik } from "../utils/purchaseImport";

interface ProductCreateModalProps {
  open: boolean;
  initialRow?: PurchaseImportRow | null;
  onClose: () => void;
  onCreated: () => void;
}

interface ProductCreateForm {
  name: string;
  mxik: string;
  productGroupId: number | null;
  unitId: number | null;
  isPieceTracked: boolean;
}

const getInitialValues = (
  initialRow?: PurchaseImportRow | null,
): ProductCreateForm => ({
  name:
    initialRow?.productName ||
    initialRow?.name ||
    initialRow?.product ||
    "",
  mxik: getRowMxik(initialRow),
  productGroupId: null,
  unitId: initialRow?.unitId ?? null,
  isPieceTracked: Boolean(initialRow?.isPieceTracked),
});

export default function ProductCreateModal({
  open,
  initialRow,
  onClose,
  onCreated,
}: ProductCreateModalProps) {
  const { t } = useTranslation();
  const productCreateSchema = Yup.object({
    name: Yup.string().trim().required(t("purchase.messages.productNameRequired")),
    mxik: Yup.string().trim().required(t("purchase.messages.mxikRequired")),
    productGroupId: Yup.number()
      .nullable()
      .required(t("purchase.messages.productTypeRequired")),
    unitId: Yup.number().nullable().required(t("purchase.messages.unitRequired")),
    isPieceTracked: Yup.boolean().defined(),
  });
  const formik = useFormik<ProductCreateForm>({
    initialValues: getInitialValues(initialRow),
    validationSchema: productCreateSchema,
    onSubmit: async (values) => {
      try {
        await $axiosPrivate.post("products", {
          productGroupId: values.productGroupId,
          unitId: values.unitId,
          name: values.name.trim(),
          mxik: values.mxik.trim(),
          barcode: null,
          description: "",
          isService: false,
          isPieceTracked: values.isPieceTracked,
        });
        toast.success(t("purchase.messages.productCreated"));
        formik.resetForm();
        onClose();
        onCreated();
      } catch {
        toast.error(t("purchase.messages.productCreateError"));
      }
    },
  });
  const setFormValues = formik.setValues;

  useEffect(() => {
    if (!open) return;
    void setFormValues(getInitialValues(initialRow), false);
  }, [initialRow, open, setFormValues]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal maskClosable={false}
      title={t("products.modal.createProduct")}
      footer={null}
      open={open}
      width={500}
      destroyOnHidden
      onCancel={handleClose}
    >
      <Form onFinish={formik.handleSubmit} layout="vertical" className="mt-3!">
        <Row gutter={10}>
          <Col span={24}>
            <InputText
              label="purchase.fields.productName"
              fieldName="name"
              formik={formik}
            />
          </Col>
          <Col span={24}>
            <InputText label="purchase.fields.mxik" fieldName="mxik" formik={formik} />
          </Col>
          <Col span={24} className="relative">
            <SelectCustom
              path={selectListEndpoints.productGroupsSelectList}
              label="purchase.fields.productType"
              fieldName="productGroupId"
              formik={formik}
              search
              required
            />
            <div className="absolute right-2 top-0">
              <span>{t("purchase.fields.pieceTracked")}: </span>
              <Switch
                checked={formik.values.isPieceTracked}
                onChange={(value) => {
                  void formik.setFieldValue("isPieceTracked", value, true);
                }}
                size="small"
              />
            </div>
          </Col>
          <Col span={24}>
            <SelectCustom
              path={selectListEndpoints.unitsSelectList}
              label="purchase.fields.unit"
              fieldName="unitId"
              formik={formik}
              search
              required
            />
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              htmlType="submit"
              loading={formik.isSubmitting}
              block
            >
              {t("common.add")}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
