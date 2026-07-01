import { Button, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import useLocalStorage from "@/hooks/UseLocalStorage";
import Card from "@/components/ui/card/Card";
import LineClampCell from "@/components/widget/text/LineClampCell";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetProductByMarking, useWarehouseConfirmSale } from "../hooks";
import type { SaleDoc, SaleDocProduct, SaleDocTable } from "../types/type";
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
  productTableId: number | null;
  markingNumber?: string | null;
}

interface WarehouseConfirmGroup {
  key: string;
  productName: string;
  unitName?: string;
  rows: WarehouseConfirmRow[];
}

interface WarehouseConfirmDraftItem {
  rowId: string;
  productTableId: number;
  markingNumber?: string | null;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const read = (value: unknown, keys: string[]) => {
  if (!isRecord(value)) return undefined;
  for (const key of keys) {
    const current = value[key];
    if (current !== undefined && current !== null && current !== "") {
      return current;
    }
  }
  return undefined;
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getGroupKey = (productId: number, productName: string) =>
  [productId, productName].join(":");

const getProductTables = (product: SaleDocProduct) =>
  product.tables?.length ? product.tables : [];

const buildRowsFromLine = (
  line: SaleDocTable,
  index: number,
): WarehouseConfirmRow[] => {
  const quantity = Math.max(1, Math.round(toNumber(line.quantity, 1)));
  const groupKey = getGroupKey(line.productId, line.productName);

  return Array.from({ length: quantity }, (_, quantityIndex) => ({
    rowId: `line-${line.id}-${index}-${quantityIndex}`,
    groupKey,
    saleDocProductId: line.id,
    expectedProductTableId: toNumber(line.productTableId) || null,
    productId: line.productId,
    productName: line.productName,
    unitName: line.unitName,
    productTableId: null,
    markingNumber: null,
  }));
};

const buildRowsFromProduct = (
  product: SaleDocProduct,
  index: number,
): WarehouseConfirmRow[] => {
  const productName = product.productName;
  const productTables = getProductTables(product);
  const sourceItems = productTables.length ? productTables : [product];

  return sourceItems.flatMap((item, itemIndex) => {
    const source = item as UnknownRecord;
    const quantity = productTables.length
      ? 1
      : Math.max(1, Math.round(toNumber(product.quantity, 1)));
    const groupKey = getGroupKey(product.productId, productName);

    return Array.from({ length: quantity }, (_, quantityIndex) => ({
      rowId: `product-${product.id}-${index}-${itemIndex}-${quantityIndex}`,
      groupKey,
      saleDocProductId: product.id,
      expectedProductTableId: toNumber(read(source, ["productTableId"])) || null,
      productId: product.productId,
      productName,
      unitName: product.unitName,
      productTableId: null,
      markingNumber: null,
    }));
  });
};

const buildRows = (document: SaleDoc): WarehouseConfirmRow[] => {
  if (document.lines?.length) {
    return document.lines.flatMap((line, index) => buildRowsFromLine(line, index));
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

const mergeDraftRows = (
  rows: WarehouseConfirmRow[],
  draft: WarehouseConfirmDraftItem[],
) =>
  rows.map((row) => {
    const savedRow = draft.find((item) => item.rowId === row.rowId);

    return savedRow
      ? {
          ...row,
          productTableId: savedRow.productTableId,
          markingNumber: savedRow.markingNumber,
        }
      : row;
  });

const toDraftItems = (rows: WarehouseConfirmRow[]): WarehouseConfirmDraftItem[] =>
  rows
    .filter((row) => row.productTableId)
    .map((row) => ({
      rowId: row.rowId,
      productTableId: row.productTableId as number,
      markingNumber: row.markingNumber,
    }));

const getScannedCount = (rows: WarehouseConfirmRow[]) =>
  rows.filter((row) => row.productTableId).length;

export default function SaleWarehouseConfirm({ document }: Props) {
  const navigate = useNavigate();
  const confirmSale = useWarehouseConfirmSale(document.id);
  const getProductByMarking = useGetProductByMarking();
  const baseRows = useMemo(() => buildRows(document), [document]);
  const [draftRows, setDraftRows] = useLocalStorage<WarehouseConfirmDraftItem[]>(
    `sale:warehouse-confirm:${document.id}`,
    [],
  );
  // Tasdiqlanmagan skanlar backendga hali ketmaydi, shuning uchun faqat shu hujjat uchun vaqtinchalik draft saqlaymiz.
  const rows = useMemo(
    () => mergeDraftRows(baseRows, draftRows),
    [baseRows, draftRows],
  );
  const groups = useMemo(() => buildGroups(rows), [rows]);

  const handleScan = async (markingNumber: string) => {
    try {
      const product = await getProductByMarking.mutateAsync(markingNumber);
      const productTableId = Number(product.productTableId ?? product.id ?? 0);
      if (!productTableId) {
        toast.error("Product table ID topilmadi");
        return;
      }

      setDraftRows((currentDraft) => {
        const current = mergeDraftRows(baseRows, currentDraft);

        if (current.some((item) => item.productTableId === productTableId)) {
          toast.error("Bu marker avval qo'shilgan");
          return currentDraft;
        }

        const exactRowIndex = current.findIndex(
          (item) =>
            item.expectedProductTableId === productTableId && !item.productTableId,
        );
        const fallbackRowIndex = current.findIndex(
          (item) => item.productId === product.productId && !item.productTableId,
        );
        const rowIndex = exactRowIndex !== -1 ? exactRowIndex : fallbackRowIndex;

        if (rowIndex === -1) {
          toast.error("Bu marker hujjatdagi mahsulotlarga tegishli emas");
          return currentDraft;
        }

        const nextRows = current.map((item, index) =>
          index === rowIndex
            ? {
                ...item,
                productTableId,
                markingNumber: product.markingNumber || markingNumber,
              }
            : item,
        );

        return toDraftItems(nextRows);
      });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleConfirm = async () => {
    if (rows.some((row) => !row.productTableId)) {
      toast.error("Barcha mahsulotlar to'liq skaner qilinmagan");
      return;
    }

    try {
      await confirmSale.mutateAsync({
        items: rows.map((row) => ({
          productTableId: row.productTableId as number,
        })),
      });
      setDraftRows([]);
      navigate("/main/sales/sale", { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const scannedCount = getScannedCount(rows);

  const columns: TableColumnsType<WarehouseConfirmRow> = [
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
      render: (_, row) => `1 ${row.unitName || "dona"}`,
    },
    {
      dataIndex: "markingNumber",
      title: "Markirovka",
      minWidth: 240,
      render: (value) => <LineClampCell text={value || null} />,
    },
    {
      dataIndex: "status",
      title: "Holati",
      width: 140,
      align: "center",
      render: (_, row) =>
        row.productTableId ? (
          <Tag color="success">Urildi</Tag>
        ) : (
          <Tag>Urilmagan</Tag>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      <SaleBarcodeScanner onScan={handleScan} />
      <div className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2">
        <span className="font-semibold text-text">Skan qilinadigan tovarlar</span>
        <span className="text-sm text-secondary-text">
          {numberSpacing(scannedCount, undefined, true)} /{" "}
          {numberSpacing(rows.length, undefined, true)}
        </span>
      </div>
      <div className="space-y-3">
        {groups.map((group) => {
          const groupScannedCount = getScannedCount(group.rows);
          return (
            <Card
              key={group.key}
              className="overflow-hidden border border-border"
            >
              <div className="grid gap-3 border-b border-border bg-muted/30 px-3 py-3 md:grid-cols-[minmax(260px,1fr)_140px_140px]">
                <div>
                  <div className="text-xs text-secondary-text">Mahsulot</div>
                  <div className="font-semibold text-text">{group.productName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-secondary-text">Miqdor</div>
                  <div>
                    {numberSpacing(group.rows.length, undefined, true)}{" "}
                    {group.unitName || "dona"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-secondary-text">Holati</div>
                  <div>
                    {numberSpacing(groupScannedCount, undefined, true)} /{" "}
                    {numberSpacing(group.rows.length, undefined, true)}
                  </div>
                </div>
              </div>
              <Table<WarehouseConfirmRow>
                size="small"
                columns={columns}
                dataSource={generateKeyTable(group.rows, "rowId")}
                pagination={false}
                scroll={{ x: "max-content" }}
              />
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
