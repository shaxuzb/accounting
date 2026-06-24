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
import type { SaleDoc, SaleDocProduct } from "../types/type";
import SaleBarcodeScanner from "./SaleBarcodeScanner";

interface Props {
  document: SaleDoc;
}

interface WarehouseConfirmRow {
  rowId: string;
  saleDocProductId: number;
  productId: number;
  productName: string;
  unitName?: string;
  productTableId: number | null;
  markingNumber?: string | null;
}

interface WarehouseConfirmDraftItem {
  rowId: string;
  productTableId: number;
  markingNumber?: string | null;
}

const getDocumentProducts = (document: SaleDoc): SaleDocProduct[] => {
  if (document.products?.length) return document.products;

  return (document.lines ?? []).map((line) => ({
    id: line.id,
    ownerId: line.ownerId,
    productId: line.productId,
    productName: line.productName,
    quantity: line.quantity,
    unitName: line.unitName,
    unitPrice: line.price,
    amount: line.amount,
    vatRateId: line.vatRateId,
    vatRateName: line.vatRateName,
  }));
};

const buildRows = (document: SaleDoc): WarehouseConfirmRow[] =>
  getDocumentProducts(document).flatMap((product) => {
    const count = Math.max(0, Math.round(product.quantity || 0));

    return Array.from({ length: count }, (_, index) => ({
      rowId: `${product.id}-${index}`,
      saleDocProductId: product.id,
      productId: product.productId,
      productName: product.productName,
      unitName: product.unitName,
      productTableId: null,
      markingNumber: null,
    }));
  });

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

        const rowIndex = current.findIndex(
          (item) => item.productId === product.productId && !item.productTableId,
        );

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
      navigate("/main/sale", { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const scannedCount = rows.filter((row) => row.productTableId).length;

  const columns: TableColumnsType<WarehouseConfirmRow> = [
    {
      dataIndex: "indexId",
      title: "№",
      width: 60,
      align: "center",
    },
    {
      dataIndex: "productName",
      title: "Mahsulot",
      minWidth: 240,
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
      <Card className="overflow-hidden border border-border">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="font-semibold text-text">Skan qilinadigan tovarlar</span>
          <span className="text-sm text-secondary-text">
            {numberSpacing(scannedCount, undefined, true)} /{" "}
            {numberSpacing(rows.length, undefined, true)}
          </span>
        </div>
        <Table<WarehouseConfirmRow>
          columns={columns}
          dataSource={generateKeyTable(rows, "rowId")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 420px)" }}
        />
      </Card>
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
