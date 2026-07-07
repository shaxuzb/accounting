import { useQuery } from "@tanstack/react-query";
import { Button, Card as AntCard, Checkbox, Empty, Input, InputNumber, Select } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";

type SelectOption = {
  id: number;
  name?: string;
};

export interface InventoryCountItemForm {
  productTableId: number | null;
  barcode: string;
  serialNumber: string;
  markingNumber: string;
  costPrice: number | null;
}

export interface InventoryCountLineForm {
  productId: number | null;
  unitId: number | null;
  countedQuantity: number | null;
  defaultCostPrice: number | null;
  comment: string;
  items: InventoryCountItemForm[];
}

interface Props {
  disabled?: boolean;
  lines: InventoryCountLineForm[];
  onChange: (lines: InventoryCountLineForm[]) => void;
  isCountCompleted: boolean;
  onCountCompletedChange: (value: boolean) => void;
}

const defaultLine: InventoryCountLineForm = {
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
};

const defaultItem: InventoryCountItemForm = {
  productTableId: null,
  barcode: "",
  serialNumber: "",
  markingNumber: "",
  costPrice: null,
};

const useSelectOptions = (path: string, key: string) =>
  useQuery({
    queryKey: ["inventory-count-editor-select", key, path],
    queryFn: async () => {
      const response = await $axiosPrivate.get<SelectOption[]>(path);
      return response.data;
    },
  });

export default function InventoryCountLinesEditor({
  disabled = false,
  lines,
  onChange,
  isCountCompleted,
  onCountCompletedChange,
}: Props) {
  const productsQuery = useSelectOptions(
    selectListEndpoints.productsSelectList,
    "products",
  );
  const unitsQuery = useSelectOptions(selectListEndpoints.unitsSelectList, "units");

  const setLine = (index: number, patch: Partial<InventoryCountLineForm>) => {
    onChange(
      lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    );
  };

  const setItem = (
    lineIndex: number,
    itemIndex: number,
    patch: Partial<InventoryCountItemForm>,
  ) => {
    onChange(
      lines.map((line, currentLineIndex) => {
        if (currentLineIndex !== lineIndex) return line;

        return {
          ...line,
          items: line.items.map((item, currentItemIndex) =>
            currentItemIndex === itemIndex ? { ...item, ...patch } : item,
          ),
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold">Sanash qatorlari</div>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isCountCompleted}
            disabled={disabled}
            onChange={(event) => onCountCompletedChange(event.target.checked)}
          >
            Sanash tugallandi
          </Checkbox>
          <Button
            type="dashed"
            icon={<Plus className="size-4" />}
            onClick={() => onChange([...lines, defaultLine])}
            disabled={disabled}
          >
            Qator qo'shish
          </Button>
        </div>
      </div>

      {!lines.length && <Empty description="Qatorlar yo'q" />}

      {lines.map((line, lineIndex) => (
        <AntCard
          key={`count-line-${lineIndex}`}
          size="small"
          title={`Qator ${lineIndex + 1}`}
          extra={
            <Button
              type="text"
              danger
              icon={<Trash2 className="size-4" />}
              onClick={() =>
                onChange(lines.filter((_, index) => index !== lineIndex))
              }
              disabled={disabled || lines.length === 1}
            />
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              value={line.productId}
              placeholder="Mahsulot"
              options={(productsQuery.data ?? []).map((item) => ({
                value: item.id,
                label: item.name ?? item.id,
              }))}
              loading={productsQuery.isLoading}
              disabled={disabled}
              onChange={(value) => setLine(lineIndex, { productId: value })}
            />
            <Select
              value={line.unitId}
              placeholder="Birlik"
              options={(unitsQuery.data ?? []).map((item) => ({
                value: item.id,
                label: item.name ?? item.id,
              }))}
              loading={unitsQuery.isLoading}
              disabled={disabled}
              onChange={(value) => setLine(lineIndex, { unitId: value })}
            />
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Sanalgan miqdor"
              value={line.countedQuantity ?? undefined}
              disabled={disabled}
              onChange={(value) =>
                setLine(lineIndex, {
                  countedQuantity: Number(value ?? 0) || null,
                })
              }
            />
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Default cost price"
              value={line.defaultCostPrice ?? undefined}
              disabled={disabled}
              onChange={(value) =>
                setLine(lineIndex, {
                  defaultCostPrice: Number(value ?? 0) || null,
                })
              }
            />
            <Input
              className="md:col-span-2"
              placeholder="Izoh"
              value={line.comment}
              disabled={disabled}
              onChange={(event) => setLine(lineIndex, { comment: event.target.value })}
            />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground">
                Itemlar
              </div>
              <Button
                type="dashed"
                size="small"
                icon={<Plus className="size-3.5" />}
                onClick={() =>
                  onChange(
                    lines.map((currentLine, index) =>
                      index === lineIndex
                        ? { ...currentLine, items: [...currentLine.items, defaultItem] }
                        : currentLine,
                    ),
                  )
                }
                disabled={disabled}
              >
                Item qo'shish
              </Button>
            </div>
            {line.items.map((item, itemIndex) => (
              <div
                key={`count-line-${lineIndex}-item-${itemIndex}`}
                className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-2"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="Product table ID"
                  value={item.productTableId ?? undefined}
                  disabled={disabled}
                  onChange={(value) =>
                    setItem(lineIndex, itemIndex, {
                      productTableId: Number(value ?? 0) || null,
                    })
                  }
                />
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="Cost price"
                  value={item.costPrice ?? undefined}
                  disabled={disabled}
                  onChange={(value) =>
                    setItem(lineIndex, itemIndex, {
                      costPrice: Number(value ?? 0) || null,
                    })
                  }
                />
                <Input
                  placeholder="Barcode"
                  value={item.barcode}
                  disabled={disabled}
                  onChange={(event) =>
                    setItem(lineIndex, itemIndex, { barcode: event.target.value })
                  }
                />
                <Input
                  placeholder="Serial number"
                  value={item.serialNumber}
                  disabled={disabled}
                  onChange={(event) =>
                    setItem(lineIndex, itemIndex, {
                      serialNumber: event.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Marking number"
                  value={item.markingNumber}
                  disabled={disabled}
                  onChange={(event) =>
                    setItem(lineIndex, itemIndex, {
                      markingNumber: event.target.value,
                    })
                  }
                />
                <Button
                  danger
                  icon={<Trash2 className="size-4" />}
                  onClick={() =>
                    onChange(
                      lines.map((currentLine, index) =>
                        index === lineIndex
                          ? {
                              ...currentLine,
                              items:
                                currentLine.items.length === 1
                                  ? currentLine.items
                                  : currentLine.items.filter(
                                      (_, currentItemIndex) =>
                                        currentItemIndex !== itemIndex,
                                    ),
                            }
                          : currentLine,
                      ),
                    )
                  }
                  disabled={disabled || line.items.length === 1}
                />
              </div>
            ))}
          </div>
        </AntCard>
      ))}
    </div>
  );
}
