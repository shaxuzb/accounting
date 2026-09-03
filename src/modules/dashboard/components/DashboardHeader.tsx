import { Button, DatePicker, Select, Space } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardFilters } from "../types/type";
import { useDashboardCurrencies } from "../hooks/useDashboardCurrencies";

interface DashboardHeaderProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export default function DashboardHeader({
  filters,
  onFiltersChange,
  onRefresh,
  isFetching,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const { data: currencies = [], isLoading: isCurrenciesLoading } =
    useDashboardCurrencies();

  const rangeValue: [Dayjs, Dayjs] | null =
    filters.dateFrom && filters.dateTo
      ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
      : null;

  const handleDateChange = (range: null | [Dayjs | null, Dayjs | null]) => {
    onFiltersChange({
      ...filters,
      dateFrom: range?.[0]?.format("YYYY-MM-DD") ?? null,
      dateTo: range?.[1]?.format("YYYY-MM-DD") ?? null,
    });
  };

  return (
    <header className="mb-3 rounded-2xl border border-border bg-(--theme-bg-card) p-5 shadow-(--theme-shadow)">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-(--theme-brand)">
            {t("dashboard.eyebrow")}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            {t("dashboard.title")}
          </h1>
          <p className="mt-1 text-sm text-(--theme-text-secondary)">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <Space wrap>
          <Button
            icon={
              <RefreshCw
                className={`size-4 ${isFetching ? "animate-spin" : ""}`}
              />
            }
            onClick={onRefresh}
            aria-label={t("common.refresh")}
          />
        </Space>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <DatePicker.RangePicker
          value={rangeValue}
          onChange={handleDateChange}
          format="DD.MM.YYYY"
          allowClear
          aria-label={t("dashboard.dateRange")}
        />
        <Select<number[]>
          mode="multiple"
          allowClear
          value={filters.currencyIds}
          loading={isCurrenciesLoading}
          onChange={(currencyIds) =>
            onFiltersChange({ ...filters, currencyIds })
          }
          options={currencies.map((currency) => ({
            value: currency.id,
            label: currency.code || currency.name,
          }))}
          placeholder={t("dashboard.allCurrencies")}
          className="min-w-52"
          maxTagCount="responsive"
          aria-label={t("dashboard.currency")}
        />
        <span className="text-xs text-(--theme-text-secondary)">
          {filters.dateFrom && filters.dateTo
            ? `${filters.dateFrom} — ${filters.dateTo}`
            : t("dashboard.allPeriod")}
        </span>
      </div>
    </header>
  );
}
