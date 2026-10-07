import { Button } from "antd";
import { PlugZap, Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import Card from "@/components/ui/card/Card";
import { integrationPermissions } from "../constants/permissions";
import type {
  IntegrationDefinition,
  IntegrationRecord,
} from "../types/type";
import IntegrationStatusBadge from "./IntegrationStatusBadge";

interface IntegrationCardProps {
  definition: IntegrationDefinition;
  record?: IntegrationRecord;
  onOpen: () => void;
}

export default function IntegrationCard({
  definition,
  record,
  onOpen,
}: IntegrationCardProps) {
  const { t } = useTranslation();
  const status = record?.status ?? "DISCONNECTED";
  const isConnected = status === "CONNECTED";

  return (
    <Card className="flex h-full min-h-56 flex-col border border-border p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${definition.logoClassName}`}
            aria-hidden="true"
          >
            {definition.logo}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-primary">
              {t(definition.nameKey)}
            </h2>
            <div className="mt-0.5 text-xs text-secondary-text">{definition.domain}</div>
            <p className="mt-3 min-h-10 max-w-xl text-sm leading-5 text-secondary-text">
              {t(definition.descriptionKey)}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <IntegrationStatusBadge status={status} />
        </div>
      </div>
      <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
        <PermissionCard permission={integrationPermissions.connect}>
          <Button
            size="small"
            type={isConnected ? "default" : "primary"}
            icon={
              isConnected ? (
                <Settings2 className="size-3.5" />
              ) : (
                <PlugZap className="size-3.5" />
              )
            }
            onClick={onOpen}
          >
            {t(
              isConnected
                ? "settings.integrations.actions.manage"
                : "settings.integrations.actions.connect",
            )}
          </Button>
        </PermissionCard>
      </div>
    </Card>
  );
}
