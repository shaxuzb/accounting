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

import { faMovementSchema } from "../types/schema";
import type { FaMovementFormValues } from "../types/form";
import type { FaMovementPayload } from "../types/type";
import {
  useCancelFaMovement,
  useConfirmFaMovement,
  useCreateFaMovement,
  useGetDetailFaMovement,
  useUpdateFaMovement,
} from "../hooks";
import { faMovementPermissions } from "../constants/permissions";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import FaMovementFormFields from "../components/FaMovementFormFields";
import FaMovementReadonlyView from "../components/FaMovementReadonlyView";

const defaultValues: FaMovementFormValues = {
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  toDepartmentId: null,
  toResponsibleUserId: null,
  note: "",
  lines: [
    {
      faAssetId: null,
      note: "",
    },
  ],
};

const toPayload = (
  values: FaMovementFormValues,
): FaMovementPayload => ({
  docDate: values.docDate,
  toDepartmentId: values.toDepartmentId == null ? null : Number(values.toDepartmentId),
  toResponsibleUserId: values.toResponsibleUserId == null ? null : Number(values.toResponsibleUserId),
  note: values.note,
  lines: values.lines.map((line) => ({
    faAssetId: Number(line.faAssetId),
    note: line.note || null,
  })),
});

export default function FaMovementFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;

  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canViewList = permissions.includes(faMovementPermissions.view);
  const canCreate = permissions.includes(faMovementPermissions.create);
  const canUpdate = permissions.includes(faMovementPermissions.update);
  const canConfirm = permissions.includes(faMovementPermissions.confirm);
  const canCancel = permissions.includes(faMovementPermissions.cancel);

  const detailQuery = useGetDetailFaMovement(id);
  const createMutation = useCreateFaMovement();
  const updateMutation = useUpdateFaMovement();
  const confirmMutation = useConfirmFaMovement(id);
  const cancelMutation = useCancelFaMovement(id);

  const record = detailQuery.data;
  const statusId = record?.statusId ?? faDocumentStatusIds.draft;
  const isDraft = isCreate || statusId === faDocumentStatusIds.draft;
  const canSubmit = isCreate ? canCreate : isDraft && canUpdate;
  const showEditor = isCreate || (isDraft && canSubmit);
  const exitPath = canViewList ? "/main/fa/movements" : "/main";

  const initialValues = useMemo<FaMovementFormValues>(
    () => ({
      docDate: record?.docDate ?? defaultValues.docDate,
      toDepartmentId: record?.toDepartmentId ?? defaultValues.toDepartmentId,
      toResponsibleUserId:
        record?.toResponsibleUserId ?? defaultValues.toResponsibleUserId,
      note: record?.note ?? "",
      lines: record?.lines?.length
        ? record.lines.map((line) => ({
            faAssetId: line.faAssetId,
            note: line.note ?? "",
          }))
        : defaultValues.lines,
    }),
    [record],
  );

  const persistMovement = async (
    values: FaMovementFormValues,
  ): Promise<number> => {
    const payload = toPayload(values);

    if (!isCreate && id) {
      await updateMutation.mutateAsync({ id, payload });
      return Number(id);
    }
    return createMutation.mutateAsync(payload);
  };

  const formik = useFormik<FaMovementFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faMovementSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        await persistMovement(values);
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

  const validateMovement = async () => {
    const errors = await formik.validateForm();
    if (!Object.keys(errors).length) return true;

    formik.setTouched(setNestedObjectValues(errors, true));
    toast.error(t("common.requiredFields"));
    return false;
  };

  const handleConfirm = async () => {
    if (!(await validateMovement())) return;

    try {
      await persistMovement(formik.values);
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

    return <FaMovementReadonlyView record={record} action={cancelAction} />;
  }

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <fieldset disabled={!canSubmit} className="min-w-0">
        <FaMovementFormFields
          formik={formik}
          isDraft={isDraft}
        />
      </fieldset>

      <FaDraftActionsBar
        isCreate={isCreate}
        canSave={canSubmit}
        canConfirm={canConfirm}
        canCancel={canCancel}
        saving={createMutation.isPending || updateMutation.isPending}
        confirming={confirmMutation.isPending}
        cancelling={cancelMutation.isPending}
        onExit={() => navigate(exitPath)}
        onConfirm={handleConfirm}
        onCancelDocument={handleCancelDocument}
      />
    </Form>
  );
}
