import { Spin } from "antd";
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
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";

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
          // Create javobi — yalang'och id raqami, hujjat obyekti emas.
          const createdId = await createMutation.mutateAsync(values);
          toast.success(t("warehouse.messages.created"));
          navigate(`/main/warehouses/inventory-adjustments/${createdId}`, {
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

  /**
   * Saqlaydi va hujjat id'sini qaytaradi. Yangi hujjatda id hali yo'q, shuning
   * uchun uni tasdiqlash uchun aynan shu yerdan olish kerak.
   */
  const saveDraft = async (): Promise<string | number | null> => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      toast.error(t("warehouse.messages.fillRequired"));
      return null;
    }

    if (!isCreate) {
      await formik.submitForm();
      return id;
    }

    try {
      const createdId = await createMutation.mutateAsync(formik.values);
      toast.success(t("warehouse.messages.created"));
      navigate(`/main/warehouses/inventory-adjustments/${createdId}`, {
        replace: true,
      });
      return createdId;
    } catch (error) {
      errorHandlers(error);
      return null;
    }
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
                // Saqlanmagan hujjatni tasdiqlab bo'lmaydi: ilgari bu yerda
                // id'siz so'rov ketib, /inventory-adjustments//confirm 404
                // qaytarardi. Avval saqlaymiz va qaytgan id bilan tasdiqlaymiz.
                const confirmId = await saveDraft();
                if (confirmId === null) return;

                await confirmMutation.mutateAsync(confirmId);
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
            <AccountingEntriesButton
              block
              // Hujjat turisiz hisobot 1 (xarid) ga tushib qolardi va o'sha
              // id-li butunlay boshqa hujjatning provodkasini ko'rsatardi.
              documentTypeId={8}
              documentId={id}
              statusId={record?.statusId}
            >
              {t("app.routes.accountingEntries")}
            </AccountingEntriesButton>
          )}
        </div>
      </div>
    </div>
  );
}
