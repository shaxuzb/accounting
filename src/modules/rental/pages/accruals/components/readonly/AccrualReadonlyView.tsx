import { Card, Col, Row } from "antd";
import { useTranslation } from "react-i18next";
import { formatRentalAmount } from "@/modules/rental/shared/utils/formatters";
import type { RentalAccrualDetail } from "../../types/type";
import AccrualItemsTable from "../AccrualItemsTable";
import AccrualSummaryCard from "../AccrualSummaryCard";

interface AccrualReadonlyViewProps {
  data: RentalAccrualDetail;
}

export default function AccrualReadonlyView({
  data,
}: AccrualReadonlyViewProps) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 space-y-4">
      <AccrualSummaryCard data={data} />
      <AccrualItemsTable data={data} />
      <Row gutter={[12, 12]}>
        {["taxAmount", "payableAmount", "amount"].map((field) => (
          <Col xs={24} md={8} key={field}>
            <Card className="border-border!" size="small">
              <div className="text-sm text-secondary-text">
                {t(`rental.fields.${field}`)}
              </div>
              <div className="mt-1 text-xl font-semibold">
                {formatRentalAmount(
                  data[field as keyof RentalAccrualDetail] as number,
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
