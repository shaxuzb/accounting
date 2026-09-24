import { Spin } from "antd";
import { setNestedObjectValues, useFormik } from "formik";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import WarehouseTransferActions from "../components/WarehouseTransferActions";
import WarehouseTransferFormFields from "../components/WarehouseTransferFormFields";
import WarehouseTransferHeader from "../components/WarehouseTransferHeader";
import WarehouseTransferLinesEditor from "../components/WarehouseTransferLinesEditor";
import {
  useCancelWarehouseTransfer,
  useConfirmWarehouseTransfer,
  useCreateWarehouseTransfer,
  useGetDetailWarehouseTransfer,
  useUpdateWarehouseTransfer,
} from "../hooks";
import type { WarehouseTransferForm } from "../types/form";
import { warehouseTransferSchema } from "../types/schema";
import {
  createDefaultTransferForm,
  mapTransferDetailToForm,
} from "../utils/transfer";
import { useTranslation } from "react-i18next";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";

export default function WarehouseTransferDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const detailQuery = useGetDetailWarehouseTransfer(id);
  const createMutation = useCreateWarehouseTransfer();
  const updateMutation = useUpdateWarehouseTransfer(id);
  const confirmMutation = useConfirmWarehouseTransfer(id);
  const cancelMutation = useCancelWarehouseTransfer(id);
  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || statusId === 1;
  const isPosted = !isCreate && statusId === 2;

  const initialValues = useMemo<WarehouseTransferForm>(
    () =>
      isCreate ? createDefaultTransferForm() : mapTransferDetailToForm(record),
    [isCreate, record],
  );

  const formik = useFormik<WarehouseTransferForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: warehouseTransferSchema,
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          await createMutation.mutateAsync(values);
          toast.success(t("warehouse.messages.created"));
          navigate(`/main/warehouses/transfers`, { replace: true });
          return;
        }

        await updateMutation.mutateAsync(values);
        toast.success(t("warehouse.messages.saved"));
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      // Mark the invalid fields, lines included, so they show what is missing.
      formik.setTouched(setNestedObjectValues(errors, true));
      toast.error(t("warehouse.messages.fillRequired"));
      return false;
    }
    await formik.submitForm();
    return true;
  };

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <WarehouseTransferHeader
        record={record}
        isCreate={isCreate}
        onBack={() => navigate("..")}
      />

      <div className="grid gap-4 lg:grid-cols-[1.8fr_0.9fr]">
        <div className="space-y-4">
          <WarehouseTransferFormFields formik={formik} disabled={!isDraft} />
          <WarehouseTransferLinesEditor formik={formik} disabled={!isDraft} />
        </div>

        <div className="space-y-4">
          <WarehouseTransferActions
            isDraft={isDraft}
            isSaved={!isCreate}
            saving={createMutation.isPending || updateMutation.isPending}
            confirming={confirmMutation.isPending}
            cancelling={cancelMutation.isPending}
            isPosted={isPosted}
            onSave={() => saveDraft()}
            onConfirm={async () => {
              try {
                await confirmMutation.mutateAsync();
                toast.success(t("warehouse.messages.confirmed"));
              } catch (error) {
                errorHandlers(error);
              }
            }}
            onCancel={async () => {
              try {
                await cancelMutation.mutateAsync();
                toast.success(t("warehouse.messages.cancelled"));
              } catch (error) {
                errorHandlers(error);
              }
            }}
          />

          {!isCreate && (
            <Card className="p-4">
              <div className="text-sm font-semibold">
                {t("warehouse.transfer.additional")}
              </div>
              <div className="mt-3 space-y-2">
                <AccountingEntriesButton
                  block
                  documentTypeId={18}
                  documentId={id}
                  statusId={record?.statusId}
                >
                  {t("app.routes.accountingEntries")}
                </AccountingEntriesButton>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
