import {
  ArrowLeft,
  CheckCircle2,
  CircleX,
  Save,
  ScrollText,
} from "lucide-react";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Space,
  Spin,
  Tabs,
  Table,
  Tag,
} from "antd";
import dayjs from "@/config/dayjs";
import type { TableColumnsType } from "antd";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import InventoryCountLinesEditor from "@/modules/warehouse/pages/components/InventoryCountLinesEditor";
import {
  useCancelInventoryCount,
  useConfirmInventoryCount,
  useCreateInventoryCount,
  useGetDetailInventoryCount,
  useGetInventoryCountDifferences,
  useGetInventoryCountInventoryMovements,
  useGetInventoryCountPostingBatches,
  useUpdateInventoryCount,
} from "../hooks";
import type {
  InventoryCountCreatePayload,
  InventoryCountForm,
  InventoryCountUpdatePayload,
} from "../types/form";
import type { InventoryCountDifference } from "../types/type";
import {
  inventoryCountCreateSchema,
  inventoryCountUpdateSchema,
} from "../types/schema";

type JsonRecord = Record<string, unknown>;

const defaultValues: InventoryCountForm = {
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  warehouseId: null,
  stateId: 1,
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
          barcode: null,
          serialNumber: null,
          markingNumber: null,
          costPrice: null,
        },
      ],
    },
  ],
};

const getDifferenceStatus = (
  difference: InventoryCountDifference,
): string => {
  const missing = difference.missingQuantity ?? 0;
  const found = difference.foundQuantity ?? 0;
  if (missing > 0) return "Kam chiqqan";
  if (found > 0) return "Ortiq chiqqan";
  return "Farq yo'q";
};

const buildJsonTableColumns = (rows: JsonRecord[]) =>
  Array.from(
    new Set(rows.flatMap((row) => Object.keys(row))),
  ).map((key) => ({
    dataIndex: key,
    title: key,
    render: (value: unknown) =>
      value === null || value === undefined ? "-" : String(value),
  }));

const buildJsonRows = (rows: JsonRecord[] | undefined): (JsonRecord & { key: string })[] =>
  (rows ?? []).map((row, index) => ({ ...row, key: `${index}` }));

export default function InventoryCountDetailPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const isCreate = location.pathname.endsWith("/add");
  const isEditMode = location.pathname.endsWith("/edit");
  const safeId = isCreate ? undefined : id;
  const queryId = safeId ?? "";

  const activeTab = searchParams.get("tab") ?? "general";
  const action = searchParams.get("action");
  const detailQuery = useGetDetailInventoryCount(queryId);
  const differencesQuery = useGetInventoryCountDifferences(
    queryId,
    activeTab === "differences",
  );
  const postingBatchesQuery = useGetInventoryCountPostingBatches(
    queryId,
    activeTab === "posting-batches",
  );
  const inventoryMovementsQuery = useGetInventoryCountInventoryMovements(
    queryId,
    activeTab === "inventory-movements",
  );

  const createMutation = useCreateInventoryCount();
  const updateMutation = useUpdateInventoryCount(queryId);
  const confirmMutation = useConfirmInventoryCount(queryId);
  const cancelMutation = useCancelInventoryCount(queryId);

  const record = detailQuery.data;

  const isPosted = Boolean(record?.postedAt);
  const isCancelled = Boolean(record?.cancelledAt);
  const canEdit =
    isCreate || (isEditMode && !isPosted && !isCancelled);
  const canConfirm =
    Boolean(record?.isCountCompleted) &&
    !isPosted &&
    !isCancelled &&
    !isCreate;
  const canCancel = !isPosted && !isCancelled && !isCreate;

  const initialValues = useMemo<InventoryCountForm>(() => {
    if (isCreate || !record) {
      return defaultValues;
    }

    return {
      docDate: record.docDate,
      warehouseId: record.warehouseId,
      stateId: record.stateId ?? defaultValues.stateId,
      comment: record.comment ?? "",
      isCountCompleted: record.isCountCompleted ?? false,
      lines:
        record.lines?.map((line) => ({
          productId: line.productId,
          unitId: line.unitId,
          countedQuantity: line.countedQuantity,
          defaultCostPrice: line.defaultCostPrice,
          comment: line.comment ?? "",
          items:
            line.items?.map((item) => ({
              productTableId: item.productTableId,
              barcode: item.barcode ?? null,
              serialNumber: item.serialNumber ?? null,
              markingNumber: item.markingNumber ?? null,
              costPrice: item.costPrice,
            })) ?? defaultValues.lines[0].items,
        })) ?? defaultValues.lines,
    };
  }, [isCreate, record]);

  const toCreatePayload = (values: InventoryCountForm): InventoryCountCreatePayload => ({
    docDate: values.docDate,
    warehouseId: values.warehouseId,
    comment: values.comment ?? "",
    isCountCompleted: values.isCountCompleted,
    lines: values.lines,
  });

  const toUpdatePayload = (
    values: InventoryCountForm,
    isCountCompleted = values.isCountCompleted,
  ): InventoryCountUpdatePayload => ({
    docDate: values.docDate,
    warehouseId: values.warehouseId,
    comment: values.comment ?? "",
    isCountCompleted,
    lines: values.lines,
    stateId: values.stateId ?? defaultValues.stateId ?? 1,
  });

  const formik = useFormik<InventoryCountForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: isCreate
      ? inventoryCountCreateSchema
      : inventoryCountUpdateSchema,
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          const created = await createMutation.mutateAsync(toCreatePayload(values));
          toast.success("Hujjat saqlandi");
          navigate(`/main/warehouses/inventory-counts/${created.id}`, {
            replace: true,
          });
          return;
        }

        await updateMutation.mutateAsync(toUpdatePayload(values));
        toast.success("Hujjat saqlandi");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const clearAction = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("action");
    setSearchParams(next, { replace: true });
  };

  const updateActiveTab = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", key);
    setSearchParams(next, { replace: true });
  };

  const closeActionModals = () => {
    setIsConfirmOpen(false);
    setIsCancelConfirmOpen(false);
    clearAction();
  };

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      toast.error("Iltimos, majburiy maydonlarni to'ldiring");
      return false;
    }
    await formik.submitForm();
    return true;
  };

  const finalizeCounting = async () => {
    if (isCompleting || isCreate || !record) return;
    setIsCompleting(true);
    try {
      await formik.setFieldValue("isCountCompleted", true, true);
      await updateMutation.mutateAsync({
        ...toUpdatePayload(formik.values, true),
      });
      toast.success("Sanoq tugatildi");
    } catch (error) {
      errorHandlers(error);
    } finally {
      setIsCompleting(false);
    }
  };

  const differences = useMemo(
    () => differencesQuery.data ?? [],
    [differencesQuery.data],
  );
  const differenceSummary = useMemo(() => {
    let missingCount = 0;
    let extraCount = 0;
    let equalCount = 0;

    differences.forEach((item) => {
      const missing = item.missingQuantity ?? 0;
      const found = item.foundQuantity ?? 0;
      if (missing > 0) missingCount += 1;
      if (found > 0) extraCount += 1;
      if (missing <= 0 && found <= 0) equalCount += 1;
    });

    return {
      missingCount,
      extraCount,
      equalCount,
    };
  }, [differences]);

  const differenceColumns: TableColumnsType<InventoryCountDifference> = [
    {
      dataIndex: "productName",
      title: "Mahsulot",
      render: (_, record) => record.productName ?? record.productId,
    },
    {
      dataIndex: "unitName",
      title: "Birlik",
      align: "center",
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
      dataIndex: "correctQuantity",
      title: "To'g'rilangan",
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "missingQuantity",
      title: "Kam chiqqan",
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "foundQuantity",
      title: "Ortiqchi",
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "status",
      title: "Status",
      align: "center",
      render: (_, record) => getDifferenceStatus(record),
    },
  ];

  const postingBatches = useMemo(
    () =>
      buildJsonRows(postingBatchesQuery.data as JsonRecord[] | undefined),
    [postingBatchesQuery.data],
  );

  const movementRows = useMemo(
    () =>
      buildJsonRows(
        inventoryMovementsQuery.data as JsonRecord[] | undefined,
      ),
    [inventoryMovementsQuery.data],
  );

  const postingBatchesColumns = useMemo(
    () =>
      buildJsonTableColumns(postingBatchesQuery.data as JsonRecord[] | undefined),
    [postingBatchesQuery.data],
  );

  const movementsColumns = useMemo(
    () =>
      buildJsonTableColumns(
        inventoryMovementsQuery.data as JsonRecord[] | undefined,
      ),
    [inventoryMovementsQuery.data],
  );

  const isConfirmDialogOpen = canConfirm && (action === "confirm" || isConfirmOpen);
  const isCancelDialogOpen = canCancel && (action === "cancel" || isCancelConfirmOpen);

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
            <div className="text-sm text-muted-foreground">Inventarizatsiya</div>
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
            <Button
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate("..")}
            >
              Orqaga
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.8fr_0.9fr]">
        <Card className="space-y-3 p-4">
          <Tabs
            activeKey={activeTab}
            items={[
              {
                key: "general",
                label: "Umumiy ma'lumot",
                children: (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Hujjat raqami</div>
                      <div className="font-medium">
                        {record?.docNumber ?? "Yaratilmoqda"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Hujjat sanasi</div>
                      <div className="font-medium">
                        {record?.docDate ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="font-medium">
                        {record?.statusName ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Holat</div>
                      <div className="font-medium">
                        {record?.stateName ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Ombor</div>
                      <div className="font-medium">
                        {record?.warehouseName ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Sanoq holati</div>
                      <div className="font-medium">
                        {record?.isCountCompleted ? "Sanoq tugallangan" : "Sanoq jarayonida"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Yaratilgan sana</div>
                      <div className="font-medium">
                        {record?.createdDate ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Yuborilgan</div>
                      <div className="font-medium">
                        {record?.postedAt ?? "Yuborilmagan"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Bekor qilingan</div>
                      <div className="font-medium">
                        {record?.cancelledAt ?? "Bekor qilinmagan"}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "products",
                label: "Mahsulotlar",
                children: (
                  <>
                    <Form layout="vertical" onFinish={formik.handleSubmit}>
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <SelectDate
                            formik={formik}
                            fieldName="docDate"
                            label="Sana"
                            disabled={!canEdit}
                          />
                        </Col>
                        <Col span={12}>
                          <SelectCustom
                            formik={formik}
                            fieldName="warehouseId"
                            label="Ombor"
                            path={selectListEndpoints.warehousesSelectList}
                            disabled={!canEdit}
                          />
                        </Col>
                        <Col span={12}>
                          <InputText
                            formik={formik}
                            fieldName="comment"
                            label="Izoh"
                            disabled={!canEdit}
                          />
                        </Col>
                      </Row>
                    </Form>
                    <div className="mt-4">
                      <InventoryCountLinesEditor
                        lines={formik.values.lines}
                        onChange={(lines) => formik.setFieldValue("lines", lines, true)}
                        isCountCompleted={formik.values.isCountCompleted}
                        onCountCompletedChange={(value) =>
                          formik.setFieldValue("isCountCompleted", value, true)
                        }
                        disabled={!canEdit}
                      />
                    </div>
                  </>
                ),
              },
              {
                key: "differences",
                label: "Farqlar",
                children: (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Tag color="orange">
                        Kam chiqqan: {differenceSummary.missingCount}
                      </Tag>
                      <Tag color="green">
                        Ortiq chiqqan: {differenceSummary.extraCount}
                      </Tag>
                      <Tag color="blue">
                        Farqsiz: {differenceSummary.equalCount}
                      </Tag>
                    </div>
                    <Table<InventoryCountDifference>
                      size="small"
                      columns={differenceColumns}
                      dataSource={generateKeyTable(differences, "productId")}
                      loading={
                        differencesQuery.isLoading || differencesQuery.isFetching
                      }
                      pagination={false}
                      scroll={{ x: "max-content" }}
                      expandable={{
                        expandedRowRender: (row) => (
                          <div className="space-y-3">
                            <div>
                              <div className="font-semibold text-sm">
                                missingProductTableIds
                              </div>
                              <div>
                                {row.missingProductTableIds?.length
                                  ? row.missingProductTableIds.join(", ")
                                  : "Mavjud emas"}
                              </div>
                            </div>
                            <Table<JsonRecord>
                              size="small"
                              pagination={false}
                              rowKey="key"
                              dataSource={buildJsonRows(
                                row.foundItems as unknown as JsonRecord[] | undefined,
                              )}
                              columns={[
                                { dataIndex: "productTableId", title: "ProductTableId" },
                                { dataIndex: "barcode", title: "Barcode" },
                                { dataIndex: "serialNumber", title: "Serial" },
                                { dataIndex: "markingNumber", title: "Marking" },
                                {
                                  dataIndex: "costPrice",
                                  title: "Cost price",
                                  render: (value) => numberSpacing(value),
                                },
                              ]}
                            />
                          </div>
                        ),
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "posting-batches",
                label: "Provodkalar",
                children: (
                  <div className="space-y-3">
                    <Table<JsonRecord>
                      rowKey="key"
                      columns={postingBatchesColumns}
                      dataSource={postingBatches}
                      loading={
                        postingBatchesQuery.isLoading ||
                        postingBatchesQuery.isFetching
                      }
                      pagination={false}
                      locale={{ emptyText: "Ma'lumot yo'q" }}
                    />
                  </div>
                ),
              },
              {
                key: "inventory-movements",
                label: "Qoldiq harakati",
                children: (
                  <div className="space-y-3">
                    <Table<JsonRecord>
                      rowKey="key"
                      columns={movementsColumns}
                      dataSource={movementRows}
                      loading={
                        inventoryMovementsQuery.isLoading ||
                        inventoryMovementsQuery.isFetching
                      }
                      pagination={false}
                      locale={{ emptyText: "Ma'lumot yo'q" }}
                    />
                  </div>
                ),
              },
            ]}
            onChange={updateActiveTab}
          />
        </Card>

        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">Amallar</div>
          <Button
            block
            icon={<Save className="size-4" />}
            onClick={() => void saveDraft()}
            disabled={!canEdit}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isCreate ? "Qoralama saqlash" : "Saqlash"}
          </Button>
          {!isCreate && (
            <>
              <Button
                type="default"
                block
                icon={<ScrollText className="size-4" />}
                onClick={() => void finalizeCounting()}
                disabled={!canEdit || formik.values.isCountCompleted}
                loading={isCompleting || updateMutation.isPending}
              >
                Sanoqni yakunlash
              </Button>
              {canConfirm && (
                <Button
                  type="primary"
                  block
                  icon={<CheckCircle2 className="size-4" />}
                  onClick={() => setIsConfirmOpen(true)}
                  loading={confirmMutation.isPending}
                >
                  Tasdiqlash
                </Button>
              )}
              {canCancel && (
                <Button
                  danger
                  block
                  icon={<CircleX className="size-4" />}
                  onClick={() => setIsCancelConfirmOpen(true)}
                  loading={cancelMutation.isPending}
                >
                  Bekor qilish
                </Button>
              )}
            </>
          )}
          <div className="space-y-1.5 pt-1">
            <div className="text-sm font-semibold">Yaratilgan tuzatish hujjatlari</div>
            <Space direction="vertical" className="w-full">
              {record?.positiveAdjustmentDocId ? (
                <Link
                  to={`/main/warehouses/inventory-adjustments/${record.positiveAdjustmentDocId}`}
                >
                  <Button block>{`Musbat: ${record.positiveAdjustmentDocId}`}</Button>
                </Link>
              ) : (
                <Button block disabled>
                  Musbat: yaratilmagan
                </Button>
              )}
              {record?.negativeAdjustmentDocId ? (
                <Link
                  to={`/main/warehouses/inventory-adjustments/${record.negativeAdjustmentDocId}`}
                >
                  <Button block>{`Manfiy: ${record.negativeAdjustmentDocId}`}</Button>
                </Link>
              ) : (
                <Button block disabled>
                  Manfiy: yaratilmagan
                </Button>
              )}
            </Space>
          </div>
        </Card>
      </div>

      <Modal
        title="Inventarizatsiyani tasdiqlash"
        open={isConfirmDialogOpen}
        onCancel={closeActionModals}
        confirmLoading={confirmMutation.isPending}
        onOk={async () => {
          try {
            await confirmMutation.mutateAsync();
            toast.success("Inventarizatsiya tasdiqlandi");
            closeActionModals();
          } catch (error) {
            errorHandlers(error);
          }
        }}
      >
        <div className="space-y-2">
          <p>
            Inventarizatsiyani tasdiqlaysizmi? Bu amal farqlar asosida qoldiqni
            avtomatik to'g'rilaydi. Kam chiqqan mahsulotlar uchun negative
            adjustment, ortiq chiqqan mahsulotlar uchun positive adjustment
            yaratiladi.
          </p>
        </div>
      </Modal>

      <Modal
        title="Inventarizatsiyani bekor qilish"
        open={isCancelDialogOpen}
        onCancel={closeActionModals}
        confirmLoading={cancelMutation.isPending}
        onOk={async () => {
          try {
            await cancelMutation.mutateAsync();
            toast.success("Hujjat bekor qilindi");
            closeActionModals();
          } catch (error) {
            errorHandlers(error);
          }
        }}
      >
        <div className="space-y-2">
          <p>Inventarizatsiyani bekor qilmoqchimisiz?</p>
        </div>
      </Modal>
    </div>
  );
}
