import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import { useTranslation } from "react-i18next";

interface Props {
  title?: string;
  description?: string;
  data: unknown;
  isLoading?: boolean;
  emptyText?: string;
}

export default function AccountingReportRawCard({
  title,
  description,
  data,
  isLoading = false,
  emptyText,
}: Props) {
  const { t } = useTranslation();
  return (
    <EndpointResultCard
      title={title ?? t("accountings.result.rawTitle")}
      description={description ?? t("accountings.result.rawDescription")}
      data={data}
      isLoading={isLoading}
      emptyText={emptyText ?? t("accountings.result.empty")}
    />
  );
}
