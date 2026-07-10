import { Button, Spin } from "antd";
import { useFormik } from "formik";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router";
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

export default function WarehouseTransferDetailPage() {
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
          toast.success("Hujjat yaratildi");
          navigate(`/main/warehouses/transfers`, { replace: true });
          return;
        }

        await updateMutation.mutateAsync(values);
        toast.success("Hujjat saqlandi");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      toast.error("Iltimos, majburiy maydonlarni to'ldiring");
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
            saving={createMutation.isPending || updateMutation.isPending}
            confirming={confirmMutation.isPending}
            cancelling={cancelMutation.isPending}
            onSave={() => saveDraft()}
            onConfirm={async () => {
              try {
                await confirmMutation.mutateAsync();
                toast.success("Hujjat tasdiqlandi");
              } catch (error) {
                errorHandlers(error);
              }
            }}
            onCancel={async () => {
              try {
                await cancelMutation.mutateAsync();
                toast.success("Hujjat bekor qilindi");
              } catch (error) {
                errorHandlers(error);
              }
            }}
          />

          {!isCreate && (
            <Card className="p-4">
              <div className="text-sm font-semibold">Qo'shimcha</div>
              <div className="mt-3 space-y-2">
                <Link to={`/main/accountingentriesreport?documentId=${id}`}>
                  <Button block>Provodka</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
