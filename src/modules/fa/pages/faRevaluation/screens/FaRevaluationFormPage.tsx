import { Alert, Button, Form, Popconfirm, Spin } from "antd";
import { useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { Trash2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import FaDraftActionsBar from "../../../shared/components/FaDraftActionsBar";
import { faRevaluationSchema } from "../types/schema";
import type { FaRevaluationFormValues } from "../types/form";
import type { FaRevaluation, FaRevaluationPayload } from "../types/type";
import {
  useCancelFaRevaluation,
  useConfirmFaRevaluation,
  useCreateFaRevaluation,
  useGetDetailFaRevaluation,
  useUpdateFaRevaluation,
} from "../hooks";
import { faRevaluationPermissions } from "../constants/permissions";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import FaRevaluationFormFields from "../components/FaRevaluationFormFields";
import FaRevaluationReadonlyView from "../components/FaRevaluationReadonlyView";

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
    },
  ],
};

const toPayload = (values: FaRevaluationFormValues): FaRevaluationPayload => ({
  revaluationDate: values.revaluationDate,
  reason: values.reason || "",
  stateId: values.stateId ?? faDocumentStatusIds.draft,
  revaluationReserveAccountId: Number(values.revaluationReserveAccountId),
  revaluationLossAccountId: Number(values.revaluationLossAccountId),
  lines: values.lines.map((line) => ({
    faAssetId: Number(line.faAssetId),
    newValue: Number(line.newValue),
    note: line.note || "",
    assetAccountId: Number(line.assetAccountId),
    accumulatedDepreciationAccountId: Number(
      line.accumulatedDepreciationAccountId,
    ),
  })),
});

export default function FaRevaluationFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;

  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canViewList = permissions.includes(faRevaluationPermissions.view);
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
  const showEditor = isCreate || (isDraft && canSubmit);
  const listPath = canViewList ? "/main/fa/revaluations" : "/main";

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

  const persistRevaluation = async (
    values: FaRevaluationFormValues,
  ): Promise<FaRevaluation> => {
    const payload = toPayload(values);
    if (!isCreate && id) {
      return updateMutation.mutateAsync({ id, payload });
    }
    return createMutation.mutateAsync(payload);
  };

  const formik = useFormik<FaRevaluationFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faRevaluationSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        await persistRevaluation(values);
        helpers.resetForm({ values });
        toast.success(
          t(isCreate ? "settings.messages.created" : "settings.messages.updated"),
        );

        navigate(-1);
      } catch (error: unknown) {
        errorHandlers(error);
      }
    },
  });

  const validateRevaluation = async () => {
    const errors = await formik.validateForm();
    if (!Object.keys(errors).length) return true;

    formik.setTouched(setNestedObjectValues(errors, true));
    toast.error(t("common.requiredFields"));
    return false;
  };

  const handleConfirm = async () => {
    if (!(await validateRevaluation())) return;

    try {
      await persistRevaluation(formik.values);
      await confirmMutation.mutateAsync(id);
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
          <Button size="small" onClick={() => detailQuery.refetch()}>
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

    return <FaRevaluationReadonlyView record={record} action={cancelAction} />;
  }

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <fieldset disabled={!canSubmit} className="min-w-0">
        <FaRevaluationFormFields formik={formik} isDraft={isDraft} />
      </fieldset>

      <FaDraftActionsBar
        isCreate={isCreate}
        canSave={canSubmit}
        canConfirm={canConfirm}
        canCancel={canCancel}
        saving={createMutation.isPending || updateMutation.isPending}
        confirming={confirmMutation.isPending}
        cancelling={cancelMutation.isPending}
        onExit={() => navigate(listPath)}
        onConfirm={handleConfirm}
        onCancelDocument={handleCancelDocument}
      />
    </Form>
  );
}
