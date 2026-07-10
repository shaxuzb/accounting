import { Button, Col, Form, Row, Spin } from "antd";
import { useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import InputText from "@/components/fields/InputText";
import SelectDate from "@/components/fields/SelectDate";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import type { FaReceiptFormValues } from "../types/form";
import { faGenericDocumentSchema } from "../types/schema";
import { useAppSelector } from "@/store/hooks";
import {
  useCancelFaReceipt,
  useConfirmFaReceipt,
  useCreateFaReceipt,
  useGetDetailFaReceipt,
  useUpdateFaReceipt,
} from "../hooks";
import { faReceiptPermissions } from "../constants/permissions";

const defaultValues: FaReceiptFormValues = {
  documentNumber: "",
  documentDate: "",
  comment: "",
};

export default function FaReceiptFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canSubmit = isEdit
    ? permissions.includes(faReceiptPermissions.update)
    : permissions.includes(faReceiptPermissions.create);
  const submitPermission = isEdit
    ? faReceiptPermissions.update
    : faReceiptPermissions.create;
  const detailQuery = useGetDetailFaReceipt(id);
  const createMutation = useCreateFaReceipt();
  const updateMutation = useUpdateFaReceipt();
  const confirmMutation = useConfirmFaReceipt(id);
  const cancelMutation = useCancelFaReceipt(id);

  const formik = useFormik<FaReceiptFormValues>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: faGenericDocumentSchema,
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && id) {
          await updateMutation.mutateAsync({
            id,
            payload: {
              documentNumber: values.documentNumber,
              documentDate: values.documentDate,
              comment: values.comment,
            },
          });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync({
            documentNumber: values.documentNumber,
            documentDate: values.documentDate,
            comment: values.comment,
          });
          toast.success(t("settings.messages.created"));
        }

        helpers.resetForm();
        navigate("/main/fa/receipts");
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (!detailQuery.data) return;
    formik.setValues({
      documentNumber: detailQuery.data.documentNumber ?? "",
      documentDate: detailQuery.data.documentDate ?? "",
      comment: detailQuery.data.comment ?? "",
    });
  }, [detailQuery.data]);

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    detailQuery.isLoading;

  return (
    <Card className="border border-border p-4">
      <div className="mb-4 text-xl font-semibold">
        {isEdit ? t("fa.form.edit") : t("fa.form.create")}
      </div>
      <Spin spinning={detailQuery.isLoading && isEdit}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[20, 8]}>
            <Col span={8}>
              <InputText
                formik={formik}
                fieldName="documentNumber"
                label="fa.fields.documentNumber"
              />
            </Col>
            <Col span={8}>
              <SelectDate
                formik={formik}
                fieldName="documentDate"
                label="fa.fields.documentDate"
              />
            </Col>
            <Col span={24}>
              <InputText
                formik={formik}
                fieldName="comment"
                label="fa.fields.comment"
              />
            </Col>
          </Row>
          <div className="mt-4 flex flex-wrap gap-3">
            {canSubmit && (
              <PermissionCard permission={submitPermission}>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {t("common.submit")}
                </Button>
              </PermissionCard>
            )}
              
            {isEdit && permissions.includes(faReceiptPermissions.confirm) && (
              <PermissionCard permission={faReceiptPermissions.confirm}>
                <Button
                  htmlType="button"
                  loading={confirmMutation.isPending}
                  onClick={() =>
                    void confirmMutation.mutateAsync().then(() => {
                      navigate("/main/fa/receipts");
                    })
                  }
                >
                  {t("actions.confirm")}
                </Button>
              </PermissionCard>
            )}
            {isEdit && permissions.includes(faReceiptPermissions.cancel) && (
              <PermissionCard permission={faReceiptPermissions.cancel}>
                <Button
                  htmlType="button"
                  danger
                  loading={cancelMutation.isPending}
                  onClick={() =>
                    void cancelMutation.mutateAsync().then(() => {
                      navigate("/main/fa/receipts");
                    })
                  }
                >
                  {t("common.cancel")}
                </Button>
              </PermissionCard>
            )}
          </div>
        </Form>
      </Spin>
    </Card>
  );
}
