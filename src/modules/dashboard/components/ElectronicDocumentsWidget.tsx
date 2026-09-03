import { Segmented } from "antd";
import { ArrowDownToLine, ArrowUpFromLine, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  ElectronicDocumentsSummary,
  RelationshipsSummary,
  StatusCount,
} from "../types/type";
import {
  formatDashboardCount,
  getDashboardDocumentLabel,
  getDashboardDocumentStatusLabel,
} from "../utils/dashboard";
import DashboardSection from "./DashboardSection";

type DirectionFilter = "ALL" | "INBOX" | "OUTBOX";

const documentTypeDefinitions = [
  { code: "CONTRACT", aliases: ["CONTRACT"] },
  { code: "POWER_OF_ATTORNEY", aliases: ["POWER_OF_ATTORNEY", "EMPOWERMENT"] },
  { code: "FACTURA", aliases: ["FACTURA"] },
  { code: "WAYBILL_LOCAL", aliases: ["WAYBILL_LOCAL", "WAYBILL", "TTYU"] },
] as const;

const documentStatusOrder = ["SIGNED", "SENT", "REJECTED", "CANCELLED"];
const documentStatusColors: Record<string, string> = {
  SIGNED: "#10b981",
  SENT: "#3b82f6",
  REJECTED: "#ef4444",
  CANCELLED: "#f59e0b",
  INBOX: "#3b82f6",
  OUTBOX: "#10b981",
};

function getStatusItems(items: StatusCount[]) {
  const knownItems = documentStatusOrder.map((status) => ({
    status,
    count: items.reduce((total, item) => {
      const itemStatus = item.status.toUpperCase();
      return itemStatus === status ||
        (status === "CANCELLED" && itemStatus === "CANCELED")
        ? total + item.count
        : total;
    }, 0),
  }));

  const unknownItems = items
    .filter(
      (item) =>
        !documentStatusOrder.some(
          (status) =>
            status === item.status.toUpperCase() ||
            (status === "CANCELLED" &&
              item.status.toUpperCase() === "CANCELED"),
        ),
    )
    .map((item) => ({ status: item.status, count: item.count }));

  return [...knownItems, ...unknownItems];
}

function getDirectionTotal(items: StatusCount[], filter: DirectionFilter) {
  if (filter === "ALL") return items.reduce((sum, item) => sum + item.count, 0);
  return items.find((item) => item.status === filter)?.count ?? 0;
}

function getGradientStops(
  items: Array<{ status: string; count: number }>,
  total: number,
) {
  return items
    .filter((item) => item.count > 0)
    .reduce(
      (result, item) => {
        const end = result.start + (item.count / total) * 100;
        const color = documentStatusColors[item.status] ?? "#64748b";
        return {
          start: end,
          stops: [...result.stops, `${color} ${result.start}% ${end}%`],
        };
      },
      { start: 0, stops: [] as string[] },
    ).stops;
}

function DistributionRing({
  items,
}: {
  items: Array<{ status: string; count: number }>;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const gradientStops = getGradientStops(items, total);

  return (
    <div
      className="relative grid size-24 shrink-0 place-items-center rounded-full p-2.5"
      style={{
        background: gradientStops.length
          ? `conic-gradient(${gradientStops.join(", ")})`
          : "conic-gradient(#e2e8f0 0 100%)",
      }}
      aria-label={`${formatDashboardCount(total)} ta hujjat`}
    >
      <div className="grid size-full place-items-center rounded-full bg-(--theme-bg-card)">
        <div className="text-center">
          <p className="text-lg font-semibold leading-none text-heading">
            {formatDashboardCount(total)}
          </p>
          <p className="mt-1 text-[10px] text-(--theme-text-secondary)">ta</p>
        </div>
      </div>
    </div>
  );
}

function StatusLegend({
  items,
}: {
  items: Array<{ status: string; count: number }>;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 flex-1 space-y-2">
      {items.map((item) => (
        <div
          key={item.status}
          className="flex items-center justify-between gap-2 text-xs"
        >
          <span className="flex min-w-0 items-center gap-2 text-(--theme-text-secondary)">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: documentStatusColors[item.status] ?? "#64748b",
              }}
            />
            <span className="truncate">
              {item.status === "INBOX" || item.status === "OUTBOX"
                ? t(
                    item.status === "INBOX"
                      ? "dashboard.documents.incoming"
                      : "dashboard.documents.outgoing",
                  )
                : t(
                    `dashboard.documents.statusLabels.${item.status.toUpperCase()}`,
                    {
                      defaultValue: getDashboardDocumentStatusLabel(
                        item.status,
                      ),
                    },
                  )}
            </span>
          </span>
          <strong className="shrink-0 text-heading">
            {formatDashboardCount(item.count)} ta
          </strong>
        </div>
      ))}
    </div>
  );
}

function VerticalStatusBars({
  items,
  hasData,
}: {
  items: Array<{ status: string; count: number }>;
  hasData: boolean;
}) {
  const { t } = useTranslation();
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="mt-3">
      <p className="mb-2 text-center text-xs text-(--theme-text-secondary)">
        {t("dashboard.documents.amountPeriod")}
      </p>
      {hasData ? (
        <div className="flex h-20 items-end justify-center gap-2 border-b border-l border-border px-3">
          {items.map((item) => (
            <div
              key={item.status}
              className="w-5 rounded-t-md transition-[height] duration-500"
              style={{
                height: `${Math.max((item.count / max) * 100, item.count ? 8 : 3)}%`,
                backgroundColor: documentStatusColors[item.status] ?? "#64748b",
              }}
              title={`${getDashboardDocumentStatusLabel(item.status)}: ${formatDashboardCount(item.count)}`}
            />
          ))}
        </div>
      ) : (
        <div
          className="h-20 rounded-lg border border-dashed border-border bg-(--theme-bg-muted)"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function TypeCard({
  code,
  item,
  directionCounts,
  canUseDirectionCounts,
  directionFilter,
}: {
  code: string;
  item: StatusCount | undefined;
  directionCounts: StatusCount[];
  canUseDirectionCounts: boolean;
  directionFilter: DirectionFilter;
}) {
  const { t } = useTranslation();
  const incoming =
    directionCounts.find((direction) => direction.status === "INBOX")?.count ??
    0;
  const outgoing =
    directionCounts.find((direction) => direction.status === "OUTBOX")?.count ??
    0;
  const directionCount = directionFilter === "INBOX" ? incoming : outgoing;
  const count =
    directionFilter === "ALL"
      ? (item?.count ?? 0)
      : canUseDirectionCounts && item?.count
        ? directionCount
        : 0;
  const normalizedCode = code.toUpperCase();

  return (
    <div className="min-w-0 rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 dark:border-blue-900/80 dark:bg-blue-950/30">
      <div className="flex items-center gap-2 text-sm text-(--theme-text-secondary)">
        <FileText className="size-4 text-(--theme-brand)" />
        <span className="truncate">
          {t(`dashboard.documents.typeLabels.${normalizedCode}`, {
            defaultValue: getDashboardDocumentLabel(code),
          })}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold leading-none text-heading">
        {formatDashboardCount(count)}{" "}
        <span className="text-sm font-normal">
          {t("dashboard.documents.count")}
        </span>
      </p>
      <p className="mt-2 truncate text-xs text-(--theme-text-secondary)">
        {item?.amount === null || item === undefined
          ? t("dashboard.documents.amountMissing")
          : item.amount}
      </p>
      {directionFilter === "ALL" ? (
        <div className="mt-4 flex items-center gap-4 text-xs text-(--theme-text-secondary)">
          <span className="flex items-center gap-1.5">
            <ArrowDownToLine className="size-3.5 text-emerald-600" />
            {canUseDirectionCounts && count > 0
              ? formatDashboardCount(incoming)
              : "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <ArrowUpFromLine className="size-3.5 text-blue-600" />
            {canUseDirectionCounts && count > 0
              ? formatDashboardCount(outgoing)
              : "—"}
          </span>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-(--theme-text-secondary)">
          {directionFilter === "INBOX" ? (
            <ArrowDownToLine className="size-3.5 text-emerald-600" />
          ) : (
            <ArrowUpFromLine className="size-3.5 text-blue-600" />
          )}
          {canUseDirectionCounts && count > 0
            ? formatDashboardCount(directionCount)
            : "—"}
        </div>
      )}
    </div>
  );
}

function TypeAnalyticsCard({
  code,
  count,
  statusItems,
  hasStatusData,
  hasAmountData,
}: {
  code: string;
  count: number;
  statusItems: Array<{ status: string; count: number }>;
  hasStatusData: boolean;
  hasAmountData: boolean;
}) {
  const { t } = useTranslation();
  const zeroStatusItems = statusItems.map((item) => ({ ...item, count: 0 }));
  const chartItems = hasStatusData ? statusItems : zeroStatusItems;

  return (
    <div className="min-w-0 rounded-xl border border-border bg-(--theme-bg-card) p-4">
      <h3 className="truncate text-base font-medium text-heading">
        {t(`dashboard.documents.typeLabels.${code}`, {
          defaultValue: getDashboardDocumentLabel(code),
        })}
      </h3>
      <p className="mt-3 text-center text-xs text-(--theme-text-secondary)">
        {t("dashboard.documents.countByStatus")}
      </p>
      <div className="mt-2 flex items-center gap-4">
        <DistributionRing items={chartItems} />
        <StatusLegend items={chartItems} />
      </div>
      <VerticalStatusBars items={chartItems} hasData={hasAmountData} />
      {!count && !hasStatusData ? (
        <p className="mt-3 text-center text-[11px] text-(--theme-text-secondary)">
          {t("dashboard.documents.empty")}
        </p>
      ) : null}
    </div>
  );
}

function DirectionFilters({
  value,
  onChange,
}: {
  value: DirectionFilter;
  onChange: (value: DirectionFilter) => void;
}) {
  const { t } = useTranslation();

  return (
    <Segmented<DirectionFilter>
      value={value}
      onChange={onChange}
      className="rounded-xl"
      options={[
        {
          value: "ALL",
          label: (
            <span className="px-1">{t("dashboard.documents.filters.all")}</span>
          ),
        },
        {
          value: "INBOX",
          label: (
            <span className="px-1">
              {t("dashboard.documents.filters.incoming")}
            </span>
          ),
        },
        {
          value: "OUTBOX",
          label: (
            <span className="px-1">
              {t("dashboard.documents.filters.outgoing")}
            </span>
          ),
        },
      ]}
      size="small"
    />
  );
}

export default function ElectronicDocumentsWidget({
  summary,
  relationships,
}: {
  summary: ElectronicDocumentsSummary;
  relationships: RelationshipsSummary;
}) {
  const { t } = useTranslation();
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("ALL");
  const statusItems = useMemo(
    () => getStatusItems(summary.statusCounts),
    [summary.statusCounts],
  );
  const actualTypeItems = summary.typeCounts.filter((item) => item.count > 0);
  const canUseDirectionCounts = actualTypeItems.length <= 1;
  const total = summary.typeCounts.reduce((sum, item) => sum + item.count, 0);
  const hasAmountData =
    summary.amountSeries.length > 0 || summary.currencyTotals.length > 0;
  const directionTotal = getDirectionTotal(
    summary.directionCounts,
    directionFilter,
  );
  const displayedTotal = directionFilter === "ALL" ? total : directionTotal;
  const directionStatusItems =
    directionFilter === "INBOX"
      ? getStatusItems(relationships.incoming.statusCounts)
      : getStatusItems(relationships.outgoing.statusCounts);
  const displayedStatusItems =
    directionFilter === "ALL" ? statusItems : directionStatusItems;
  const filteredDirectionCounts = summary.directionCounts.filter(
    (item) => directionFilter === "ALL" || item.status === directionFilter,
  );

  return (
    <DashboardSection
      title={t("dashboard.documents.title")}
      icon={<FileText className="size-5" />}
      extra={
        <DirectionFilters
          value={directionFilter}
          onChange={setDirectionFilter}
        />
      }
    >
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-(--theme-text-secondary)">
            {t("dashboard.documents.total")}
          </p>
          <p className="mt-1 text-2xl font-semibold leading-none text-heading">
            {formatDashboardCount(displayedTotal)}{" "}
            <span className="text-sm font-normal text-(--theme-text-secondary)">
              {t("dashboard.documents.count")}
            </span>
          </p>
        </div>
        {filteredDirectionCounts.length ? (
          <p className="text-xs text-(--theme-text-secondary)">
            {filteredDirectionCounts
              .map(
                (item) =>
                  `${item.status === "INBOX" ? t("dashboard.documents.incoming") : t("dashboard.documents.outgoing")}: ${formatDashboardCount(item.count)}`,
              )
              .join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {documentTypeDefinitions.map((definition) => (
          <TypeCard
            key={definition.code}
            code={definition.code}
            item={summary.typeCounts.find((item) =>
              definition.aliases.some(
                (alias) => alias === item.status.toUpperCase(),
              ),
            )}
            directionCounts={summary.directionCounts}
            canUseDirectionCounts={canUseDirectionCounts}
            directionFilter={directionFilter}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {documentTypeDefinitions.map((definition) => {
          const item = summary.typeCounts.find((typeItem) =>
            definition.aliases.some(
              (alias) => alias === typeItem.status.toUpperCase(),
            ),
          );
          const isOnlyTypeWithData =
            actualTypeItems.length === 1 && item?.count;
          const displayedCount =
            item?.count && directionFilter !== "ALL"
              ? directionTotal
              : (item?.count ?? 0);
          return (
            <TypeAnalyticsCard
              key={definition.code}
              code={definition.code}
              count={displayedCount}
              statusItems={displayedStatusItems}
              hasStatusData={Boolean(isOnlyTypeWithData)}
              hasAmountData={hasAmountData}
            />
          );
        })}
      </div>
    </DashboardSection>
  );
}
