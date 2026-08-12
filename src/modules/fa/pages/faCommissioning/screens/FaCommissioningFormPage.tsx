import { Alert, Button, Form, Popconfirm, Spin } from "antd";
import { useMemo } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { Trash2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import FaDraftActionsBar from "../../../shared/components/FaDraftActionsBar";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import FaCommissioningFormFields from "../components/FaCommissioningFormFields";
import FaCommissioningReadonlyView from "../components/readonly/FaCommissioningReadonlyView";
import { faCommissioningPermissions } from "../constants/permissions";
import {
  useCancelFaCommissioning,
  useConfirmFaCommissioning,
  useCreateFaCommissioning,
  useGetDetailFaCommissioning,
  useUpdateFaCommissioning,
} from "../hooks";
import type { FaCommissioningFormValues } from "../types/form";
import type { FaCommissioningPayload } from "../types/type";
import { faCommissioningSchema } from "../types/schema";

const defaults: FaCommissioningFormValues = {
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  note: "",
  lines: [
    {
      faAssetId: null,
      deprStartDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      salvageValue: 0,
      usefulLifeMonths: 1,
      depreciationMethodId: null,
      plannedUnitsTotal: null,
      departmentId: null,
      responsibleUserId: null,
      accumulatedDepreciationAccountId: null,
      depreciationExpenseAccountId: null,
      note: "",
    },
  ],
};

const toPayload = (
  values: FaCommissioningFormValues,
  currentUserId: number | null,
): FaCommissioningPayload => ({
  docDate: values.docDate,
  note: values.note.trim(),
  lines: values.lines.map((line) => ({
    faAssetId: Number(line.faAssetId),
    deprStartDate: line.deprStartDate,
    salvageValue: Number(line.salvageValue),
    usefulLifeMonths: Number(line.usefulLifeMonths),
    depreciationMethodId: Number(line.depreciationMethodId),
    plannedUnitsTotal:
      line.plannedUnitsTotal == null ? null : Number(line.plannedUnitsTotal),
    departmentId: Number(line.departmentId),
    responsibleUserId: Number(line.responsibleUserId ?? currentUserId),
    accumulatedDepreciationAccountId: Number(
      line.accumulatedDepreciationAccountId,
    ),
    depreciationExpenseAccountId: Number(line.depreciationExpenseAccountId),
    note: line.note.trim() || null,
  })),
});

export default function FaCommissioningFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id = "" } = useParams();
  const isCreate = !id;
  const isReadonlyRoute = !isCreate && !location.pathname.includes("/edit/");
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const currentUserId = useAppSelector(
    (state) => state.auth.user?.user.id ?? null,
  );
  const detailQuery = useGetDetailFaCommissioning(id);
  const createMutation = useCreateFaCommissioning();
  const updateMutation = useUpdateFaCommissioning();
  const confirmMutation = useConfirmFaCommissioning();
  const cancelMutation = useCancelFaCommissioning();
  const record = detailQuery.data;
  const statusId = record?.statusId ?? faDocumentStatusIds.draft;
  const isDraft = isCreate || statusId === faDocumentStatusIds.draft;
  const canSave = isCreate
    ? permissions.includes(faCommissioningPermissions.create)
    : isDraft && permissions.includes(faCommissioningPermissions.update);

  const initialValues = useMemo<FaCommissioningFormValues>(
    () => ({
      docDate: record?.docDate ?? defaults.docDate,
      note: record?.note ?? "",
      lines: record?.lines?.length
        ? record.lines.map((line) => ({
            ...line,
            note: line.note ?? "",
            responsibleUserId: line.responsibleUserId ?? currentUserId,
          }))
        : defaults.lines.map((line) => ({
            ...line,
            responsibleUserId: currentUserId,
          })),
    }),
    [currentUserId, record],
  );
  const persist = async (values: FaCommissioningFormValues) => {
    const payload = toPayload(values, currentUserId);
    if (isCreate) return createMutation.mutateAsync(payload);
    await updateMutation.mutateAsync({ id, payload });
    return Number(id);
  };
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: faCommissioningSchema(t),
    onSubmit: async (values) => {
      try {
        await persist(values);
        toast.success(
          t(
            isCreate
              ? "settings.messages.created"
              : "settings.messages.updated",
          ),
        );
        navigate("/main/fa/commissionings");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });
  const handleConfirm = async () => {
    try {
      await persist(formik.values);
      await confirmMutation.mutateAsync(id);
      toast.success(t("actions.confirmSuccess", { id }));
      navigate("/main/fa/commissionings");
    } catch (error) {
      errorHandlers(error);
    }
  };
  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      toast.success(t("actions.cancelSuccess", { id }));
      navigate("/main/fa/commissionings");
    } catch (error) {
      errorHandlers(error);
    }
  };

  if (!isCreate && detailQuery.isLoading)
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  if (!isCreate && detailQuery.isError)
    return (
      <Alert
        type="error"
        showIcon
        message={t("error.title")}
        description={t("error.subtitle")}
      />
    );

  if (isReadonlyRoute && record) {
    const cancelAction =
      statusId === faDocumentStatusIds.posted &&
      permissions.includes(faCommissioningPermissions.cancel) ? (
        <Popconfirm
          title={t("actions.cancelConfirmTitle")}
          description={t("actions.cancelConfirmContent")}
          okText={t("actions.cancel")}
          cancelText={t("common.cancel")}
          okButtonProps={{ danger: true }}
          onConfirm={handleCancel}
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

    return (
      <FaCommissioningReadonlyView record={record} action={cancelAction} />
    );
  }

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <fieldset disabled={!canSave} className="min-w-0">
        <FaCommissioningFormFields
          formik={formik}
          isDraft={isDraft}
          currentUserId={currentUserId}
        />
      </fieldset>
      {isDraft ? (
        <FaDraftActionsBar
          isCreate={isCreate}
          canSave={canSave}
          canConfirm={permissions.includes(faCommissioningPermissions.confirm)}
          canCancel={permissions.includes(faCommissioningPermissions.cancel)}
          saving={createMutation.isPending || updateMutation.isPending}
          confirming={confirmMutation.isPending}
          cancelling={cancelMutation.isPending}
          onExit={() => navigate("/main/fa/commissionings")}
          onConfirm={handleConfirm}
          onCancelDocument={handleCancel}
        />
      ) : statusId === faDocumentStatusIds.posted &&
        permissions.includes(faCommissioningPermissions.cancel) ? (
        <div className="mt-4 flex justify-end">
          <Popconfirm
            title={t("actions.cancelConfirmTitle")}
            onConfirm={handleCancel}
          >
            <Button
              danger
              icon={<Trash2 className="size-4" />}
              loading={cancelMutation.isPending}
            >
              {t("fa.actions.cancelDocument")}
            </Button>
          </Popconfirm>
        </div>
      ) : null}
    </Form>
  );
}
