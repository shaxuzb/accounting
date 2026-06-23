import { useMemo } from "react";
import type {
  SalePricingLine,
  SaleProductGroupData,
} from "../types/type";
import SaleProductGroup from "./SaleProductGroup";

interface Props {
  lines: SalePricingLine[];
  currencyCode: string;
  onApplyMargin: (lineIds: number[], margin: number) => void;
  onApplySalePrice: (lineIds: number[], salePrice: number) => void;
  onApplyVat: (lineIds: number[], vatRateId: number | null) => void;
  onLineMarginChange: (lineId: number, margin: number) => void;
  onLineSalePriceChange: (lineId: number, salePrice: number) => void;
}

export default function SaleProductGroupList({ lines, ...props }: Props) {
  const groups = useMemo(() => {
    const result = new Map<string, SaleProductGroupData>();

    lines.forEach((line) => {
      const groupKey = line.productId
        ? `product-${line.productId}`
        : `product-table-${line.productTableId}`;
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
