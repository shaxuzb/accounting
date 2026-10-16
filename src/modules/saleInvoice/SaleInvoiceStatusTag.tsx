import { Tag } from "antd";
import { useTranslation } from "react-i18next";

const colors: Record<number, string> = { 1: "orange", 2: "blue", 3: "green", 4: "default" };

/** 1C «Состояние счета»: not paid, paid in part, paid, cancelled. */
export default function SaleInvoiceStatusTag({ statusId }: { statusId: number }) {
  const { t } = useTranslation();
  return <Tag color={colors[statusId] ?? "default"}>{t(`saleInvoice.status.${statusId}`)}</Tag>;
}
