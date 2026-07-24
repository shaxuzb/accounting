import { Button, Select, Tooltip, type TableColumnType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Pencil, QrCode, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountSelectedLabel,
} from "@/shared/constants/selectLists";
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
  purchaseDocumentAccountChartAccountsPath,
  purchaseDocumentTypeIds,
} from "../constants/endpoints";
import {
  getNumber,
  getRowAmount,
  getRowUnitLabel,
  getRowUnitPrice,
  getRowVatAmount,
  toMarkingNumbers,
} from "../utils/purchaseImport";

interface PurchaseChartAccountOption {
  id: number;
  number?: string | number;
  code?: string | number;
  name?: string;
}

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
}: UsePurchaseImportColumnsParams): TableColumnType<PurchaseImportRow>[] => {
  const documentTypeId = purchaseDocumentTypeIds[purchaseMode];
  const chartAccountsPath =
    purchaseDocumentAccountChartAccountsPath(purchaseMode);
  const { data: debitAccounts = [] } = useQuery<
    PurchaseChartAccountOption[]
  >({
    queryKey: [
      "document-account-settings",
      "chart-accounts",
      documentTypeId,
      "purchase_debit",
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<PurchaseChartAccountOption[]>(
        chartAccountsPath,
        { params: { documentRoleCode: "purchase_debit" } },
      );
      return data ?? [];
    },
    enabled,
  });
  const { data: vatAccounts = [] } = useQuery<PurchaseChartAccountOption[]>({
    queryKey: [
      "document-account-settings",
      "chart-accounts",
      documentTypeId,
      "purchase_vat",
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<PurchaseChartAccountOption[]>(
        chartAccountsPath,
        { params: { documentRoleCode: "purchase_vat" } },
      );
      return data ?? [];
    },
    enabled,
  });
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
              ? "Xizmat"
              : "Tovar"
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
                    ? "Xizmat"
                    : "Tovar"
              }
              value={record.productId ?? undefined}
              loading={isLoading}
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
              disabled={isMxikCell && Boolean(record.productId)}
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
      purchaseMode === "goods" && column.dataIndex === "mxik"
        ? [column, markingColumn]
        : [column],
    );

    return [
      ...orderedEditableColumns,
      {
        dataIndex: "unitId",
        title: "Birlik",
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
        width: 100,
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
        align: "center",
        render: (_: unknown, record: PurchaseImportRow) => {
          const qty = getNumber(record.qty);
          const price = getRowUnitPrice(record);
          return numberSpacing(qty * price, undefined, true);
        },
      },
      {
        dataIndex: "vatRateId",
        title: "QQS (foiz va summa)",
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => {
          const vatAmount = getRowVatAmount(record, vatRateOptions);
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
        align: "center",
        render: (_: unknown, record: PurchaseImportRow) => {
          const amount = getRowAmount(record);
          const vatAmount = getRowVatAmount(record, vatRateOptions);
          return numberSpacing(amount + vatAmount, undefined, true);
        },
      },
      {
        dataIndex: "accounts",
        title: "Hisobvaraqlar",
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
              title="Hisobvaraqlarni tanlash"
              onClick={() => openAccountModal(rowIndex)}
            />
          </div>
        ),
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
    isMxikValid,
    itemOptions,
    openAccountModal,
    openMarkingModal,
    purchaseMode,
    unitOptions,
    vatRateOptions,
    chartAccountById,
  ]);
};
