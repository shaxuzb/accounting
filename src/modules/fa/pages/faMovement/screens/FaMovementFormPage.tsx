import { Button, Form, Spin, Divider, Row, Col, Typography, Card as AntdCard } from "antd";
import { useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { Calendar, CheckCircle2, CircleX, Delete, Plus, Save } from "lucide-react";

import InputText from "@/components/fields/InputText";
import SelectDate from "@/components/fields/SelectDate";
import SelectCustom from "@/components/fields/SelectCustom";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { selectListEndpoints } from "@/shared/constants/selectLists";

import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate } from "@/utils/utils";

import { faMovementSchema } from "../types/schema";
import type { FaMovementFormValues } from "../types/form";
import {
  useCancelFaMovement,
  useConfirmFaMovement,
  useCreateFaMovement,
  useGetDetailFaMovement,
  useUpdateFaMovement,
} from "../hooks";
import { faMovementPermissions } from "../constants/permissions";

const { Text } = Typography;

const defaultValues: FaMovementFormValues = {
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  toDepartmentId: null as unknown as number,
  toResponsibleUserId: null as unknown as number,
  note: "",
  lines: [
    {
      faAssetId: null as unknown as number,
      note: "",
    },
  ],
};

export default function FaMovementFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canView =
    permissions.includes(faMovementPermissions.view) ||
    permissions.includes(faMovementPermissions.detail);
  const canCreate = permissions.includes(faMovementPermissions.create);
  const canUpdate = permissions.includes(faMovementPermissions.update);
  const canSubmit = isCreate ? canCreate : canUpdate;

  const detailQuery = useGetDetailFaMovement(id);
  const createMutation = useCreateFaMovement();
  const updateMutation = useUpdateFaMovement();
  const confirmMutation = useConfirmFaMovement(id);
  const cancelMutation = useCancelFaMovement(id);

  const record = detailQuery.data;
  const statusId = record?.stateId ?? 1;
  const isDraft = isCreate || statusId === 1;

  const initialValues = useMemo<FaMovementFormValues>(
    () => ({
      docDate: record?.docDate ?? defaultValues.docDate,
      toDepartmentId: record?.toDepartmentId ?? defaultValues.toDepartmentId,
      toResponsibleUserId: record?.toResponsibleUserId ?? defaultValues.toResponsibleUserId,
      note: record?.note ?? "",
      lines: record?.lines?.length ? record.lines : defaultValues.lines,
    }),
    [record],
  );

  const formik = useFormik<FaMovementFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faMovementSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          docDate: values.docDate,
          toDepartmentId: Number(values.toDepartmentId),
          toResponsibleUserId: Number(values.toResponsibleUserId),
          note: values.note,
          stateId: record?.stateId ?? 1,
          lines: values.lines.map((line) => ({
            ...line,
            faAssetId: Number(line.faAssetId),
          })),
        };

        if (!isCreate && id) {
          await updateMutation.mutateAsync({ id, payload });
          toast.success(t("settings.messages.updated"));
          navigate(`/main/fa/movements/edit/${id}`, { replace: true });
        } else {
          const created = await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
          navigate(`/main/fa/movements/edit/${created.id}`, { replace: true });
        }
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      toast.error(t("common.requiredFields"));
      return false;
    }
    await formik.submitForm();
    return true;
  };

  const ensureSavedBeforeAction = async () => {
    if (!formik.dirty) return true;
    return saveDraft();
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

  const handleAddLine = () => {
    const newLines = [...formik.values.lines, { ...defaultValues.lines[0] }];
    formik.setFieldValue("lines", newLines);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = formik.values.lines.filter((_, i) => i !== index);
    formik.setFieldValue("lines", newLines);
  };

  if (!canView) {
    return null;
  }

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">
              {t("app.routes.faMovements")}
            </div>
            <div className="text-lg font-semibold">
              {isCreate ? t("fa.form.create") : `${t("fa.form.edit")} №${record?.id ?? id}`}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">{t("fa.fields.docDate")}</span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(record?.docDate ?? defaultValues.docDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isCreate && (
              <ProcessStatusBadge
                statusId={record?.stateId}
                statusName={record?.stateName}
              />
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_0.9fr]">
        <Card className="p-4">
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <fieldset disabled={!isDraft} className="group">
              <Row gutter={[20, 8]}>
                <Col span={8}>
                  <SelectDate
                    formik={formik}
                    fieldName="docDate"
                    label="fa.fields.docDate"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.departmentsSelectList}
                    formik={formik}
                    fieldName="toDepartmentId"
                    label="fa.fields.toDepartmentId"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.usersSelectList}
                    formik={formik}
                    fieldName="toResponsibleUserId"
                    label="fa.fields.toResponsibleUserId"
                  />
                </Col>
                <Col span={8}>
                  <InputText
                    formik={formik}
                    fieldName="note"
                    label="fa.fields.note"
                  />
                </Col>
              </Row>

              <Divider className="my-4" />
              
              <div className="mb-4 flex justify-between items-center">
                <Text strong className="text-lg">
                  O'tkazish detallari
                </Text>
                {isDraft && (
                  <Button
                    type="dashed"
                    icon={<Plus className="size-4" />}
                    onClick={handleAddLine}
                  >
                    Qo'shish
                  </Button>
                )}
              </div>

              {formik.values.lines.map((_, lineIndex) => (
                <AntdCard
                  key={`line-${lineIndex}`}
                  size="small"
                  className="mb-4 bg-gray-50/50 border border-border shadow-sm"
                  title={
                    <div className="flex justify-between items-center mb-1">
                      <Text strong>Qator #{lineIndex + 1}</Text>
                      {isDraft && formik.values.lines.length > 1 && (
                        <Button
                          danger
                          size="small"
                          icon={<Delete className="size-4" />}
                          onClick={() => handleRemoveLine(lineIndex)}
                        />
                      )}
                    </div>
                  }
                >
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <SelectCustom
                        path={selectListEndpoints.faAssetsSelectList}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].faAssetId`}
                        label="fa.fields.faAssetId"
                      />
                    </Col>
                    <Col span={8}>
                      <InputText
                        formik={formik}
                        fieldName={`lines[${lineIndex}].note`}
                        label="fa.fields.note"
                      />
                    </Col>
                  </Row>
                </AntdCard>
              ))}
              
              {typeof formik.errors.lines === "string" && (
                <div className="text-red-500 text-sm mt-2">
                  {formik.errors.lines}
                </div>
              )}
            </fieldset>
          </Form>
        </Card>

        {/* Right Column - Actions */}
        <div className="flex flex-col gap-4">
          <Card className="space-y-3 p-4">
            <div className="text-sm font-semibold">{t("common.actions")}</div>
            {isDraft && canSubmit && (
              <>
                <Button
                  block
                  icon={<Save className="size-4" />}
                  onClick={() => void saveDraft()}
                  loading={isSubmitting}
                >
                  {t("common.save")}
                </Button>
                {!isCreate && (
                  <>
                    <Button
                      type="primary"
                      block
                      icon={<CheckCircle2 className="size-4" />}
                      onClick={async () => {
                        const ready = await ensureSavedBeforeAction();
                        if (!ready) return;

                        try {
                          await confirmMutation.mutateAsync();
                          toast.success(t("actions.confirmSuccess", { id: record?.id ?? id }));
                          navigate("/main/fa/movements", { replace: true });
                        } catch (error) {
                          errorHandlers(error);
                        }
                      }}
                      loading={confirmMutation.isPending}
                    >
                      {t("common.confirm")}
                    </Button>
                    <Button
                      danger
                      block
                      icon={<CircleX className="size-4" />}
                      onClick={async () => {
                        const ready = await ensureSavedBeforeAction();
                        if (!ready) return;

                        try {
                          await cancelMutation.mutateAsync();
                          toast.success(t("actions.cancelSuccess", { id: record?.id ?? id }));
                          navigate("/main/fa/movements", { replace: true });
                        } catch (error) {
                          errorHandlers(error);
                        }
                      }}
                      loading={cancelMutation.isPending}
                    >
                      {t("common.cancel")}
                    </Button>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
