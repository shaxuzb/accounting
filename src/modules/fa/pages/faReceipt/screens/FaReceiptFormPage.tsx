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
import { faReceiptSchema } from "../types/schema";
import type { FaReceiptFormValues } from "../types/form";
import type { FaReceiptPayload, FaReceiptResponse } from "../types/type";
import {
  useCancelFaReceipt,
  useConfirmFaReceipt,
  useCreateFaReceipt,
  useGetDetailFaReceipt,
  useUpdateFaReceipt,
} from "../hooks";
import { faReceiptPermissions } from "../constants/permissions";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import FaReceiptFormFields from "../components/FaReceiptFormFields";
import FaReceiptReadonlyView from "../components/readonly/FaReceiptReadonlyView";

const defaultValues: FaReceiptFormValues = {
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  counterpartyId: null,
  currencyId: null,
  receiptTypeId: null,
  supplierAccountId: null,
  lines: [
    {
      name: "",
      quantity: 1,
      price: 0,
      vatRateId: null,
      capitalInvestmentAccountId: null,
      vatAccountId: null,
      assets: [
        {
          inventoryNumber: "",
          name: "",
          initialCost: 0,
          faGroupId: null,
          okofId: null,
          assetAccountId: null,
        },
      ],
    },
  ],
};

const getFirstValidationError = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = getFirstValidationError(item);
      if (message) return message;
    }
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const message = getFirstValidationError(item);
      if (message) return message;
    }
  }
  return undefined;
};

const toPayload = (
  values: FaReceiptFormValues,
): FaReceiptPayload => ({
  docDate: values.docDate,
  counterpartyId: Number(values.counterpartyId),
  currencyId: Number(values.currencyId),
  receiptTypeId: Number(values.receiptTypeId),
  supplierAccountId: Number(values.supplierAccountId),
  lines: values.lines.map((line) => ({
    name: line.name.trim(),
    quantity: Number(line.quantity),
    price: Number(line.price),
    vatRateId: Number(line.vatRateId),
    capitalInvestmentAccountId: Number(line.capitalInvestmentAccountId),
    vatAccountId: Number(line.vatAccountId),
    assets: line.assets.map((asset) => ({
      inventoryNumber: asset.inventoryNumber.trim(),
      name: asset.name.trim(),
      initialCost: Number(asset.initialCost),
      faGroupId: Number(asset.faGroupId),
      okofId: Number(asset.okofId),
      assetAccountId: Number(asset.assetAccountId),
    })),
  })),
});

export default function FaReceiptFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;

  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canCreate = permissions.includes(faReceiptPermissions.create);
  const canUpdate = permissions.includes(faReceiptPermissions.update);
  const canConfirm = permissions.includes(faReceiptPermissions.confirm);
  const canCancel = permissions.includes(faReceiptPermissions.cancel);

  const detailQuery = useGetDetailFaReceipt(id);
  const createMutation = useCreateFaReceipt();
  const updateMutation = useUpdateFaReceipt();
  const confirmMutation = useConfirmFaReceipt();
  const cancelMutation = useCancelFaReceipt(id);

  const record = detailQuery.data;
  const statusId = record?.statusId ?? faDocumentStatusIds.draft;
  const isDraft = isCreate || statusId === faDocumentStatusIds.draft;
  const isPosted = statusId === faDocumentStatusIds.posted;
  const canSubmit = isCreate ? canCreate : isDraft && canUpdate;
  const listPath = "/main/fa/receipts";

  const initialValues = useMemo<FaReceiptFormValues>(
    () => ({
      docDate: record?.docDate ?? defaultValues.docDate,
      counterpartyId: record?.counterpartyId ?? defaultValues.counterpartyId,
      currencyId: record?.currencyId ?? defaultValues.currencyId,
      receiptTypeId: record?.receiptTypeId ?? defaultValues.receiptTypeId,
      supplierAccountId:
        record?.supplierAccountId ?? defaultValues.supplierAccountId,
      lines: record?.lines?.length ? record.lines : defaultValues.lines,
    }),
    [record],
  );

  const formik = useFormik<FaReceiptFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faReceiptSchema(t),
    onSubmit: async (values) => {
      try {
        await persistReceipt(values);
        toast.success(
          isCreate
            ? t("settings.messages.created")
            : t("settings.messages.updated"),
        );
        navigate(-1);
      } catch (error: unknown) {
        errorHandlers(error);
        throw error;
      }
    },
  });

  async function persistReceipt(
    values: FaReceiptFormValues,
  ): Promise<FaReceiptResponse> {
    const payload = toPayload(values);
    const savedId =
      !isCreate && id
        ? (await updateMutation.mutateAsync({ id, payload }), Number(id))
        : await createMutation.mutateAsync(payload);
    return { ...payload, id: savedId, statusId: faDocumentStatusIds.draft };
  }

  const validateReceipt = async () => {
    const errors = await formik.validateForm();
    if (!Object.keys(errors).length) return true;

    formik.setTouched(setNestedObjectValues(errors, true));
    toast.error(getFirstValidationError(errors) ?? t("common.requiredFields"));
    return false;
  };

  const handleConfirm = async () => {
    if (!(await validateReceipt())) return;

    try {
      await persistReceipt(formik.values);
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

  if (!isDraft && record) {
    return (
      <div className="w-full pb-2">
        <FaReceiptReadonlyView
          record={record}
          action={
            isPosted && canCancel ? (
              <Popconfirm
                title={t("actions.cancelConfirmTitle")}
                description={t("actions.cancelConfirmContent")}
                okText={t("actions.cancel")}
                cancelText={t("common.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() => handleCancelDocument()}
              >
                <Button
                  danger
                  icon={<Trash2 className="size-4" />}
                  loading={cancelMutation.isPending}
                >
                  {t("fa.actions.cancelDocument")}
                </Button>
              </Popconfirm>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-2">
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <fieldset disabled={!isDraft || !canSubmit} className="group">
          <FaReceiptFormFields
            formik={formik}
            isDraft={isDraft}
          />
        </fieldset>

        {isDraft && (
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
        )}
      </Form>
    </div>
  );
}
