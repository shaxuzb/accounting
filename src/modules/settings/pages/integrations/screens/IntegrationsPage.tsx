import { Alert, Button, Empty, Segmented, Skeleton } from "antd";
import { CheckCircle2, CircleOff, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import {
  integrationCategories,
  integrationDefinitions,
} from "../constants/integration";
import IntegrationCard from "../components/IntegrationCard";
import IntegrationConnectionModal from "../components/IntegrationConnectionModal";
import { useIntegrations } from "../hooks/useIntegrations";
import type { IntegrationCategory, IntegrationCode } from "../types/type";
import { useEdoActiveProvider } from "../edo/hooks";
import { readEdoAuthSession } from "../edo/utils/authSession";

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, isLoading, error, refresh } = useIntegrations();
  const activeProviderQuery = useEdoActiveProvider();
  const [selectedCode, setSelectedCode] = useState<IntegrationCode | null>(
    null,
  );
  const [activeCategory, setActiveCategory] =
    useState<IntegrationCategory>("ALL");
  const recordsByCode = useMemo(() => {
    const records = new Map(items.map((item) => [item.code, item]));
    const provider = activeProviderQuery.data;
    const session = readEdoAuthSession(provider?.code);
    records.set("EDO", {
      code: "EDO",
      status: session?.isAuthenticated ? "CONNECTED" : "DISCONNECTED",
    });
    return records;
  }, [activeProviderQuery.data, items]);
  const selectedDefinition = integrationDefinitions.find(
    (item) => item.code === selectedCode,
  );
  const selectedRecord = selectedCode
    ? recordsByCode.get(selectedCode)
    : undefined;
  const availableDefinitions = integrationDefinitions.filter(
    (definition) => definition.isAvailable,
  );
  const connectedCount = availableDefinitions.filter(
    (definition) => recordsByCode.get(definition.code)?.status === "CONNECTED",
  ).length;
  const disconnectedCount = availableDefinitions.length - connectedCount;
  const visibleDefinitions = useMemo(() => {
    // const normalizedSearch = search.trim().toLowerCase();
    return integrationDefinitions.filter((definition) => {
      const matchesCategory =
        activeCategory === "ALL" || definition.category === activeCategory;
      // const matchesSearch =
      //   !normalizedSearch ||
      //   definition.domain.toLowerCase().includes(normalizedSearch) ||
      //   definition.code.toLowerCase().includes(normalizedSearch) ||
      //   t(definition.nameKey).toLowerCase().includes(normalizedSearch);
      return matchesCategory;
    });
  }, [activeCategory]);

  const openIntegration = (code: IntegrationCode) => {
    if (code === "EDO") {
      navigate("edo");
      return;
    }
    setSelectedCode(code);
  };

  return (
    <Card className="p-3">
      <header className="flex flex-col gap-4  border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="pt-2 flex items-center justify-between gap-3">
          <Segmented
            value={activeCategory}
            options={integrationCategories.map((category) => ({
              label: t(category.labelKey),
              value: category.value,
            }))}
            onChange={(value) =>
              setActiveCategory(value as IntegrationCategory)
            }
            className="max-w-full overflow-x-auto"
          />
          {/* <Space>
            <SearchFilter />
          </Space> */}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-primary-bg px-3 text-sm">
            <CheckCircle2 className="size-4 text-success" />
            <span className="font-semibold tabular-nums text-heading">
              {connectedCount}
            </span>
            <span className="text-secondary-text">
              {t("settings.integrations.status.connected")}
            </span>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-primary-bg px-3 text-sm">
            <CircleOff className="size-4 text-secondary-text" />
            <span className="font-semibold tabular-nums text-heading">
              {disconnectedCount}
            </span>
            <span className="text-secondary-text">
              {t("settings.integrations.status.disconnected")}
            </span>
          </div>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refresh()}
            loading={isLoading}
          >
            {t("common.refresh")}
          </Button>
        </div>
      </header>

      {error && <Alert type="error" showIcon message={error} />}

      <section aria-labelledby="integrations-list-title">
        {isLoading && items.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[
              "integration-skeleton-1",
              "integration-skeleton-2",
              "integration-skeleton-3",
            ].map((key) => (
              <Card key={key} className="border border-border p-5">
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  title={{ width: "42%" }}
                />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {visibleDefinitions.map((definition) => (
              <IntegrationCard
                key={definition.code}
                definition={definition}
                record={recordsByCode.get(definition.code)}
                isBusy={selectedCode === definition.code}
                onOpen={() => openIntegration(definition.code)}
              />
            ))}
            {visibleDefinitions.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-border py-10">
                <Empty description={t("settings.integrations.noResults")} />
              </div>
            )}
          </div>
        )}
      </section>

      {selectedDefinition && (
        <IntegrationConnectionModal
          open
          definition={selectedDefinition}
          record={selectedRecord}
          onClose={() => setSelectedCode(null)}
          onChanged={refresh}
        />
      )}
    </Card>
  );
}
