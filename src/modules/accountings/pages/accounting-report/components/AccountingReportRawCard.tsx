import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";

interface Props {
  title?: string;
  description?: string;
  data: unknown;
  isLoading?: boolean;
  emptyText?: string;
}

export default function AccountingReportRawCard({
  title = "Raw response",
  description = "Endpoint dan qaytgan to'liq data.",
  data,
  isLoading = false,
  emptyText = "Natija yo'q",
}: Props) {
  return (
    <EndpointResultCard
      title={title}
      description={description}
      data={data}
      isLoading={isLoading}
      emptyText={emptyText}
    />
  );
}
