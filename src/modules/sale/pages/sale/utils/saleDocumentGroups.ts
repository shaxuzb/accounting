import type { SaleDocTable, SaleDocumentLineGroup } from "../types/type";

const getLineTotal = (line: SaleDocTable) =>
  line.totalAmount || line.amount * line.quantity + (line.vatAmount || 0);

export const groupSaleDocumentLines = (
  lines: SaleDocTable[],
): SaleDocumentLineGroup[] => {
  const groups = new Map<string, SaleDocumentLineGroup>();

  lines.forEach((line) => {
    const groupKey = String(line.productId || line.rowKey);
    const quantity = Number(line.quantity) || 0;
    const amount = (Number(line.amount) || 0) * quantity;
    const vatAmount = Number(line.vatAmount) || 0;
    const totalAmount = getLineTotal(line);
    const group = groups.get(groupKey);

    if (group) {
      group.quantity += quantity;
      group.amount += amount;
      group.vatAmount += vatAmount;
      group.totalAmount += totalAmount;
      group.lines.push(line);
      group.unitPrice = group.quantity ? group.amount / group.quantity : 0;
      if (group.vatRateName !== line.vatRateName) {
        group.vatRateName = "Aralash";
      }
      return;
    }

    groups.set(groupKey, {
      key: groupKey,
      productId: line.productId,
      productName: line.productName,
      productMxik: line.productMxik,
      quantity,
      unitName: line.unitName,
      unitPrice: quantity ? amount / quantity : 0,
      amount,
      vatRateName: line.vatRateName || "-",
      vatAmount,
      totalAmount,
      lines: [line],
    });
  });

  return Array.from(groups.values());
};
