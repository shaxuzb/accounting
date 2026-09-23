import { Button, Select, Tooltip, type TableColumnType } from "antd";
import { Pencil, QrCode, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  chartAccountSelectedLabel,
} from "@/shared/constants/selectLists";
import { useDocumentAccountOptions } from "@/shared/documentAccounts";
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
  purchaseDocumentTypeIds,
} from "../constants/endpoints";
import {
  getRowMarkingCount,
  getRowMoney,
  getRowUnitLabel,
  getRowUnitPrice,
} from "../utils/purchaseImport";

interface UsePurchaseImportColumnsParams {
  columnConfig: ImportColumnConfig[];
  enabled?: boolean;
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
  isMxikValid: (value: unknown) => boolean;
  itemOptions: ProductSelectOption[];
  openMarkingModal: (rowIndex: number) => void;
  openAccountModal: (rowIndex: number) => void;
  purchaseMode: PurchaseMode;
  unitOptions: SelectOption[];
  vatRateOptions: SelectOption[];
  /** Entered prices already contain VAT (it is extracted, not added on top). */
  priceIncludesVat?: boolean;
  readOnlyValues?: boolean;
  disabled?: boolean;
}

export const usePurchaseImportColumns = ({
  columnConfig,
  enabled = true,
  handleCellCommit,
  handleDeleteRow,
  handleItemSelect,
  handleRowValueChange,
  isLoading,
  isMxikValid,
  itemOptions,
  openMarkingModal,
  openAccountModal,
  purchaseMode,
  unitOptions,
  vatRateOptions,
  priceIncludesVat = false,
  readOnlyValues = false,
  disabled = false,
}: UsePurchaseImportColumnsParams): TableColumnType<PurchaseImportRow>[] => {
  const { t } = useTranslation();
  const documentTypeId = purchaseDocumentTypeIds[purchaseMode];
  const { data: debitAccounts = [] } = useDocumentAccountOptions(
    documentTypeId,
    "purchase_debit",
    enabled,
  );
  const { data: vatAccounts = [] } = useDocumentAccountOptions(
    documentTypeId,
    "purchase_vat",
    enabled,
  );
  const chartAccounts = useMemo(
    () =>
      Array.from(
        new Map(
          [...debitAccounts, ...vatAccounts].map((account) => [
            Number(account.id),
            account,
          ]),
        ).values(),
      ),
    [debitAccounts, vatAccounts],
  );
  const chartAccountById = useMemo(
    () =>
      new Map(
        chartAccounts.map((account) => [Number(account.id), account] as const),
      ),
    [chartAccounts],
  );

  return useMemo(() => {
    const getAccountPreviewLabel = (
      accountId: number | null | undefined,
      accountName: string | undefined,
    ) => {
      const account = chartAccountById.get(Number(accountId));
      return account
        ? chartAccountSelectedLabel(account)
        : accountName || (accountId ? String(accountId) : "—");
    };

    const getAccountPreview = (row: PurchaseImportRow) =>
      [
        getAccountPreviewLabel(row.debitAccountId, row.debitAccountName) ||
          (row.debitAccountId ? `#${row.debitAccountId}` : "—"),
        getAccountPreviewLabel(row.vatAccountId, row.vatAccountName) ||
          (row.vatAccountId ? `#${row.vatAccountId}` : "—"),
      ].join(" / ");

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
              ? t("purchase.fields.service")
              : t("purchase.fields.goods")
            : col.code === "mxik"
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
              optionFilterProp="label"
              className="w-full"
              placeholder={
                record.product
                  ? String(record.product)
                  : purchaseMode === "services"
                    ? t("purchase.fields.service")
                    : t("purchase.fields.goods")
              }
              value={record.productId ?? undefined}
              loading={isLoading}
              options={itemOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              onChange={(value) => handleItemSelect(rowIndex, Number(value))}
              disabled={disabled}
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
          const isMxikCell = col.code === "mxik";
          const hasMxikValue = String(value ?? "").trim().length > 0;
          const invalidMxik =
            isMxikCell && hasMxikValue && !isMxikValid(value);

          return (
            <PurchaseImportEditableCell
              value={value}
              dataIndex={String(col.dataIndex)}
              rowIndex={rowIndex ?? 0}
              onCommit={handleCellCommit}
              isInvalid={invalidMxik}
              disabled={readOnlyValues || (isMxikCell && Boolean(record.productId))}
            />
          );
        },
      };
    });

    const markingColumn: TableColumnType<PurchaseImportRow> = {
      dataIndex: "markingNumber",
      title: t("app.fields.marking"),
      width: 130,
      align: "center",
      render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => {
        const markingCount = getRowMarkingCount(record);
        return (
          <Tooltip
            title={
              markingCount
                ? t("purchase.messages.markingCount", { count: markingCount })
                : t("purchase.messages.unmarkedLine")
            }
          >
            <Button
              type="text"
              disabled={disabled || readOnlyValues}
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
      purchaseMode === "goods" && column.dataIndex === "mxik"
        ? [column, markingColumn]
        : [column],
    );

    return [
      ...orderedEditableColumns,
      {
        dataIndex: "unitId",
        title: t("purchase.fields.uom"),
        width: 120,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) =>
          getRowUnitLabel(record) ? (
            <span className="font-medium">{getRowUnitLabel(record)}</span>
          ) : (
            <Select
              showSearch
              optionFilterProp="label"
              className="w-full"
              placeholder={t("purchase.fields.uom")}
              value={(record.unitId as number | null) ?? undefined}
              options={unitOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              disabled={disabled}
              onChange={(value) =>
                handleRowValueChange(rowIndex, { unitId: Number(value) })
              }
            />
          ),
      },
      {
        dataIndex: "qty",
        title: t("purchase.fields.quantity"),
        width: 100,
        align: "center",
        render: (value: unknown, record: PurchaseImportRow, rowIndex: number) => (
          <PurchaseImportEditableCell
            value={value}
            dataIndex="qty"
            rowIndex={rowIndex ?? 0}
            onCommit={handleCellCommit}
            // A marked line counts its codes; an unmarked one (goods bought before
            // marking was mandatory) is entered by quantity.
            disabled={
              disabled ||
              readOnlyValues ||
              (purchaseMode === "goods" && getRowMarkingCount(record) > 0)
            }
          />
        ),
      } satisfies TableColumnType<PurchaseImportRow>,
      {
        dataIndex: "price",
        title: t("purchase.fields.price"),
        width: 140,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => (
          <PurchaseImportEditableCell
            value={getRowUnitPrice(record)}
            dataIndex="price"
            rowIndex={rowIndex ?? 0}
            onCommit={handleCellCommit}
            disabled={disabled || readOnlyValues}
          />
        ),
      } satisfies TableColumnType<PurchaseImportRow>,
      {
        dataIndex: "amount",
        title: t("purchase.fields.amountWithoutVat"),
        width: 140,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow) =>
          numberSpacing(
            getRowMoney(record, vatRateOptions, priceIncludesVat).net,
            undefined,
            true,
          ),
      },
      {
        dataIndex: "vatRateId",
        title: t("purchase.fields.vatRateAndAmount"),
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => {
          const vatAmount = getRowMoney(record, vatRateOptions, priceIncludesVat).vat;
          return (
            <div className="flex items-center">
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                className="min-w-28"
                placeholder="QQS"
                value={record.vatRateId ?? undefined}
                options={vatRateOptions.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                disabled={disabled}
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
        title: t("common.total"),
        width: 140,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow) =>
          numberSpacing(
            getRowMoney(record, vatRateOptions, priceIncludesVat).total,
            undefined,
            true,
          ),
      },
      {
        dataIndex: "accounts",
        title: t("purchase.fields.accounts"),
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => (
          <div className="flex min-w-30 items-center">
            <span
              className="min-w-0 flex-1 truncate text-xs text-left"
              title={getAccountPreview(record)}
            >
              {getAccountPreview(record)}
            </span>
            <Button
              type="text"
              size="small"
              icon={<Pencil className="size-4" />}
              title={t("purchase.actions.selectAccounts")}
              onClick={() => openAccountModal(rowIndex)}
              disabled={disabled}
            />
          </div>
        ),
      },
      {
        dataIndex: "actions",
        // title: "Amallar",
        render: (_: unknown, __: PurchaseImportRow, rowIndex: number) => readOnlyValues ? null : (
          <Tooltip title={t("purchase.actions.deleteLine")}>
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
    isMxikValid,
    itemOptions,
    openAccountModal,
    openMarkingModal,
    purchaseMode,
    unitOptions,
    vatRateOptions,
    priceIncludesVat,
    chartAccountById,
    readOnlyValues,
    disabled,
    t,
  ]);
};
