import { Alert, Button, Select, Tag } from "antd";
import { CheckCircle2, ServerCog } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useEdoActiveProvider,
  useSetEdoActiveProvider,
} from "../hooks";
import { edoProviderOptions } from "../constants/providers";
import type { EdoProviderCode, EdoProviderDto } from "../types/type";

export default function EdoProviderPanel({
  onProviderChanged,
}: {
  onProviderChanged?: (provider: EdoProviderDto) => void;
}) {
  const { t } = useTranslation();
  const activeProviderQuery = useEdoActiveProvider();
  const setActiveProvider = useSetEdoActiveProvider();
  const activeCode = activeProviderQuery.data?.code;

  const handleSelect = async (providerCode: EdoProviderCode) => {
    if (providerCode === activeCode) return;
    try {
      const updated = await setActiveProvider.mutateAsync({
        providerCode,
      });
      toast.success(t("settings.integrations.edo.messages.providerChanged"));
      onProviderChanged?.(updated);
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <Card className="border border-border p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <ServerCog className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-heading">
            {t("settings.integrations.edo.provider.title")}
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            {t("settings.integrations.edo.provider.description")}
          </p>
        </div>
      </div>

      {activeProviderQuery.isError && (
        <Alert
          type="error"
          showIcon
          message={t("settings.integrations.edo.errors.providers")}
          action={
            <Button
              size="small"
              onClick={() => void activeProviderQuery.refetch()}
            >
              {t("common.reload")}
            </Button>
          }
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,420px)_1fr] lg:items-end">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading">
            {t("settings.integrations.edo.provider.title")}
          </label>
          <Select<EdoProviderCode>
            className="w-full"
            size="large"
            value={activeCode}
            options={edoProviderOptions.map((provider) => ({
              value: provider.providerCode,
              label: provider.displayName,
            }))}
            loading={
              activeProviderQuery.isLoading || setActiveProvider.isPending
            }
            disabled={setActiveProvider.isPending}
            onChange={(providerCode) => void handleSelect(providerCode)}
            placeholder={t("settings.integrations.edo.auth.selectProvider")}
          />
        </div>

        {activeProviderQuery.data && (
          <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <CheckCircle2 className="size-4 text-success" />
              <span className="text-sm font-semibold text-heading">
                {activeProviderQuery.data.name || activeCode}
              </span>
              <span className="text-xs text-secondary-text">
                {activeCode}
              </span>
              <span className="text-xs text-secondary-text">
                ID: {activeProviderQuery.data.id}
              </span>
              <Tag color="success" className="m-0! ml-auto!">
                {t("settings.saleCondition.active")}
              </Tag>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
