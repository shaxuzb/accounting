import { Alert, Button, Form, Spin } from "antd";
import { useMemo } from "react";
import { useFormik } from "formik";
import { useMatch, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { Calendar, CheckCircle2, CircleX, Save } from "lucide-react";
import Card from "@/components/ui/card/Card";
import DocumentActionsCard from "@/components/ui/card/DocumentActionsCard";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";

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
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import FaMovementFormFields from "../components/FaMovementFormFields";
import FaMovementReadonlyDetailsCard from "../components/FaMovementReadonlyDetailsCard";

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

export default function FaMovementFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const isEdit = Boolean(useMatch("/main/fa/movements/edit/:id"));

  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canViewList = permissions.includes(faMovementPermissions.view);
  const canViewDetail = permissions.includes(faMovementPermissions.detail);
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
  const statusId =
    record?.statusId ?? record?.stateId ?? faDocumentStatusIds.draft;
  const isDraft = isCreate || statusId === faDocumentStatusIds.draft;
  const canSubmit = isCreate ? canCreate : isDraft && canUpdate;
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

  const formik = useFormik<FaMovementFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faMovementSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        const payload = {
          docDate: values.docDate,
          toDepartmentId: Number(values.toDepartmentId),
          toResponsibleUserId: Number(values.toResponsibleUserId),
          note: values.note,
          stateId: record?.stateId ?? faDocumentStatusIds.draft,
          lines: values.lines.map((line) => ({
            faAssetId: Number(line.faAssetId),
            note: line.note,
          })),
        };

        if (!isCreate && id) {
          await updateMutation.mutateAsync({ id, payload });
          helpers.resetForm({ values });
          toast.success(t("settings.messages.updated"));
        } else {
          const created = await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
          const path = canUpdate
            ? `/main/fa/movements/edit/${created.id}`
            : canViewDetail
              ? `/main/fa/movements/${created.id}`
              : exitPath;
          navigate(path, { replace: true });
        }
      } catch (err: unknown) {
        errorHandlers(err);
        throw err;
      }
    },
  });

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
      toast.success(t("actions.confirmSuccess", { id: record?.id ?? id }));
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
      toast.success(t("actions.cancelSuccess", { id: record?.id ?? id }));
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
    cancelMutation.isPending;

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

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">
              {t("app.routes.faMovements")}
            </div>
            <div className="text-lg font-semibold">
              {record?.documentNumber ??
                record?.docNumber ??
                (isCreate
                  ? t("fa.form.create")
                  : isEdit
                    ? `${t("fa.form.edit")} №${record?.id ?? id}`
                    : `${t("fa.form.detail")} №${record?.id ?? id}`)}
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
                statusId={record?.statusId ?? record?.stateId}
                statusName={record?.statusName ?? record?.stateName}
              />
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_0.9fr]">
        <Card className="p-4">
          {isDraft ? (
            <Form layout="vertical" onFinish={formik.handleSubmit}>
              <fieldset disabled={!canSubmit} className="group">
                <FaMovementFormFields formik={formik} isDraft={isDraft} />
              </fieldset>
            </Form>
          ) : (
            record && <FaMovementReadonlyDetailsCard record={record} />
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
        </div>
      </div>
    </div>
  );
}
