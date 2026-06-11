import { Formik, Form } from "formik";
import { Button, Card } from "antd";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import FormInput from "@/components/fields/FormInput";
import { useCreateProducts } from "../../hooks/useCreateProducts";
import { productsSchema } from "../../types/products";
import type { ProductsForm } from "../../types/products";

export default function ProductsAddPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateProducts();

  const initialValues: ProductsForm = { name: "" };

  return (
    <Card title="Add Products" className="max-w-lg">
      <Formik
        initialValues={initialValues}
        validationSchema={productsSchema}
        onSubmit={async (values) => {
          await mutateAsync(values);
          toast.success(t("common.created", "Created"));
          navigate("..");
        }}
      >
        <Form className="space-y-4">
          <FormInput name="name" label={t("common.name", "Name")} />
          <Button type="primary" htmlType="submit" loading={isPending}>
            {t("common.save", "Save")}
          </Button>
        </Form>
      </Formik>
    </Card>
  );
}
