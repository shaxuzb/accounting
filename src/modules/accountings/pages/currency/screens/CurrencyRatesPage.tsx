import { Button, DatePicker, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Download } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { currencyRatePermissions, UZS_CURRENCY_ID } from "../constants";
import { useCurrencyRates, useImportRates } from "../hooks";
import type { CurrencyRate } from "../types";

const PAGE_SIZE = 50;

/** The Central Bank rates the documents and the revaluation use: UZS for one unit. */
export default function CurrencyRatesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const params = {
    baseCurrencyId: UZS_CURRENCY_ID,
    targetCurrencyId: searchParams.get("currencyId") || undefined,
    effectiveFrom: searchParams.get("dateFrom") || undefined,
    effectiveTo: searchParams.get("dateTo") || undefined,
    page,
    pageSize: PAGE_SIZE,
  };
  const { data, isLoading, isFetching, refetch } = useCurrencyRates(params);
  const importRates = useImportRates();
  const [importDate, setImportDate] = useState(dayjs());

  const runImport = async () => {
    await importRates.mutateAsync(importDate.format("YYYY-MM-DD"));
    toast.success(
      t("currency.rates.imported", { date: importDate.format("DD.MM.YYYY") }),
    );
  };

  const columns: TableColumnsType<CurrencyRate> = [
    {
      dataIndex: "effectiveDate",
      title: t("currency.rates.date"),
      width: 140,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      dataIndex: "targetCurrencyCode",
      title: t("currency.rates.currency"),
      width: 120,
      render: (value: string, record) => (
        <Space size={6}>
          <b>{value}</b>
          <span className="text-secondary-text">{record.targetCurrencyName}</span>
        </Space>
      ),
    },
    {
      dataIndex: "officialRate",
      title: t("currency.rates.rate"),
      align: "right",
      render: (value: number) =>
        value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
    },
    {
      dataIndex: "rateSource",
      title: t("currency.rates.source"),
      render: (value?: string | null, record?: CurrencyRate) => (
        <Space size={6}>
          <span>{value ?? "—"}</span>
          {record && !record.isActive && <Tag>{t("currency.rates.inactive")}</Tag>}
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SelectFilter
              paramKey="currencyId"
              placeholder="currency.rates.currency"
              path={selectListEndpoints.currenciesSelectList}
              width={160}
            />
            <DateRangeFilter placeholderKeys={["currency.dateFrom", "currency.dateTo"]} />
          </>
        }
        actions={
          <PermissionCard permission={currencyRatePermissions.sync}>
            <Space.Compact>
              <DatePicker
                value={importDate}
                format="DD.MM.YYYY"
                allowClear={false}
                disabledDate={(day) => day.isAfter(dayjs(), "day")}
                onChange={(value) => value && setImportDate(value)}
              />
              <Button
                type="primary"
                icon={<Download className="size-4" />}
                loading={importRates.isPending}
                onClick={() => void runImport()}
              >
                {t("currency.rates.import")}
              </Button>
            </Space.Compact>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<CurrencyRate>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data?.items ?? []}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: data?.totalCount ?? 0,
            showSizeChanger: false,
            onChange: (next) => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set("page", String(next));
              setSearchParams(nextParams);
            },
          }}
          scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
        />
      </Card>
    </div>
  );
}
