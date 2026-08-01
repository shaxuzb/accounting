import { Button, Spin } from "antd";
import { useFormik } from "formik";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import InventoryAdjustmentActions from "../components/InventoryAdjustmentActions";
import InventoryAdjustmentFormFields from "../components/InventoryAdjustmentFormFields";
import InventoryAdjustmentHeader from "../components/InventoryAdjustmentHeader";
import InventoryAdjustmentLinesEditor from "../components/InventoryAdjustmentLinesEditor";
import {
  useCancelInventoryAdjustment,
  useConfirmInventoryAdjustment,
  useCreateInventoryAdjustment,
  useGetDetailInventoryAdjustment,
  useUpdateInventoryAdjustment,
} from "../hooks";
import type { InventoryAdjustmentForm } from "../types/form";
import { inventoryAdjustmentSchema } from "../types/schema";
import {
  createDefaultAdjustmentForm,
  mapAdjustmentDetailToForm,
} from "../utils/inventoryAdjustment";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useTranslation } from "react-i18next";

export default function InventoryAdjustmentDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const detailQuery = useGetDetailInventoryAdjustment(id);
  const createMutation = useCreateInventoryAdjustment();
  const updateMutation = useUpdateInventoryAdjustment(id);
  const confirmMutation = useConfirmInventoryAdjustment(id);
  const cancelMutation = useCancelInventoryAdjustment(id);
  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || statusId === 1;

  const initialValues = useMemo<InventoryAdjustmentForm>(
    () =>
      isCreate
        ? createDefaultAdjustmentForm()
        : mapAdjustmentDetailToForm(record),
    [isCreate, record],
  );

  const formik = useFormik<InventoryAdjustmentForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: inventoryAdjustmentSchema,
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          const created = await createMutation.mutateAsync(values);
          toast.success(t("warehouse.messages.created"));
          navigate(`/main/warehouses/inventory-adjustments/${created.id}`, {
            replace: true,
          });
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
      <InventoryAdjustmentHeader
        record={record}
        isCreate={isCreate}
        onBack={() => navigate("..")}
      />

      <div className="grid gap-4 lg:grid-cols-[1.8fr_0.9fr]">
        <div className="space-y-4">
          <InventoryAdjustmentFormFields
            formik={formik}
            disabled={!isDraft}
          />
          <InventoryAdjustmentLinesEditor
            formik={formik}
            disabled={!isDraft}
          />
        </div>

        <div className="space-y-4">
          <InventoryAdjustmentActions
            isDraft={isDraft}
            saving={createMutation.isPending || updateMutation.isPending}
            confirming={confirmMutation.isPending}
            cancelling={cancelMutation.isPending}
            onSave={() => void saveDraft()}
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
            <Button
              block
              onClick={() => navigate(`/main/accountingentriesreport?documentId=${id}`)}
            >
              {t("app.routes.accountingEntries")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
