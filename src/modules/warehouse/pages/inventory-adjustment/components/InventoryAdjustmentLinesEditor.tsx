import { useMemo, useState } from "react";
import { Button, Empty, Select, Tag } from "antd";
import type { FormikProps } from "formik";
import { Plus, Trash2 } from "lucide-react";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import type { ProductStock, ProductStockSerial } from "../../warehouse/types/type";
import { useGetInventoryAdjustmentStocks } from "../hooks/useGetInventoryAdjustmentStocks";
import { useGetInventoryAdjustmentSerials } from "../hooks/useGetInventoryAdjustmentSerials";
import type { InventoryAdjustmentForm, InventoryAdjustmentLineForm } from "../types/form";
import { useTranslation } from "react-i18next";
import InventoryAdjustmentMarkingModal from "./InventoryAdjustmentMarkingModal";
import {
  createDefaultAdjustmentItem,
  createDefaultAdjustmentLine,
  toMarkingList,
} from "../utils/inventoryAdjustment";

interface Props {
  formik: FormikProps<InventoryAdjustmentForm>;
  disabled?: boolean;
}

export default function InventoryAdjustmentLinesEditor({
  formik,
  disabled = false,
}: Props) {
  const { t } = useTranslation();
  const warehouseId = formik.values.warehouseId;
  const stockQuery = useGetInventoryAdjustmentStocks({
    warehouseId,
    page: 1,
    pageSize: 1000,
  });
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const stockMap = useMemo(() => {
    const map = new Map<number, ProductStock>();
    (stockQuery.data?.items ?? []).forEach((item) => {
      map.set(item.productId, item);
    });
    return map;
  }, [stockQuery.data?.items]);

  const activeLine =
    activeLineIndex !== null ? formik.values.lines[activeLineIndex] : null;

  const serialsQuery = useGetInventoryAdjustmentSerials(
    activeLine?.productId
      ? {
          productId: activeLine.productId,
          warehouseId,
          page: 1,
          pageSize: 1000,
        }
      : undefined,
  );

  const serialItems = serialsQuery.data?.items ?? [];

  const setLine = (
    index: number,
    patch: Partial<InventoryAdjustmentLineForm>,
  ) => {
    formik.setFieldValue(
      "lines",
      formik.values.lines.map((line, currentIndex) =>
        currentIndex === index ? { ...line, ...patch } : line,
      ),
      true,
    );
  };

  const setLineItems = (index: number, items: ProductStockSerial[]) => {
    const nextItems =
      items.length > 0
        ? items.map((item) => ({
            productTableId: item.id,
            costPrice:
              stockMap.get(formik.values.lines[index]?.productId ?? 0)
                ?.costPrice ?? null,
            markingNumber: item.markingNumber ?? null,
            serialNumber: item.serialNumber ?? null,
          }))
        : [createDefaultAdjustmentItem()];

    setLine(index, {
      quantity: items.length || null,
      items: nextItems,
    });
  };

  const addLine = () =>
    formik.setFieldValue(
      "lines",
      [...formik.values.lines, createDefaultAdjustmentLine()],
      true,
    );

  const removeLine = (lineIndex: number) =>
    formik.setFieldValue(
      "lines",
      formik.values.lines.length === 1
        ? formik.values.lines
        : formik.values.lines.filter((_, index) => index !== lineIndex),
      true,
    );

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
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

      {!formik.values.lines.length && (
        <Empty description={t("warehouse.lines.noLines")} />
      )}

      <div className="space-y-4">
        {formik.values.lines.map((line, index) => {
          const stock = line.productId ? stockMap.get(line.productId) : undefined;
          const selectedMarkings = toMarkingList(line.items);
          const totalStock = stock?.quantity ?? 0;
          const canOpenMarking = Boolean(line.productId);

          return (
            <div
              key={`inventory-adjustment-line-${index}`}
              className="rounded-xl border border-border p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {t("warehouse.lines.row", { number: index + 1 })}
                </div>
                <Button
                  type="text"
                  danger
                  icon={<Trash2 className="size-4" />}
                  onClick={() => removeLine(index)}
                  disabled={disabled || formik.values.lines.length === 1}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <div className="mb-1 text-sm text-secondary-text">
                    {t("warehouse.fields.productName")}
                  </div>
                  <Select
                    value={line.productId}
                    placeholder={t("warehouse.lines.selectProduct")}
                    loading={stockQuery.isLoading || stockQuery.isFetching}
                    disabled={disabled || !warehouseId}
                    showSearch
                    options={(stockQuery.data?.items ?? []).map((item) => ({
                      value: item.productId,
                      label: `${item.productName ?? item.name ?? item.productId} - ${t("warehouse.lines.pieces", { count: numberSpacing(item.quantity, undefined, true) })}`,
                    }))}
                    onChange={(value) => {
                      const selected = stockMap.get(Number(value));
                      setLine(index, {
                        productId: Number(value),
                        productName: selected?.productName ?? selected?.name ?? "",
                        unitId: line.unitId,
                        unitName: line.unitName,
                        quantity: selected?.quantity ? 1 : null,
                        items: [createDefaultAdjustmentItem()],
                      });
                      setActiveLineIndex(index);
                      setSelectedRowKeys([]);
                    }}
                    style={{ width: "100%" }}
                  />
                </div>

                <SelectCustom
                  formik={formik}
                  fieldName={`lines[${index}].unitId`}
                  label={t("purchase.fields.unit")}
                  path={selectListEndpoints.unitsSelectList}
                  disabled={disabled}
                  getFieldName={`lines[${index}].unitName`}
                />

                <InputNumber
                  formik={formik}
                  fieldName={`lines[${index}].quantity`}
                  label={t("openingInventory.fields.quantity")}
                  disabled={disabled}
                  min={0}
                />

                <div className="xl:col-span-2">
                  <InputText
                    formik={formik}
                    fieldName={`lines[${index}].comment`}
                    label={t("openingInventory.fields.comment")}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Tag color="blue">
                  {t("warehouse.lines.stock")}: {numberSpacing(totalStock, undefined, true)}
                </Tag>
                <Tag color={selectedMarkings.length ? "green" : "default"}>
                  {t("warehouse.lines.marking")}: {selectedMarkings.length}
                </Tag>
                <Button
                  size="small"
                  onClick={() => {
                    setActiveLineIndex(index);
                    setSelectedRowKeys(
                      (line.items ?? [])
                        .map((item) => item.productTableId)
                        .filter((item): item is number => Boolean(item)),
                    );
                  }}
                  disabled={disabled || !canOpenMarking || serialsQuery.isFetching}
                >
                  {t("warehouse.lines.marking")}
                </Button>
                {!warehouseId && (
                  <span className="text-xs text-red-500">
                    {t("warehouse.lines.selectWarehouseFirst")}
                  </span>
                )}
                {line.productId && !serialItems.length && canOpenMarking && (
                  <span className="text-xs text-secondary-text">
                    {t("warehouse.lines.notPieceTracked")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <InventoryAdjustmentMarkingModal
        open={activeLineIndex !== null && Boolean(activeLine?.productId)}
        title={activeLine?.productName || t("warehouse.lines.selectMarking")}
        items={serialItems}
        selectedRowKeys={selectedRowKeys}
        loading={serialsQuery.isLoading || serialsQuery.isFetching}
        onClose={() => {
          setActiveLineIndex(null);
          setSelectedRowKeys([]);
        }}
        onSelectedRowKeysChange={setSelectedRowKeys}
        onConfirm={(selected) => {
          if (activeLineIndex === null) return;
          setLineItems(activeLineIndex, selected);
          setSelectedRowKeys(selected.map((item) => item.id));
          setActiveLineIndex(null);
        }}
      />
    </Card>
  );
}
