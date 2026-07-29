import { Button, Switch } from "antd";
import { Clock3, Settings2, Unplug, PlugZap } from "lucide-react";
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
  isBusy: boolean;
  onOpen: () => void;
}

export default function IntegrationCard({
  definition,
  record,
  isBusy,
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
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-primary">
                {t(definition.nameKey)}
              </h2>
            </div>
            <div className="mt-0.5 text-xs text-secondary-text">{definition.domain}</div>
            <p className="mt-3 min-h-10 max-w-xl text-sm leading-5 text-secondary-text">
              {t(definition.descriptionKey)}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {definition.isAvailable ? (
            <IntegrationStatusBadge status={status} />
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-secondary-text">
              <Clock3 className="size-3" />
              {t("settings.integrations.comingSoon")}
            </span>
          )}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <PermissionCard permission={integrationPermissions.connect}>
          <Button
            size="small"
            type={isConnected ? "default" : "primary"}
            disabled={!definition.isAvailable}
            icon={
              isConnected ? (
                <Settings2 className="size-3.5" />
              ) : (
                <PlugZap className="size-3.5" />
              )
            }
            loading={isBusy}
            onClick={onOpen}
          >
            {t(
              isConnected
                ? "settings.integrations.actions.manage"
                : "settings.integrations.actions.connect",
            )}
          </Button>
        </PermissionCard>
        <PermissionCard permission={integrationPermissions.connect}>
          <span title={definition.isAvailable ? undefined : t("settings.integrations.comingSoon")}>
            <Switch
              size="small"
              aria-label={t(definition.nameKey)}
              checked={isConnected}
              disabled={!definition.isAvailable || isBusy}
              loading={isBusy}
              onChange={onOpen}
            />
          </span>
        </PermissionCard>
      </div>
      {record?.certificate && isConnected && (
        <div className={`mt-5 rounded-xl p-3 text-sm ${definition.accentClassName}`}>
          <div className="flex items-center gap-2 font-medium">
            <Unplug className="size-4" />
            <span>{record.certificate.ownerName}</span>
          </div>
          <div className="mt-1 text-xs opacity-80">
            {t("settings.integrations.certificate.serial")}: {record.certificate.serialNumber}
          </div>
        </div>
      )}
    </Card>
  );
}
