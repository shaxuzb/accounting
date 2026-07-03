import { Button, Form, Select, Spin } from "antd";
import { useFormik } from "formik";
import { ArrowLeft, CheckCircle2, CircleX, Save } from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import dayjs from "@/config/dayjs";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import WarehouseDocumentLinesEditor from "@/modules/warehouse/shared/components/WarehouseDocumentLinesEditor";
import type { InventoryAdjustmentForm } from "../types/form";
import { inventoryAdjustmentSchema } from "../types/schema";
import {
  useCancelInventoryAdjustment,
  useConfirmInventoryAdjustment,
  useCreateInventoryAdjustment,
  useGetDetailInventoryAdjustment,
  useUpdateInventoryAdjustment,
} from "../hooks";

const adjustmentTypeOptions = [
  { value: "Increase", label: "Ko'paytirish" },
  { value: "Decrease", label: "Kamaytirish" },
];

const defaultValues: InventoryAdjustmentForm = {
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  warehouseId: null,
  adjustmentType: "Decrease",
  comment: "",
  lines: [
    {
      productId: null,
      unitId: null,
      quantity: null,
      comment: "",
      items: [{ productTableId: null, costPrice: null }],
    },
  ],
};

export default function InventoryAdjustmentDetailPage() {
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
    () => ({
      docDate: record?.docDate ?? defaultValues.docDate,
      warehouseId: record?.warehouseId ?? null,
      adjustmentType: record?.adjustmentType ?? "Decrease",
      comment: record?.comment ?? "",
      lines:
        record?.lines?.map((line) => ({
          productId: line.productId ?? null,
          unitId: line.unitId ?? null,
          quantity: line.quantity ?? null,
          comment: line.comment ?? "",
          items:
            line.items?.map((item) => ({
              productTableId: item.productTableId ?? null,
              costPrice: item.costPrice ?? null,
            })) ?? [{ productTableId: null, costPrice: null }],
        })) ?? defaultValues.lines,
    }),
    [record],
  );

  const formik = useFormik<InventoryAdjustmentForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: inventoryAdjustmentSchema,
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          const created = await createMutation.mutateAsync(values);
          toast.success("Hujjat yaratildi");
          navigate(`/main/warehouses/inventory-adjustments/${created.id}`, {
            replace: true,
          });
          return;
        }
        await updateMutation.mutateAsync(values);
        toast.success("Hujjat saqlandi");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Inventory adjustment</div>
            <div className="text-lg font-semibold">
              {record?.docNumber ?? "Yangi hujjat"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCreate && (
              <ProcessStatusBadge
                statusId={record?.statusId}
                statusName={record?.statusName}
              />
            )}
            <Button icon={<ArrowLeft className="size-4" />} onClick={() => navigate("..")}>
              Orqaga
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.8fr_0.9fr]">
        <Card className="p-4">
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectDate
                formik={formik}
                fieldName="docDate"
                label="bank.fields.date"
                disabled={!isDraft}
              />
              <SelectCustom
                formik={formik}
                fieldName="warehouseId"
                label="settings.entities.warehouse"
                path={selectListEndpoints.warehousesSelectList}
                disabled={!isDraft}
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Tuzatish turi</label>
                <Select
                  value={formik.values.adjustmentType}
                  options={adjustmentTypeOptions}
                  disabled={!isDraft}
                  onChange={(value) => formik.setFieldValue("adjustmentType", value, true)}
                />
              </div>
              <div className="md:col-span-2">
                <InputText
                  formik={formik}
                  fieldName="comment"
                  label="bank.fields.comment"
                  disabled={!isDraft}
                />
              </div>
            </div>
          </Form>
          <div className="mt-4">
            <WarehouseDocumentLinesEditor
              lines={formik.values.lines}
              onChange={(lines) => formik.setFieldValue("lines", lines, true)}
              disabled={!isDraft}
            />
          </div>
        </Card>

        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">Amallar</div>
          <Button
            block
            icon={<Save className="size-4" />}
            onClick={() => void formik.submitForm()}
            disabled={!isDraft}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            Saqlash
          </Button>
          {!isCreate && (
            <>
              <Button
                type="primary"
                block
                icon={<CheckCircle2 className="size-4" />}
                onClick={async () => {
                  try {
                    await confirmMutation.mutateAsync();
                    toast.success("Hujjat tasdiqlandi");
                  } catch (error) {
                    errorHandlers(error);
                  }
                }}
                disabled={!isDraft}
                loading={confirmMutation.isPending}
              >
                Tasdiqlash
              </Button>
              <Button
                danger
                block
                icon={<CircleX className="size-4" />}
                onClick={async () => {
                  try {
                    await cancelMutation.mutateAsync();
                    toast.success("Hujjat bekor qilindi");
                  } catch (error) {
                    errorHandlers(error);
                  }
                }}
                disabled={!isDraft}
                loading={cancelMutation.isPending}
              >
                Bekor qilish
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
