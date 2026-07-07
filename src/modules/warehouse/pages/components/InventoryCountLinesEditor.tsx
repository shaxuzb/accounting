import { useMemo } from "react";
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
import { Plus, Trash2 } from "lucide-react";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import type {
  InventoryCountItemForm,
  InventoryCountLineForm,
} from "../inventory-count/types/form";

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
  disabled?: boolean;
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
  disabled = false,
}: InventoryCountLinesEditorProps) {
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

  const removeLine = (lineIndex: number) => {
    const nextLines = lines.filter((_, index) => index !== lineIndex);
    commitLines(nextLines);
  };

  const addItem = (lineIndex: number) => {
    updateLine(lineIndex, (line) => ({
      ...line,
      items: [...line.items, createDefaultInventoryCountItem()],
    }));
  };

  const removeItem = (lineIndex: number, itemIndex: number) => {
    updateLine(lineIndex, (line) => {
      const nextItems = line.items.filter((_, index) => index !== itemIndex);
      return {
        ...line,
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
      title: "Mahsulot",
      dataIndex: "productId",
      render: (_, line, index) => (
        <Select
          className="w-full"
          showSearch
          allowClear
          placeholder="Mahsulotni tanlang"
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
      title: "Sanoq",
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
      title: "Birlik",
      width: 140,
      render: (_, line) => (
        <div className="text-sm text-muted-foreground">
          {getUnitLabel(line, unitMap)}
        </div>
      ),
    },
    {
      title: "Default cost",
      width: 160,
      align: "right",
      render: (_, line) => (
        <div className="text-sm tabular-nums text-muted-foreground">
          {toMoneyText(line.defaultCostPrice)}
        </div>
      ),
    },
    {
      title: "Izoh",
      dataIndex: "comment",
      render: (value, _, index) => (
        <Input
          value={value}
          placeholder="Izoh"
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
      title: "Amallar",
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
            Inventarizatsiya qatorlari
          </div>
          <div className="text-xs text-muted-foreground">
            Har bir mahsulot va uning real sanalgan miqdorini kiriting
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={isCountCompleted}
              disabled={disabled || isCountCompleted}
              onChange={onCountCompletedChange}
            />
            <span className="text-sm">Sanoq yakunlandimi?</span>
          </div>

          {!isReadOnly && (
            <Button
              type="dashed"
              icon={<Plus className="size-4" />}
              onClick={addLine}
            >
              Mahsulot qo'shish
            </Button>
          )}
        </div>
      </div>

      {!lines.length ? (
        <Empty description="Qatorlar mavjud emas" />
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
                    <div className="text-sm font-semibold">Qator itemlari</div>
                    {!isReadOnly && (
                      <Button
                        size="small"
                        type="dashed"
                        icon={<Plus className="size-4" />}
                        onClick={() => addItem(lineIndex)}
                      >
                        Item qo'shish
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
                        title: "Product table ID",
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
                        title: "Barcode",
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
                        title: "Serial number",
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
                        title: "Marking number",
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
                        title: "Cost price",
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
                        title: "Amallar",
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
