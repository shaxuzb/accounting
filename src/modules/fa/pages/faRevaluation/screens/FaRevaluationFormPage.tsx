import { Button, Col, Form, Row, Spin, Typography, Space } from "antd";
import { useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import dayjs from "@/config/dayjs";
import InputText from "@/components/fields/InputText";
import SelectDate from "@/components/fields/SelectDate";
import SelectCustom from "@/components/fields/SelectCustom";
import InputNumber from "@/components/fields/InputNumber";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { faRevaluationSchema } from "../types/schema";
import type { FaRevaluationFormValues } from "../types/form";
import {
  useCancelFaRevaluation,
  useConfirmFaRevaluation,
  useCreateFaRevaluation,
  useGetDetailFaRevaluation,
  useUpdateFaRevaluation,
} from "../hooks";
import { faRevaluationPermissions } from "../constants/permissions";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";

const { Text } = Typography;

const defaultValues: FaRevaluationFormValues = {
  revaluationDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  reason: "",
  stateId: faDocumentStatusIds.draft,
  revaluationReserveAccountId: null,
  revaluationLossAccountId: null,
  lines: [
    {
      faAssetId: null,
      newValue: 0,
      note: "",
      assetAccountId: null,
      accumulatedDepreciationAccountId: null,
    }
  ]
};

export default function FaRevaluationFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;

  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canCreate = permissions.includes(faRevaluationPermissions.create);
  const canUpdate = permissions.includes(faRevaluationPermissions.update);
  const canConfirm = permissions.includes(faRevaluationPermissions.confirm);
  const canCancel = permissions.includes(faRevaluationPermissions.cancel);

  const detailQuery = useGetDetailFaRevaluation(id);
  const createMutation = useCreateFaRevaluation();
  const updateMutation = useUpdateFaRevaluation();
  const confirmMutation = useConfirmFaRevaluation(id);
  const cancelMutation = useCancelFaRevaluation(id);

  const record = detailQuery.data;
  const statusId =
    record?.statusId ?? record?.stateId ?? faDocumentStatusIds.draft;
  const isDraft = isCreate || statusId === faDocumentStatusIds.draft;
  const canSubmit = isCreate ? canCreate : isDraft && canUpdate;

  const initialValues = useMemo<FaRevaluationFormValues>(
    () => ({
      revaluationDate:
        record?.revaluationDate ?? defaultValues.revaluationDate,
      reason: record?.reason ?? "",
      stateId: record?.stateId ?? defaultValues.stateId,
      revaluationReserveAccountId:
        record?.revaluationReserveAccountId ?? null,
      revaluationLossAccountId: record?.revaluationLossAccountId ?? null,
      lines: record?.lines?.length
        ? record.lines.map((line) => ({
            faAssetId: line.faAssetId,
            newValue: line.newValue ?? 0,
            note: line.note ?? "",
            assetAccountId: line.assetAccountId ?? null,
            accumulatedDepreciationAccountId:
              line.accumulatedDepreciationAccountId ?? null,
          }))
        : defaultValues.lines,
    }),
    [record],
  );

  const formik = useFormik<FaRevaluationFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faRevaluationSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        if (!isCreate && id) {
          await updateMutation.mutateAsync({ id, payload: values });
          helpers.resetForm({ values });
          toast.success(t("settings.messages.updated"));
        } else {
          const created = await createMutation.mutateAsync(values);
          toast.success(t("settings.messages.created"));
          navigate(`/main/fa/revaluations/edit/${created.id}`, {
            replace: true,
          });
          return;
        }

      } catch (err: unknown) {
        errorHandlers(err);
        throw err;
      }
    },
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      toast.error(t("common.requiredFields"));
      return false;
    }

    try {
      await formik.submitForm();
      return true;
    } catch {
      return false;
    }
  };

  const ensureSavedBeforeAction = () =>
    formik.dirty ? saveDraft() : Promise.resolve(true);

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending ||
    detailQuery.isLoading;

  const handleAddLine = () => {
    const newLines = [
      ...formik.values.lines,
      {
        faAssetId: null,
        newValue: 0,
        note: "",
        assetAccountId: null,
        accumulatedDepreciationAccountId: null,
      },
    ];
    formik.setFieldValue("lines", newLines);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = formik.values.lines.filter((_, i) => i !== index);
    formik.setFieldValue("lines", newLines);
  };

  return (
    <div className="w-full">
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Space direction="vertical" size="large" className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/main/fa/revaluations">
                <Button icon={<ArrowLeft className="size-4" />} />
              </Link>
              <Text className="text-xl font-semibold">
                {isCreate ? t("fa.form.create") : t("fa.form.edit")}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              {!isCreate && (
                <ProcessStatusBadge
                  statusId={record?.statusId ?? record?.stateId}
                  statusName={record?.statusName ?? record?.stateName}
                />
              )}
            </div>
          </div>

          <Spin spinning={detailQuery.isLoading && !isCreate}>
            <Row gutter={24}>
              <Col span={16}>
                <Space direction="vertical" size="large" className="w-full">
                  <Card className="border border-border p-6 shadow-sm">
                    <div className="mb-4 text-lg font-medium">
                      {t("fa.form.revaluationDetails")}
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <SelectDate
                          formik={formik}
                          fieldName="revaluationDate"
                          label="fa.fields.revaluationDate"
                          disabled={!isDraft}
                        />
                      </Col>
                      <Col span={24}>
                        <InputText
                          formik={formik}
                          fieldName="reason"
                          label="fa.fields.reason"
                          disabled={!isDraft}
                        />
                      </Col>
                      <Col span={12}>
                        <SelectCustom
                          path={selectListEndpoints.chartAccountsSelectList}
                          displayConfig={chartAccountSelectDisplayConfig}
                          formik={formik}
                          fieldName="revaluationReserveAccountId"
                          label="fa.fields.revaluationReserveAccount"
                          disabled={!isDraft}
                          search
                          required
                        />
                      </Col>
                      <Col span={12}>
                        <SelectCustom
                          path={selectListEndpoints.chartAccountsSelectList}
                          displayConfig={chartAccountSelectDisplayConfig}
                          formik={formik}
                          fieldName="revaluationLossAccountId"
                          label="fa.fields.revaluationLossAccount"
                          disabled={!isDraft}
                          search
                          required
                        />
                      </Col>
                    </Row>
                  </Card>

                  <Card className="border border-border p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-lg font-medium">
                        {t("fa.form.assets")}
                      </div>
                      {isDraft && (
                        <Button
                          type="dashed"
                          onClick={handleAddLine}
                          icon={<Plus className="size-4" />}
                        >
                          {t("common.add")}
                        </Button>
                      )}
                    </div>
                    
                    {formik.values.lines.map((_, lineIndex) => (
                      <div
                        key={`line-${lineIndex}`}
                        className="mb-4 rounded-lg border border-border p-4 bg-gray-50/50 relative group"
                      >
                        {isDraft && formik.values.lines.length > 1 && (
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="text"
                              danger
                              icon={<Trash2 className="size-4" />}
                              onClick={() => handleRemoveLine(lineIndex)}
                            />
                          </div>
                        )}
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <SelectCustom
                              path={selectListEndpoints.faAssetsSelectList}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].faAssetId`}
                              label="fa.fields.faAssetId"
                              disabled={!isDraft}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              formik={formik}
                              fieldName={`lines[${lineIndex}].newValue`}
                              label="fa.fields.newValue"
                              disabled={!isDraft}
                            />
                          </Col>
                          <Col span={8}>
                            <InputText
                              formik={formik}
                              fieldName={`lines[${lineIndex}].note`}
                              label="fa.fields.note"
                              disabled={!isDraft}
                            />
                          </Col>
                          <Col span={12}>
                            <SelectCustom
                              path={selectListEndpoints.chartAccountsSelectList}
                              displayConfig={chartAccountSelectDisplayConfig}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assetAccountId`}
                              label="fa.fields.assetAccount"
                              disabled={!isDraft}
                              search
                              required
                            />
                          </Col>
                          <Col span={12}>
                            <SelectCustom
                              path={selectListEndpoints.chartAccountsSelectList}
                              displayConfig={chartAccountSelectDisplayConfig}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].accumulatedDepreciationAccountId`}
                              label="fa.fields.accumulatedDepreciationAccount"
                              disabled={!isDraft}
                              search
                              required
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                    {typeof formik.errors.lines === "string" && (
                      <div className="text-sm text-error">
                        {formik.errors.lines}
                      </div>
                    )}
                  </Card>
                </Space>
              </Col>

              
              <Col span={8}>
                <Card className="border border-border p-6 shadow-sm sticky top-6">
                  <div className="text-lg font-medium mb-4">
                    {t("fa.form.actions")}
                  </div>
                  <Space direction="vertical" className="w-full">
                    {canSubmit && isDraft && (
                      <PermissionCard permission={isCreate ? faRevaluationPermissions.create : faRevaluationPermissions.update}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={isSubmitting}
                          icon={<Save className="size-4" />}
                          className="w-full"
                          size="large"
                        >
                          {t("common.save")}
                        </Button>
                      </PermissionCard>
                    )}

                    {!isCreate && isDraft && canConfirm && (
                      <PermissionCard permission={faRevaluationPermissions.confirm}>
                        <Button
                          type="default"
                          className="w-full border-primary text-primary"
                          size="large"
                          loading={confirmMutation.isPending}
                          onClick={async () => {
                            const ready = await ensureSavedBeforeAction();
                            if (!ready) return;

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

                    {!isCreate && isDraft && canCancel && (
                      <PermissionCard permission={faRevaluationPermissions.cancel}>
                        <Button
                          danger
                          className="w-full"
                          size="large"
                          loading={cancelMutation.isPending}
                          onClick={async () => {
                            const ready = await ensureSavedBeforeAction();
                            if (!ready) return;

                            try {
                              await cancelMutation.mutateAsync();
                              toast.success(t("common.cancel"));
                              navigate("/main/fa/revaluations");
                            } catch (error) {
                              errorHandlers(error);
                            }
                          }}
                        >
                          {t("actions.cancel")}
                        </Button>
                      </PermissionCard>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Spin>
        </Space>
      </Form>
    </div>
  );
}
