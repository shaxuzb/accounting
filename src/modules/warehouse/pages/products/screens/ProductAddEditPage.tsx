import { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spin, Tag } from "antd";
import { useFormik } from "formik";
import { useNavigate, useParams, useSearchParams } from "react-router";
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

const getInitialValues = (
  isEdit: boolean,
  isService: boolean,
): ProductTypeForm => ({
  name: "",
  isService,
  products: [],
  ...(isEdit ? { id: null, stateId: null } : {}),
});

export default function ProductAddEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const isServiceParam = searchParams.get("isService") === "true";

  const [productModalOpen, setProductModalOpen] = useState(false);
  const { data, isLoading } = useGetDetailProduct(id, isServiceParam);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const dispatch = useAppDispatch();

  const formik = useFormik<ProductTypeForm>({
    initialValues: getInitialValues(isEdit, isServiceParam),
    validationSchema: productTypeSchema(isEdit),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, payload: values });
        toast.success(
          values.isService
            ? t("products.messages.serviceUpdated")
            : t("products.messages.updated"),
        );
      } else {
        await createMutation.mutateAsync(values);
        toast.success(
          values.isService
            ? t("products.messages.serviceCreated")
            : t("products.messages.created"),
        );
      }
      navigate(-1);
    },
  });

  useEffect(() => {
    if (!data) return;
    const items = data.products ?? [];
    const detectedIsService =
      data.isService ?? items[0]?.isService ?? isServiceParam;
    formik.setValues({
      id: data.id,
      name: data.name ?? "",
      stateId: data.stateId ?? null,
      isService: detectedIsService,
      products: items.map((item, index) => ({
        ...item,
        idIndex: item.idIndex ?? item.id ?? index + 1,
        // barcode: item.barcode ?? "",
        mxik: item.mxik ?? item.barcode ?? "",
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    dispatch(changeSelectListType("disabled"));
    return () => {
      dispatch(changeSelectListType("selectable"));
    };
  }, [dispatch]);

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
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("products.fields.groupKind")}:
          </span>
          <Tag color={formik.values.isService ? "purple" : "blue"}>
            {formik.values.isService
              ? t("products.segments.services")
              : t("products.segments.products")}
          </Tag>
        </div>
        <Row gutter={12}>
          <Col span={24} md={8}>
            <InputText
              label={
                formik.values.isService
                  ? "products.fields.serviceGroupName"
                  : "products.fields.name"
              }
              formik={formik}
              fieldName="name"
            />
          </Col>
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
            {formik.values.isService
              ? t("products.actions.addService")
              : t("products.actions.addProduct")}
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
