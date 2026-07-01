import type {
  SaleDoc,
  SaleDocLineItem,
  SaleDocProduct,
  SaleDocProductTable,
  SaleDocTable,
} from "../types/type";

type PurchaseDocumentFields = {
  purchaseDocNumber?: string;
  purchaseDocumentNumber?: string;
  purchaseDocNo?: string;
  purchaseNumber?: string;
  docNumber?: string;
  documentNumber?: string;
  purchaseDate?: string;
  purchaseDocDate?: string;
  purchaseDocumentDate?: string;
  docDate?: string;
  date?: string;
};

type ProductMarkingFields = {
  marking?: string | null;
  markingCode?: string | null;
  markingNumber?: string | null;
  markingNo?: string | null;
  serial?: string | null;
  serialNumber?: string | null;
  serialNo?: string | null;
};

type SaleDocProductDetail = SaleDocProduct &
  PurchaseDocumentFields &
  ProductMarkingFields & {
    lineId?: number;
    name?: string;
    product?: string;
    salePrice?: number;
    unit?: string;
  };

type SaleDocProductTableDetail = SaleDocProductTable &
  PurchaseDocumentFields &
  ProductMarkingFields;

type SaleDocLineDetail = SaleDocTable &
  PurchaseDocumentFields &
  ProductMarkingFields & {
    salePrice?: number;
    unitPrice?: number;
    items?: SaleDocLineItem[];
  };

type SaleDocLineItemDetail = SaleDocLineItem &
  PurchaseDocumentFields &
  ProductMarkingFields;

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const firstPositiveNumber = (...values: unknown[]) => {
  for (const value of values) {
    const numberValue = toNumber(value);
    if (numberValue > 0) return numberValue;
  }

  return 0;
};

const getPurchaseDocNumber = (value: PurchaseDocumentFields) =>
  value.purchaseDocNumber ??
  value.purchaseDocumentNumber ??
  value.purchaseDocNo ??
  value.purchaseNumber ??
  value.docNumber ??
  value.documentNumber ??
  "";

const getPurchaseDate = (value: PurchaseDocumentFields) =>
  value.purchaseDate ??
  value.purchaseDocDate ??
  value.purchaseDocumentDate ??
  value.docDate ??
  value.date ??
  "";

const getMarkingNumber = (value: ProductMarkingFields) =>
  value.markingNumber ?? value.marking ?? value.markingNo ?? value.markingCode ?? "";

const getSerialNumber = (value: ProductMarkingFields) =>
  value.serialNumber ?? value.serial ?? value.serialNo ?? "";

const normalizeDocumentLine = (
  line: SaleDocTable,
  index: number,
): SaleDocTable => {
  const detail = line as SaleDocLineDetail;
  const quantity = toNumber(detail.quantity, 1) || 1;
  const amount = firstPositiveNumber(
    detail.unitPrice,
    detail.salePrice,
    detail.price,
    quantity > 1 && detail.amount ? toNumber(detail.amount) / quantity : detail.amount,
  );
  const markingNumber = getMarkingNumber(detail);
  const serialNumber = getSerialNumber(detail);
  const rowKey =
    (markingNumber ? String(markingNumber) : "") ||
    (detail.productTableId ? `product-table-${detail.productTableId}` : "") ||
    `line-${detail.id}-${index}`;

  return {
    ...line,
    rowKey,
    amount,
    price: firstPositiveNumber(detail.price, detail.unitPrice, amount),
    costPrice: firstPositiveNumber(
      quantity > 1 && detail.costPrice
        ? toNumber(detail.costPrice) / quantity
        : detail.costPrice,
      detail.unitPrice,
      detail.price,
    ),
    totalAmount: firstPositiveNumber(detail.totalAmount, amount * quantity),
    markingNumber: markingNumber ? String(markingNumber) : "",
    serialNumber: serialNumber ? String(serialNumber) : "",
    purchaseDocNumber: getPurchaseDocNumber(detail),
    purchaseDate: getPurchaseDate(detail),
  };
};

const normalizeDocumentLineItem = (
  line: SaleDocTable,
  item: SaleDocLineItem,
  itemIndex: number,
): SaleDocTable => {
  const detail = line as SaleDocLineDetail;
  const itemDetail = item as SaleDocLineItemDetail;
  const amount = firstPositiveNumber(
    itemDetail.amount,
    detail.unitPrice,
    detail.amount,
    detail.price,
  );
  const markingNumber = getMarkingNumber(itemDetail);
  const serialNumber = getSerialNumber(itemDetail);
  const productTableId = toNumber(itemDetail.productTableId);
  const rowKey =
    (markingNumber ? String(markingNumber) : "") ||
    (productTableId ? `product-table-${productTableId}` : "") ||
    `line-item-${detail.id}-${itemDetail.id}-${itemIndex}`;

  return {
    id: toNumber(itemDetail.id),
    rowKey,
    ownerId: toNumber(detail.id),
    productTableId,
    productId: toNumber(detail.productId),
    productName: String(detail.productName ?? "-"),
    productMxik: detail.productMxik,
    quantity: 1,
    unitId: detail.unitId,
    unitName: detail.unitName,
    unitPrice: firstPositiveNumber(detail.unitPrice, amount),
    costPrice: firstPositiveNumber(itemDetail.costPrice, detail.costPrice),
    price: amount,
    amount,
    vatRateId: itemDetail.vatRateId ?? detail.vatRateId ?? null,
    vatRateName: itemDetail.vatRateName ?? detail.vatRateName ?? null,
    vatAmount: toNumber(itemDetail.vatAmount),
    totalAmount: firstPositiveNumber(itemDetail.totalAmount, amount),
    markingNumber: markingNumber ? String(markingNumber) : "",
    serialNumber: serialNumber ? String(serialNumber) : "",
    purchaseDocNumber:
      getPurchaseDocNumber(itemDetail) || getPurchaseDocNumber(detail),
    purchaseDate: getPurchaseDate(itemDetail) || getPurchaseDate(detail),
  };
};

export const getDocumentLines = (document?: SaleDoc): SaleDocTable[] => {
  if (!document) return [];

  if (document.lines?.length) {
    return document.lines.flatMap((line, index) => {
      const detail = line as SaleDocLineDetail;
      if (detail.items?.length) {
        return detail.items.map((item, itemIndex) =>
          normalizeDocumentLineItem(line, item, itemIndex),
        );
      }

      return normalizeDocumentLine(line, index);
    });
  }

  return (document.products ?? []).flatMap((product, productIndex) => {
    const detail = product as SaleDocProductDetail;
    const productName = String(
      detail.productName ?? detail.name ?? detail.product ?? "-",
    );
    const productId = toNumber(detail.productId);
    const productTables = detail.tables?.length ? detail.tables : [detail];

    return productTables.map((table, tableIndex) => {
      const tableDetail = table as SaleDocProductTableDetail;
      const amount = toNumber(
        tableDetail.amount ??
          detail.amount ??
          detail.salePrice ??
          detail.price ??
          detail.unitPrice,
      );
      const markingNumber =
        getMarkingNumber(tableDetail) || getMarkingNumber(detail);
      const serialNumber = getSerialNumber(tableDetail) || getSerialNumber(detail);
      const productTableId = toNumber(
        tableDetail.productTableId ?? detail.productTableId,
      );
      const rowKey =
        (markingNumber ? String(markingNumber) : "") ||
        (productTableId ? `product-table-${productTableId}` : "") ||
        `product-${productId}-${detail.id}-${productIndex}-${tableIndex}`;
      const costPrice = firstPositiveNumber(
        tableDetail.costPrice,
        detail.costPrice,
        detail.unitPrice,
        detail.price,
      );
      const purchaseDocNumber =
        getPurchaseDocNumber(tableDetail) || getPurchaseDocNumber(detail);
      const purchaseDate =
        getPurchaseDate(tableDetail) || getPurchaseDate(detail);

      return {
        id: toNumber(tableDetail.id ?? detail.lineId ?? detail.id),
        rowKey,
        ownerId: toNumber(detail.ownerId, document.id),
        productTableId,
        productId,
        productName,
        quantity: 1,
        costPrice,
        price: toNumber(detail.price ?? detail.unitPrice ?? amount),
        amount,
        vatRateId: tableDetail.vatRateId ?? detail.vatRateId ?? null,
        vatRateName: tableDetail.vatRateName ?? detail.vatRateName ?? null,
        vatAmount: toNumber(tableDetail.vatAmount ?? detail.vatAmount),
        totalAmount: toNumber(tableDetail.totalAmount, amount),
        markingNumber: markingNumber ? String(markingNumber) : "",
        serialNumber: serialNumber ? String(serialNumber) : "",
        unitName: detail.unitName ?? detail.unit,
        purchaseDocNumber,
        purchaseDate,
      };
    });
  });
};
