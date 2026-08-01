import SelectCustom from "@/components/fields/SelectCustom";
import type { PurchaseImportRow } from "@/modules/purchase/pages/purchase/types/type";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Switch,
  Table,
  type TableColumnType,
} from "antd";
import { useFormik } from "formik";
import { Trash } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import * as yup from "yup";

interface ProductsCreateModalProps {
  open: boolean;
  rows: PurchaseImportRow[];
  onClose: () => void;
  onCreated: () => void;
  onRowsChange: (rows: PurchaseImportRow[]) => void;
}

interface Products {
  name: string;
  product: string;
  mxik: string;
  description: string;
}

interface ProductInitialValues {
  products: Products[];
  productGroupId: number | null;
  unitId: number | null;
  isService: boolean;
  isPieceTracked: boolean;
}

const ProductsCreateModal = ({
  open,
  rows,
  onClose,
  onCreated,
  onRowsChange,
}: ProductsCreateModalProps) => {
  const { t } = useTranslation();
  const schemaAuth = yup.object({
    products: yup
      .array()
      .of(yup.object({ mxik: yup.string().trim().required(t("purchase.messages.mxikRequired")) }))
      .min(1, t("purchase.messages.atLeastOneProduct"))
      .required(t("purchase.messages.productsRequired")),
    productGroupId: yup.number().nullable().required(t("purchase.messages.productTypeRequired")),
    unitId: yup.number().nullable().required(t("purchase.messages.unitRequired")),
    isService: yup.boolean().defined(),
    isPieceTracked: yup.boolean().defined(),
  });
  const formik = useFormik<ProductInitialValues>({
    initialValues: {
      products: rows as unknown as Products[],
      productGroupId: null,
      unitId: null,
      isService: false,
      isPieceTracked: false,
    },
    validationSchema: schemaAuth,
    onSubmit: async (values) => {
      try {
        const response = await $axiosPrivate.post("products/many", {
          products: values.products.map((item) => ({
            productGroupId: values.productGroupId,
            unitId: values.unitId,
            name: item.product || item.name,
            mxik: String(item.mxik ?? "").trim(),
            barcode: null,
            description: "",
            isService: values.isService,
            isPieceTracked: values.isPieceTracked,
          })),
        });

        if (response) {
          toast.success(t("purchase.messages.productCreated"));
          formik.resetForm();
          onRowsChange([]);
          onClose();
          onCreated();
        }
      } catch {
        toast.error(t("purchase.messages.productsCreateError"));
      }
    },
  });

  const handleDelete = (rowIndex: number) => {
    const filtered = rows.filter((_, index) => index !== rowIndex);
    onRowsChange(filtered);
    formik.setFieldValue("products", filtered, true);
  };

  const tableColumnLabels: TableColumnType<PurchaseImportRow>[] = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      width: 50,
      align: "center",
      render: (_, __, rowIndex) => rowIndex + 1,
    },
    {
      dataIndex: "product",
      title: t("purchase.fields.productName"),
      width: 200,
      render: (value, record) => {
        return record.name || value;
      },
    },
    {
      dataIndex: "mxik",
      title: t("purchase.fields.mxik"),
      width: 200,
      align: "center",
    },
    {
      dataIndex: "actions",
      title: t("common.actions"),
      width: 100,
      fixed: "right",
      align: "center",
      render(_, __, rowIndex) {
        return (
          <div>
            <Button
              onClick={() => handleDelete(rowIndex)}
              type="text"
              icon={<Trash className="size-4 text-danger!" />}
            />
          </div>
        );
      },
    },
  ];

  const handleClose = () => {
    formik.resetForm();
    onRowsChange([]);
    onClose();
  };

  const setFormValues = formik.setValues;

  useEffect(() => {
    if (rows.length > 0) {
      setFormValues({
        productGroupId: null,
        products: rows as unknown as Products[],
        isService: false,
        isPieceTracked: Boolean(rows[0].isPieceTracked),
        unitId: null,
      });
    }
  }, [rows, setFormValues]);

  return (
    <Modal
      title={t("products.modal.createProduct")}
      footer={false}
      open={open}
      width={600}
      onCancel={handleClose}
    >
      <Form onFinish={formik.handleSubmit} layout="vertical" className="mt-3!">
        <Row gutter={10}>
          <Col
            span={24}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            className="relative"
          >
            <SelectCustom
              path={selectListEndpoints.productGroupsSelectList}
              label="purchase.fields.productType"
              search
              formik={formik}
              fieldName="productGroupId"
            />

            <div className="absolute right-2 top-0">
              <span>{t("purchase.fields.pieceTracked")}: </span>
              <Switch
                checked={formik.values.isPieceTracked}
                onChange={(e) => {
                  formik.setFieldValue("isPieceTracked", e, true);
                }}
                size="small"
              />
            </div>
          </Col>
          <Col span={24} sm={{ span: 12 }} md={{ span: 12 }}>
            <SelectCustom
              fieldName="unitId"
              label="purchase.fields.unit"
              path={selectListEndpoints.unitsSelectList}
              formik={formik}
              search
            />
          </Col>
          <Col span={24}>
            <Table
              columns={tableColumnLabels}
              bordered
              dataSource={rows}
              rowKey="key"
            />
          </Col>
          <Col span={24}>
            <Button
              loading={formik.isSubmitting}
              htmlType="submit"
              className="w-full py-4!"
              type="primary"
            >
              {t("common.save")}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ProductsCreateModal;
