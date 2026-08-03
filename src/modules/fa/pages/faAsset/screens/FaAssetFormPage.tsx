import { Alert, Button, Form, Spin } from "antd";
import { useMemo, useState } from "react";
import { useFormik } from "formik";
import { useMatch, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { Calendar, CheckCircle2, CircleX, Save } from "lucide-react";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import Card from "@/components/ui/card/Card";
import DocumentActionsCard from "@/components/ui/card/DocumentActionsCard";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import FaAssetFormFields from "../components/FaAssetFormFields";
import FaAssetProcessingModeModal from "../components/FaAssetProcessingModeModal";
import FaAssetReadonlyDetailsCard from "../components/FaAssetReadonlyDetailsCard";
import { useAppSelector } from "@/store/hooks";
import { customDate, numberSpacing } from "@/utils/utils";
import type {
  FaAssetCreatePayload,
  FaAssetEditableFields,
  FaAssetFormValues,
  FaAssetProcessingMode,
  FaAssetUpdatePayload,
} from "../types/form";
import { faAssetSchema } from "../types/schema";
import { faAssetPermissions } from "../constants/permissions";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import {
  useGetDetailFaAsset,
  useCreateFaAsset,
  useUpdateFaAsset,
  useConfirmFaAsset,
  useCancelFaAsset,
} from "../hooks";

const defaultValues: FaAssetFormValues = {
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
  assetAccountId: null,
  accumulatedDepreciationAccountId: null,
  depreciationExpenseAccountId: null,
  stateId: null,
  statusId: faDocumentStatusIds.draft,
};

const toEditableFields = (
  values: FaAssetFormValues,
): FaAssetEditableFields => {
  const { stateId: _stateId, statusId: _statusId, ...editableFields } = values;

  return {
    ...editableFields,
    inventoryNumber: values.inventoryNumber.trim(),
    name: values.name.trim(),
  };
};

export default function FaAssetFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const isCreate = !id;
  const isEdit = Boolean(useMatch("/main/fa/assets/edit/:id"));
  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = user?.user.id ?? null;
  const permissions = user?.user.permissions ?? [];
  const canViewList = permissions.includes(faAssetPermissions.view);
  const canViewDetail = permissions.includes(faAssetPermissions.detail);
  const canCreate = permissions.includes(faAssetPermissions.create);
  const canUpdate = permissions.includes(faAssetPermissions.update);
  const canConfirm = permissions.includes(faAssetPermissions.confirm);
  const canCancel = permissions.includes(faAssetPermissions.cancel);
  const [processingModeModalOpen, setProcessingModeModalOpen] = useState(false);
  const [isCreateProcessing, setIsCreateProcessing] = useState(false);

  const detailQuery = useGetDetailFaAsset(id);
  const createMutation = useCreateFaAsset();
  const updateMutation = useUpdateFaAsset();
  const confirmMutation = useConfirmFaAsset(id);
  const cancelMutation = useCancelFaAsset(id);
  const record = detailQuery.data;
  const statusId = record?.statusId ?? faDocumentStatusIds.draft;
  const isDraft = isCreate || statusId === faDocumentStatusIds.draft;
  const canSubmit = isCreate ? canCreate : isDraft && canUpdate;
  const exitPath = canViewList ? "/main/fa/assets" : "/main";

  const initialValues = useMemo<FaAssetFormValues>(
    () => ({
      inventoryNumber: record?.inventoryNumber ?? defaultValues.inventoryNumber,
      name: record?.name ?? defaultValues.name,
      faGroupId: record?.faGroupId ?? defaultValues.faGroupId,
      okofId: record?.okofId ?? defaultValues.okofId,
      depreciationMethodId:
        record?.depreciationMethodId ?? defaultValues.depreciationMethodId,
      usefulLifeMonths:
        record?.usefulLifeMonths ?? defaultValues.usefulLifeMonths,
      initialCost: record?.initialCost ?? defaultValues.initialCost,
      salvageValue: record?.salvageValue ?? defaultValues.salvageValue,
      commissioningDate:
        record?.commissioningDate ?? defaultValues.commissioningDate,
      deprStartDate: record?.deprStartDate ?? defaultValues.deprStartDate,
      plannedUnitsTotal:
        record?.plannedUnitsTotal ?? defaultValues.plannedUnitsTotal,
      sourceProductTableId:
        record?.sourceProductTableId ?? defaultValues.sourceProductTableId,
      departmentId: record?.departmentId ?? defaultValues.departmentId,
      responsibleUserId:
        record?.responsibleUserId ??
        (isCreate ? currentUserId : defaultValues.responsibleUserId),
      assetAccountId: record?.assetAccountId ?? defaultValues.assetAccountId,
      accumulatedDepreciationAccountId:
        record?.accumulatedDepreciationAccountId ??
        defaultValues.accumulatedDepreciationAccountId,
      depreciationExpenseAccountId:
        record?.depreciationExpenseAccountId ??
        defaultValues.depreciationExpenseAccountId,
      stateId: record?.stateId ?? defaultValues.stateId,
      statusId: record?.statusId ?? defaultValues.statusId,
    }),
    [currentUserId, isCreate, record],
  );

  const formik = useFormik<FaAssetFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faAssetSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        if (!isCreate && id) {
          const editableFields = toEditableFields(values);
          const payload: FaAssetUpdatePayload = {
            ...editableFields,
            stateId: values.stateId,
            statusId: values.statusId,
          };
          await updateMutation.mutateAsync({ id, payload });
          helpers.resetForm({ values: payload });
          toast.success(t("settings.messages.updated"));
        } else {
          setProcessingModeModalOpen(true);
        }
      } catch (err: unknown) {
        errorHandlers(err);
        throw err;
      }
    },
  });

  const handleCreateSave = async (processingMode: FaAssetProcessingMode) => {
    if (!isCreate || isCreateProcessing) return;

    setProcessingModeModalOpen(false);
    setIsCreateProcessing(true);

    try {
      const payload: FaAssetCreatePayload = {
        ...toEditableFields(formik.values),
        processingMode,
      };
      const created = await createMutation.mutateAsync(payload);
      toast.success(t("settings.messages.created"));

      const path =
        processingMode === 1 && canUpdate
          ? `/main/fa/assets/edit/${created.id}`
          : canViewDetail
            ? `/main/fa/assets/${created.id}`
            : exitPath;
      navigate(path, { replace: true });
    } catch (error: unknown) {
      errorHandlers(error);
    } finally {
      setIsCreateProcessing(false);
    }
  };

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
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

  const ensureSavedBeforeAction = async () => {
    if (!formik.dirty) return true;
    return saveDraft();
  };

  const handleConfirm = async () => {
    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await confirmMutation.mutateAsync();
      toast.success(t("actions.confirmSuccess"));
      navigate(exitPath, { replace: true });
    } catch (error: unknown) {
      errorHandlers(error);
      throw error;
    }
  };

  const handleCancel = async () => {
    if (isDraft) {
      const ready = await ensureSavedBeforeAction();
      if (!ready) return;
    }

    try {
      await cancelMutation.mutateAsync();
      toast.success(t("actions.cancelSuccess"));
      navigate(exitPath, { replace: true });
    } catch (error: unknown) {
      errorHandlers(error);
      throw error;
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending ||
    isCreateProcessing;

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (detailQuery.isError && !isCreate) {
    return (
      <Alert
        type="error"
        showIcon
        message={t("error.title")}
        description={t("error.subtitle")}
        action={
          <Button size="small" onClick={() => void detailQuery.refetch()}>
            {t("common.reload")}
          </Button>
        }
      />
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
              {record?.inventoryNumber ??
                (isCreate
                  ? t("fa.form.create")
                  : isEdit
                    ? t("fa.form.edit")
                    : t("fa.form.detail"))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">
                {t("fa.fields.commissioningDate")}
              </span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(
                record?.commissioningDate ?? defaultValues.commissioningDate,
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isCreate && (
              <ProcessStatusBadge
                statusId={record?.statusId}
                statusCode={record?.statusCode}
                statusName={record?.statusName}
              />
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_0.9fr]">
        <Card className="p-4">
          {isDraft ? (
            <Form layout="vertical" onFinish={formik.handleSubmit}>
              <fieldset disabled={!canSubmit}>
                <FaAssetFormFields formik={formik} isCreate={isCreate} />
              </fieldset>
            </Form>
          ) : (
            record && <FaAssetReadonlyDetailsCard record={record} />
          )}
        </Card>

        <div className="space-y-4">
          <DocumentActionsCard
            actions={[
              {
                key: "save",
                label: "common.save",
                icon: <Save className="size-4" />,
                onClick: saveDraft,
                loading: isSubmitting,
                hidden: !isDraft || !canSubmit,
              },
              {
                key: "confirm",
                label: "common.confirm",
                icon: <CheckCircle2 className="size-4" />,
                type: "primary",
                onClick: handleConfirm,
                loading: confirmMutation.isPending,
                disabled: isSubmitting,
                hidden: isCreate || !isDraft || !canConfirm,
                confirm: {
                  title: "actions.confirmConfirmTitle",
                  content: "actions.confirmConfirmContent",
                  okText: "common.confirm",
                },
              },
              {
                key: "cancel",
                label: "actions.cancel",
                icon: <CircleX className="size-4" />,
                danger: true,
                onClick: handleCancel,
                loading: cancelMutation.isPending,
                disabled: isSubmitting,
                hidden:
                  isCreate ||
                  (!isDraft && statusId !== faDocumentStatusIds.posted) ||
                  !canCancel,
                confirm: {
                  title: "actions.cancelConfirmTitle",
                  content: "actions.cancelConfirmContent",
                  okText: "actions.cancel",
                  danger: true,
                },
              },
            ]}
          />

          {(record?.statusName || record?.initialCost != null) && (
            <Card className="space-y-3 p-4">
              {record?.statusName && (
                <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
                  {t("fa.fields.currentStatus")}:{" "}
                  <span className="font-semibold">{record.statusName}</span>
                </div>
              )}
              {record?.initialCost != null && (
                <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
                  {t("fa.fields.amount")}:{" "}
                  <span className="font-semibold">
                    {numberSpacing(record.initialCost)}
                  </span>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <FaAssetProcessingModeModal
        open={processingModeModalOpen}
        loading={isCreateProcessing}
        canConfirm={canConfirm}
        onClose={() => setProcessingModeModalOpen(false)}
        onSelect={(mode) => void handleCreateSave(mode)}
      />
    </div>
  );
}
