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
import { useTranslation } from "react-i18next";
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

const createDefaultValues = (): InventoryCountForm => ({
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
});

const getDifferenceStatusKey = (
  difference: InventoryCountDifference,
): string => {
  const missing = difference.missingQuantity ?? 0;
  const found = difference.foundQuantity ?? 0;
  if (missing > 0) return "warehouse.count.shortage";
  if (found > 0) return "warehouse.count.surplus";
  return "warehouse.count.noDifference";
};

const buildJsonTableColumns = (rows: JsonRecord[] = []) =>
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
  const { t } = useTranslation();
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
      return createDefaultValues();
    }

    return {
      docDate: record.docDate,
      warehouseId: record.warehouseId,
      stateId: record.stateId ?? createDefaultValues().stateId,
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
            })) ?? createDefaultValues().lines[0].items,
        })) ?? createDefaultValues().lines,
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
    stateId: values.stateId ?? createDefaultValues().stateId ?? 1,
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
          // Create javobi — yalang'och id raqami, hujjat obyekti emas.
          const createdId = await createMutation.mutateAsync(
            toCreatePayload(values),
          );
          toast.success(t("warehouse.messages.saved"));
          navigate(`/main/warehouses/inventory-counts/${createdId}`, {
            replace: true,
          });
          return;
        }

        await updateMutation.mutateAsync(toUpdatePayload(values));
        toast.success(t("warehouse.messages.saved"));
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
      toast.error(t("warehouse.messages.fillRequired"));
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
      toast.success(t("warehouse.messages.countCompleted"));
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
      title: t("warehouse.fields.productName"),
      render: (_, record) => record.productName ?? record.productId,
    },
    {
      dataIndex: "unitName",
      title: t("purchase.fields.unit"),
      align: "center",
    },
    {
      dataIndex: "expectedQuantity",
      title: t("warehouse.count.expected"),
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "countedQuantity",
      title: t("warehouse.count.counted"),
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "correctQuantity",
      title: t("warehouse.count.corrected"),
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "missingQuantity",
      title: t("warehouse.count.shortage"),
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "foundQuantity",
      title: t("warehouse.count.surplus"),
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      dataIndex: "status",
      title: t("settings.fields.status"),
      align: "center",
      render: (_, record) => t(getDifferenceStatusKey(record)),
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
            <div className="text-sm text-muted-foreground">
              {t("warehouse.count.title")}
            </div>
            <div className="text-lg font-semibold">
              {record?.docNumber ?? t("payroll.common.newDocument")}
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
              {t("common.back")}
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
                label: t("warehouse.count.generalInfo"),
                children: (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("warehouse.fields.documentNumber")}
                      </div>
                      <div className="font-medium">
                        {record?.docNumber ?? t("warehouse.count.creating")}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("warehouse.fields.documentDate")}
                      </div>
                      <div className="font-medium">
                        {record?.docDate ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("settings.fields.status")}
                      </div>
                      <div className="font-medium">
                        {record?.statusName ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("warehouse.count.state")}
                      </div>
                      <div className="font-medium">
                        {record?.stateName ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("menu.warehouse")}
                      </div>
                      <div className="font-medium">
                        {record?.warehouseName ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("warehouse.fields.countStatus")}
                      </div>
                      <div className="font-medium">
                        {record?.isCountCompleted
                          ? t("warehouse.count.countCompletedLabel")
                          : t("warehouse.count.countInProgressLabel")}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("warehouse.fields.createdDate")}
                      </div>
                      <div className="font-medium">
                        {record?.createdDate ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("warehouse.count.posted")}
                      </div>
                      <div className="font-medium">
                        {record?.postedAt ?? t("warehouse.count.notPosted")}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("warehouse.count.cancelledAt")}
                      </div>
                      <div className="font-medium">
                        {record?.cancelledAt ?? t("warehouse.count.notCancelled")}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "products",
                label: t("products.title"),
                children: (
                  <>
                    <Form layout="vertical" onFinish={formik.handleSubmit}>
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <SelectDate
                            formik={formik}
                            fieldName="docDate"
                            label="warehouse.fields.documentDate"
                            disabled={!canEdit}
                          />
                        </Col>
                        <Col span={12}>
                          <SelectCustom
                            formik={formik}
                            fieldName="warehouseId"
                            label="purchase.fields.warehouse"
                            path={selectListEndpoints.warehousesSelectList}
                            disabled={!canEdit}
                          />
                        </Col>
                        <Col span={12}>
                          <InputText
                            formik={formik}
                            fieldName="comment"
                            label={t("openingInventory.fields.comment")}
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
                        warehouseId={formik.values.warehouseId}
                        disabled={!canEdit}
                      />
                    </div>
                  </>
                ),
              },
              {
                key: "differences",
                label: t("warehouse.count.differences"),
                children: (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Tag color="orange">
                        {t("warehouse.count.shortage")}: {differenceSummary.missingCount}
                      </Tag>
                      <Tag color="green">
                        {t("warehouse.count.surplus")}: {differenceSummary.extraCount}
                      </Tag>
                      <Tag color="blue">
                        {t("warehouse.count.equal")}: {differenceSummary.equalCount}
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
                                {t("warehouse.count.missingProductTableIds")}
                              </div>
                              <div>
                                {row.missingProductTableIds?.length
                                  ? row.missingProductTableIds.join(", ")
                                  : t("warehouse.count.notAvailable")}
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
                                { dataIndex: "productTableId", title: t("warehouse.fields.productTableId") },
                                { dataIndex: "barcode", title: t("warehouse.fields.barcode") },
                                { dataIndex: "serialNumber", title: t("warehouse.fields.serialNumber") },
                                { dataIndex: "markingNumber", title: t("warehouse.fields.markingNumber") },
                                {
                                  dataIndex: "costPrice",
                                  title: t("warehouse.fields.costPrice"),
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
                label: t("warehouse.count.postingBatches"),
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
                      locale={{ emptyText: t("warehouse.messages.noData") }}
                    />
                  </div>
                ),
              },
              {
                key: "inventory-movements",
                label: t("warehouse.count.stockMovement"),
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
                      locale={{ emptyText: t("warehouse.messages.noData") }}
                    />
                  </div>
                ),
              },
            ]}
            onChange={updateActiveTab}
          />
        </Card>

        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">{t("common.actions")}</div>
          <Button
            block
            icon={<Save className="size-4" />}
            onClick={() => void saveDraft()}
            disabled={!canEdit}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isCreate ? t("warehouse.count.saveDraft") : t("common.save")}
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
                {t("warehouse.count.finish")}
              </Button>
              {canConfirm && (
                <Button
                  type="primary"
                  block
                  icon={<CheckCircle2 className="size-4" />}
                  onClick={() => setIsConfirmOpen(true)}
                  loading={confirmMutation.isPending}
                >
                  {t("common.confirm")}
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
                  {t("common.cancel")}
                </Button>
              )}
            </>
          )}
          <div className="space-y-1.5 pt-1">
            <div className="text-sm font-semibold">
              {t("warehouse.count.adjustmentsCreated")}
            </div>
            <Space direction="vertical" className="w-full">
              {record?.positiveAdjustmentDocId ? (
                <Link
                  to={`/main/warehouses/inventory-adjustments/${record.positiveAdjustmentDocId}`}
                >
                  <Button block>
                    {t("warehouse.count.positiveWithId", {
                      id: record.positiveAdjustmentDocId,
                    })}
                  </Button>
                </Link>
              ) : (
                <Button block disabled>
                  {t("warehouse.count.positiveNotCreated")}
                </Button>
              )}
              {record?.negativeAdjustmentDocId ? (
                <Link
                  to={`/main/warehouses/inventory-adjustments/${record.negativeAdjustmentDocId}`}
                >
                  <Button block>
                    {t("warehouse.count.negativeWithId", {
                      id: record.negativeAdjustmentDocId,
                    })}
                  </Button>
                </Link>
              ) : (
                <Button block disabled>
                  {t("warehouse.count.negativeNotCreated")}
                </Button>
              )}
            </Space>
          </div>
        </Card>
      </div>

      <Modal maskClosable={false}
        title={t("warehouse.count.confirmTitle")}
        open={isConfirmDialogOpen}
        onCancel={closeActionModals}
        confirmLoading={confirmMutation.isPending}
        onOk={async () => {
          try {
            await confirmMutation.mutateAsync();
            toast.success(t("warehouse.messages.inventoryConfirmed"));
            closeActionModals();
          } catch (error) {
            errorHandlers(error);
          }
        }}
      >
        <div className="space-y-2">
          <p>{t("warehouse.count.confirmQuestion")}</p>
        </div>
      </Modal>

      <Modal maskClosable={false}
        title={t("warehouse.count.cancelTitle")}
        open={isCancelDialogOpen}
        onCancel={closeActionModals}
        confirmLoading={cancelMutation.isPending}
        onOk={async () => {
          try {
            await cancelMutation.mutateAsync();
            toast.success(t("warehouse.messages.cancelled"));
            closeActionModals();
          } catch (error) {
            errorHandlers(error);
          }
        }}
      >
        <div className="space-y-2">
          <p>{t("warehouse.count.cancelQuestion")}</p>
        </div>
      </Modal>
    </div>
  );
}
