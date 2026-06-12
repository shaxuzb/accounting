import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { Button, Col, Form, Row } from "antd";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/fields/ImageUpload";
import ProductTypeTable from "@/modules/warehouses/components/ProductTypeTable";
import Card from "@/components/ui/card/Card";
import { productTypeSchema } from "@/utils/validations/warehouses";
import { useUpdateProductTypes } from "@/modules/warehouses/hooks/useUpdateProductTypes";
import { useCreateProductTypes } from "@/modules/warehouses/hooks/useCreateProductTypes";
import { useGetDetailProductTypes } from "@/modules/warehouses/hooks/useGetDetailProductTypes";
import { ProductTypeInitialValues } from "@/modules/warehouses/types/initialValues";
import { selectListEndpoints } from "@/shared/constants";
import { productTypeKeys } from "@/modules/warehouses/constants/queryKeys";
import { productTypeEndpoint } from "@/modules/warehouses/constants/endpoints";
import SupplierAddEdit from "@/modules/settings/features/settings/supplier/addedit";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useChangeSelectType } from "@/hooks/useChangeSelectType ";

const ProductAddEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;
  const updateMutation = useUpdateProductTypes(Number(params.id));
  const createMutation = useCreateProductTypes();
  const mutation = isEdit ? updateMutation : createMutation;
  const [openSupplier, setOpenSupplier] = useState(false);
  const [productAddModal, setProductAddModal] = useState<boolean>(false);
  const {
    data: getData,
    isSuccess,
    refetch,
  } = useGetDetailProductTypes(Number(params.id));

  const formik = useFormik<ProductTypeInitialValues>({
    initialValues: {
      name: "",
      description: "",
      supplierId: null,
      products: [],
      ...(params.id && { stateId: null, id: null }),
    },
    validationSchema: productTypeSchema(!!params.id),
    onSubmit: async (values) => {
      mutation.mutate(values, {
        onSuccess: () => {
          formik.resetForm();
          navigate(-1);
          refetch();
        },
      });
    },
  });
  useChangeSelectType("disabled");
  useUnsavedChangesGuard(formik.dirty);

  useEffect(() => {
    if (isSuccess) {
      if (getData) {
        const values = {
          name: getData.name,
          products: (getData.products?.map((item) => ({
            ...item,
            idIndex: item.id,
          })) ?? []) as unknown as ProductTypeInitialValues["products"],
          supplierId: getData.supplierId,
          description: getData.description,
          id: getData.id,
          stateId: getData.stateId,
        };

        formik.resetForm({
          values,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, getData]);
  return (
    <div>
      <Card className="p-3">
        {/* <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {params.id ? t("Mahsulotni o'zgartrish") : t("Mahsulotni yaratish")}
          </h2>
        </div> */}
        <div>
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <div className="flex items-start gap-6">
              {isEdit && (
                <ImageUpload
                  queryKey={productTypeKeys.GET_IMAGES}
                  url={productTypeEndpoint.GET_IMAGES(Number(params.id))}
                  marginBottom="!m-0"
                  type="square"
                />
              )}
              <Row gutter={12}>
                <Col span={24} md={{ span: 12 }} sm={{ span: 24 }}>
                  <InputText
                    label="Nomi"
                    fieldName="name"
                    formik={formik}
                    marginBottom="!mb-0"
                  />
                </Col>
                <Col span={24} md={{ span: 12 }} sm={{ span: 24 }}>
                  <InputText
                    label="Ma'lumot"
                    fieldName="description"
                    formik={formik}
                  />
                </Col>
                {/* <Col span={24} md={{ span: 8 }} sm={{ span: 24 }}>
                  <SelectCustom
                    path={selectListEndpoints.supplierSelectList}
                    label="Yetkazib beruvchi"
                    fieldName="supplierId"
                    formik={formik}
                    marginBottom="!mb-0"
                    addOption={{
                      bool: true,
                      permissionCode: supplierPermission.CREATE,
                      onClick() {
                        setOpenSupplier(true);
                      },
                    }}
                  />
                </Col> */}
                {params.id && (
                  <Col span={24} md={{ span: 12 }} sm={{ span: 24 }}>
                    <SelectCustom
                      path={selectListEndpoints.stateSelectList}
                      label="Holati"
                      fieldName="stateId"
                      formik={formik}
                      marginBottom="!mb-0"
                    />
                  </Col>
                )}
              </Row>
            </div>
            <div className="flex justify-end items-center bottom-3 right-3 absolute">
              <Button
                type="primary"
                loading={formik.isSubmitting}
                htmlType="submit"
              >
                {t("Saqlash")}
              </Button>
            </div>
          </Form>
        </div>
      </Card>
      <Card className="mt-2 p-3">
        <div className="flex justify-between items-center">
          {/* <h2 className="text-lg font-semibold">
            {t("Mahsulot turini qo'shish")}
          </h2> */}
          <div className="h-full flex justify-end items-center">
            <Button
              type="default"
              htmlType="button"
              disabled={formik.values.supplierId === null}
              onClick={() => setProductAddModal(!productAddModal)}
            >
              {t("Mahsulot yaratish")}
            </Button>
          </div>
        </div>
        <ProductTypeTable
          formik={formik}
          fieldName="products"
          openEditModal={productAddModal}
          setOpenEditModal={setProductAddModal}
          tableData={formik.values.products}
          refetch={refetch}
        />
      </Card>
      <SupplierAddEdit
        open={openSupplier}
        setOpen={setOpenSupplier}
        edit={null}
      />
    </div>
  );
};

export default ProductAddEdit;
