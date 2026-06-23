import { Button, Empty, Spin } from "antd";
import {
  Boxes,
  CheckCircle2,
  PackageCheck,
  Sigma,
  UserRound,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import { useConfirmSale } from "../hooks";
import type { SaleDoc, SaleDocTable, SalePricingLine } from "../types/type";
import {
  createSalePricingLine,
  getMarginBySalePrice,
  getSalePriceByMargin,
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

export default function SalePricingEditor({
  document,
  lines: sourceLines,
  loading,
  organizationName,
}: Props) {
  const navigate = useNavigate();
  const confirmSale = useConfirmSale(document.id);
  const [editedLines, setEditedLines] = useState<SalePricingLine[] | null>(null);
  const initialLines = useMemo(
    () => sourceLines.map(createSalePricingLine),
    [sourceLines],
  );
  const lines = editedLines ?? initialLines;

  const updateLines = useCallback(
    (
      lineIds: number[],
      update: (line: SalePricingLine) => SalePricingLine,
    ) => {
      const ids = new Set(lineIds);
      setEditedLines((current) =>
        (current ?? initialLines).map((line) =>
          ids.has(line.id) ? update(line) : line,
        ),
      );
    },
    [initialLines],
  );

  const applyMargin = useCallback(
    (lineIds: number[], margin: number) =>
      updateLines(lineIds, (line) => ({
        ...line,
        marginPercent: margin,
        amount: getSalePriceByMargin(line.costPrice, margin),
      })),
    [updateLines],
  );
  const applySalePrice = useCallback(
    (lineIds: number[], salePrice: number) =>
      updateLines(lineIds, (line) => ({
        ...line,
        amount: roundMoney(Math.max(0, salePrice)),
        marginPercent: getMarginBySalePrice(line.costPrice, salePrice),
      })),
    [updateLines],
  );
  const applyVat = useCallback(
    (lineIds: number[], vatRateId: number | null) =>
      updateLines(lineIds, (line) => ({ ...line, vatRateId })),
    [updateLines],
  );
  const changeLineMargin = useCallback(
    (lineId: number, margin: number) => applyMargin([lineId], margin),
    [applyMargin],
  );
  const changeLineSalePrice = useCallback(
    (lineId: number, salePrice: number) =>
      applySalePrice([lineId], salePrice),
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
    if (lines.some((line) => line.vatRateId === null)) {
      toast.error("Barcha mahsulotlar uchun QQS stavkasini tanlang");
      return;
    }

    try {
      await confirmSale.mutateAsync({
        counterpartyId: document.counterpartyId,
        docDate: document.docDate,
        lines: lines.map((line) => ({
          id: line.id,
          amount: roundMoney(line.amount),
          vatRateId: line.vatRateId,
        })),
      });
      navigate("/main/sale");
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
        totalAmount={totals.totalAmount || document.totalAmount}
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
        <div className="flex min-h-20 items-center border-b border-border px-5 py-3 lg:border-b-0">
          <Button
            type="primary"
            size="large"
            block
            icon={<CheckCircle2 size={18} />}
            loading={confirmSale.isPending}
            disabled={!lines.length}
            onClick={handleConfirm}
          >
            Tasdiqlash
          </Button>
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
