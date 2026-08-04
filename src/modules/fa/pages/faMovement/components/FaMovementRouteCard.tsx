import { ArrowRight, Building2, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";

interface FaMovementRouteCardProps {
  previousLocation: string;
  previousTitle?: string;
  destinationDepartment: string;
  destinationUser: string;
  embedded?: boolean;
}

export default function FaMovementRouteCard({
  previousLocation,
  previousTitle,
  destinationDepartment,
  destinationUser,
  embedded = false,
}: FaMovementRouteCardProps) {
  const { t } = useTranslation();
  const hasPreviousLocation = Boolean(previousLocation.trim());
  const content = (
    <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
      <div className="rounded-lg border border-border bg-surface-muted/70 px-5 py-4">
        <div
          className={
            hasPreviousLocation
              ? "flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-secondary-text"
              : "flex min-h-14 items-center gap-2 text-sm font-medium text-secondary-text"
          }
        >
          <Building2 className="size-4 text-primary" />
          {previousTitle ?? t("fa.movement.previousLocation")}
        </div>
        {hasPreviousLocation && (
          <div className="mt-2 text-sm font-semibold text-text">
            {previousLocation}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center px-3 text-primary">
        <ArrowRight className="size-7" />
      </div>

      <div className="rounded-lg border border-blue-200 bg-brand-soft/55 px-5 py-4 dark:border-blue-900">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-secondary-text">
          <UserRound className="size-4 text-primary" />
          {t("fa.movement.newLocation")}
        </div>
        <div className="mt-2 text-sm font-semibold text-text">
          {destinationDepartment || "-"}
        </div>
        <div className="mt-0.5 text-sm text-secondary-text">
          {destinationUser || "-"}
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return <Card className="border border-border p-4">{content}</Card>;
}
