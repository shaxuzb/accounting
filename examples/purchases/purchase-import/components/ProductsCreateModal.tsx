import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Switch,
  Table,
  TableColumnType,
} from "antd";
import { useFormik } from "formik";
import { Trash } from "lucide-react";
import { FC, useEffect } from "react";
import toast from "react-hot-toast";
import * as yup from "yup";
import { ExcelDataProductIncomeType } from "..";

interface ModalPros {
  open?: boolean;
  refetch: () => void;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  editData?: ExcelDataProductIncomeType[] | null;
  setEditData?: React.Dispatch<
    React.SetStateAction<ExcelDataProductIncomeType[]>
  >;
}

const schemaAuth = yup.object({
  products: yup.array().required("Login majburiy"),
  productTypeId: yup.number().required("Login majburiy"),
  isSerial: yup.boolean().required("Yetkazib beruvchi majburiy"),
  productUom: yup.object().shape({
    supplierUomId: yup.number().when("isSerial", {
      is: false,
      then: (schema) => schema.required("Majburiy"),
      otherwise: (schema) => schema.notRequired(),
    }),
    stockUomId: yup.number().when("isSerial", {
      is: false,
      then: (schema) => schema.required("Majburiy"),
      otherwise: (schema) => schema.notRequired(),
    }),
    clientUomId: yup.number().when("isSerial", {
      is: false,
      then: (schema) => schema.required("Majburiy"),
      otherwise: (schema) => schema.notRequired(),
    }),
    supplierToStockFactor: yup.number().notRequired(),
    stockToClientFactor: yup.number().notRequired(),
  }),
});

interface Products {
  name: string;
  product: string;
  sapCode: string;
  description: string;
  productTypeId: number | null;
  supplierId: number | null;
  isSerial: boolean;
  productUom: {
    supplierUomId: number | null;
    stockUomId: number | null;
    clientUomId: number | null;
    supplierToStockFactor: number | null;
    stockToClientFactor: number | null;
  };
}

interface ProductInitialValues {
  products: Products[];
  productTypeId: number | null;
  currencyId: number | null;
  isSerial: boolean;
  productUom: {
    supplierUomId: number | null;
    stockUomId: number | null;
    clientUomId: number | null;
    supplierToStockFactor: number | null;
    stockToClientFactor: number | null;
  };
  supplierId: number | null;
}

const ProductsCreateModal: FC<ModalPros> = (props) => {
  const { open, setOpen, refetch, editData, setEditData } = props;
  const formik = useFormik<ProductInitialValues>({
    initialValues: {
      products: (editData as unknown as Products[]) ?? [],
      productTypeId: null,
      currencyId: null,
      isSerial: true,
      productUom: {
        clientUomId: null,
        stockToClientFactor: 1,
        stockUomId: null,
        supplierToStockFactor: 1,
        supplierUomId: null,
      },
      supplierId: null,
    },
    validationSchema: schemaAuth,
    onSubmit: async (values) => {
      try {
        const response = await $axiosPrivate.post(
          "products/many",
          values.products.map((item) => ({
            productTypeId: values.productTypeId,
            name: item.product || item.name,
            sapCode: item.sapCode.toString(),
            description: "",
            supplierId: values.supplierId,
            currencyId: values.currencyId,
            isSerial: values.isSerial,
            productUom: values.productUom,
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

  const tableColumnLabels: TableColumnType<ExcelDataProductIncomeType>[] = [
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
              icon={<Trash className="!text-red-800 size-4" />}
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
        productTypeId: null,
        products: editData as unknown as Products[],
        isSerial: editData[0].isSerial,
        productUom: {
          clientUomId: null,
          stockToClientFactor: 1,
          stockUomId: null,
          supplierToStockFactor: 1,
          supplierUomId: null,
        },
        currencyId: null,
        supplierId: editData[0].supplierId,
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
      <Form onFinish={formik.handleSubmit} layout="vertical" className="!mt-3">
        <Row gutter={10}>
          <Col
            span={24}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            className="relative"
          >
            <SelectCustom
              path={selectListEndpoints.producTypeSelectList}
              label="Mahsulot turi"
              search
              formik={formik}
              fieldName="productTypeId"
            />

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
          <Col span={24} sm={{ span: 12 }} md={{ span: 12 }}>
            <SelectCustom
              fieldName="currencyId"
              label="Valyuta turi"
              path={selectListEndpoints.currencySelectList}
              formik={formik}
            />
          </Col>
          {/* {!formik.values.isSerial && (
            <> */}
          <Col span={24} sm={{ span: 12 }} md={{ span: 12 }}>
            <SelectCustom
              label="Xariddagi birlik "
              path={selectListEndpoints.uomSelectList}
              search
              formik={formik}
              fieldName="productUom.supplierUomId"
            />
          </Col>
          <Col span={24} sm={{ span: 12 }} md={{ span: 12 }}>
            <SelectCustom
              label="Ombordagi birlik "
              path={selectListEndpoints.uomSelectList}
              search
              formik={formik}
              fieldName="productUom.stockUomId"
            />
          </Col>
          <Col span={24} sm={{ span: 12 }} md={{ span: 12 }}>
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
          <Col span={24} sm={{ span: 12 }} md={{ span: 12 }}>
            <SelectCustom
              label="Yetkazib beruvchi"
              path={selectListEndpoints.supplierSelectList}
              formik={formik}
              fieldName="supplierId"
              search
              getFieldName="supplier"
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
              className="w-full !py-4"
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
