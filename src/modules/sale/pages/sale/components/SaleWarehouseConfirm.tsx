import { Button, Checkbox, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import useLocalStorage from "@/hooks/UseLocalStorage";
import Card from "@/components/ui/card/Card";
import LineClampCell from "@/components/widget/text/LineClampCell";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import {
  useGetAvailableSaleProducts,
  useWarehouseConfirmSale,
} from "../hooks";
import type {
  SaleDoc,
  SaleDocProduct,
  SaleDocTable,
} from "../types/type";
import SaleBarcodeScanner from "./SaleBarcodeScanner";

interface Props {
  document: SaleDoc;
}

interface WarehouseConfirmRow {
  rowId: string;
  groupKey: string;
  saleDocProductId: number;
  expectedProductTableId: number | null;
  productId: number;
  productName: string;
  unitName?: string;
  quantity: number;
  isPieceTracked: boolean;
  batchId: number | null;
  batchNumber?: string | null;
  batchDate?: string | null;
  expectedMarkingNumber?: string | null;
  productTableId: number | null;
  markingNumber?: string | null;
  confirmed: boolean;
}

interface WarehouseConfirmGroup {
  key: string;
  productName: string;
  unitName?: string;
  rows: WarehouseConfirmRow[];
}

interface WarehouseConfirmBatch {
  key: string;
  batchId: number | null;
  batchNumber?: string | null;
  batchDate?: string | null;
  rows: WarehouseConfirmRow[];
}

interface WarehouseConfirmDraftItem {
  rowId: string;
  productTableId?: number | null;
  markingNumber?: string | null;
  confirmed?: boolean;
}

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getGroupKey = (productId: number, productName: string) =>
  [productId, productName].join(":");

const getSaleBatches = (
  product: Pick<SaleDocProduct, "batches" | "quantity"> | Pick<SaleDocTable, "batches" | "quantity">,
) =>
  product.batches?.length
    ? product.batches
    : [{ batchId: 0, quantity: toNumber(product.quantity) }];

const buildRowsFromLine = (
  line: SaleDocTable,
  index: number,
): WarehouseConfirmRow[] => {
  const groupKey = getGroupKey(line.productId, line.productName);
  const batches = getSaleBatches(line);

  if (line.isPieceTracked === false) {
    return batches.map((batch, batchIndex) => ({
      rowId: `line-${line.id}-${index}-batch-${batch.batchId || batchIndex}`,
      groupKey,
      saleDocProductId: line.id,
      expectedProductTableId: null,
      productId: line.productId,
      productName: line.productName,
      unitName: line.unitName,
      quantity: Math.max(0, toNumber(batch.quantity)),
      isPieceTracked: false,
      batchId: batch.batchId || null,
      batchNumber: batch.batchNumber,
      batchDate: batch.batchDate,
      productTableId: null,
      markingNumber: null,
      confirmed: false,
    }));
  }

  return batches.flatMap((batch, batchIndex) =>
    Array.from(
      { length: Math.max(0, Math.round(toNumber(batch.quantity))) },
      (_, quantityIndex) => ({
        rowId: `line-${line.id}-${index}-batch-${batch.batchId || batchIndex}-${quantityIndex}`,
        groupKey,
        saleDocProductId: line.id,
        expectedProductTableId: null,
        productId: line.productId,
        productName: line.productName,
        unitName: line.unitName,
        quantity: 1,
        isPieceTracked: true,
        batchId: batch.batchId || null,
        batchNumber: batch.batchNumber,
        batchDate: batch.batchDate,
        productTableId: null,
        markingNumber: null,
        confirmed: false,
      }),
    ),
  );
};

const buildRowsFromProduct = (
  product: SaleDocProduct,
  index: number,
): WarehouseConfirmRow[] => {
  const productName = product.productName;
  const groupKey = getGroupKey(product.productId, productName);
  const batches = getSaleBatches(product);

  if (product.isPieceTracked === false) {
    return batches.map((batch, batchIndex) => ({
      rowId: `product-${product.id}-${index}-batch-${batch.batchId || batchIndex}`,
      groupKey,
      saleDocProductId: product.id,
      expectedProductTableId: null,
      productId: product.productId,
      productName,
      unitName: product.unitName,
      quantity: Math.max(0, toNumber(batch.quantity)),
      isPieceTracked: false,
      batchId: batch.batchId || null,
      batchNumber: batch.batchNumber,
      batchDate: batch.batchDate,
      productTableId: null,
      markingNumber: null,
      confirmed: false,
    }));
  }

  return batches.flatMap((batch, batchIndex) =>
    Array.from(
      { length: Math.max(0, Math.round(toNumber(batch.quantity))) },
      (_, quantityIndex) => ({
        rowId: `product-${product.id}-${index}-batch-${batch.batchId || batchIndex}-${quantityIndex}`,
        groupKey,
        saleDocProductId: product.id,
        expectedProductTableId: null,
        productId: product.productId,
        productName,
        unitName: product.unitName,
        quantity: 1,
        isPieceTracked: true,
        batchId: batch.batchId || null,
        batchNumber: batch.batchNumber,
        batchDate: batch.batchDate,
        productTableId: null,
        markingNumber: null,
        confirmed: false,
      }),
    ),
  );
};

const buildRows = (
  document: SaleDoc,
): WarehouseConfirmRow[] => {
  if (document.lines?.length) {
    return document.lines.flatMap((line, index) =>
      buildRowsFromLine(line, index),
    );
  }

  return (document.products ?? []).flatMap((product, index) =>
    buildRowsFromProduct(product, index),
  );
};

const buildGroups = (rows: WarehouseConfirmRow[]): WarehouseConfirmGroup[] => {
  const map = new Map<string, WarehouseConfirmGroup>();

  rows.forEach((row) => {
    const existing = map.get(row.groupKey);
    if (existing) {
      existing.rows.push(row);
      return;
    }

    map.set(row.groupKey, {
      key: row.groupKey,
      productName: row.productName,
      unitName: row.unitName,
      rows: [row],
    });
  });

  return Array.from(map.values());
};

const buildBatchGroups = (
  rows: WarehouseConfirmRow[],
): WarehouseConfirmBatch[] => {
  const map = new Map<string, WarehouseConfirmBatch>();

  rows.forEach((row) => {
    const key = [row.batchId ?? "none", row.batchNumber ?? "", row.batchDate ?? ""].join(
      ":",
    );
    const existing = map.get(key);
    if (existing) {
      existing.rows.push(row);
      return;
    }

    map.set(key, {
      key,
      batchId: row.batchId,
      batchNumber: row.batchNumber,
      batchDate: row.batchDate,
      rows: [row],
    });
  });

  return Array.from(map.values());
};

const mergeDraftRows = (
  rows: WarehouseConfirmRow[],
  draft: WarehouseConfirmDraftItem[],
) => {
  const draftByRowId = new Map(draft.map((item) => [item.rowId, item]));

  return rows.map((row) => {
    const savedRow = draftByRowId.get(row.rowId);

    return savedRow
      ? {
          ...row,
          productTableId: savedRow.productTableId ?? null,
          markingNumber: savedRow.markingNumber,
          confirmed: Boolean(savedRow.confirmed),
        }
      : row;
  });
};

const toDraftItems = (rows: WarehouseConfirmRow[]): WarehouseConfirmDraftItem[] =>
  rows
    .filter((row) => row.productTableId || row.confirmed)
    .map((row) => ({
      rowId: row.rowId,
      productTableId: row.productTableId,
      markingNumber: row.markingNumber,
      confirmed: row.confirmed,
    }));

const isRowConfirmed = (row: WarehouseConfirmRow) =>
  row.isPieceTracked ? Boolean(row.productTableId) : row.confirmed;

const getConfirmedQuantity = (rows: WarehouseConfirmRow[]) =>
  rows.reduce(
    (total, row) => total + (isRowConfirmed(row) ? row.quantity : 0),
    0,
  );

const getTotalQuantity = (rows: WarehouseConfirmRow[]) =>
  rows.reduce((total, row) => total + row.quantity, 0);

const toAssemblyPayload = (rows: WarehouseConfirmRow[]) => {
  const lines = new Map<
    number,
    {
      id: number;
      assembled: true;
      items: { productTableId: number }[];
    }
  >();

  rows.forEach((row) => {
    if (!isRowConfirmed(row)) return;

    const line =
      lines.get(row.saleDocProductId) ?? {
        id: row.saleDocProductId,
        assembled: true as const,
        items: [],
      };

    if (row.productTableId) {
      line.items.push({ productTableId: row.productTableId });
    }
    lines.set(row.saleDocProductId, line);
  });

  return Array.from(lines.values());
};

export default function SaleWarehouseConfirm({ document }: Props) {
  const navigate = useNavigate();
  const confirmSale = useWarehouseConfirmSale(document.id);
  const availableProductsQuery = useGetAvailableSaleProducts(document.id);
  const availableProducts = useMemo(
    () => availableProductsQuery.data ?? [],
    [availableProductsQuery.data],
  );
  const availableMarkingByNumber = useMemo(() => {
    const index = new Map<
      string,
      { productId: number; batchId: number; productTableId: number; markingNumber: string }
    >();

    availableProducts.forEach((product) => {
      product.batches.forEach((batch) => {
        batch.productTables.forEach((productTable) => {
          const markingKey = productTable.markingNumber.trim();
          if (index.has(markingKey)) return;

          index.set(markingKey, {
            productId: product.productId,
            batchId: batch.batchId,
            productTableId: productTable.productTableId,
            markingNumber: productTable.markingNumber,
          });
        });
      });
    });

    return index;
  }, [availableProducts]);
  const baseRows = useMemo(
    () => buildRows(document),
    [document],
  );
  const [draftRows, setDraftRows] = useLocalStorage<WarehouseConfirmDraftItem[]>(
    `sale:warehouse-confirm:${document.id}`,
    [],
  );
  const rows = useMemo(
    () => mergeDraftRows(baseRows, draftRows),
    [baseRows, draftRows],
  );
  const groups = useMemo(() => buildGroups(rows), [rows]);
  const batchGroupsByGroup = useMemo(
    () =>
      new Map(
        groups.map((group) => [group.key, buildBatchGroups(group.rows)]),
      ),
    [groups],
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const hasPieceTrackedRows = rows.some((row) => row.isPieceTracked);

  const handleBatchConfirm = useCallback((rowId: string, confirmed: boolean) => {
    setDraftRows((currentDraft) => {
      const current = mergeDraftRows(baseRows, currentDraft);
      const nextRows = current.map((row) =>
        row.rowId === rowId ? { ...row, confirmed } : row,
      );

      return toDraftItems(nextRows);
    });
  }, [baseRows, setDraftRows]);

  const handleScan = useCallback(async (markingNumber: string) => {
    try {
      if (!availableProductsQuery.isSuccess) {
        toast.error("Ruxsat etilgan markirovkalar hali yuklanmagan");
        return;
      }

      const normalizedMarkingNumber = markingNumber.trim();
      const matchedProduct = availableMarkingByNumber.get(
        normalizedMarkingNumber,
      );

      if (!matchedProduct) {
        toast.error("Bu markirovka ushbu sotuvga tegishli emas");
        return;
      }

      const productTableId = matchedProduct.productTableId;

      setDraftRows((currentDraft) => {
        const current = mergeDraftRows(baseRows, currentDraft);

        if (current.some((item) => item.productTableId === productTableId)) {
          toast.error("Bu marker avval qo'shilgan");
          return currentDraft;
        }

        const batchRowIndex = current.findIndex(
          (item) =>
            item.isPieceTracked &&
            item.productId === matchedProduct.productId &&
            item.batchId === matchedProduct.batchId &&
            !item.productTableId,
        );
        const expectedRowIndex = current.findIndex(
          (item) =>
            item.isPieceTracked &&
            item.expectedProductTableId === productTableId &&
            !item.productTableId,
        );
        const rowIndex =
          batchRowIndex !== -1 ? batchRowIndex : expectedRowIndex;

        if (rowIndex === -1) {
          toast.error("Bu marker hujjatdagi mahsulotlarga tegishli emas");
          return currentDraft;
        }

        const nextRows = current.map((item, index) =>
          index === rowIndex
            ? {
                ...item,
                productTableId,
                markingNumber: matchedProduct.markingNumber,
              }
            : item,
        );

        return toDraftItems(nextRows);
      });
    } catch (error) {
      errorHandlers(error);
    }
  }, [availableMarkingByNumber, availableProductsQuery.isSuccess, baseRows, setDraftRows]);

  const handleConfirm = useCallback(async () => {
    if (hasPieceTrackedRows && !availableProductsQuery.isSuccess) {
      toast.error("Ruxsat etilgan markirovkalar hali tekshirilmagan");
      return;
    }

    if (rows.some((row) => !isRowConfirmed(row))) {
      toast.error("Barcha partiyalar tasdiqlanmagan yoki skaner qilinmagan");
      return;
    }

    try {
      await confirmSale.mutateAsync(toAssemblyPayload(rows));
      setDraftRows([]);
      navigate("/main/sales/sale", { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  }, [availableProductsQuery.isSuccess, confirmSale, hasPieceTrackedRows, navigate, rows, setDraftRows]);

  const confirmedQuantity = getConfirmedQuantity(rows);
  const totalQuantity = getTotalQuantity(rows);

  const columns = useMemo<TableColumnsType<WarehouseConfirmRow>>(
    () => [
    {
      dataIndex: "indexId",
      title: "T/r",
      width: 56,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: "quantity",
      title: "Miqdor",
      width: 120,
      align: "center",
      render: (_, row) =>
        `${numberSpacing(row.quantity, undefined, true)} ${row.unitName || "dona"}`,
    },
    {
      dataIndex: "batchNumber",
      title: "Partiya",
      width: 130,
      render: (value, row) => value || row.batchId || "—",
    },
    {
      dataIndex: "batchDate",
      title: "Kirim sanasi",
      width: 120,
      render: (value) => (value ? customDate(value) : "—"),
    },
    {
      dataIndex: "markingNumber",
      title: "Markirovka",
      minWidth: 240,
      render: (value, row) =>
        row.isPieceTracked ? <LineClampCell text={value || null} /> : "—",
    },
    {
      dataIndex: "status",
      title: "Holati",
      width: 180,
      align: "center",
      render: (_, row) =>
        row.isPieceTracked ? (
          row.productTableId ? (
            <Tag color="success">Urildi</Tag>
          ) : (
            <Tag>Urilmagan</Tag>
          )
        ) : (
          <Checkbox
            checked={row.confirmed}
            onChange={(event) =>
              handleBatchConfirm(row.rowId, event.target.checked)
            }
          >
            Tasdiqlash
          </Checkbox>
        ),
    },
    ],
    [handleBatchConfirm],
  );

  const batchColumns = useMemo(
    () =>
      columns.filter(
        (column) =>
          !(
            "dataIndex" in column &&
            (column.dataIndex === "batchNumber" ||
              column.dataIndex === "batchDate")
          ),
      ),
    [columns],
  );

  return (
    <div className="space-y-3">
      {hasPieceTrackedRows && availableProductsQuery.isSuccess && (
        <SaleBarcodeScanner onScan={handleScan} />
      )}
      <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
        <span className="font-semibold text-text">
          Ombordan chiqariladigan tovarlar
        </span>
        <span className="text-sm text-secondary-text">
          {numberSpacing(confirmedQuantity, undefined, true)} /{" "}
          {numberSpacing(totalQuantity, undefined, true)}
        </span>
      </div>
      <div className="space-y-3">
        {groups.map((group) => {
          const groupConfirmedQuantity = getConfirmedQuantity(group.rows);
          const groupTotalQuantity = getTotalQuantity(group.rows);
          const isGroupComplete =
            groupTotalQuantity > 0 &&
            groupConfirmedQuantity === groupTotalQuantity;
          const isGroupPartial =
            groupConfirmedQuantity > 0 && !isGroupComplete;
          const isExpanded = expandedGroups[group.key] ?? false;
          const batches = batchGroupsByGroup.get(group.key) ?? [];
          return (
            <Card
              key={group.key}
              className={`overflow-hidden border ${
                isGroupComplete
                  ? "border-success/50 bg-success-soft/40!"
                  : isGroupPartial
                    ? "border-warning/50 bg-warning-soft/40!"
                    : "border-border"
              }`}
            >
              <button
                type="button"
                className={`grid w-full gap-3 border-b px-3 py-3 text-left transition-colors md:grid-cols-[auto_minmax(260px,1fr)_140px_140px] ${
                  isGroupComplete
                    ? "border-success/40 bg-success-soft/70 hover:bg-success-soft"
                    : isGroupPartial
                      ? "border-warning/40 bg-warning-soft/70 hover:bg-warning-soft"
                      : "border-border bg-surface-muted hover:bg-surface-hover"
                }`}
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedGroups((current) => ({
                    ...current,
                    [group.key]: !isExpanded,
                  }))
                }
              >
                <span className="flex items-center justify-center text-secondary-text">
                  {isExpanded ? (
                    <ChevronDown className="size-5" />
                  ) : (
                    <ChevronRight className="size-5" />
                  )}
                </span>
                <div>
                  <div className="text-xs text-secondary-text">Mahsulot</div>
                  <div className="font-semibold text-text">{group.productName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-secondary-text">Miqdor</div>
                  <div>
                    {numberSpacing(groupTotalQuantity, undefined, true)}{" "}
                    {group.unitName || "dona"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-secondary-text">Holati</div>
                  <div className={isGroupComplete ? "font-semibold text-success" : undefined}>
                    {numberSpacing(groupConfirmedQuantity, undefined, true)} /{" "}
                    {numberSpacing(groupTotalQuantity, undefined, true)}
                    {isGroupComplete && (
                      <CheckCircle2 className="ml-1 inline-block size-4 text-success" />
                    )}
                  </div>
                </div>
              </button>
              {isExpanded && <div className="space-y-2 p-2">
                {batches.map((batch) => {
                  const batchConfirmedQuantity = getConfirmedQuantity(batch.rows);
                  const batchTotalQuantity = getTotalQuantity(batch.rows);
                  const isPieceTracked = batch.rows.some(
                    (row) => row.isPieceTracked,
                  );
                  const visibleRows = isPieceTracked
                    ? batch.rows.filter((row) => row.productTableId)
                    : batch.rows;

                  return (
                    <div
                      key={batch.key}
                      className="overflow-hidden rounded-md border border-border bg-card"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted px-3 py-2">
                        <div>
                          <div className="text-sm font-semibold text-text">
                            Partiya {batch.batchNumber || batch.batchId || "—"}
                          </div>
                          <div className="text-xs text-secondary-text">
                            Hujjat raqami: {batch.batchNumber || batch.batchId || "—"}
                            {batch.batchDate
                              ? ` · Kirim sanasi: ${customDate(batch.batchDate)}`
                              : ""}
                          </div>
                        </div>
                        <div className="text-right text-sm text-secondary-text">
                          <div>
                            Miqdor: {numberSpacing(batchTotalQuantity, undefined, true)}{" "}
                            {group.unitName || "dona"}
                          </div>
                          <div className="font-medium text-text">
                            Tasdiqlangan: {numberSpacing(batchConfirmedQuantity, undefined, true)} /{" "}
                            {numberSpacing(batchTotalQuantity, undefined, true)}
                          </div>
                        </div>
                      </div>
                      {isPieceTracked && !visibleRows.length ? (
                        <div className="px-3 py-3 text-sm text-secondary-text">
                          Markirovka hali skaner qilinmagan
                        </div>
                      ) : (
                        <Table<WarehouseConfirmRow>
                          size="small"
                          columns={batchColumns}
                          dataSource={generateKeyTable(visibleRows, "rowId")}
                          pagination={
                            isPieceTracked
                              ? {
                                  defaultPageSize: 50,
                                  showSizeChanger: true,
                                  pageSizeOptions: [25, 50, 100],
                                }
                              : false
                          }
                          scroll={{ x: "max-content" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>}
            </Card>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button
          type="primary"
          size="large"
          icon={<CheckCircle2 className="size-4" />}
          loading={confirmSale.isPending}
          disabled={!rows.length}
          onClick={handleConfirm}
        >
          Tasdiqlash
        </Button>
      </div>
    </div>
  );
}
