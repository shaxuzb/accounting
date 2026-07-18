import { Button, Empty, Popconfirm, Spin } from "antd";
import {
  Boxes,
  CheckCircle2,
  PackageCheck,
  Sigma,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import useLocalStorage from "@/hooks/UseLocalStorage";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import { useCancelSale, useConfirmSale } from "../hooks";
import type { SaleDoc, SaleDocTable, SalePricingLine } from "../types/type";
import type {
  SaleDocConfirmLineForm,
  SaleDocConfirmLineItemForm,
} from "../types/form";
import {
  createSalePricingLine,
  getMarginBySalePrice,
  getSalePriceByMargin,
  getSalePriceByMarginAmount,
  getVatAmount,
  roundMoney,
} from "../utils/pricing";
import SaleDocumentSummary, {
  SaleSummaryItem,
} from "./SaleDocumentSummary";
import SaleProductGroupList from "./SaleProductGroupList";

interface Props {
  document: SaleDoc;
  lines: SaleDocTable[];
  loading: boolean;
  organizationName: string;
}

interface SalePricingDraftLine {
  rowKey: string;
  id: number;
  amount: number;
  vatRateId: number | null;
  vatRateName?: string | null;
  marginPercent: number;
}

interface SaleConfirmAggregate extends SaleDocConfirmLineForm {
  productId: number;
  productName: string;
  productMxik?: string | null;
  isService: boolean;
  quantity: number;
  unitId?: number | null;
  unitName?: string | null;
  amount: number;
  vatRateId: number;
  vatRateName?: string | null;
  vatAmount: number;
  totalAmount: number;
  items: SaleDocConfirmLineItemForm[];
}

export default function SalePricingEditor({
  document,
  lines: sourceLines,
  loading,
  organizationName,
}: Props) {
  const navigate = useNavigate();
  const confirmSale = useConfirmSale(document.id);
  const cancelSale = useCancelSale(document.id);
  const [draftLines, setDraftLines] = useLocalStorage<SalePricingDraftLine[]>(
    `sale:pricing:${document.id}`,
    [],
  );
  const [editedLines, setEditedLines] = useState<SalePricingLine[] | null>(null);
  const updateLineAmounts = useCallback((line: SalePricingLine) => {
    const vatAmount = getVatAmount(line.amount, line.quantity, line.vatRateName);

    return {
      ...line,
      vatAmount,
      totalAmount: roundMoney(line.amount * line.quantity),
    };
  }, []);
  const initialLines = useMemo(
    () =>
      sourceLines.map(createSalePricingLine).map((line) => {
        const draftLine = draftLines.find(
          (item) => item.rowKey === line.rowKey || item.id === line.id,
        );
        if (!draftLine) return line;

        return updateLineAmounts({
          ...line,
          amount: draftLine.amount,
          vatRateId: draftLine.vatRateId,
          vatRateName: draftLine.vatRateName ?? line.vatRateName,
          marginPercent: draftLine.marginPercent,
        });
      }),
    [draftLines, sourceLines, updateLineAmounts],
  );
  const lines = editedLines ?? initialLines;

  useEffect(() => {
    if (!editedLines) return;
    setDraftLines(
      editedLines.map((line) => ({
        rowKey: line.rowKey,
        id: line.id,
        amount: line.amount,
        vatRateId: line.vatRateId,
        vatRateName: line.vatRateName,
        marginPercent: line.marginPercent,
      })),
    );
  }, [editedLines, setDraftLines]);

  const updateLines = useCallback(
    (
      lineKeys: string[],
      update: (line: SalePricingLine) => SalePricingLine,
    ) => {
      const keys = new Set(lineKeys);
      setEditedLines((current) =>
        (current ?? initialLines).map((line) =>
          keys.has(line.rowKey) ? update(line) : line,
        ),
      );
    },
    [initialLines],
  );
  const applyMargin = useCallback(
    (lineKeys: string[], margin: number) =>
      updateLines(lineKeys, (line) =>
        updateLineAmounts({
          ...line,
          marginPercent: margin,
          amount: getSalePriceByMargin(line.costPrice, margin),
        }),
      ),
    [updateLineAmounts, updateLines],
  );
  const applySalePrice = useCallback(
    (lineKeys: string[], salePrice: number) =>
      updateLines(lineKeys, (line) =>
        updateLineAmounts({
          ...line,
          amount: roundMoney(Math.max(0, salePrice)),
          marginPercent: getMarginBySalePrice(line.costPrice, salePrice),
        }),
      ),
    [updateLineAmounts, updateLines],
  );
  const applyMarginAmount = useCallback(
    (lineKeys: string[], marginAmount: number) =>
      updateLines(lineKeys, (line) => {
        const salePrice = getSalePriceByMarginAmount(
          line.costPrice,
          marginAmount,
        );
        return updateLineAmounts({
          ...line,
          amount: salePrice,
          marginPercent: getMarginBySalePrice(line.costPrice, salePrice),
        });
      }),
    [updateLineAmounts, updateLines],
  );
  const applyVat = useCallback(
    (
      lineKeys: string[],
      vatRateId: number | null,
      vatRateName?: string | null,
    ) =>
      updateLines(lineKeys, (line) =>
        updateLineAmounts({
          ...line,
          vatRateId,
          vatRateName: vatRateName ?? line.vatRateName,
        }),
      ),
    [updateLineAmounts, updateLines],
  );
  const changeLineMargin = useCallback(
    (lineKey: string, margin: number) => applyMargin([lineKey], margin),
    [applyMargin],
  );
  const changeLineSalePrice = useCallback(
    (lineKey: string, salePrice: number) =>
      applySalePrice([lineKey], salePrice),
    [applySalePrice],
  );

  const totals = useMemo(() => {
    const productIds = new Set<number>();
    let totalAmount = 0;
    let totalQuantity = 0;
    lines.forEach((line) => {
      productIds.add(line.productId);
      totalAmount += line.amount * line.quantity;
      totalQuantity += line.quantity;
    });
    return {
      productCount: productIds.size,
      totalAmount: roundMoney(totalAmount),
      totalQuantity,
    };
  }, [lines]);

  const handleConfirm = async () => {
    if (!lines.length) {
      toast.error("Tasdiqlash uchun mahsulotlar topilmadi");
      return;
    }
    if (lines.some((line) => line.amount <= 0)) {
      toast.error("Barcha mahsulotlar uchun sotuv narxini kiriting");
      return;
    }
    if (lines.some((line) => line.costPrice <= 0)) {
      toast.error("Barcha mahsulotlar uchun tannarx topilmadi");
      return;
    }
    if (lines.some((line) => line.vatRateId === null)) {
      toast.error("Barcha mahsulotlar uchun QQS stavkasini tanlang");
      return;
    }
    if (lines.some((line) => !line.id)) {
      toast.error("Mahsulotlarda sale-doc-table id topilmadi");
      return;
    }

    const toPositiveNumber = (value: number | string | null | undefined) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
    };

    const parentLineByKey = new Map<number, SaleDocTable>();
    const sourceLineById = new Map<number, SaleDocTable>();
    const originLines = document.lines?.length ? document.lines : sourceLines;

    sourceLines.forEach((sourceLine) => {
      const sourceLineId = toPositiveNumber(sourceLine.id);
      if (sourceLineId > 0) sourceLineById.set(sourceLineId, sourceLine);
    });

    originLines.forEach((parentLine) => {
      const parentId = toPositiveNumber(parentLine.id);
      if (parentId > 0) parentLineByKey.set(parentId, parentLine);

      const parentProductTableId = toPositiveNumber(parentLine.productTableId);
      if (parentProductTableId > 0) {
        parentLineByKey.set(parentProductTableId, parentLine);
      }

      parentLine.items?.forEach((item) => {
        const itemId = toPositiveNumber(item.id);
        if (itemId > 0) parentLineByKey.set(itemId, parentLine);

        const itemProductTableId = toPositiveNumber(item.productTableId);
        if (itemProductTableId > 0) {
          parentLineByKey.set(itemProductTableId, parentLine);
        }
      });
    });

    const groupedLines = lines.reduce((acc, line) => {
      const lineId = toPositiveNumber(line.id);
      const lineOwnerId = toPositiveNumber(line.ownerId);
      const lineProductTableId = toPositiveNumber(line.productTableId);
      const parentLine =
        parentLineByKey.get(lineOwnerId) ??
        parentLineByKey.get(lineProductTableId) ??
        (lineOwnerId > 0 ? sourceLineById.get(lineOwnerId) : undefined) ??
        parentLineByKey.get(lineId) ??
        sourceLineById.get(lineId) ??
        line;
      const resolvedLineId = toPositiveNumber(
        parentLine?.id || lineOwnerId || lineId,
      );

      if (!resolvedLineId) {
        return acc;
      }

      if (!acc[resolvedLineId]) {
        acc[resolvedLineId] = {
          id: resolvedLineId,
          productId: toPositiveNumber(parentLine?.productId || line.productId),
          productName: parentLine?.productName || line.productName,
          productMxik: parentLine?.productMxik ?? line.productMxik ?? null,
          isService: false,
          quantity: 0,
          unitId: parentLine?.unitId ?? line.unitId,
          unitName: parentLine?.unitName ?? line.unitName,
          costPrice: 0,
          unitPrice: roundMoney(
            line.amount || parentLine?.unitPrice || parentLine?.amount || 0,
          ),
          amount: 0,
          vatRateId: toPositiveNumber(line.vatRateId),
          vatRateName: parentLine?.vatRateName || line.vatRateName,
          vatAmount: 0,
          totalAmount: 0,
          items: [],
        };
      }

      const existingLine = acc[resolvedLineId];
      const lineQuantity = line.quantity || 1;
      const lineCostPrice = roundMoney(line.costPrice || 0);
      const lineAmount = roundMoney(line.amount || 0);
      const lineVatAmount = roundMoney(line.vatAmount || 0);
      const lineTotalAmount = roundMoney(line.totalAmount || 0);
      const nextQuantity = existingLine.quantity + lineQuantity;
      const nextAmount = roundMoney(
        existingLine.amount + lineAmount * lineQuantity,
      );
      const existingCostTotal = existingLine.costPrice * existingLine.quantity;
      const nextCostTotal = roundMoney(
        existingCostTotal + lineCostPrice * lineQuantity,
      );

      existingLine.quantity = nextQuantity;
      existingLine.costPrice = nextQuantity
        ? roundMoney(nextCostTotal / nextQuantity)
        : 0;
      existingLine.unitPrice = nextQuantity
        ? roundMoney(nextAmount / nextQuantity)
        : 0;
      existingLine.amount = nextAmount;
      existingLine.vatAmount = roundMoney(
        existingLine.vatAmount + lineVatAmount,
      );
      existingLine.totalAmount = roundMoney(
        existingLine.totalAmount + lineTotalAmount,
      );

      const isItemLine =
        lineOwnerId > 0 &&
        lineOwnerId !== lineId &&
        (parentLineByKey.has(lineOwnerId) ||
          sourceLineById.has(lineOwnerId));
      if (isItemLine) {
        existingLine.items.push({
          id: lineId,
          productTableId: lineProductTableId,
          markingNumber: line.markingNumber || null,
          serialNumber: line.serialNumber || null,
          costPrice: lineCostPrice,
          amount: lineAmount,
          vatRateId: toPositiveNumber(line.vatRateId),
          vatAmount: lineVatAmount,
          totalAmount: lineTotalAmount,
        });
      }

      return acc;
    }, {} as Record<number, SaleConfirmAggregate>);

    const payloadLines = Object.values(groupedLines).filter((line) => line.id > 0);

    if (!payloadLines.length) {
      toast.error("Tasdiqlash uchun to'g'ri mahsulot satrlari tuzilmadi");
      return;
    }

    try {
      await confirmSale.mutateAsync({
        lines: payloadLines.map(({ id, costPrice, unitPrice }) => ({
          id,
          costPrice,
          unitPrice,
        })),
      });
      setDraftLines([]);
      navigate("/main/sales/sale", { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSale.mutateAsync();
      setDraftLines([]);
      toast.success("Sotuv hujjati bekor qilindi");
      navigate("/main/sales/sale", { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const currencyCode = document.currencyCode || "UZS";

  return (
    <div className="space-y-4">
      <SaleDocumentSummary
        document={document}
        organizationName={organizationName}
        totalAmount={totals.totalAmount}
      />
      <section className="grid overflow-hidden rounded-lg border border-border bg-primary-bg shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <SaleSummaryItem
          icon={<UserRound size={24} strokeWidth={1.8} />}
          label="Kontragent"
          value={document.counterpartyName || "-"}
        />
        <SaleSummaryItem
          icon={<Boxes size={24} strokeWidth={1.8} />}
          label="Mahsulot turlari"
          value={totals.productCount}
        />
        <SaleSummaryItem
          icon={<PackageCheck size={24} strokeWidth={1.8} />}
          label="Umumiy miqdor"
          value={`${totals.totalQuantity} dona`}
          iconClassName="text-green-600"
        />
        <SaleSummaryItem
          icon={<Sigma size={24} strokeWidth={1.8} />}
          label="Umumiy summa"
          value={`${numberSpacing(totals.totalAmount, undefined, true)} ${currencyCode}`}
          emphasized
          iconClassName="text-violet-600"
        />
        <div className="flex min-h-20 items-center gap-2 border-b border-border px-5 py-3 lg:border-b-0">
          <Button
            type="primary"
            size="large"
            className="flex-1"
            icon={<CheckCircle2 size={18} />}
            loading={confirmSale.isPending || cancelSale.isPending}
            disabled={!lines.length || cancelSale.isPending}
            onClick={handleConfirm}
          >
            Tasdiqlash
          </Button>
          <Popconfirm
            title="Hujjatni bekor qilish"
            description="Sotuv hujjatini bekor qilishni tasdiqlaysizmi?"
            okText="Bekor qilish"
            cancelText="Yo‘q"
            okButtonProps={{ danger: true, loading: cancelSale.isPending }}
            onConfirm={handleCancel}
          >
            <Button
              danger
              size="large"
              icon={<XCircle size={18} />}
              disabled={confirmSale.isPending || cancelSale.isPending}
            >
              Bekor qilish
            </Button>
          </Popconfirm>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center p-10">
          <Spin />
        </div>
      ) : lines.length ? (
        <SaleProductGroupList
          lines={lines}
          currencyCode={currencyCode}
          onApplyMargin={applyMargin}
          onApplyMarginAmount={applyMarginAmount}
          onApplySalePrice={applySalePrice}
          onApplyVat={applyVat}
          onLineMarginChange={changeLineMargin}
          onLineSalePriceChange={changeLineSalePrice}
        />
      ) : (
        <Card className="border border-border p-8">
          <Empty description="Mahsulotlar topilmadi" />
        </Card>
      )}
    </div>
  );
}
