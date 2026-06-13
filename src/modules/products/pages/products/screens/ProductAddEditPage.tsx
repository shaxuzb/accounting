import { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spin } from "antd";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { productTypeSchema } from "../types/schema";
import type { ProductTypeForm } from "../types/type";
import {
  useCreateProduct,
  useGetDetailProduct,
  useUpdateProduct,
} from "../hooks";
import ProductItemsTable from "../components/ProductItemsTable";
import { changeSelectListType } from "@/store/features/organizationSlice";
import { useAppDispatch } from "@/store/hooks";

const getInitialValues = (isEdit: boolean): ProductTypeForm => ({
  name: "",
  // stateId: 1,
  products: [],
  ...(isEdit ? { id: null, stateId: null } : {}),
});

export default function ProductAddEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const { data, isLoading } = useGetDetailProduct(id);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const dispatch = useAppDispatch();

  const formik = useFormik<ProductTypeForm>({
    initialValues: getInitialValues(isEdit),
    validationSchema: productTypeSchema(isEdit),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, payload: values });
        toast.success(t("products.messages.updated"));
      } else {
        await createMutation.mutateAsync(values);
        toast.success(t("products.messages.created"));
      }
      navigate(-1);
    },
  });

  useEffect(() => {
    if (!data) return;
    formik.setValues({
      id: data.id,
      name: data.name ?? "",
      // description: data.description ?? "",
      // supplierId: data.supplierId ?? null,
      stateId: data.stateId ?? null,
      products: (data.products ?? []).map((item, index) => ({
        ...item,
        idIndex: item.idIndex ?? item.id ?? index + 1,
        // productUom: {
        //   supplierUomId: item.productUom?.supplierUomId ?? null,
        //   stockUomId: item.productUom?.stockUomId ?? null,
        //   clientUomId: item.productUom?.clientUomId ?? null,
        //   supplierToStockFactor: item.productUom?.supplierToStockFactor ?? 1,
        //   stockToClientFactor: item.productUom?.stockToClientFactor ?? 1,
        // },
        // characteristics: item.characteristics ?? [],
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  useEffect(() => {
    dispatch(changeSelectListType("disabled"));
    return () => {
      dispatch(changeSelectListType("selectable"));
    };
  }, []);

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <Card className="mb-3 border border-border p-4">
        <Row gutter={12}>
          <Col span={24} md={8}>
            <InputText
              label="products.fields.name"
              formik={formik}
              fieldName="name"
            />
          </Col>
          {/* <Col span={24} md={8}>
            <InputText
              label="products.fields.description"
              formik={formik}
              fieldName="description"
            />
          </Col>
          <Col span={24} md={8}>
            <SelectCustom
              label="products.fields.supplier"
              path={selectListEndpoints.counterpartiesSelectList}
              formik={formik}
              fieldName="supplierId"
            />
          </Col> */}
          {isEdit && (
            <Col span={24} md={8}>
              <SelectCustom
                label="products.fields.status"
                path={selectListEndpoints.statesSelectList}
                formik={formik}
                fieldName="stateId"
              />
            </Col>
          )}
        </Row>
      </Card>

      <Card className="border border-border p-4">
        <div className="mb-3 flex justify-end">
          <Button type="default" onClick={() => setProductModalOpen(true)}>
            {t("products.actions.addProduct")}
          </Button>
        </div>
        <ProductItemsTable
          formik={formik}
          open={productModalOpen}
          setOpen={setProductModalOpen}
        />
      </Card>

      <div className="mt-4 flex justify-end">
        <Button
          type="primary"
          htmlType="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {t("common.save")}
        </Button>
      </div>
    </Form>
  );
}
