import { useMemo } from "react";
import type {
  SalePricingLine,
  SaleProductGroupData,
} from "../types/type";
import SaleProductGroup from "./SaleProductGroup";

interface Props {
  lines: SalePricingLine[];
  currencyCode: string;
  onApplyMargin: (lineKeys: string[], margin: number) => void;
  onApplyMarginAmount: (lineKeys: string[], marginAmount: number) => void;
  onApplySalePrice: (lineKeys: string[], salePrice: number) => void;
  onApplyVat: (
    lineKeys: string[],
    vatRateId: number | null,
    vatRateName?: string | null,
  ) => void;
  onLineMarginChange: (lineKey: string, margin: number) => void;
  onLineSalePriceChange: (lineKey: string, salePrice: number) => void;
}

export default function SaleProductGroupList({ lines, ...props }: Props) {
  const groups = useMemo(() => {
    const result = new Map<string, SaleProductGroupData>();

    lines.forEach((line) => {
      const groupKey = line.productId
        ? `product-${line.productId}`
        : line.rowKey;
      const group = result.get(groupKey);
      if (group) {
        group.lines.push(line);
        group.totalQuantity += line.quantity;
        return;
      }
      result.set(groupKey, {
        key: groupKey,
        productId: line.productId,
        productName: line.productName,
        lines: [line],
        totalQuantity: line.quantity,
      });
    });

    return Array.from(result.values());
  }, [lines]);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <SaleProductGroup key={group.key} group={group} {...props} />
      ))}
    </div>
  );
}
