import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Empty,
  Input,
  InputNumber,
  Select,
  Switch,
  Table,
  type TableColumnsType,
} from "antd";
import { ListRestart, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { takeBatchUnitCosts } from "../inventory-adjustment/utils/inventoryAdjustment";
import { numberSpacing } from "@/utils/utils";
import type {
  InventoryCountItemForm,
  InventoryCountLineForm,
} from "../inventory-count/types/form";
import { useTranslation } from "react-i18next";

type SelectOption = {
  id: number;
  name?: string;
  unitId?: number | null;
  unitName?: string | null;
  unit?: string | null;
  costPrice?: number | null;
  price?: number | null;
};

export interface InventoryCountLinesEditorProps {
  lines: InventoryCountLineForm[];
  onChange: (lines: InventoryCountLineForm[]) => void;
  isCountCompleted: boolean;
  onCountCompletedChange: (value: boolean) => void;
  /** Qoldiq bo'yicha to'ldirish shu ombor kesimida ishlaydi. */
  warehouseId?: number | null;
  disabled?: boolean;
}

interface StockBatch {
  receivedDate?: string;
  availableQuantity: number;
  unitCost: number;
}

interface StockProduct {
  productId: number;
  unitId: number;
  quantity?: number;
  availableQuantity?: number;
  availableProductTableIds?: number[];
  batches?: StockBatch[];
}

interface StockTable {
  id: number;
  productId: number;
  serialNumber?: string | null;
  markingNumber?: string | null;
}

const createDefaultInventoryCountItem = (): InventoryCountItemForm => ({
  productTableId: null,
  barcode: "",
  serialNumber: "",
  markingNumber: "",
  costPrice: null,
});

const createDefaultInventoryCountLine = (): InventoryCountLineForm => ({
  productId: null,
  unitId: null,
  countedQuantity: null,
  defaultCostPrice: null,
  comment: "",
  items: [createDefaultInventoryCountItem()],
});

const useSelectOptions = (path: string, key: string) =>
  useQuery({
    queryKey: ["inventory-count-editor-select", key, path],
    queryFn: async () => {
      const response = await $axiosPrivate.get(path);
      const data = response.data as
        | SelectOption[]
        | {
            items?: SelectOption[];
            results?: SelectOption[];
            data?: SelectOption[];
          }
        | null;

      if (Array.isArray(data)) {
        return data;
      }

      return data?.items ?? data?.results ?? data?.data ?? [];
    },
  });

const toMoneyText = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : numberSpacing(value);

const getUnitLabel = (
  line: InventoryCountLineForm,
  units: Map<number, SelectOption>,
) => {
  if (!line.unitId) return "-";
  return units.get(line.unitId)?.name ?? line.unitId;
};

export default function InventoryCountLinesEditor({
  lines,
  onChange,
  isCountCompleted,
  onCountCompletedChange,
  warehouseId = null,
  disabled = false,
}: InventoryCountLinesEditorProps) {
  const { t } = useTranslation();
  const [filling, setFilling] = useState(false);
  const productsQuery = useSelectOptions(
    selectListEndpoints.productsSelectList,
    "products",
  );
  const unitsQuery = useSelectOptions(
    selectListEndpoints.unitsSelectList,
    "units",
  );

  const productMap = useMemo(() => {
    const map = new Map<number, SelectOption>();
    (productsQuery.data ?? []).forEach((item) => {
      map.set(Number(item.id), item);
    });
    return map;
  }, [productsQuery.data]);

  const unitMap = useMemo(() => {
    const map = new Map<number, SelectOption>();
    (unitsQuery.data ?? []).forEach((item) => {
      map.set(Number(item.id), item);
    });
    return map;
  }, [unitsQuery.data]);

  const isReadOnly = disabled || isCountCompleted;

  const commitLines = (nextLines: InventoryCountLineForm[]) => {
    onChange(
      nextLines.length > 0 ? nextLines : [createDefaultInventoryCountLine()],
    );
  };

  const updateLine = (
    lineIndex: number,
    updater: (line: InventoryCountLineForm) => InventoryCountLineForm,
  ) => {
    commitLines(
      lines.map((line, index) => (index === lineIndex ? updater(line) : line)),
    );
  };

  const updateItem = (
    lineIndex: number,
    itemIndex: number,
    updater: (item: InventoryCountItemForm) => InventoryCountItemForm,
  ) => {
    updateLine(lineIndex, (line) => ({
      ...line,
      items: line.items.map((item, index) =>
        index === itemIndex ? updater(item) : item,
      ),
    }));
  };

  const addLine = () =>
    commitLines([...lines, createDefaultInventoryCountLine()]);

  /**
   * Hujjatni ombor qoldig'i bilan to'ldiradi — 1C dagi "Qoldiq bo'yicha
   * to'ldirish" kabi.
   *
   * Har bir dona o'z identifikatori bilan tushadi: backend faqat hujjatdagi
   * qatorlarni solishtiradi va ro'yxatda yo'q donani kamomad deb oladi.
   * Shuning uchun sanoqda topilmagan donalarni foydalanuvchi shu yerdan
   * o'chiradi — o'chirilgani Dt 5910 / Kt 2910 bo'lib yoziladi.
   */
  const fillFromStock = async () => {
    if (!warehouseId) {
      toast.error(t("warehouse.lines.selectWarehouseFirst"));
      return;
    }

    setFilling(true);
    try {
      const params = { warehouseId, page: 1, pageSize: 5000 };
      const [productsResponse, tablesResponse] = await Promise.all([
        $axiosPrivate.get("/product-stocks/products", { params }),
        $axiosPrivate.get("/product-stocks/tables", { params }),
      ]);

      const stockProducts: StockProduct[] = productsResponse.data?.items ?? [];
      const stockTables: StockTable[] = tablesResponse.data?.items ?? [];

      const tableById = new Map(stockTables.map((table) => [table.id, table]));

      const nextLines: InventoryCountLineForm[] = [];
      stockProducts.forEach((product) => {
        const tableIds = product.availableProductTableIds ?? [];
        const onHand = Number(product.availableQuantity ?? product.quantity ?? 0);

        // Miqdor bo'yicha yuritiladigan tovarning donalari yo'q: qator ombordagi
        // miqdor bilan tushadi, sanovchi uni topilganiga to'g'rilaydi. Avval bunday
        // tovarlar umuman tushmas edi — faqat markirovkalilar to'ldirilardi.
        if (!tableIds.length) {
          if (onHand <= 0) return;
          const [cost] = takeBatchUnitCosts({ batches: product.batches }, 1);
          nextLines.push({
            productId: product.productId,
            unitId: product.unitId ?? null,
            countedQuantity: onHand,
            defaultCostPrice: cost ?? null,
            comment: "",
            items: [createDefaultInventoryCountItem()],
          });
          return;
        }

        // Tannarx mahsulotda emas, partiyalarda turadi va partiyalar har xil
        // narxda bo'ladi — shuning uchun FIFO tartibida olinadi.
        const costs = takeBatchUnitCosts({ batches: product.batches }, tableIds.length);

        nextLines.push({
          productId: product.productId,
          unitId: product.unitId ?? null,
          // Kodsiz qabul qilingan donalar ham omborda: ular kamomad deb o'qilmasin.
          countedQuantity: Math.max(onHand, tableIds.length),
          defaultCostPrice: costs[0] ?? null,
          comment: "",
          items: tableIds.map((tableId, index) => {
            const table = tableById.get(tableId);
            return {
              productTableId: tableId,
              barcode: "",
              serialNumber: table?.serialNumber ?? "",
              markingNumber: table?.markingNumber ?? "",
              costPrice: costs[index] ?? costs[0] ?? null,
            };
          }),
        });
      });

      if (!nextLines.length) {
        toast.error(t("warehouse.lines.noStockToFill"));
        return;
      }

      commitLines(nextLines);
      toast.success(
        t("warehouse.lines.filledFromStock", { count: nextLines.length }),
      );
    } catch (error) {
      errorHandlers(error);
    } finally {
      setFilling(false);
    }
  };

  const removeLine = (lineIndex: number) => {
    const nextLines = lines.filter((_, index) => index !== lineIndex);
    commitLines(nextLines);
  };

  /**
   * Dona qo'shilsa yoki o'chirilsa sanalgan miqdor ham siljiydi.
   *
   * Backend ro'yxatdagi donalarni topilgan deb, ortib qolgan miqdorni esa
   * markirovkasiz topilgan dona deb hisoblaydi. Miqdor qotib qolsa, bitta
   * donani o'chirish "1 dona kamomad va ayni paytda 1 dona ortiqcha" bo'lib
   * o'qilardi — bitta mahsulot uchun ikkala korrektirovka ham yaratilardi.
   * Foydalanuvchi markirovkasiz dona kiritmoqchi bo'lsa, miqdorni keyin
   * qo'lda oshirishi mumkin.
   */
  const shiftCountedQuantity = (line: InventoryCountLineForm, delta: number) =>
    Math.max(0, (line.countedQuantity ?? line.items.length) + delta);

  const addItem = (lineIndex: number) => {
    updateLine(lineIndex, (line) => ({
      ...line,
      countedQuantity: shiftCountedQuantity(line, 1),
      items: [...line.items, createDefaultInventoryCountItem()],
    }));
  };

  const removeItem = (lineIndex: number, itemIndex: number) => {
    updateLine(lineIndex, (line) => {
      const nextItems = line.items.filter((_, index) => index !== itemIndex);
      return {
        ...line,
        countedQuantity: shiftCountedQuantity(line, -1),
        items:
          nextItems.length > 0
            ? nextItems
            : [createDefaultInventoryCountItem()],
      };
    });
  };

  const handleProductChange = (lineIndex: number, productId: number) => {
    const selectedProduct = productMap.get(productId);
    const selectedUnitId = selectedProduct?.unitId ?? null;
    const selectedCostPrice =
      selectedProduct?.costPrice ?? selectedProduct?.price ?? null;

    updateLine(lineIndex, (line) => ({
      ...line,
      productId,
      unitId: selectedUnitId,
      defaultCostPrice: selectedCostPrice,
      items: [createDefaultInventoryCountItem()],
    }));
  };

  const columns: TableColumnsType<InventoryCountLineForm> = [
    {
      title: "#",
      width: 64,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: t("warehouse.fields.productName"),
      dataIndex: "productId",
      render: (_, line, index) => (
        <Select
          className="w-full"
          showSearch
          allowClear
          placeholder={t("warehouse.lines.selectProduct")}
          value={line.productId ?? undefined}
          loading={productsQuery.isLoading || productsQuery.isFetching}
          disabled={isReadOnly}
          options={(productsQuery.data ?? []).map((item) => ({
            value: item.id,
            label: item.name ?? item.id,
          }))}
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(value) => {
            if (value === undefined || value === null) {
              updateLine(index, (current) => ({
                ...current,
                productId: null,
                unitId: null,
                defaultCostPrice: null,
                items: [createDefaultInventoryCountItem()],
              }));
              return;
            }
            handleProductChange(index, Number(value));
          }}
        />
      ),
    },
    {
      title: t("warehouse.fields.countedQuantity"),
      width: 160,
      dataIndex: "countedQuantity",
      align: "center",
      render: (value, _, index) => (
        <InputNumber
          className="w-full"
          min={0}
          precision={3}
          value={value ?? undefined}
          disabled={isReadOnly}
          onChange={(nextValue) =>
            updateLine(index, (current) => ({
              ...current,
              countedQuantity:
                nextValue === null || nextValue === undefined
                  ? null
                  : Number(nextValue),
            }))
          }
        />
      ),
    },
    {
      title: t("purchase.fields.unit"),
      width: 140,
      render: (_, line) => (
        <div className="text-sm text-muted-foreground">
          {getUnitLabel(line, unitMap)}
        </div>
      ),
    },
    {
      title: t("warehouse.fields.defaultCost"),
      width: 160,
      align: "right",
      render: (_, line) => (
        <div className="text-sm tabular-nums text-muted-foreground">
          {toMoneyText(line.defaultCostPrice)}
        </div>
      ),
    },
    {
      title: t("openingInventory.fields.comment"),
      dataIndex: "comment",
      render: (value, _, index) => (
        <Input
          value={value}
          placeholder={t("openingInventory.fields.comment")}
          disabled={isReadOnly}
          onChange={(event) =>
            updateLine(index, (current) => ({
              ...current,
              comment: event.target.value,
            }))
          }
        />
      ),
    },
    {
      title: t("common.actions"),
      width: 96,
      align: "center",
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<Trash2 className="size-4" />}
          onClick={() => removeLine(index)}
          disabled={isReadOnly || lines.length === 1}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {t("warehouse.lines.inventoryLines")}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("warehouse.lines.inventoryHint")}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={isCountCompleted}
              disabled={disabled || isCountCompleted}
              onChange={onCountCompletedChange}
            />
            <span className="text-sm">
              {t("warehouse.lines.countFinished")}
            </span>
          </div>

          {!isReadOnly && (
            <Button
              type="dashed"
              icon={<Plus className="size-4" />}
              onClick={addLine}
            >
              {t("warehouse.lines.addProduct")}
            </Button>
          )}

          {!isReadOnly && (
            <Button
              icon={<ListRestart className="size-4" />}
              loading={filling}
              disabled={!warehouseId}
              onClick={() => void fillFromStock()}
            >
              {t("warehouse.lines.fillFromStock")}
            </Button>
          )}
        </div>
      </div>

      {!lines.length ? (
        <Empty description={t("warehouse.lines.noLines")} />
      ) : (
        <Table<InventoryCountLineForm>
          rowKey={(record) => String(lines.indexOf(record))}
          size="middle"
          columns={columns}
          dataSource={lines}
          pagination={false}
          scroll={{ x: 1100 }}
          expandable={{
            expandedRowRender: (_, lineIndex) => {
              const currentLine = lines[lineIndex];

              if (!currentLine) return null;

              return (
                <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold">
                      {t("warehouse.lines.items")}
                    </div>
                    {!isReadOnly && (
                      <Button
                        size="small"
                        type="dashed"
                        icon={<Plus className="size-4" />}
                        onClick={() => addItem(lineIndex)}
                      >
                        {t("warehouse.lines.addItem")}
                      </Button>
                    )}
                  </div>

                  <Table<InventoryCountItemForm>
                    rowKey={(record) =>
                      `item-${lineIndex}-${currentLine.items.indexOf(record)}`
                    }
                    size="small"
                    pagination={false}
                    dataSource={currentLine.items}
                    columns={[
                      {
                        title: "#",
                        width: 64,
                        align: "center",
                        render: (_, __, index) => index + 1,
                      },
                      {
                        title: t("warehouse.fields.productTableId"),
                        width: 160,
                        render: (_, item, itemIndex) => (
                          <InputNumber
                            className="w-full"
                            min={0}
                            value={item.productTableId ?? undefined}
                            disabled={isReadOnly}
                            onChange={(value) =>
                              updateItem(lineIndex, itemIndex, (current) => ({
                                ...current,
                                productTableId:
                                  value === null || value === undefined
                                    ? null
                                    : Number(value),
                              }))
                            }
                          />
                        ),
                      },
                      {
                        title: t("warehouse.fields.barcode"),
                        render: (_, item, itemIndex) => (
                          <Input
                            value={item.barcode}
                            disabled={isReadOnly}
                            onChange={(event) =>
                              updateItem(lineIndex, itemIndex, (current) => ({
                                ...current,
                                barcode: event.target.value,
                              }))
                            }
                          />
                        ),
                      },
                      {
                        title: t("warehouse.fields.serialNumber"),
                        render: (_, item, itemIndex) => (
                          <Input
                            value={item.serialNumber}
                            disabled={isReadOnly}
                            onChange={(event) =>
                              updateItem(lineIndex, itemIndex, (current) => ({
                                ...current,
                                serialNumber: event.target.value,
                              }))
                            }
                          />
                        ),
                      },
                      {
                        title: t("warehouse.fields.markingNumber"),
                        render: (_, item, itemIndex) => (
                          <Input
                            value={item.markingNumber}
                            disabled={isReadOnly}
                            onChange={(event) =>
                              updateItem(lineIndex, itemIndex, (current) => ({
                                ...current,
                                markingNumber: event.target.value,
                              }))
                            }
                          />
                        ),
                      },
                      {
                        title: t("warehouse.fields.costPrice"),
                        width: 160,
                        align: "right",
                        render: (_, item, itemIndex) => (
                          <InputNumber
                            className="w-full"
                            min={0}
                            precision={3}
                            value={item.costPrice ?? undefined}
                            disabled={isReadOnly}
                            onChange={(value) =>
                              updateItem(lineIndex, itemIndex, (current) => ({
                                ...current,
                                costPrice:
                                  value === null || value === undefined
                                    ? null
                                    : Number(value),
                              }))
                            }
                          />
                        ),
                      },
                      {
                        title: t("common.actions"),
                        width: 80,
                        align: "center",
                        render: (_, __, itemIndex) => (
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 className="size-4" />}
                            onClick={() => removeItem(lineIndex, itemIndex)}
                            disabled={
                              isReadOnly || currentLine.items.length === 1
                            }
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              );
            },
          }}
        />
      )}
    </div>
  );
}
