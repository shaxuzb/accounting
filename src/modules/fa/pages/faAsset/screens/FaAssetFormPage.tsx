import { Alert, Button, Form, Popconfirm, Spin } from "antd";
import { useMemo, useState } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { Trash2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import FaDraftActionsBar from "../../../shared/components/FaDraftActionsBar";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import FaAssetFormFields from "../components/FaAssetFormFields";
import FaAssetProcessingModeModal from "../components/FaAssetProcessingModeModal";
import FaAssetReadonlyView from "../components/FaAssetReadonlyView";
import { faAssetPermissions } from "../constants/permissions";
import {
  useCancelFaAsset,
  useConfirmFaAsset,
  useCreateFaAsset,
  useGetDetailFaAsset,
  useUpdateFaAsset,
} from "../hooks";
import type {
  FaAssetCreatePayload,
  FaAssetEditableFields,
  FaAssetFormValues,
  FaAssetProcessingMode,
  FaAssetUpdatePayload,
} from "../types/form";
import { faAssetSchema } from "../types/schema";
import type { FaAsset } from "../types/type";

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
  responsibleUserId: number | null,
): FaAssetEditableFields => {
  const { stateId: _stateId, statusId: _statusId, ...editableFields } = values;

  return {
    ...editableFields,
    inventoryNumber: values.inventoryNumber.trim(),
    name: values.name.trim(),
    responsibleUserId,
  };
};

export default function FaAssetFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const isCreate = !id;

  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = user?.user.id ?? null;
  const permissions = user?.user.permissions ?? [];
  const canViewList = permissions.includes(faAssetPermissions.view);
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
  const showEditor = isCreate || (isDraft && canSubmit);
  const listPath = canViewList ? "/main/fa/assets" : "/main";

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
      responsibleUserId: currentUserId,
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
    [currentUserId, record],
  );

  const updateAsset = async (values: FaAssetFormValues): Promise<FaAsset> => {
    const payload: FaAssetUpdatePayload = {
      ...toEditableFields(values, currentUserId),
      stateId: values.stateId,
      statusId: values.statusId,
    };
    return updateMutation.mutateAsync({ id, payload });
  };

  const formik = useFormik<FaAssetFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faAssetSchema(t),
    onSubmit: async (values, helpers) => {
      if (isCreate) {
        setProcessingModeModalOpen(true);
        return;
      }

      try {
        await updateAsset(values);
        helpers.resetForm({ values });
        toast.success(t("settings.messages.updated"));
      } catch (error: unknown) {
        errorHandlers(error);
      }
    },
  });

  const handleCreateSave = async (processingMode: FaAssetProcessingMode) => {
    if (!isCreate || isCreateProcessing) return;

    setProcessingModeModalOpen(false);
    setIsCreateProcessing(true);

    try {
      const payload: FaAssetCreatePayload = {
        ...toEditableFields(formik.values, currentUserId),
        processingMode,
      };
      await createMutation.mutateAsync(payload);
      toast.success(t("settings.messages.created"));
      navigate(-1);
    } catch (error: unknown) {
      errorHandlers(error);
    } finally {
      setIsCreateProcessing(false);
    }
  };

  const validateAsset = async () => {
    const errors = await formik.validateForm();
    if (!Object.keys(errors).length) return true;

    formik.setTouched(setNestedObjectValues(errors, true));
    toast.error(t("common.requiredFields"));
    return false;
  };

  const handleConfirm = async () => {
    if (!(await validateAsset())) return;

    try {
      await updateAsset(formik.values);
      await confirmMutation.mutateAsync();
      toast.success(t("actions.confirmSuccess", { id }));
      navigate(-1);
    } catch (error: unknown) {
      errorHandlers(error);
    }
  };

  const handleCancelDocument = async () => {
    try {
      await cancelMutation.mutateAsync();
      toast.success(t("actions.cancelSuccess", { id: record?.id ?? id }));
      navigate(-1);
    } catch (error: unknown) {
      errorHandlers(error);
    }
  };

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

  if (!showEditor && record) {
    const cancelAction =
      statusId === faDocumentStatusIds.posted && canCancel ? (
        <Popconfirm
          title={t("actions.cancelConfirmTitle")}
          description={t("actions.cancelConfirmContent")}
          okText={t("actions.cancel")}
          cancelText={t("common.cancel")}
          okButtonProps={{ danger: true }}
          onConfirm={handleCancelDocument}
        >
          <Button
            danger
            icon={<Trash2 className="size-4" />}
            loading={cancelMutation.isPending}
          >
            {t("fa.actions.cancelDocument")}
          </Button>
        </Popconfirm>
      ) : undefined;

    return <FaAssetReadonlyView record={record} action={cancelAction} />;
  }

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <fieldset disabled={!canSubmit} className="min-w-0">
        <FaAssetFormFields formik={formik} isCreate={isCreate} />
      </fieldset>

      <FaDraftActionsBar
        isCreate={isCreate}
        canSave={canSubmit}
        canConfirm={canConfirm}
        canCancel={canCancel}
        saving={
          createMutation.isPending ||
          updateMutation.isPending ||
          isCreateProcessing
        }
        confirming={confirmMutation.isPending}
        cancelling={cancelMutation.isPending}
        onExit={() => navigate(listPath)}
        onConfirm={handleConfirm}
        onCancelDocument={handleCancelDocument}
      />

      <FaAssetProcessingModeModal
        open={processingModeModalOpen}
        loading={isCreateProcessing}
        canConfirm={canConfirm}
        onClose={() => setProcessingModeModalOpen(false)}
        onSelect={(mode) => void handleCreateSave(mode)}
      />
    </Form>
  );
}
