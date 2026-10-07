import { Button, Empty, Popconfirm, Spin } from "antd";
import {
  Boxes,
  CheckCircle2,
  PackageCheck,
  Save,
  Sigma,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import useLocalStorage from "@/hooks/UseLocalStorage";
import { useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import {
  readPersistedValue,
  removePersistedValue,
} from "@/shared/persistence/storage";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import { useCancelSale, useConfirmSale, useSaveSalePrices } from "../hooks";
import { useVatPayer } from "@/shared/hooks/useVatPayer";
import type { SaleDoc, SaleDocTable, SalePricingLine } from "../types/type";
import type {
  SaleDocConfirmForm,
  SaleDocConfirmLineForm,
  SaleDocConfirmLineItemForm,
} from "../types/form";
import {
  createSalePricingLine,
  getLineTotal,
  getMarginBySalePrice,
  getSalePriceByMargin,
  getSalePriceByMarginAmount,
  getVatAmount,
  roundMoney,
} from "../utils/pricing";
import SaleDocumentSummary from "./SaleDocumentSummary";
import SaleProductGroupList from "./SaleProductGroupList";
import { useTranslation } from "react-i18next";

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

interface SaleConfirmAggregate extends Omit<SaleDocConfirmLineForm, "items"> {
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirmSale = useConfirmSale(document.id);
  const cancelSale = useCancelSale(document.id);
  const savePrices = useSaveSalePrices(document.id);
  const vatPayer = useVatPayer(document.docDate);
  const draftKey = useScopedStorageKey("form-draft", `sale-pricing:${document.id}`);
  const [draftLines, setDraftLines] = useLocalStorage<SalePricingDraftLine[]>(
    draftKey,
    readPersistedValue(`sale:pricing:${document.id}`, [], "local"),
  );
  const [editedLines, setEditedLines] = useState<SalePricingLine[] | null>(null);
  // a sale in a foreign currency is priced in it while the stock cost is in UZS
  const rate =
    document.currencyCode && document.currencyCode !== "UZS"
      ? Number(document.exchangeRate) || 1
      : 1;
  const updateLineAmounts = useCallback((line: SalePricingLine) => {
    const vatAmount = getVatAmount(line.amount, line.quantity, line.vatRateName);

    return {
      ...line,
      vatAmount,
      totalAmount: getLineTotal(line.amount, line.quantity, line.vatRateName),
    };
  }, []);
  const draftLineByKey = useMemo(() => {
    const result = new Map<string | number, SalePricingDraftLine>();

    draftLines.forEach((draftLine) => {
      result.set(draftLine.rowKey, draftLine);
      result.set(draftLine.id, draftLine);
    });

    return result;
  }, [draftLines]);
  const initialLines = useMemo(
    () =>
      sourceLines.map((line, index) => createSalePricingLine(line, index, rate)).map((line) => {
        const draftLine =
          draftLineByKey.get(line.rowKey) ?? draftLineByKey.get(line.id);
        if (!draftLine) return line;

        return updateLineAmounts({
          ...line,
          amount: draftLine.amount,
          vatRateId: draftLine.vatRateId,
          vatRateName: draftLine.vatRateName ?? line.vatRateName,
          marginPercent: draftLine.marginPercent,
        });
      }),
    [draftLineByKey, rate, sourceLines, updateLineAmounts],
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
          amount: getSalePriceByMargin(line.docCostPrice, margin),
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
          marginPercent: getMarginBySalePrice(line.docCostPrice, salePrice),
        }),
      ),
    [updateLineAmounts, updateLines],
  );
  const applyMarginAmount = useCallback(
    (lineKeys: string[], marginAmount: number) =>
      updateLines(lineKeys, (line) => {
        const salePrice = getSalePriceByMarginAmount(
          line.docCostPrice,
          marginAmount,
        );
        return updateLineAmounts({
          ...line,
          amount: salePrice,
          marginPercent: getMarginBySalePrice(line.docCostPrice, salePrice),
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
    let finalAmount = 0;
    let totalQuantity = 0;
    lines.forEach((line) => {
      productIds.add(line.productId);
      totalAmount += line.amount * line.quantity;
      finalAmount += getLineTotal(line.amount, line.quantity, line.vatRateName);
      totalQuantity += line.quantity;
    });
    return {
      productCount: productIds.size,
      totalAmount: roundMoney(totalAmount),
      finalAmount: roundMoney(finalAmount),
      totalQuantity,
    };
  }, [lines]);

  /** The confirm payload of the screen's prices, or null (with the reason shown). */
  const buildPricePayload = (): SaleDocConfirmForm | null => {
    if (!lines.length) {
      toast.error(t("sale.messages.noProductsToConfirm"));
      return null;
    }
    if (lines.some((line) => line.amount <= 0)) {
      toast.error(t("sale.messages.salePriceRequired"));
      return null;
    }
    // No cost check here any more: the server writes off the batches when the
    // document posts and takes the cost from what they gave up, so a line that
    // has no cost yet is normal rather than an error.
    if (lines.some((line) => line.vatRateId === null)) {
      toast.error(t("sale.messages.vatRateRequired"));
      return null;
    }
    if (lines.some((line) => !line.id)) {
      toast.error(t("sale.messages.saleDocTableIdMissing"));
      return null;
    }

    const toPositiveNumber = (value: number | string | null | undefined) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
    };

    // A pricing row is either a product line of the document or one listed unit of
    // it (ownerId = the product line). Line ids, unit-row ids and product-table ids
    // are separate sequences, so they are never looked up in one map: unit 1 of one
    // line must not be taken for product line 1.
    const productLineById = new Map<number, SaleDocTable>();
    (document.lines ?? []).forEach((productLine) => {
      const productLineId = toPositiveNumber(productLine.id);
      if (productLineId > 0) productLineById.set(productLineId, productLine);
    });

    const groupedLines = lines.reduce((acc, line) => {
      const lineId = toPositiveNumber(line.id);
      const lineOwnerId = toPositiveNumber(line.ownerId);
      const lineProductTableId = toPositiveNumber(line.productTableId);
      const isItemLine = lineOwnerId > 0;
      const resolvedLineId = isItemLine ? lineOwnerId : lineId;
      const parentLine = productLineById.get(resolvedLineId) ?? line;

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
      toast.error(t("sale.messages.invalidConfirmLines"));
      return null;
    }

    return {
      // the VAT rate goes too: changed here, it used to show on screen and post the old one
      // marked units keep the price each was given, not the line's average
      lines: payloadLines.map(({ id, costPrice, unitPrice, vatRateId, items }) => ({
        id,
        costPrice,
        unitPrice,
        vatRateId: vatRateId || null,
        items: items
          .filter((item) => item.id > 0)
          .map((item) => ({ id: item.id, unitPrice: item.amount })),
      })),
    };
  };

  const clearLocalDraft = () => {
    setDraftLines([]);
    setEditedLines(null);
    removePersistedValue(`sale:pricing:${document.id}`, "local");
  };

  const handleSavePrices = async () => {
    const payload = buildPricePayload();
    if (!payload) return;
    try {
      await savePrices.mutateAsync(payload);
      clearLocalDraft();
      toast.success(t("sale.messages.pricesSaved"));
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleConfirm = async () => {
    const payload = buildPricePayload();
    if (!payload) return;
    try {
      await confirmSale.mutateAsync(payload);
      clearLocalDraft();
      navigate("/main/sales/sale", { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSale.mutateAsync();
      clearLocalDraft();
      toast.success(t("sale.messages.documentCancelled"));
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
        totalAmount={totals.finalAmount}
      />
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<UserRound size={24} strokeWidth={1.8} />}
          label={t("app.reports.fields.counterparty")}
          value={document.counterpartyName || "-"}
        />
        <DocumentSummaryItem
          icon={<Boxes size={24} strokeWidth={1.8} />}
          label={t("sale.fields.productTypes")}
          value={totals.productCount}
        />
        <DocumentSummaryItem
          icon={<PackageCheck size={24} strokeWidth={1.8} />}
          label={t("sale.fields.totalQuantity")}
          value={`${totals.totalQuantity} ${t("sale.fields.piece")}`}
          iconClassName="text-green-600"
        />
        <DocumentSummaryItem
          icon={<Sigma size={24} strokeWidth={1.8} />}
          label={t("sale.fields.totalAmount")}
          value={`${numberSpacing(totals.finalAmount, undefined, true)} ${currencyCode}`}
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
            {t("common.confirm")}
          </Button>
          <Button
            size="large"
            icon={<Save size={18} />}
            loading={savePrices.isPending}
            disabled={
              !lines.length || confirmSale.isPending || cancelSale.isPending
            }
            title={t("sale.messages.savePricesHint")}
            onClick={handleSavePrices}
          >
            {t("common.save")}
          </Button>
          <Popconfirm
            title={t("sale.actions.cancelDocument")}
            description={t("sale.messages.cancelDocumentQuestion")}
            okText={t("common.cancel")}
            cancelText={t("app.common.no")}
            okButtonProps={{ danger: true, loading: cancelSale.isPending }}
            onConfirm={handleCancel}
          >
            <Button
              danger
              size="large"
              icon={<XCircle size={18} />}
              disabled={confirmSale.isPending || cancelSale.isPending}
            >
              {t("common.cancel")}
            </Button>
          </Popconfirm>
        </div>
      </DocumentSummary>

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
          vatPayer={vatPayer.isVatPayer}
        />
      ) : (
        <Card className="border border-border p-8">
          <Empty description={t("sale.messages.productsNotFound")} />
        </Card>
      )}
    </div>
  );
}
