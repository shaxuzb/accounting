import { Button, Select, Tooltip, type TableColumnType } from "antd";
import { Pencil, QrCode, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { chartAccountSelectedLabel } from "@/shared/constants/selectLists";
import { useDocumentAccountOptions } from "@/shared/documentAccounts";
import { numberSpacing } from "@/utils/utils";
import OpeningInventoryEditableCell from "../components/OpeningInventoryEditableCell";
import type {
  ProductSelectOption,
  OpeningInventoryRow,
  OpeningInventoryMode,
  SelectOption,
} from "../types/type";
import { openingInventoryDocumentTypeIds } from "../constants/endpoints";
import {
  getNumber,
  getRowAmount,
  getRowUnitLabel,
  getRowUnitPrice,
  getRowVatAmount,
  toMarkingNumbers,
} from "../utils/openingInventory";

interface UseOpeningInventoryColumnsParams {
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
    patch: Partial<OpeningInventoryRow>,
  ) => void;
  isLoading: boolean;
  itemOptions: ProductSelectOption[];
  rows: OpeningInventoryRow[];
  mode: OpeningInventoryMode;
  openMarkingModal: (rowIndex: number) => void;
  openAccountModal: (rowIndex: number) => void;
  unitOptions: SelectOption[];
  vatRateOptions: SelectOption[];
}

export const useOpeningInventoryColumns = ({
  enabled = true,
  handleCellCommit,
  handleDeleteRow,
  handleItemSelect,
  handleRowValueChange,
  isLoading,
  itemOptions,
  rows,
  mode,
  openMarkingModal,
  openAccountModal,
  unitOptions,
  vatRateOptions,
}: UseOpeningInventoryColumnsParams): TableColumnType<OpeningInventoryRow>[] => {
  const { t } = useTranslation();

  const { data: debitAccounts = [] } = useDocumentAccountOptions(
    openingInventoryDocumentTypeIds[mode],
    "purchase_debit",
    enabled,
  );

  const chartAccounts = useMemo(
    () =>
      Array.from(
        new Map(
          debitAccounts.map((account) => [
            Number(account.id),
            account,
          ]),
        ).values(),
      ),
    [debitAccounts],
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

    const getAccountPreview = (row: OpeningInventoryRow) =>
      getAccountPreviewLabel(row.debitAccountId, row.debitAccountName) ||
      (row.debitAccountId ? `#${row.debitAccountId}` : "—");

    const columns: TableColumnType<OpeningInventoryRow>[] = [
      {
        dataIndex: "indexId",
        title: t("common.rowNumber"),
        width: 50,
        align: "center",
        render: (value) => String(value ?? ""),
      },
      {
        dataIndex: "product",
        title:
          mode === "services"
            ? t("openingInventory.fields.serviceName")
            : t("openingInventory.fields.goodsName"),
        width: 280,
        render: (_: unknown, record: OpeningInventoryRow, rowIndex: number) => (
          <Select
            showSearch
            className="w-full"
            placeholder={
              record.product ||
              (mode === "services"
                ? t("openingInventory.messages.selectService")
                : t("openingInventory.messages.selectGoods"))
            }
            value={record.productId ?? undefined}
            loading={isLoading}
            options={itemOptions.map((item) => ({
              value: item.id,
              label: item.name,
              disabled: rows.some(
                (row, index) =>
                  index !== rowIndex && row.productId === item.id,
              ),
            }))}
            onChange={(value) => handleItemSelect(rowIndex, Number(value))}
            size="middle"
          />
        ),
      },
      ...(mode === "goods"
        ? ([{
        dataIndex: "mxik",
        title: t("purchase.fields.mxik"),
        width: 160,
        align: "center",
        render: (value: unknown, record: OpeningInventoryRow, rowIndex: number) => (
          <OpeningInventoryEditableCell
            value={value}
            dataIndex="mxik"
            rowIndex={rowIndex}
            onCommit={handleCellCommit}
            disabled={Boolean(record.productId)}
          />
        ),
      }, {
        dataIndex: "markingNumber",
        title: t("app.fields.marking"),
        width: 130,
        align: "center",
        render: (_: unknown, record: OpeningInventoryRow, rowIndex: number) => {
          const markingCount = toMarkingNumbers(record).length;
          const isTracked = Boolean(record.isPieceTracked);
          return (
            <Tooltip
              title={
                isTracked
                  ? markingCount
                    ? t("openingInventory.messages.markingCount", {
                        count: markingCount,
                      })
                    : t("openingInventory.messages.enterMarking")
                  : t("openingInventory.messages.notPieceTracked")
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
      }] as TableColumnType<OpeningInventoryRow>[])
        : []),
      {
        dataIndex: "unitId",
        title: t("openingInventory.fields.unit"),
        width: 120,
        align: "center",
        render: (_: unknown, record: OpeningInventoryRow, rowIndex: number) =>
          getRowUnitLabel(record) ? (
            <span className="font-medium">{getRowUnitLabel(record)}</span>
          ) : (
            <Select
              showSearch
              className="w-full"
              placeholder={t("openingInventory.fields.unit")}
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
        title: t("openingInventory.fields.quantity"),
        width: 100,
        align: "center",
        render: (value: unknown, record: OpeningInventoryRow, rowIndex: number) => (
          <OpeningInventoryEditableCell
            value={value}
            dataIndex="qty"
            rowIndex={rowIndex}
            onCommit={handleCellCommit}
            disabled={Boolean(record.isPieceTracked)}
          />
        ),
      },
      {
        dataIndex: "price",
        title: t("openingInventory.fields.price"),
        width: 140,
        align: "center",
        render: (_: unknown, record: OpeningInventoryRow, rowIndex: number) => (
          <OpeningInventoryEditableCell
            value={getRowUnitPrice(record)}
            dataIndex="price"
            rowIndex={rowIndex}
            onCommit={handleCellCommit}
          />
        ),
      },
      {
        dataIndex: "amount",
        title: t("openingInventory.fields.amount"),
        width: 140,
        align: "center",
        render: (_: unknown, record: OpeningInventoryRow) => {
          const qty = getNumber(record.qty);
          const price = getRowUnitPrice(record);
          return numberSpacing(qty * price, undefined, true);
        },
      },
      {
        dataIndex: "vatRateId",
        title: t("openingInventory.fields.vatRateAndAmount"),
        align: "center",
        render: (_: unknown, record: OpeningInventoryRow, rowIndex: number) => {
          const vatAmount = getRowVatAmount(record, vatRateOptions);
          return (
            <div className="flex items-center">
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                className="min-w-28"
                placeholder={t("settings.fields.vatRate")}
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
        title: t("common.total"),
        width: 140,
        align: "center",
        render: (_: unknown, record: OpeningInventoryRow) => {
          const amount = getRowAmount(record);
          const vatAmount = getRowVatAmount(record, vatRateOptions);
          return numberSpacing(amount + vatAmount, undefined, true);
        },
      },
      {
        dataIndex: "accounts",
        title: t("openingInventory.fields.accounts"),
        align: "center",
        render: (_: unknown, record: OpeningInventoryRow, rowIndex: number) => (
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
              title={t("openingInventory.actions.selectAccounts")}
              onClick={() => openAccountModal(rowIndex)}
            />
          </div>
        ),
      },
      {
        dataIndex: "actions",
        render: (_: unknown, __: OpeningInventoryRow, rowIndex: number) => (
          <Tooltip title={t("openingInventory.actions.deleteLine")}>
            <Button
              danger
              type="text"
              icon={<Trash2 className="size-4" />}
              onClick={() => handleDeleteRow(rowIndex)}
            />
          </Tooltip>
        ),
      },
    ];

    return columns;
  }, [
    handleCellCommit,
    handleDeleteRow,
    handleItemSelect,
    handleRowValueChange,
    isLoading,
    itemOptions,
    mode,
    openAccountModal,
    openMarkingModal,
    rows,
    unitOptions,
    vatRateOptions,
    chartAccountById,
    t,
  ]);
};
