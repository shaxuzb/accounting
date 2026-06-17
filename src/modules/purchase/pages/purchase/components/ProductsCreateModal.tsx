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
import { useEffect, type FC } from "react";
import toast from "react-hot-toast";
import * as yup from "yup";

interface ModalPros {
  open?: boolean;
  refetch: () => void;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  editData?: PurchaseImportRow[] | null;
  setEditData?: React.Dispatch<React.SetStateAction<PurchaseImportRow[]>>;
}

const schemaAuth = yup.object({
  products: yup.array().required("Login majburiy"),
  productGroupId: yup.number().required("Login majburiy"),
  unitId: yup.number().required("Majburiy"),
  isService: yup.boolean().required("Yetkazib beruvchi majburiy"),
});

interface Products {
  name: string;
  product: string;
  sapCode: string;
  description: string;
}

interface ProductInitialValues {
  products: Products[];
  productGroupId: number | null;
  unitId: number | null;
  isService: boolean;
}

const ProductsCreateModal: FC<ModalPros> = (props) => {
  const { open, setOpen, refetch, editData, setEditData } = props;
  const formik = useFormik<ProductInitialValues>({
    initialValues: {
      products: (editData as unknown as Products[]) ?? [],
      productGroupId: null,
      unitId: null,
      isService: true,
    },
    validationSchema: schemaAuth,
    onSubmit: async (values) => {
      try {
        const response = await $axiosPrivate.post(
          "products/many",
          values.products.map((item) => ({
            productGroupId: values.productGroupId,
            name: item.product || item.name,
            barcode: item.sapCode.toString(),
            description: "",
            unitId: values.unitId,
            isService: values.isService,
          })),
        );

        if (response) {
          toast.success("Mahsulot muvaffaqiyatli yaratildi");
          setOpen?.(false);
          formik.resetForm();
          setEditData?.([]);
          refetch();
        }
      } catch {
        toast.error("Mahsulotlarni yaratishda xatolik yuz berdi");
      }
    },
  });

  const handleDelete = (id: number) => {
    const filtered = (editData ?? []).filter((item) => item.indexId !== id);
    setEditData?.(filtered);
  };

  const tableColumnLabels: TableColumnType<PurchaseImportRow>[] = [
    {
      dataIndex: "indexId",
      title: "T/r",
      width: 50,
      align: "center",
    },
    {
      dataIndex: "product",
      title: "Mahsulot nomi",
      width: 200,
      render: (value, record) => {
        return record.name || value;
      },
    },
    {
      dataIndex: "sapCode",
      title: "Sab kodi",
      width: 200,
      align: "center",
    },
    {
      dataIndex: "actions",
      title: "Amallar",
      width: 100,
      fixed: "right",
      align: "center",
      render(_, record) {
        return (
          <div>
            <Button
              onClick={() => handleDelete(record.indexId)}
              type="text"
              icon={<Trash className="text-red-800! size-4" />}
            />
          </div>
        );
      },
    },
  ];

  const handleClose = () => {
    formik.resetForm();
    setEditData?.([]);
    setOpen?.(false);
  };

  useEffect(() => {
    if (editData && editData.length > 0) {
      formik.setValues({
        productGroupId: null,
        products: editData as unknown as Products[],
        isService: Boolean(editData[0].isSerial),
        unitId: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  return (
    <Modal
      title={"Mahsulot yaratish"}
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
              label="Mahsulot turi"
              search
              formik={formik}
              fieldName="productGroupId"
            />

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
          <Col span={24} sm={{ span: 12 }} md={{ span: 12 }}>
            <SelectCustom
              fieldName="unitId"
              label="Birlik"
              path={selectListEndpoints.unitsSelectList}
              formik={formik}
              search
            />
          </Col>
          <Col span={24}>
            <Table
              columns={tableColumnLabels}
              bordered
              dataSource={(editData ?? []).map((item, index) => ({
                ...item,
                indexId: index + 1,
              }))}
            />
          </Col>
          <Col span={24}>
            <Button
              loading={formik.isSubmitting}
              htmlType="submit"
              className="w-full py-4!"
              type="primary"
            >
              Saqlash
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ProductsCreateModal;
