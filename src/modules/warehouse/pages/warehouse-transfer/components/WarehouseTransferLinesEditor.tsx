import { useMemo, useState } from "react";
import { Button, Col, Empty, Form, Row, Select, Tag } from "antd";
import type { FormikProps } from "formik";
import { Plus, Trash2 } from "lucide-react";
import Card from "@/components/ui/card/Card";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import { useGetWarehouseTransferStocks } from "../hooks/useGetWarehouseTransferStocks";
import { useGetWarehouseTransferProducts } from "../hooks/useGetWarehouseTransferProducts";
import { useGetWarehouseTransferSerials } from "../hooks/useGetWarehouseTransferSerials";
import type {
  WarehouseTransferForm,
  WarehouseTransferItemForm,
} from "../types/form";
import type {
  ProductStock,
  ProductStockSerial,
} from "../../warehouse/types/type";
import { useTranslation } from "react-i18next";
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

export default function WarehouseTransferLinesEditor({
  formik,
  disabled = false,
}: Props) {
  const { t } = useTranslation();
  const sourceWarehouseId = formik.values.sourceWarehouseId;

  const stockQuery = useGetWarehouseTransferStocks({
    warehouseId: sourceWarehouseId,
    isService: false,
    page: 1,
    pageSize: 1000,
  });

  const manualProductsQuery = useGetWarehouseTransferProducts({
    isService: false,
    warehouseId: sourceWarehouseId,
  });

  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const stockMap = useMemo(() => {
    const map = new Map<number, ProductStock>();
    (stockQuery.data?.items ?? []).forEach((item) => {
      map.set(item.id, item);
      if (item.productId !== item.id) {
        map.set(item.productId, item);
      }
    });
    return map;
  }, [stockQuery.data?.items]);

  const manualProductMap = useMemo(() => {
    const map = new Map<
      number,
      {
        name?: string;
        unitName?: string | null;
      }
    >();

    (manualProductsQuery.data ?? []).forEach((item) => {
      map.set(Number(item.id), {
        name: item.name,
        unitName: item.unitName ?? item.unit,
      });
    });

    return map;
  }, [manualProductsQuery.data]);

  const manualProductOptions = useMemo(
    () =>
      (manualProductsQuery.data ?? []).map((item) => ({
        value: item.id,
        label: item.name ?? String(item.id),
      })),
    [manualProductsQuery.data],
  );

  const activeLine =
    activeLineIndex !== null ? formik.values.lines[activeLineIndex] : null;

  const serialsQuery = useGetWarehouseTransferSerials(
    activeLine?.productId
      ? {
          productId: activeLine.productId,
          warehouseId: sourceWarehouseId,
          isService: false,
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
    const currentProductId = Number(formik.values.lines[index]?.productId);
    const productStock = stockMap.get(currentProductId);
    const nextItems: WarehouseTransferItemForm[] = items.length
      ? items.map((item) => ({
          productTableId: item.id,
          costPrice: productStock?.costPrice ?? null,
          markingNumber: item.markingNumber ?? null,
          serialNumber: item.serialNumber ?? null,
        }))
      : [createDefaultTransferItem()];

    setLine(index, {
      quantity: items.length || null,
      items: nextItems,
    });
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

              <Form layout="vertical">
                <Row gutter={[16, 0]}>
                  <Col span={12}>
                    <div className="mb-1 text-sm text-secondary-text pb-2">
                      {t("warehouse.fields.productName")}
                    </div>
                    <Select
                      value={line.productId}
                      placeholder={t("warehouse.lines.selectProduct")}
                      loading={
                        manualProductsQuery.isLoading ||
                        manualProductsQuery.isFetching
                      }
                      disabled={disabled || !sourceWarehouseId}
                      showSearch
                      optionFilterProp="label"
                      options={manualProductOptions}
                      style={{ width: "100%" }}
                      onChange={(value) => {
                        const selectedProductId = Number(value);
                        const selectedStock = stockMap.get(selectedProductId);
                        const selectedManual =
                          manualProductMap.get(selectedProductId);

                        setLine(index, {
                          productId: Number.isNaN(selectedProductId)
                            ? null
                            : selectedProductId,
                          productName:
                            selectedStock?.productName ??
                            selectedStock?.name ??
                            selectedManual?.name ??
                            "",
                          unitId: line.unitId,
                          unitName:
                            line.unitName ||
                            selectedManual?.unitName?.trim() ||
                            null,
                          quantity: selectedStock?.quantity ? 1 : null,
                          items: [createDefaultTransferItem()],
                        });
                        setActiveLineIndex(index);
                        setSelectedRowKeys([]);
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <InputNumber
                      formik={formik}
                      fieldName={`lines[${index}].quantity`}
                      label={t("openingInventory.fields.quantity")}
                      disabled={disabled}
                      min={0}
                    />
                  </Col>
                  <Col span={6}>
                    <SelectCustom
                      formik={formik}
                      fieldName={`lines[${index}].unitId`}
                      label={t("purchase.fields.unit")}
                      path={selectListEndpoints.unitsSelectList}
                      disabled={disabled}
                      getFieldName={`lines[${index}].unitName`}
                    />
                  </Col>

                  <Col span={24}>
                    <InputText
                      formik={formik}
                      fieldName={`lines[${index}].comment`}
                      label={t("openingInventory.fields.comment")}
                      disabled={disabled}
                    />
                  </Col>
                </Row>
              </Form>
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
                  disabled={
                    disabled || !canOpenMarking || serialsQuery.isFetching
                  }
                >
                  {t("warehouse.lines.marking")}
                </Button>
                {!sourceWarehouseId && (
                  <span className="text-xs text-red-500">
                    {t("warehouse.lines.selectSourceWarehouseFirst")}
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

      <WarehouseTransferMarkingModal
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
