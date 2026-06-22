import { Button, Empty, Spin } from "antd";
import {
  Boxes,
  CheckCircle2,
  PackageCheck,
  Sigma,
  UserRound,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import {
  SaleAccountingGroups,
  SaleCompletedDocument,
  SaleDocumentSummary,
} from "../components";
import { SaleSummaryItem } from "../components/SaleDocumentSummary";
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
  const document = documentQuery.data;
  const documentStatusId = document?.statusId ?? document?.stateId;
  const isCompletedDocument = documentStatusId === 2;
  const linesQuery = useGetSaleLines(id);
  const vatRatesQuery = useVatRates(Boolean(document) && !isCompletedDocument);
  const confirmSale = useConfirmSale(id);
  const [draftLines, setDraftLines] = useState<SaleAccountingLine[] | null>(
    null,
  );

  const initialLines = useMemo(
    () => (linesQuery.data ?? []).map(toAccountingLine),
    [linesQuery.data],
  );
  const lines = draftLines ?? initialLines;
  const currency = document?.currencyCode || "UZS";

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
        lines.reduce((sum, line) => sum + line.amount * line.quantity, 0),
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

  if (document && isCompletedDocument) {
    return (
      <SaleCompletedDocument
        document={document}
        lines={linesQuery.data ?? []}
        loading={linesQuery.isLoading || linesQuery.isFetching}
        organizationName={organization.name}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SaleDocumentSummary
        document={document}
        organizationName={organization.name}
        totalAmount={totalAmount || document?.totalAmount || 0}
      />

      <section className="grid overflow-hidden rounded-lg border border-border bg-primary-bg shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <SaleSummaryItem
          icon={<UserRound size={24} strokeWidth={1.8} />}
          label="Kontragent"
          value={document?.counterpartyName || "-"}
        />
        <SaleSummaryItem
          icon={<Boxes size={24} strokeWidth={1.8} />}
          label="Mahsulot turlari"
          value={productCount}
        />
        <SaleSummaryItem
          icon={<PackageCheck size={24} strokeWidth={1.8} />}
          label="Umumiy miqdor"
          value={`${totalQuantity} dona`}
          iconClassName="text-green-600"
        />
        <SaleSummaryItem
          icon={<Sigma size={24} strokeWidth={1.8} />}
          label="Umumiy summa"
          value={`${numberSpacing(totalAmount, undefined, true)} ${currency}`}
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

      <div className="min-w-0">
        {linesQuery.isLoading ? (
          <div className="flex justify-center p-10">
            <Spin />
          </div>
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
          <Card className="border border-border p-8">
            <Empty description="Mahsulotlar topilmadi" />
          </Card>
        )}
      </div>
    </div>
  );
}
