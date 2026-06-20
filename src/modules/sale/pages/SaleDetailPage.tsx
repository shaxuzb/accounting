import { Descriptions, Spin, Statistic } from "antd";
import { useParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { customDate, numberSpacing } from "@/utils/utils";
import { SaleLinesTable } from "../components";
import { useGetDetailSale, useGetSaleLines } from "../hooks";

export default function SaleDetailPage() {
  const { id = "" } = useParams();
  const documentQuery = useGetDetailSale(id);
  const linesQuery = useGetSaleLines(id);
  const document = documentQuery.data;
  const lines = linesQuery.data ?? [];
  const totalAmount = lines.reduce(
    (sum, line) => sum + line.quantity * line.price,
    0,
  );

  if (documentQuery.isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-4 border-b border-border pb-4 lg:grid-cols-[1fr_220px]">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <Descriptions.Item label="Hujjat">
            {document?.docNumber || `#${document?.id}`}
          </Descriptions.Item>
          <Descriptions.Item label="Sana">
            {customDate(document?.docDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Kontragent">
            {document?.counterpartyName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ombor">
            {document?.warehouseName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Valyuta">
            {document?.currencyName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Holat">
            {document?.statusName || document?.stateName || "-"}
          </Descriptions.Item>
          {document?.comment && (
            <Descriptions.Item label="Izoh" span={3}>
              {document.comment}
            </Descriptions.Item>
          )}
        </Descriptions>
        <Statistic
          title="Jami summa"
          value={numberSpacing(totalAmount || document?.totalAmount || 0)}
          suffix={document?.currencyName}
        />
      </div>

      <Card className="overflow-hidden border border-border">
        <SaleLinesTable
          lines={lines}
          loading={linesQuery.isLoading || linesQuery.isFetching}
          readOnly
        />
      </Card>
    </div>
  );
}
