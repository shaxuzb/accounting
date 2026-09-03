import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SourceStatus } from "../types/type";
import DashboardSection from "./DashboardSection";

export default function UnavailableWidget({
  title,
  description,
  status = "NOT_AVAILABLE",
}: {
  title: string;
  description: string;
  status?: SourceStatus;
}) {
  const { t } = useTranslation();

  return (
    <DashboardSection
      title={title}
      description={description}
      icon={<Info className="size-5" />}
      status={status}
    >
      <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border bg-(--theme-bg-muted) px-4 text-center text-sm text-(--theme-text-secondary)">
        {t("dashboard.notAvailable")}
      </div>
    </DashboardSection>
  );
}
