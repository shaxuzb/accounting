import { Button, Select, Tooltip, type TableColumnType } from "antd";
import { QrCode, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { numberSpacing } from "@/utils/utils";
import PurchaseImportEditableCell from "../components/PurchaseImportEditableCell";
import type {
  ProductSelectOption,
  PurchaseImportRow,
  PurchaseMode,
  SelectOption,
} from "../types/type";
import type { ImportColumnConfig } from "../utils/importColumns";
import {
  getNumber,
  getRowAmount,
  getRowUnitLabel,
  getRowUnitPrice,
  getRowVatAmount,
  toMarkingNumbers,
} from "../utils/purchaseImport";

interface UsePurchaseImportColumnsParams {
  columnConfig: ImportColumnConfig[];
  handleCellCommit: (
    rowIndex: number,
    dataIndex: string,
    rawValue: string,
  ) => void;
  handleDeleteRow: (rowIndex: number) => void;
  handleItemSelect: (rowIndex: number, value: number) => void;
  handleRowValueChange: (
    rowIndex: number,
    patch: Partial<PurchaseImportRow>,
  ) => void;
  isLoading: boolean;
  isSapCodeValid: (value: unknown) => boolean;
  isServicesLoading: boolean;
  itemOptions: ProductSelectOption[];
  openMarkingModal: (rowIndex: number) => void;
  purchaseMode: PurchaseMode;
  unitOptions: SelectOption[];
  vatRateOptions: SelectOption[];
}

export const usePurchaseImportColumns = ({
  columnConfig,
  handleCellCommit,
  handleDeleteRow,
  handleItemSelect,
  handleRowValueChange,
  isLoading,
  isSapCodeValid,
  isServicesLoading,
  itemOptions,
  openMarkingModal,
  purchaseMode,
  unitOptions,
  vatRateOptions,
}: UsePurchaseImportColumnsParams): TableColumnType<PurchaseImportRow>[] =>
  useMemo(() => {
    const visibleColumnConfig = columnConfig.filter(
      (col) =>
        ![
          "serialNumber",
          "markingNumber",
          "qty",
          "price",
          "pricePerUom",
        ].includes(col.code),
    );

    const editableColumns = visibleColumnConfig.map((col) => {
      const baseColumn: TableColumnType<PurchaseImportRow> = {
        dataIndex: col.dataIndex,
        title:
          col.code === "product"
            ? purchaseMode === "services"
              ? "Xizmat"
              : "Tovar"
            : col.code === "sapCode"
              ? "MXIK"
              : col.title,
        width: col.width,
        align: col.align,
        ellipsis: false,
      };

      if (col.code === "indexId") {
        return {
          ...baseColumn,
          render: col.render,
        };
      }

      if (col.code === "product") {
        return {
          ...baseColumn,
          width: 280,
          render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => (
            <Select
              showSearch
              className="w-full"
              placeholder={purchaseMode === "services" ? "Xizmat" : "Tovar"}
              value={record.productId ?? undefined}
              loading={isLoading || isServicesLoading}
              options={itemOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              onChange={(value) => handleItemSelect(rowIndex, Number(value))}
              size="medium"
            />
          ),
        };
      }

      return {
        ...baseColumn,
        render: (
          value: unknown,
          record: PurchaseImportRow,
          rowIndex: number,
        ) => {
          const isSapCodeCell = col.code === "sapCode";
          const hasSapCodeValue = String(value ?? "").trim().length > 0;
          const invalidSapCode =
            isSapCodeCell && hasSapCodeValue && !isSapCodeValid(value);

          return (
            <PurchaseImportEditableCell
              value={value}
              dataIndex={String(col.dataIndex)}
              rowIndex={rowIndex ?? 0}
              onCommit={handleCellCommit}
              isInvalid={invalidSapCode}
              disabled={isSapCodeCell && Boolean(record.productId)}
            />
          );
        },
      };
    });

    const markingColumn: TableColumnType<PurchaseImportRow> = {
      dataIndex: "markingNumber",
      title: "Markirovka",
      width: 130,
      align: "center",
      render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => {
        const markingCount = toMarkingNumbers(record).length;
        const isTracked = Boolean(record.isPieceTracked);
        return (
          <Tooltip
            title={
              isTracked
                ? markingCount
                  ? `${markingCount} ta markirovka`
                  : "Markirovka kiritish"
                : "Bu mahsulot markirovkasiz"
            }
          >
            <Button
              type="text"
              disabled={!isTracked}
              className="text-primary"
              icon={<QrCode className="size-5" />}
              onClick={() => openMarkingModal(rowIndex)}
            >
              {markingCount || ""}
            </Button>
          </Tooltip>
        );
      },
    };

    const orderedEditableColumns = editableColumns.flatMap((column) =>
      purchaseMode === "goods" && column.dataIndex === "sapCode"
        ? [column, markingColumn]
        : [column],
    );

    return [
      ...orderedEditableColumns,
      {
        dataIndex: "unitId",
        title: "Birlik",
        width: 140,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) =>
          getRowUnitLabel(record) ? (
            <span className="font-medium">{getRowUnitLabel(record)}</span>
          ) : (
            <Select
              showSearch
              className="w-full"
              placeholder="Birlik"
              value={(record.unitId as number | null) ?? undefined}
              options={unitOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              onChange={(value) =>
                handleRowValueChange(rowIndex, { unitId: Number(value) })
              }
            />
          ),
      },
      {
        dataIndex: "qty",
        title: "Miqdor",
        width: 120,
        align: "center",
        render: (value: unknown, record: PurchaseImportRow, rowIndex: number) => (
          <PurchaseImportEditableCell
            value={value}
            dataIndex="qty"
            rowIndex={rowIndex ?? 0}
            onCommit={handleCellCommit}
            disabled={purchaseMode === "goods" && Boolean(record.isPieceTracked)}
          />
        ),
      } satisfies TableColumnType<PurchaseImportRow>,
      {
        dataIndex: "price",
        title: "Narx",
        width: 140,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => (
          <PurchaseImportEditableCell
            value={getRowUnitPrice(record)}
            dataIndex="price"
            rowIndex={rowIndex ?? 0}
            onCommit={handleCellCommit}
          />
        ),
      } satisfies TableColumnType<PurchaseImportRow>,
      {
        dataIndex: "amount",
        title: "Summa",
        width: 140,
        align: "right",
        render: (_: unknown, record: PurchaseImportRow) => {
          const qty = getNumber(record.qty);
          const price = getRowUnitPrice(record);
          return numberSpacing(qty * price, undefined, true);
        },
      },
      {
        dataIndex: "vatRateId",
        title: "QQS (foiz va summa)",
        width: 260,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => {
          const vatAmount = getRowVatAmount(record, vatRateOptions);
          return (
            <div className="flex items-center gap-2">
              <Select
                showSearch
                allowClear
                className="min-w-28"
                placeholder="QQS"
                value={record.vatRateId ?? undefined}
                options={vatRateOptions.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                onChange={(value) =>
                  handleRowValueChange(rowIndex, {
                    vatRateId: value ? Number(value) : null,
                  })
                }
              />
              <span className="min-w-24 text-right">
                {numberSpacing(vatAmount)}
              </span>
            </div>
          );
        },
      },
      {
        dataIndex: "totalAmount",
        title: "Jami",
        width: 140,
        align: "right",
        render: (_: unknown, record: PurchaseImportRow) => {
          const amount = getRowAmount(record);
          const vatAmount = getRowVatAmount(record, vatRateOptions);
          return numberSpacing(amount + vatAmount, undefined, true);
        },
      },
      {
        dataIndex: "actions",
        // title: "Amallar",
        render: (_: unknown, __: PurchaseImportRow, rowIndex: number) => (
          <Tooltip title="Qatorni o'chirish">
            <Button
              danger
              type="text"
              icon={<Trash2 className="size-4" />}
              onClick={() => handleDeleteRow(rowIndex)}
            />
          </Tooltip>
        ),
      } satisfies TableColumnType<PurchaseImportRow>,
    ];
  }, [
    columnConfig,
    handleCellCommit,
    handleDeleteRow,
    handleItemSelect,
    handleRowValueChange,
    isLoading,
    isSapCodeValid,
    isServicesLoading,
    itemOptions,
    openMarkingModal,
    purchaseMode,
    unitOptions,
    vatRateOptions,
  ]);
