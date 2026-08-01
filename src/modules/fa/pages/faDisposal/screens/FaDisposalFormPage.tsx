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
import InputNumber from "@/components/fields/InputNumber";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";

import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";

import { faDisposalSchema } from "../types/schema";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { FaDisposalFormValues } from "../types/form";
import {
  useCancelFaDisposal,
  useConfirmFaDisposal,
  useCreateFaDisposal,
  useGetDetailFaDisposal,
  useUpdateFaDisposal,
} from "../hooks";
import { faDisposalPermissions } from "../constants/permissions";

const { Text } = Typography;

const defaultValues: FaDisposalFormValues = {
  disposalDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  disposalType: "",
  reason: "",
  stateId: 0,
  disposalAccountId: null,
  customerAccountId: null,
  vatAccountId: null,
  gainAccountId: null,
  lossAccountId: null,
  lines: [
    {
      faAssetId: null as unknown as number,
      saleAmount: 0,
      note: "",
      assetAccountId: null,
      accumulatedDepreciationAccountId: null,
    },
  ],
};

export default function FaDisposalFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canView =
    permissions.includes(faDisposalPermissions.view) ||
    permissions.includes(faDisposalPermissions.detail);
  const canCreate = permissions.includes(faDisposalPermissions.create);
  const canUpdate = permissions.includes(faDisposalPermissions.update);
  const canSubmit = isCreate ? canCreate : canUpdate;

  const detailQuery = useGetDetailFaDisposal(id);
  const createMutation = useCreateFaDisposal();
  const updateMutation = useUpdateFaDisposal();
  const confirmMutation = useConfirmFaDisposal(id);
  const cancelMutation = useCancelFaDisposal(id);

  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || statusId === 1;

  const initialValues = useMemo<FaDisposalFormValues>(
    () => ({
      disposalDate: record?.disposalDate ?? defaultValues.disposalDate,
      disposalType: record?.disposalType ?? "",
      reason: record?.reason ?? "",
      stateId: record?.stateId ?? defaultValues.stateId,
      disposalAccountId:
        record?.disposalAccountId ?? defaultValues.disposalAccountId,
      customerAccountId:
        record?.customerAccountId ?? defaultValues.customerAccountId,
      vatAccountId: record?.vatAccountId ?? defaultValues.vatAccountId,
      gainAccountId: record?.gainAccountId ?? defaultValues.gainAccountId,
      lossAccountId: record?.lossAccountId ?? defaultValues.lossAccountId,
      lines: record?.lines?.length ? record.lines : defaultValues.lines,
    }),
    [record],
  );

  const formik = useFormik<FaDisposalFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faDisposalSchema(t),
    onSubmit: async (values) => {
      try {
        const payload = {
          disposalDate: values.disposalDate,
          disposalType: values.disposalType,
          reason: values.reason,
          stateId: values.stateId,
          disposalAccountId: Number(values.disposalAccountId),
          customerAccountId: Number(values.customerAccountId),
          vatAccountId: Number(values.vatAccountId),
          gainAccountId: Number(values.gainAccountId),
          lossAccountId: Number(values.lossAccountId),
          lines: values.lines.map((line) => ({
            ...line,
            faAssetId: Number(line.faAssetId),
            saleAmount: Number(line.saleAmount),
            assetAccountId: Number(line.assetAccountId),
            accumulatedDepreciationAccountId: Number(
              line.accumulatedDepreciationAccountId,
            ),
          })),
        };

        if (!isCreate && id) {
          await updateMutation.mutateAsync({ id, payload });
          toast.success(t("settings.messages.updated"));
          navigate(`/main/fa/disposals/edit/${id}`, { replace: true });
        } else {
          const created = await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
          navigate(`/main/fa/disposals/edit/${created.id}`, { replace: true });
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

  const totalSaleAmount = formik.values.lines.reduce((sum, line) => sum + Number(line.saleAmount || 0), 0);

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
              {t("app.routes.faDisposals")}
            </div>
            <div className="text-lg font-semibold">
              {isCreate ? t("fa.form.create") : `${t("fa.form.edit")} №${record?.id ?? id}`}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">{t("fa.fields.disposalDate")}</span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(record?.disposalDate ?? defaultValues.disposalDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isCreate && (
              <ProcessStatusBadge
                statusId={record?.statusId}
                statusName={record?.statusName}
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
                    fieldName="disposalDate"
                    label="fa.fields.disposalDate"
                  />
                </Col>
                <Col span={8}>
                  <InputText
                    formik={formik}
                    fieldName="disposalType"
                    label="fa.fields.disposalType"
                  />
                </Col>
                <Col span={8}>
                  <InputText
                    formik={formik}
                    fieldName="reason"
                    label="fa.fields.reason"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="disposalAccountId"
                    label="fa.fields.disposalAccount"
                    search
                    required
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="customerAccountId"
                    label="fa.fields.customerAccount"
                    search
                    required
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="vatAccountId"
                    label="fa.fields.vatAccount"
                    search
                    required
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="gainAccountId"
                    label="fa.fields.gainAccount"
                    search
                    required
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="lossAccountId"
                    label="fa.fields.lossAccount"
                    search
                    required
                  />
                </Col>
              </Row>

              <Divider className="my-4" />
              
              <div className="mb-4 flex justify-between items-center">
                <Text strong className="text-lg">
                  {t("fa.sections.disposalDetails")}
                </Text>
                {isDraft && (
                  <Button
                    type="dashed"
                    icon={<Plus className="size-4" />}
                    onClick={handleAddLine}
                  >
                    {t("common.add")}</Button>
                )}
              </div>

              {formik.values.lines.map((_, lineIndex) => (
                <AntdCard
                  key={`line-${lineIndex}`}
                  size="small"
                  className="mb-4 bg-gray-50/50 border border-border shadow-sm"
                  title={
                    <div className="flex justify-between items-center mb-1">
                      <Text strong>{t("fa.sections.lineNumber", { number: lineIndex + 1 })}</Text>
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
                      <InputNumber
                        formik={formik}
                        fieldName={`lines[${lineIndex}].saleAmount`}
                        label="fa.fields.saleAmount"
                      />
                    </Col>
                    <Col span={8}>
                      <InputText
                        formik={formik}
                        fieldName={`lines[${lineIndex}].note`}
                        label="fa.fields.note"
                      />
                    </Col>
                    <Col span={12}>
                      <SelectCustom
                        path={selectListEndpoints.chartAccountsSelectList}
                        displayConfig={chartAccountSelectDisplayConfig}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].assetAccountId`}
                        label="fa.fields.assetAccount"
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
                        search
                        required
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
                          navigate("/main/fa/disposals", { replace: true });
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
                          navigate("/main/fa/disposals", { replace: true });
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
          
          <Card className="p-4 bg-gray-50/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">{t("fa.sections.totalSaleAmount")}:</span>
              <span className="font-bold text-lg">{numberSpacing(totalSaleAmount)}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
