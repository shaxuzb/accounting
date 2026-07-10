import { Button, Col, Form, Row, Spin } from "antd";
import { useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import InputText from "@/components/fields/InputText";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { faGenericDocumentSchema } from "../types/schema";
import type { FaRevaluationFormValues } from "../types/form";
import {
  useCancelFaRevaluation,
  useConfirmFaRevaluation,
  useCreateFaRevaluation,
  useGetDetailFaRevaluation,
  useUpdateFaRevaluation,
} from "../hooks";
import { faRevaluationPermissions } from "../constants/permissions";

const defaultValues: FaRevaluationFormValues = {
  documentNumber: "",
  documentDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  comment: "",
};

export default function FaRevaluationFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canSubmit = isEdit
    ? permissions.includes(faRevaluationPermissions.update)
    : permissions.includes(faRevaluationPermissions.create);
  const submitPermission = isEdit
    ? faRevaluationPermissions.update
    : faRevaluationPermissions.create;
  const detailQuery = useGetDetailFaRevaluation(id);
  const createMutation = useCreateFaRevaluation();
  const updateMutation = useUpdateFaRevaluation();
  const confirmMutation = useConfirmFaRevaluation(id);
  const cancelMutation = useCancelFaRevaluation(id);
  const record = detailQuery.data;
  const stateId = record?.stateId ?? 1;
  const isDraft = !isEdit || stateId === 1;

  const formik = useFormik<FaRevaluationFormValues>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: faGenericDocumentSchema,
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && id) {
          await updateMutation.mutateAsync({ id, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          const created = await createMutation.mutateAsync(values);
          toast.success(t("settings.messages.created"));
          navigate(`/main/fa/revaluations/edit/${created.id}`, {
            replace: true,
          });
          return;
        }

        helpers.resetForm();
        navigate("/main/fa/revaluations");
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (!detailQuery.data) return;
    formik.setValues({
      documentNumber: detailQuery.data.documentNumber ?? "",
      documentDate: detailQuery.data.documentDate ?? defaultValues.documentDate,
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
                disabled={!isDraft}
              />
            </Col>
            <Col span={8}>
              <SelectDate
                formik={formik}
                fieldName="documentDate"
                label="fa.fields.documentDate"
                disabled={!isDraft}
              />
            </Col>
            <Col span={24}>
              <InputText
                formik={formik}
                fieldName="comment"
                label="fa.fields.comment"
                disabled={!isDraft}
              />
            </Col>
          </Row>
          <div className="mt-4 flex flex-wrap gap-3">
            {canSubmit && (
              <PermissionCard permission={submitPermission}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={!isDraft}
                >
                  {t("common.submit")}
                </Button>
              </PermissionCard>
            )}
            {isEdit && isDraft && permissions.includes(faRevaluationPermissions.confirm) && (
              <PermissionCard permission={faRevaluationPermissions.confirm}>
                <Button
                  htmlType="button"
                  loading={confirmMutation.isPending}
                  onClick={async () => {
                    try {
                      await confirmMutation.mutateAsync();
                      toast.success(t("common.submit"));
                      navigate("/main/fa/revaluations");
                    } catch (error) {
                      errorHandlers(error);
                    }
                  }}
                >
                  {t("actions.confirm")}
                </Button>
              </PermissionCard>
            )}
            {isEdit && isDraft && permissions.includes(faRevaluationPermissions.cancel) && (
              <PermissionCard permission={faRevaluationPermissions.cancel}>
                <Button
                  htmlType="button"
                  danger
                  loading={cancelMutation.isPending}
                  onClick={async () => {
                    try {
                      await cancelMutation.mutateAsync();
                      toast.success(t("common.cancel"));
                      navigate("/main/fa/revaluations");
                    } catch (error) {
                      errorHandlers(error);
                    }
                  }}
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
