import { Alert, Button, Empty, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { useVatPayer } from "@/shared/hooks/useVatPayer";
import type { AccountingPolicyCurrentDto } from "../types/type";

const formatDay = (value?: string | null) =>
  value ? dayjs(value).format("DD.MM.YYYY") : null;

/**
 * The rules the documents are posted by today (1C «Учетная политика»): only what the server
 * applies is shown — the VAT payer as the posting engine resolves it, and the fixed rules.
 */
export default function CurrentPolicyTab({
  data,
  isLoading,
  isError,
  onEdit,
}: {
  data?: AccountingPolicyCurrentDto;
  isLoading: boolean;
  isError: boolean;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const vatPayer = useVatPayer();

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (isError)
    return <Alert type="error" showIcon message={t("accountingPolicy.view.loadError")} />;
  if (!data) return <Empty description={t("accountingPolicy.view.loadError")} />;

  const from = formatDay(data.effectiveFrom);
  const to = formatDay(data.effectiveTo);
  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: t("accountingPolicy.form.vatPayer"),
      value: (
        <Tag color={vatPayer.isVatPayer ? "green" : "orange"}>
          {vatPayer.isVatPayer ? t("accountingPolicy.view.yes") : t("accountingPolicy.view.no")}
        </Tag>
      ),
    },
    {
      label: t("accountingPolicy.view.period"),
      value: from
        ? `${from} — ${to ?? t("accountingPolicy.view.openEnded")}`
        : t("accountingPolicy.view.defaultVersion"),
    },
    {
      label: t("accountingPolicy.view.accountingStart"),
      value: formatDay(data.accountingStartDate) ?? "—",
    },
    { label: t("accountingPolicy.view.valuation"), value: "FIFO" },
    { label: t("accountingPolicy.view.baseCurrency"), value: data.baseCurrencyCode ?? "UZS" },
    { label: t("accountingPolicy.view.vatPeriod"), value: t("accountingPolicy.view.vatPeriodMonth") },
    { label: t("accountingPolicy.view.vatBase"), value: t("accountingPolicy.view.vatBaseShipment") },
    { label: t("accountingPolicy.view.closedPeriods"), value: t("accountingPolicy.view.closedProtected") },
  ];

  return (
    <Card className="border border-border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-base font-semibold text-primary-text">
          {t("accountingPolicy.view.title")}
        </div>
        <Button type="primary" icon={<Pencil className="size-4" />} onClick={onEdit}>
          {t("accountingPolicy.view.newVersion")}
        </Button>
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 border-b border-border pb-2"
          >
            <dt className="text-sm text-secondary-text">{row.label}</dt>
            <dd className="m-0 text-sm font-semibold text-primary-text">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
