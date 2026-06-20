import { useMemo } from "react";
import type { SaleAccountingLine, VatRateOption } from "../types/type";
import SaleProductGroup, { type SaleProductGroupData } from "./SaleProductGroup";

interface Props {
  lines: SaleAccountingLine[];
  currency: string;
  vatRates: VatRateOption[];
  vatLoading: boolean;
  onApplyMargin: (lineIds: number[], margin: number) => void;
  onApplyAmount: (lineIds: number[], amount: number) => void;
  onApplyVat: (lineIds: number[], vatRateId: number | null) => void;
  onLineMarginChange: (lineId: number, margin: number) => void;
  onLineAmountChange: (lineId: number, amount: number) => void;
}

export default function SaleAccountingGroups({ lines, ...props }: Props) {
  const groups = useMemo(() => {
    const grouped = new Map<string, SaleProductGroupData>();

    lines.forEach((line) => {
      const key = line.productId
        ? `product-${line.productId}`
        : `product-name-${line.productName.trim().toLocaleLowerCase()}`;
      const current = grouped.get(key);

      if (current) {
        current.lines.push(line);
        current.totalQuantity += line.quantity;
        return;
      }

      grouped.set(key, {
        key,
        productId: line.productId,
        productName: line.productName || "Noma’lum mahsulot",
        lines: [line],
        totalQuantity: line.quantity,
      });
    });

    return Array.from(grouped.values());
  }, [lines]);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <SaleProductGroup key={group.key} group={group} {...props} />
      ))}
    </div>
  );
}
