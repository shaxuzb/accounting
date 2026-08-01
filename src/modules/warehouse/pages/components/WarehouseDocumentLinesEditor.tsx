import { useQuery } from "@tanstack/react-query";
import { Button, Card as AntCard, Empty, Input, InputNumber, Select } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useTranslation } from "react-i18next";

type SelectOption = {
  id: number;
  name?: string;
};

export interface WarehouseDocumentItemForm {
  productTableId: number | null;
  costPrice: number | null;
}

export interface WarehouseDocumentLineForm {
  productId: number | null;
  unitId: number | null;
  quantity: number | null;
  comment: string;
  items: WarehouseDocumentItemForm[];
}

interface Props {
  disabled?: boolean;
  lines: WarehouseDocumentLineForm[];
  onChange: (lines: WarehouseDocumentLineForm[]) => void;
}

const defaultLine: WarehouseDocumentLineForm = {
  productId: null,
  unitId: null,
  quantity: null,
  comment: "",
  items: [{ productTableId: null, costPrice: null }],
};

const defaultItem: WarehouseDocumentItemForm = {
  productTableId: null,
  costPrice: null,
};

const useSelectOptions = (path: string, key: string) =>
  useQuery({
    queryKey: ["warehouse-editor-select", key, path],
    queryFn: async () => {
      const response = await $axiosPrivate.get<SelectOption[]>(path);
      return response.data;
    },
  });

export default function WarehouseDocumentLinesEditor({
  disabled = false,
  lines,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const productsQuery = useSelectOptions(
    selectListEndpoints.productsSelectList,
    "products",
  );
  const unitsQuery = useSelectOptions(selectListEndpoints.unitsSelectList, "units");

  const setLine = (
    index: number,
    patch: Partial<WarehouseDocumentLineForm>,
  ) => {
    onChange(
      lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    );
  };

  const setItem = (
    lineIndex: number,
    itemIndex: number,
    patch: Partial<WarehouseDocumentItemForm>,
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

  const addLine = () => onChange([...lines, defaultLine]);
  const removeLine = (lineIndex: number) =>
    onChange(lines.filter((_, index) => index !== lineIndex));
  const addItem = (lineIndex: number) =>
    onChange(
      lines.map((line, index) =>
        index === lineIndex ? { ...line, items: [...line.items, defaultItem] } : line,
      ),
    );
  const removeItem = (lineIndex: number, itemIndex: number) =>
    onChange(
      lines.map((line, index) =>
        index === lineIndex
          ? {
              ...line,
              items:
                line.items.length === 1
                  ? line.items
                  : line.items.filter((_, currentItemIndex) => currentItemIndex !== itemIndex),
            }
          : line,
      ),
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          {t("warehouse.lines.productLines")}
        </div>
        <Button
          type="dashed"
          icon={<Plus className="size-4" />}
          onClick={addLine}
          disabled={disabled}
        >
          {t("warehouse.lines.addLine")}
        </Button>
      </div>

      {!lines.length && <Empty description={t("warehouse.lines.noLines")} />}

      {lines.map((line, lineIndex) => (
        <AntCard
          key={`line-${lineIndex}`}
          size="small"
          title={t("warehouse.lines.row", { number: lineIndex + 1 })}
          extra={
            <Button
              type="text"
              danger
              icon={<Trash2 className="size-4" />}
              onClick={() => removeLine(lineIndex)}
              disabled={disabled || lines.length === 1}
            />
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              value={line.productId}
              placeholder={t("warehouse.fields.productName")}
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
              placeholder={t("purchase.fields.unit")}
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
              placeholder={t("openingInventory.fields.quantity")}
              value={line.quantity ?? undefined}
              disabled={disabled}
              onChange={(value) =>
                setLine(lineIndex, { quantity: Number(value ?? 0) || null })
              }
            />
            <Input
              placeholder={t("openingInventory.fields.comment")}
              value={line.comment}
              disabled={disabled}
              onChange={(event) => setLine(lineIndex, { comment: event.target.value })}
            />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground">
                {t("warehouse.lines.items")}
              </div>
              <Button
                type="dashed"
                size="small"
                icon={<Plus className="size-3.5" />}
                onClick={() => addItem(lineIndex)}
                disabled={disabled}
              >
                {t("warehouse.lines.addItem")}
              </Button>
            </div>
            {line.items.map((item, itemIndex) => (
              <div
                key={`line-${lineIndex}-item-${itemIndex}`}
                className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder={t("warehouse.fields.productTableId")}
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
                  placeholder={t("warehouse.fields.costPrice")}
                  value={item.costPrice ?? undefined}
                  disabled={disabled}
                  onChange={(value) =>
                    setItem(lineIndex, itemIndex, {
                      costPrice: Number(value ?? 0) || null,
                    })
                  }
                />
                <Button
                  danger
                  icon={<Trash2 className="size-4" />}
                  onClick={() => removeItem(lineIndex, itemIndex)}
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
