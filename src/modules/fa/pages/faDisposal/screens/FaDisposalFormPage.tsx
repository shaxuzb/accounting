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
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import FaDisposalFormFields from "../components/FaDisposalFormFields";
import FaDisposalReadonlyView from "../components/FaDisposalReadonlyView";
import { faDisposalPermissions } from "../constants/permissions";
import {
  useCancelFaDisposal,
  useConfirmFaDisposal,
  useCreateFaDisposal,
  useGetDetailFaDisposal,
  useUpdateFaDisposal,
} from "../hooks";
import type { FaDisposalFormValues } from "../types/form";
import { faDisposalSchema } from "../types/schema";
import type { FaDisposalPayload } from "../types/type";

const defaultValues: FaDisposalFormValues = {
  disposalDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  disposalTypeId: null,
  reason: "",
  stateId: faDocumentStatusIds.draft,
  disposalAccountId: null,
  customerAccountId: null,
  vatAccountId: null,
  gainAccountId: null,
  lossAccountId: null,
  lines: [
    {
      faAssetId: null,
      saleAmount: 0,
      note: "",
    },
  ],
};

const toPayload = (values: FaDisposalFormValues): FaDisposalPayload => ({
  disposalDate: values.disposalDate,
  disposalTypeId: Number(values.disposalTypeId),
  reason: values.reason || "",
  stateId: values.stateId ?? faDocumentStatusIds.draft,
  disposalAccountId: Number(values.disposalAccountId),
  customerAccountId: Number(values.customerAccountId),
  vatAccountId: Number(values.vatAccountId),
  gainAccountId: Number(values.gainAccountId),
  lossAccountId: Number(values.lossAccountId),
  lines: values.lines.map((line) => ({
    faAssetId: Number(line.faAssetId),
    saleAmount: Number(line.saleAmount),
    note: line.note || "",
  })),
});

export default function FaDisposalFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;

  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canViewList = permissions.includes(faDisposalPermissions.view);
  const canCreate = permissions.includes(faDisposalPermissions.create);
  const canUpdate = permissions.includes(faDisposalPermissions.update);
  const canConfirm = permissions.includes(faDisposalPermissions.confirm);
  const canCancel = permissions.includes(faDisposalPermissions.cancel);

  const detailQuery = useGetDetailFaDisposal(id);
  const createMutation = useCreateFaDisposal();
  const updateMutation = useUpdateFaDisposal();
  const confirmMutation = useConfirmFaDisposal(id);
  const cancelMutation = useCancelFaDisposal(id);

  const record = detailQuery.data;
  const statusId = record?.statusId ?? faDocumentStatusIds.draft;
  const isDraft = isCreate || statusId === faDocumentStatusIds.draft;
  const canSubmit = isCreate ? canCreate : isDraft && canUpdate;
  const showEditor = isCreate || (isDraft && canSubmit);
  const listPath = canViewList ? "/main/fa/disposals" : "/main";

  const initialValues = useMemo<FaDisposalFormValues>(
    () => ({
      disposalDate: record?.disposalDate ?? defaultValues.disposalDate,
      disposalTypeId: record?.disposalTypeId ?? null,
      reason: record?.reason ?? "",
      stateId: record?.stateId ?? defaultValues.stateId,
      disposalAccountId: record?.disposalAccountId ?? null,
      customerAccountId: record?.customerAccountId ?? null,
      vatAccountId: record?.vatAccountId ?? null,
      gainAccountId: record?.gainAccountId ?? null,
      lossAccountId: record?.lossAccountId ?? null,
      lines: record?.lines?.length
        ? record.lines.map((line) => ({
            faAssetId: line.faAssetId,
            saleAmount: line.saleAmount ?? 0,
            note: line.note ?? "",
          }))
        : defaultValues.lines,
    }),
    [record],
  );

  const persistDisposal = async (
    values: FaDisposalFormValues,
  ): Promise<number> => {
    const payload = toPayload(values);
    if (!isCreate && id) {
      await updateMutation.mutateAsync({ id, payload });
      return Number(id);
    }
    return createMutation.mutateAsync(payload);
  };

  const formik = useFormik<FaDisposalFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faDisposalSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        await persistDisposal(values);
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

  const validateDisposal = async () => {
    const errors = await formik.validateForm();
    if (!Object.keys(errors).length) return true;

    formik.setTouched(setNestedObjectValues(errors, true));
    toast.error(t("common.requiredFields"));
    return false;
  };

  const handleConfirm = async () => {
    if (!(await validateDisposal())) return;

    try {
      await persistDisposal(formik.values);
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

    return <FaDisposalReadonlyView record={record} action={cancelAction} />;
  }

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <fieldset disabled={!canSubmit} className="min-w-0">
        <FaDisposalFormFields formik={formik} isDraft={isDraft} />
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
