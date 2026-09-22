import { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Row, Spin, Tag, Tooltip } from "antd";
import { useFormik } from "formik";
import { useNavigate, useParams, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { productTypeSchema } from "../types/schema";
import type { ProductType, ProductTypeForm } from "../types/type";
import {
  useCreateProduct,
  useGetDetailProduct,
  useUpdateProduct,
} from "../hooks";
import ProductItemsTable from "../components/ProductItemsTable";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { changeSelectListType } from "@/store/features/organizationSlice";
import { useAppDispatch } from "@/store/hooks";

const getInitialValues = (
  isEdit: boolean,
  isService: boolean,
): ProductTypeForm => ({
  name: "",
  // Yangi guruh uchun kod payload yig'ilishida avtomatik yaratiladi.
  code: "",
  parentId: null,
  isAssignable: true,
  sortOrder: 0,
  isService,
  products: [],
  ...(isEdit ? { id: null, stateId: null } : {}),
});

const toFormValues = (
  data: ProductType,
  isServiceParam: boolean,
): ProductTypeForm => {
  const items = data.products ?? [];

  return {
    id: data.id,
    name: data.name ?? "",
    // Backend bu maydonlarni payload'dan to'g'ridan-to'g'ri yozadi, shuning
    // uchun ular o'zgarishsiz qaytarilishi kerak.
    code: data.code ?? "",
    parentId: data.parentId ?? null,
    isAssignable: data.isAssignable ?? true,
    sortOrder: data.sortOrder ?? 0,
    stateId: data.stateId ?? null,
    isService: data.isService ?? items[0]?.isService ?? isServiceParam,
    products: items.map((item, index) => ({
      ...item,
      idIndex: item.idIndex ?? item.id ?? index + 1,
      mxik: item.mxik,
    })),
  };
};

// Formik xatolari ichidagi birinchi matnni topadi (massiv va ichma-ich obyektlar ham).
const getFirstError = (errors: unknown): string | undefined => {
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) {
    for (const item of errors) {
      const found = getFirstError(item);
      if (found) return found;
    }
    return undefined;
  }
  if (errors && typeof errors === "object") {
    for (const value of Object.values(errors)) {
      const found = getFirstError(value);
      if (found) return found;
    }
  }
  return undefined;
};

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

  // initialValues hujjatdan kelib chiqadi: shunda formik.dirty haqiqiy
  // o'zgarishni ko'rsatadi va "Saqlash" tugmasini boshqarish mumkin bo'ladi.
  const initialValues = useMemo(
    () =>
      data
        ? toFormValues(data, isServiceParam)
        : getInitialValues(isEdit, isServiceParam),
    [data, isEdit, isServiceParam],
  );

  const formik = useFormik<ProductTypeForm>({
    initialValues,
    validationSchema: productTypeSchema(isEdit),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
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
      } catch (error) {
        // Formik submit xatosini yutib yuboradi — shuning uchun o'zimiz ko'rsatamiz.
        errorHandlers(error);
      }
    },
  });

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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  // Saqlanmagan o'zgarish bormi: formik values'ni initialValues bilan chuqur
  // solishtiradi, ya'ni mahsulot qo'shish/o'chirish va holat almashtirish ham kiradi.
  const hasChanges = formik.dirty;

  // Validatsiya xatosida forma jim qolmasligi, sababini ko'rsatishi kerak.
  const handleFinish = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      toast.error(getFirstError(errors) ?? t("error.unknown"));
    }
    await formik.submitForm();
  };

  return (
    <Form layout="vertical" onFinish={handleFinish}>
      <Card className="mb-3 border border-border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("products.fields.groupKind")}:
            </span>
            <Tag color={formik.values.isService ? "purple" : "blue"}>
              {formik.values.isService
                ? t("products.segments.services")
                : t("products.segments.products")}
            </Tag>
          </div>
          <Tooltip
            title={hasChanges ? undefined : t("products.actions.noChanges")}
          >
            {/* O'chirilgan tugma hover hodisalarini bermaydi, shuning uchun
                Tooltip uchun o'rovchi element kerak. */}
            <span className="inline-flex">
              <Button
                type="primary"
                htmlType="submit"
                disabled={!hasChanges}
                loading={isSubmitting}
              >
                {t("common.save")}
              </Button>
            </span>
          </Tooltip>
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
    </Form>
  );
}
