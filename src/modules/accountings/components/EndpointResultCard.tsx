import { Loader2 } from "lucide-react";
import Card from "@/components/ui/card/Card";
import StructuredDataView from "@/components/ui/data/StructuredDataView";
import { useTranslation } from "react-i18next";

interface Props {
  title: string;
  description?: string;
  data: unknown;
  isLoading?: boolean;
  emptyText?: string;
}

export default function EndpointResultCard({
  title,
  description,
  data,
  isLoading = false,
  emptyText,
}: Props) {
  const { t } = useTranslation();
  return (
    <Card className="border border-border p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-secondary-text">{description}</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-secondary-text">
          <Loader2 className="size-4 animate-spin" />
          {t("common.loading")}...
        </div>
      ) : (
        <StructuredDataView value={data} empty={emptyText ?? t("accountings.result.empty")} />
      )}
    </Card>
  );
}
