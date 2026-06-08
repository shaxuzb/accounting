import { Formik, Form } from "formik";
import { Button, Card } from "antd";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import FormInput from "@/components/fields/FormInput";
import { roleSchema } from "../../types/settings";
import type { RoleForm } from "../../types/settings";
import { useCreateRole } from "../../hooks/role/useCreateRole";

export default function RoleAddPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateRole();

  const initialValues: RoleForm = { name: "" };

  return (
    <Card title="Add Role" className="max-w-lg">
      <Formik
        initialValues={initialValues}
        validationSchema={roleSchema}
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
