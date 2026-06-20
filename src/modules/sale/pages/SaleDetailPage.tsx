import { Button, Empty, Spin } from "antd";
import { CheckCircle2, PackageCheck, ReceiptText, Sigma } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import { SaleAccountingGroups, SaleDocumentSummary } from "../components";
import {
  useConfirmSale,
  useGetDetailSale,
  useGetSaleLines,
  useVatRates,
} from "../hooks";
import type { SaleAccountingLine } from "../types/type";
import {
  amountFromMargin,
  marginFromAmount,
  roundMoney,
  toAccountingLine,
} from "../utils/pricing";

export default function SaleDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const organization = useAppSelector((state) => state.organization);
  const documentQuery = useGetDetailSale(id);
  const linesQuery = useGetSaleLines(id);
  const vatRatesQuery = useVatRates();
  const confirmSale = useConfirmSale(id);
  const [draftLines, setDraftLines] = useState<SaleAccountingLine[] | null>(null);

  const document = documentQuery.data;
  const initialLines = useMemo(
    () => (linesQuery.data ?? []).map(toAccountingLine),
    [linesQuery.data],
  );
  const lines = draftLines ?? initialLines;
  const currency = document?.currencyName || "UZS";

  const updateLines = useCallback(
    (
      lineIds: number[],
      updater: (line: SaleAccountingLine) => SaleAccountingLine,
    ) => {
      const ids = new Set(lineIds);
      setDraftLines((current) =>
        (current ?? initialLines).map((line) =>
          ids.has(line.id) ? updater(line) : line,
        ),
      );
    },
    [initialLines],
  );

  const handleApplyMargin = useCallback(
    (lineIds: number[], margin: number) => {
      updateLines(lineIds, (line) => ({
        ...line,
        marginPercent: margin,
        amount: amountFromMargin(line.costPrice, margin),
      }));
    },
    [updateLines],
  );

  const handleApplyAmount = useCallback(
    (lineIds: number[], amount: number) => {
      const safeAmount = roundMoney(Math.max(0, amount));
      updateLines(lineIds, (line) => ({
        ...line,
        amount: safeAmount,
        marginPercent: marginFromAmount(line.costPrice, safeAmount),
      }));
    },
    [updateLines],
  );

  const handleApplyVat = useCallback(
    (lineIds: number[], vatRateId: number | null) => {
      updateLines(lineIds, (line) => ({ ...line, vatRateId }));
    },
    [updateLines],
  );
  const handleLineMarginChange = useCallback(
    (lineId: number, margin: number) => handleApplyMargin([lineId], margin),
    [handleApplyMargin],
  );
  const handleLineAmountChange = useCallback(
    (lineId: number, amount: number) => handleApplyAmount([lineId], amount),
    [handleApplyAmount],
  );

  const totalAmount = useMemo(
    () =>
      roundMoney(
        lines.reduce(
          (sum, line) => sum + line.amount * line.quantity,
          0,
        ),
      ),
    [lines],
  );
  const totalQuantity = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );
  const productCount = useMemo(
    () =>
      new Set(
        lines.map((line) =>
          line.productId
            ? `product-${line.productId}`
            : `product-name-${line.productName.trim().toLocaleLowerCase()}`,
        ),
      ).size,
    [lines],
  );

  const handleConfirm = async () => {
    if (!document || !lines.length) {
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
      toast.success("Savdo hujjati tasdiqlandi");
      navigate("/main/sale");
    } catch (error) {
      errorHandlers(error);
    }
  };

  if (documentQuery.isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-text">
            {document?.docNumber || "Savdo hujjati"}
          </h1>
          <p className="truncate text-sm text-secondary-text">
            {document?.counterpartyName || "Kontragent tanlanmagan"}
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          className="w-full! sm:w-auto!"
          icon={<CheckCircle2 size={18} />}
          loading={confirmSale.isPending}
          disabled={!lines.length}
          onClick={handleConfirm}
        >
          Tasdiqlash
        </Button>
      </div>

      <SaleDocumentSummary
        document={document}
        organizationName={organization.name}
        totalAmount={totalAmount || document?.totalAmount || 0}
      />

      <section className="grid overflow-hidden rounded-lg border border-border bg-primary-bg shadow-sm sm:grid-cols-3">
        <div className="flex items-center gap-3 px-4 py-3 sm:border-r sm:border-border">
          <ReceiptText size={22} className="shrink-0 text-primary" />
          <div>
            <div className="text-xs text-secondary-text">Mahsulot turlari</div>
            <div className="font-semibold text-text">{productCount}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 sm:border-r sm:border-border">
          <PackageCheck size={22} className="shrink-0 text-green-600" />
          <div>
            <div className="text-xs text-secondary-text">Umumiy miqdor</div>
            <div className="font-semibold text-text">{totalQuantity} dona</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Sigma size={22} className="shrink-0 text-violet-600" />
          <div className="min-w-0">
            <div className="text-xs text-secondary-text">Umumiy summa</div>
            <div className="break-words font-semibold text-text">
              {numberSpacing(totalAmount, undefined, true)} {currency}
            </div>
          </div>
        </div>
      </section>

      <div className="min-w-0">
        {linesQuery.isLoading ? (
          <div className="flex justify-center p-10"><Spin /></div>
        ) : lines.length ? (
          <SaleAccountingGroups
            lines={lines}
            currency={currency}
            vatRates={vatRatesQuery.data ?? []}
            vatLoading={vatRatesQuery.isLoading}
            onApplyMargin={handleApplyMargin}
            onApplyAmount={handleApplyAmount}
            onApplyVat={handleApplyVat}
            onLineMarginChange={handleLineMarginChange}
            onLineAmountChange={handleLineAmountChange}
          />
        ) : (
          <Card className="border border-border p-8"><Empty description="Mahsulotlar topilmadi" /></Card>
        )}
      </div>
    </div>
  );
}
