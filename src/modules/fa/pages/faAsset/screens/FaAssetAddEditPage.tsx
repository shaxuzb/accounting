import { Button, Col, Form, Row, Spin } from "antd";
import { useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { Calendar, CheckCircle2, CircleX, Save } from "lucide-react";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { customDate, numberSpacing } from "@/utils/utils";
import type { FaAssetForm } from "../types/form";
import { faAssetSchema } from "../types/schema";
import { faAssetPermissions } from "../constants/permissions";
import {
  useGetDetailFaAsset,
  useCreateFaAsset,
  useUpdateFaAsset,
  useConfirmFaAsset,
  useCancelFaAsset,
} from "../hooks";

const defaultValues: FaAssetForm = {
  inventoryNumber: "",
  name: "",
  faGroupId: null,
  okofId: null,
  depreciationMethodId: null,
  usefulLifeMonths: null,
  initialCost: null,
  salvageValue: null,
  commissioningDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  deprStartDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  plannedUnitsTotal: null,
  sourceProductTableId: null,
  departmentId: null,
  responsibleUserId: null,
};

export default function FaAssetFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const isCreate = !id;
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.user.permissions ?? [];
  const canView =
    permissions.includes(faAssetPermissions.view) ||
    permissions.includes(faAssetPermissions.detail);
  const canCreate = permissions.includes(faAssetPermissions.create);
  const canUpdate = permissions.includes(faAssetPermissions.update);
  const canSubmit = isCreate ? canCreate : canUpdate;

  const detailQuery = useGetDetailFaAsset(id);
  const createMutation = useCreateFaAsset();
  const updateMutation = useUpdateFaAsset();
  const confirmMutation = useConfirmFaAsset();
  const cancelMutation = useCancelFaAsset();
  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || statusId === 1;

  const formik = useFormik<FaAssetForm>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: faAssetSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          inventoryNumber: values.inventoryNumber.trim(),
          name: values.name.trim(),
        };

        if (!isCreate && id) {
          await updateMutation.mutateAsync({ id, payload });
          toast.success(t("settings.messages.updated"));
          navigate(`/main/fa/assets/edit/${id}`, { replace: true });
        } else {
          await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
          navigate("/main/fa/assets", { replace: true });
        }
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (record && !isCreate) {
      formik.setValues({
        inventoryNumber: record.inventoryNumber ?? "",
        name: record.name ?? "",
        faGroupId: record.faGroupId ?? null,
        okofId: record.okofId ?? null,
        depreciationMethodId: record.depreciationMethodId ?? null,
        usefulLifeMonths: record.usefulLifeMonths ?? null,
        initialCost: record.initialCost ?? null,
        salvageValue: record.salvageValue ?? null,
        commissioningDate: record.commissioningDate ?? defaultValues.commissioningDate,
        deprStartDate: record.deprStartDate ?? defaultValues.deprStartDate,
        plannedUnitsTotal: record.plannedUnitsTotal ?? null,
        sourceProductTableId: record.sourceProductTableId ?? null,
        departmentId: record.departmentId ?? null,
        responsibleUserId: record.responsibleUserId ?? null,
      });
    }
  }, [record, isCreate, formik]);

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
              {t("app.routes.faAssets")}
            </div>
            <div className="text-lg font-semibold">
              {record?.inventoryNumber ?? (isCreate ? t("fa.form.create") : t("fa.form.edit"))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">{t("fa.fields.commissioningDate")}</span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(record?.commissioningDate ?? defaultValues.commissioningDate)}
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
            <fieldset disabled={!isDraft}>
              <Row gutter={[20, 8]}>
                <Col span={12}>
                  <InputText
                    formik={formik}
                    fieldName="inventoryNumber"
                    label="fa.fields.inventoryNumber"
                  />
                </Col>
                <Col span={12}>
                  <InputText formik={formik} fieldName="name" label="fa.fields.name" />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="faGroupId"
                    label="fa.fields.faGroup"
                    path={selectListEndpoints.faGroupsSelectList}
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="okofId"
                    label="fa.fields.okof"
                    path={selectListEndpoints.okofsSelectList}
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="depreciationMethodId"
                    label="fa.fields.depreciationMethod"
                    path={selectListEndpoints.depreciationMethodsSelectList}
                  />
                </Col>
                <Col span={8}>
                  <InputNumberFormat
                    formik={formik}
                    fieldName="usefulLifeMonths"
                    label="fa.fields.usefulLifeMonths"
                    min={1}
                  />
                </Col>
                <Col span={8}>
                  <InputNumberFormat
                    formik={formik}
                    fieldName="initialCost"
                    label="fa.fields.initialCost"
                    min={0}
                  />
                </Col>
                <Col span={8}>
                  <InputNumberFormat
                    formik={formik}
                    fieldName="salvageValue"
                    label="fa.fields.salvageValue"
                    min={0}
                  />
                </Col>
                <Col span={8}>
                  <SelectDate
                    formik={formik}
                    fieldName="commissioningDate"
                    label="fa.fields.commissioningDate"
                  />
                </Col>
                <Col span={8}>
                  <SelectDate
                    formik={formik}
                    fieldName="deprStartDate"
                    label="fa.fields.deprStartDate"
                  />
                </Col>
                <Col span={8}>
                  <InputNumberFormat
                    formik={formik}
                    fieldName="plannedUnitsTotal"
                    label="fa.fields.plannedUnitsTotal"
                    min={0}
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="sourceProductTableId"
                    label="fa.fields.sourceProductTable"
                    path={selectListEndpoints.sourceProductTablesSelectList}
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="departmentId"
                    label="fa.fields.department"
                    path={selectListEndpoints.departmentsSelectList}
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="responsibleUserId"
                    label="fa.fields.responsibleUser"
                    path={selectListEndpoints.usersSelectList}
                  />
                </Col>
              </Row>
            </fieldset>
          </Form>
        </Card>

        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">{t("common.actions")}</div>
          {isDraft && canSubmit && (
            <>
              <Button
                block
                icon={<Save className="size-4" />}
                onClick={() => void saveDraft()}
                loading={createMutation.isPending || updateMutation.isPending}
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
                        await confirmMutation.mutateAsync(id);
                        toast.success(t("actions.confirmSuccess", { id: record?.inventoryNumber ?? id }));
                        navigate("/main/fa/assets", { replace: true });
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
                        await cancelMutation.mutateAsync(id);
                        toast.success(t("actions.cancelSuccess", { id: record?.inventoryNumber ?? id }));
                        navigate("/main/fa/assets", { replace: true });
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

          {!isDraft && statusId === 2 && (
            <>
              {permissions.includes(faAssetPermissions.update) && (
                <Button
                  danger
                  block
                  icon={<CircleX className="size-4" />}
                  onClick={async () => {
                    try {
                      await cancelMutation.mutateAsync(id);
                      toast.success(t("actions.cancelSuccess", { id: record?.inventoryNumber ?? id }));
                      navigate("/main/fa/assets", { replace: true });
                    } catch (error) {
                      errorHandlers(error);
                    }
                  }}
                  loading={cancelMutation.isPending}
                >
                  {t("common.cancel")}
                </Button>
              )}
            </>
          )}

          {record?.statusName && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              Joriy holat:{" "}
              <span className="font-semibold">{record.statusName}</span>
            </div>
          )}
          {record?.initialCost != null && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              Summa:{" "}
              <span className="font-semibold">
                {numberSpacing(record.initialCost)}
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
