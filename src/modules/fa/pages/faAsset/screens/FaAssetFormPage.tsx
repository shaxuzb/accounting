import { Alert, Button, Form, Spin } from "antd";
import { useMemo } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Save, X } from "lucide-react";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import Card from "@/components/ui/card/Card";
import FaAssetFormFields from "../components/FaAssetFormFields";
import FaAssetReadonlyView from "../components/FaAssetReadonlyView";
import { useGetDetailFaAsset, useUpdateFaAsset } from "../hooks";
import type { FaAssetFormValues, FaAssetUpdatePayload } from "../types/form";
import { faAssetSchema } from "../types/schema";

const defaults: FaAssetFormValues = {
  inventoryNumber: "",
  name: "",
  faGroupId: null,
  okofId: null,
};

export default function FaAssetFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id = "" } = useParams();
  const isEdit = location.pathname.includes("/edit/");
  const detailQuery = useGetDetailFaAsset(id);
  const updateMutation = useUpdateFaAsset();
  const record = detailQuery.data;

  const initialValues = useMemo<FaAssetFormValues>(
    () => ({
      inventoryNumber: record?.inventoryNumber ?? defaults.inventoryNumber,
      name: record?.name ?? defaults.name,
      faGroupId: record?.faGroupId ?? defaults.faGroupId,
      okofId: record?.okofId ?? defaults.okofId,
    }),
    [record],
  );

  const formik = useFormik<FaAssetFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faAssetSchema(t),
    onSubmit: async (values) => {
      const payload: FaAssetUpdatePayload = {
        inventoryNumber: values.inventoryNumber.trim(),
        name: values.name.trim(),
        faGroupId: Number(values.faGroupId),
        okofId: Number(values.okofId),
      };
      try {
        await updateMutation.mutateAsync({ id, payload });
        toast.success(t("settings.messages.updated"));
        navigate("/main/fa/assets");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  if (detailQuery.isLoading) return <div className="flex justify-center p-10"><Spin /></div>;
  if (detailQuery.isError || !record) return <Alert type="error" showIcon message={t("error.title")} description={t("error.subtitle")} />;
  if (!isEdit) return <FaAssetReadonlyView record={record} />;

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <FaAssetFormFields formik={formik} />
      <Card className="sticky bottom-0 z-20 mt-4 border border-border bg-primary-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex justify-end gap-3">
          <Button icon={<X className="size-4" />} onClick={() => navigate("/main/fa/assets")}>{t("common.cancel")}</Button>
          <Button type="primary" htmlType="submit" icon={<Save className="size-4" />} loading={updateMutation.isPending}>{t("common.save")}</Button>
        </div>
      </Card>
    </Form>
  );
}
