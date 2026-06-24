import { Button, Empty, Spin } from "antd";
import {
  Boxes,
  CheckCircle2,
  PackageCheck,
  Sigma,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import useLocalStorage from "@/hooks/UseLocalStorage";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import { useConfirmSale } from "../hooks";
import type { SaleDoc, SaleDocTable, SalePricingLine } from "../types/type";
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

export default function SalePricingEditor({
  document,
  lines: sourceLines,
  loading,
  organizationName,
}: Props) {
  const navigate = useNavigate();
  const confirmSale = useConfirmSale(document.id);
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
    if (lines.some((line) => line.vatRateId === null)) {
      toast.error("Barcha mahsulotlar uchun QQS stavkasini tanlang");
      return;
    }
    if (lines.some((line) => !line.id)) {
      toast.error("Mahsulotlarda sale-doc-table id topilmadi");
      return;
    }

    try {
      await confirmSale.mutateAsync({
        lines: lines.map((line) => ({
          id: line.id,
          amount: roundMoney(line.amount),
        })),
      });
      setDraftLines([]);
      navigate("/main/sale", { replace: true });
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
