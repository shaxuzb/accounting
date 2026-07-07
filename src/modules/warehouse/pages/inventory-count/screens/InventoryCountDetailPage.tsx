import { Button, Form, Table, type TableColumnsType, Spin } from "antd";
import { useFormik } from "formik";
import { ArrowLeft, CheckCircle2, CircleX, Save } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router";
import dayjs from "@/config/dayjs";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import InventoryCountLinesEditor from "@/modules/warehouse/pages/components/InventoryCountLinesEditor";
import type { InventoryCountForm } from "../types/form";
import type { InventoryCountDifference } from "../types/type";
import { inventoryCountSchema } from "../types/schema";
import {
  useCancelInventoryCount,
  useConfirmInventoryCount,
  useCreateInventoryCount,
  useGetDetailInventoryCount,
  useGetInventoryCountDifferences,
  useUpdateInventoryCount,
} from "../hooks";

const defaultValues: InventoryCountForm = {
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  warehouseId: null,
  comment: "",
  isCountCompleted: false,
  lines: [
    {
      productId: null,
      unitId: null,
      countedQuantity: null,
      defaultCostPrice: null,
      comment: "",
      items: [
        {
          productTableId: null,
          barcode: "",
          serialNumber: "",
          markingNumber: "",
          costPrice: null,
        },
      ],
    },
  ],
};

export default function InventoryCountDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [showDifferences, setShowDifferences] = useState(false);
  const isCreate = !id;
  const detailQuery = useGetDetailInventoryCount(id);
  const differencesQuery = useGetInventoryCountDifferences(id, showDifferences);
  const createMutation = useCreateInventoryCount();
  const updateMutation = useUpdateInventoryCount(id);
  const confirmMutation = useConfirmInventoryCount(id);
  const cancelMutation = useCancelInventoryCount(id);
  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || statusId === 1;

  const initialValues = useMemo<InventoryCountForm>(
    () => ({
      docDate: record?.docDate ?? defaultValues.docDate,
      warehouseId: record?.warehouseId ?? null,
      comment: record?.comment ?? "",
      isCountCompleted: record?.isCountCompleted ?? false,
      lines:
        record?.lines?.map((line) => ({
          productId: line.productId ?? null,
          unitId: line.unitId ?? null,
          countedQuantity: line.countedQuantity ?? null,
          defaultCostPrice: line.defaultCostPrice ?? null,
          comment: line.comment ?? "",
          items:
            line.items?.map((item) => ({
              productTableId: item.productTableId ?? null,
              barcode: item.barcode ?? "",
              serialNumber: item.serialNumber ?? "",
              markingNumber: item.markingNumber ?? "",
              costPrice: item.costPrice ?? null,
            })) ?? defaultValues.lines[0].items,
        })) ?? defaultValues.lines,
    }),
    [record],
  );

  const formik = useFormik<InventoryCountForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: inventoryCountSchema,
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          const created = await createMutation.mutateAsync(values);
          toast.success("Hujjat yaratildi");
          navigate(`/main/warehouses/inventory-counts/${created.id}`, {
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

  const differenceColumns: TableColumnsType<InventoryCountDifference> = [
    {
      dataIndex: "productName",
      title: "Mahsulot",
      render: (_, record) => record.productName ?? record.productId,
    },
    {
      dataIndex: "expectedQuantity",
      title: "Kutilgan",
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "countedQuantity",
      title: "Sanalgan",
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "missingQuantity",
      title: "Kam",
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "foundQuantity",
      title: "Ortiqcha",
      align: "center",
      render: (value) => numberSpacing(value),
    },
  ];

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
            <div className="text-sm text-muted-foreground">Inventory count</div>
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
            <InventoryCountLinesEditor
              lines={formik.values.lines}
              onChange={(lines) => formik.setFieldValue("lines", lines, true)}
              isCountCompleted={formik.values.isCountCompleted}
              onCountCompletedChange={(value) =>
                formik.setFieldValue("isCountCompleted", value, true)
              }
              disabled={!isDraft}
            />
          </div>
          {!isCreate && showDifferences && (
            <div className="mt-4">
              <Table<InventoryCountDifference>
                size="small"
                columns={differenceColumns}
                dataSource={generateKeyTable(differencesQuery.data ?? [], "productId")}
                loading={differencesQuery.isLoading || differencesQuery.isFetching}
                pagination={false}
                scroll={{ x: "max-content" }}
              />
            </div>
          )}
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
              <Button block onClick={() => setShowDifferences((current) => !current)}>
                {showDifferences ? "Farqlarni yashirish" : "Farqni ko'rish"}
              </Button>
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
          {!!record?.positiveAdjustmentDocId && (
            <Link
              to={`/main/warehouses/inventory-adjustments/${record.positiveAdjustmentDocId}`}
            >
              <Button block>Musbat tuzatish hujjati</Button>
            </Link>
          )}
          {!!record?.negativeAdjustmentDocId && (
            <Link
              to={`/main/warehouses/inventory-adjustments/${record.negativeAdjustmentDocId}`}
            >
              <Button block>Manfiy tuzatish hujjati</Button>
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}
