import Card from "@/components/ui/card/Card";
import type { SaleDoc, SaleDocTable } from "../types/type";
import { groupSaleDocumentLines } from "../utils/saleDocumentGroups";
import SaleConfirmedLinesTable from "./SaleConfirmedLinesTable";
import SaleDocumentSummary from "./SaleDocumentSummary";

interface Props {
  document: SaleDoc;
  lines: SaleDocTable[];
  loading: boolean;
  organizationName: string;
}

export default function ConfirmedSaleDocument({
  document,
  lines = [],
  loading,
  organizationName,
}: Props) {
  const currency = document.currencyCode || "UZS";
  const totalAmount = groupSaleDocumentLines(lines).reduce(
    (sum, group) => sum + group.totalAmount,
    0,
  );

  return (
    <div className="space-y-4">
      <SaleDocumentSummary
        document={document}
        organizationName={organizationName}
        totalAmount={totalAmount || document.totalAmount || 0}
      />
      <Card className="overflow-hidden border border-border">
        <SaleConfirmedLinesTable
          lines={lines}
          loading={loading}
          currency={currency}
        />
      </Card>
    </div>
  );
}
