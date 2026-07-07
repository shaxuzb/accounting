import { useMemo, useState } from "react";
import { Button, Empty, Select, Tag } from "antd";
import type { FormikProps } from "formik";
import { Plus, Trash2 } from "lucide-react";
import Card from "@/components/ui/card/Card";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import { useGetWarehouseTransferStocks } from "../hooks/useGetWarehouseTransferStocks";
import { useGetWarehouseTransferSerials } from "../hooks/useGetWarehouseTransferSerials";
import type {
  WarehouseTransferForm,
  WarehouseTransferItemForm,
} from "../types/form";
import type {
  ProductStock,
  ProductStockSerial,
} from "../../warehouse/types/type";
import WarehouseTransferMarkingModal from "./WarehouseTransferMarkingModal";
import {
  createDefaultTransferItem,
  createDefaultTransferLine,
  toMarkingList,
} from "../utils/transfer";

interface Props {
  formik: FormikProps<WarehouseTransferForm>;
  disabled?: boolean;
}

const getRowTitle = (index: number) => `Qator ${index + 1}`;

export default function WarehouseTransferLinesEditor({
  formik,
  disabled = false,
}: Props) {
  const stockQuery = useGetWarehouseTransferStocks({
    // warehouseId: formik.values.sourceWarehouseId,
    page: 1,
    pageSize: 1000,
  });
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const stockMap = useMemo(() => {
    const map = new Map<number, ProductStock>();
    (stockQuery.data?.items ?? []).forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [stockQuery.data?.items]);

  console.log(formik.values)

  const activeLine =
    activeLineIndex !== null ? formik.values.lines[activeLineIndex] : null;

  const serialsQuery = useGetWarehouseTransferSerials(
    activeLine?.productId
      ? {
          productId: activeLine.productId,
          // warehouseId: formik.values.sourceWarehouseId,
          page: 1,
          pageSize: 1000,
        }
      : undefined,
  );

  const serialItems = serialsQuery.data?.items ?? [];

  const setLine = (
    index: number,
    patch: Partial<WarehouseTransferForm["lines"][number]>,
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
    const currentProductId = Number(formik.values.lines[index]?.productId)
    const productStock = stockMap.get(currentProductId)
    const nextItems: WarehouseTransferItemForm[] = items.length
      ? items.map((item) => ({
          productTableId: item.id,
          costPrice: productStock?.costPrice ?? null,
          markingNumber: item.markingNumber ?? null,
          serialNumber: item.serialNumber ?? null,
        }))
      : [createDefaultTransferItem()];
      console.log(nextItems);
      

    setLine(index, {
      quantity: items.length || null,
      items: nextItems,
    });
    console.log(nextItems);
  };

  const addLine = () =>
    formik.setFieldValue(
      "lines",
      [...formik.values.lines, createDefaultTransferLine()],
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
        <div className="text-sm font-semibold">Mahsulot qatorlari</div>
        <Button
          type="dashed"
          icon={<Plus className="size-4" />}
          onClick={addLine}
          disabled={disabled}
        >
          Qator qo'shish
        </Button>
      </div>

      {!formik.values.lines.length && <Empty description="Qatorlar yo'q" />}

      <div className="space-y-4">
        {formik.values.lines.map((line, index) => {
          const stock = line.productId
            ? stockMap.get(line.productId)
            : undefined;
          const selectedMarkings = toMarkingList(line.items);
          const totalStock = stock?.quantity ?? 0;
          const canOpenMarking = Boolean(line.productId);

          return (
            <div
              key={`transfer-line-${index}`}
              className="rounded-xl border border-border p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {getRowTitle(index)}
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
                    Mahsulot
                  </div>
                  <Select
                    // value={line.productId}
                    placeholder="Mahsulotni tanlang"
                    loading={stockQuery.isLoading || stockQuery.isFetching}
                    disabled={disabled}
                    showSearch
                    options={(stockQuery.data?.items ?? []).map((item) => ({
                      value: item.id,
                      label: `${item.productName ?? item.name ?? item.productId} - ${numberSpacing(item.quantity, undefined, true)} dona`,
                    }))}
                    onSelect={(value) => {
                      const selected = stockMap.get(Number(value));

                      setLine(index, {
                        productId: Number(value),
                        productName:
                          selected?.productName ?? selected?.name ?? "",
                        unitId: line.unitId,
                        unitName: line.unitName,
                        quantity: selected?.quantity ? 1 : null,
                        items: [createDefaultTransferItem()],
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
                  label="Birlik"
                  path={selectListEndpoints.unitsSelectList}
                  disabled={disabled}
                  getFieldName={`lines[${index}].unitName`}
                />

                <InputNumber
                  formik={formik}
                  fieldName={`lines[${index}].quantity`}
                  label="Miqdor"
                  disabled={disabled}
                  min={0}
                />

                <div className="xl:col-span-2">
                  <InputText
                    formik={formik}
                    fieldName={`lines[${index}].comment`}
                    label="Izoh"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Tag color="blue">
                  Qoldiq: {numberSpacing(totalStock, undefined, true)}
                </Tag>
                <Tag color={selectedMarkings.length ? "green" : "default"}>
                  Markirovka: {selectedMarkings.length}
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
                  disabled={
                    disabled || !canOpenMarking || serialsQuery.isFetching
                  }
                >
                  Markirovka
                </Button>
                {line.productId && !serialItems.length && canOpenMarking && (
                  <span className="text-xs text-secondary-text">
                    Bu mahsulot markirovkasiz
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <WarehouseTransferMarkingModal
        open={activeLineIndex !== null && Boolean(activeLine?.productId)}
        title={activeLine?.productName || "Markirovka tanlash"}
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
