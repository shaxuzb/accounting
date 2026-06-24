import { Spin } from "antd";
import { useParams } from "react-router";
import { useAppSelector } from "@/store/hooks";
import {
  ConfirmedSaleDocument,
  SalePricingEditor,
  SaleWarehouseConfirm,
} from "../components";
import { useGetDetailSale } from "../hooks";
import type {
  SaleDoc,
  SaleDocProduct,
  SaleDocProductTable,
  SaleDocTable,
} from "../types/type";

type SaleDocProductDetail = SaleDocProduct & {
  lineId?: number;
  name?: string;
  product?: string;
  salePrice?: number;
  totalAmount?: number;
  vatAmount?: number;
  marking?: string | null;
  markingCode?: string | null;
  markingNumber?: string | null;
  markingNo?: string | null;
  serial?: string | null;
  serialNumber?: string | null;
  serialNo?: string | null;
  unit?: string;
};

type SaleDocProductTableDetail = SaleDocProductTable & {
  marking?: string | null;
  markingCode?: string | null;
  markingNo?: string | null;
  serial?: string | null;
  serialNo?: string | null;
};

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

const getDocumentLines = (document?: SaleDoc): SaleDocTable[] => {
  if (!document) return [];
  if (document.lines?.length) return document.lines;

  return (document.products ?? []).flatMap((product, productIndex) => {
    const detail = product as SaleDocProductDetail;
    const productName = String(
      detail.productName ?? detail.name ?? detail.product ?? "-",
    );
    const productId = toNumber(detail.productId);
    const productTables = detail.tables?.length ? detail.tables : [detail];

    // Backend pricing bosqichida products qaytarsa ham UI bitta SaleDocTable shakli bilan ishlaydi.
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
        tableDetail.markingNumber ??
        tableDetail.marking ??
        tableDetail.markingNo ??
        tableDetail.markingCode ??
        detail.markingNumber ??
        detail.marking ??
        detail.markingNo ??
        detail.markingCode ??
        "";
      const serialNumber =
        tableDetail.serialNumber ??
        tableDetail.serial ??
        tableDetail.serialNo ??
        detail.serialNumber ??
        detail.serial ??
        detail.serialNo ??
        "";
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
      };
    });
  });
};

export default function SaleDetailPage() {
  const { id = "" } = useParams();
  const organizationName = useAppSelector(
    (state) => state.organization.name,
  );
  const documentQuery = useGetDetailSale(id);
  const document = documentQuery.data;
  const isConfirmed = document?.statusId === 2;
  const isWarehouseConfirm = document?.statusId === 1;
  const isPricing = document?.statusId === 4;
  const documentLines = getDocumentLines(document);

  if (documentQuery.isLoading || !document) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <ConfirmedSaleDocument
        document={document}
        lines={documentLines}
        loading={documentQuery.isFetching}
        organizationName={organizationName}
      />
    );
  }

  if (isWarehouseConfirm) {
    return <SaleWarehouseConfirm key={document.id} document={document} />;
  }

  if (isPricing) {
    return (
      <SalePricingEditor
        document={document}
        lines={documentLines}
        loading={documentQuery.isFetching}
        organizationName={organizationName}
      />
    );
  }

  return (
    <SalePricingEditor
      document={document}
      lines={documentLines}
      loading={documentQuery.isFetching}
      organizationName={organizationName}
    />
  );
}
