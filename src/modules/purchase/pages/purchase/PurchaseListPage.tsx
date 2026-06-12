import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { Button, Space, Table, Tag } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Eye, FileUp, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { formatDate, generateKeyTable } from "@/utils/utils";
import { useGetListPurchase } from "../../hooks/useGetListPurchase";
import { purchasePermissions } from "../../constants/permissions";
import type { PurchaseCurrencyTotal, PurchaseData } from "../../types/type";

const formatAmount = (value?: number | null) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const statusTag = (statusId?: number, status?: string) => (
  <Tag color={statusId === 1 ? "green" : "blue"} className="m-0!">
    {status || "-"}
  </Tag>
);

const getCurrencyValue = (
  prices: PurchaseCurrencyTotal[] | undefined,
  currencyId: number,
) => prices?.find((item) => item.currencyId === currencyId)?.totalPrice ?? 0;

export default function PurchaseListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetListPurchase(searchParams);

  const currencies = useMemo(() => {
    const map = new Map<number, { currencyId: number; currencyName: string; currencyCode: string }>();
    data?.results?.forEach((record) => {
      record.prices?.forEach((price) => {
        map.set(price.currencyId, {
          currencyId: price.currencyId,
          currencyName: price.currencyName,
          currencyCode: price.currencyCode,
        });
      });
    });
    return Array.from(map.values());
  }, [data?.results]);

  const tableColumns: TableColumnsType<PurchaseData> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      minWidth: 150,
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("purchase.fields.docDate"),
      width: 130,
      render: (value) => formatDate(value),
    },
    {
      dataIndex: "supplier",
      title: t("purchase.fields.supplier"),
      minWidth: 180,
    },
    ...currencies.map<TableColumnType<PurchaseData>>((currency) => ({
      dataIndex: `currency_${currency.currencyId}`,
      title: `${t("purchase.fields.amount")} ${currency.currencyName}`,
      align: "right",
      width: 160,
      render: (_, record) =>
        `${formatAmount(getCurrencyValue(record.prices, currency.currencyId))} ${currency.currencyCode}`,
    })),
    {
      dataIndex: "statusId",
      title: t("settings.fields.status"),
      align: "center",
      width: 130,
      render: (_, record) => statusTag(record.statusId, record.status),
    },
  ];

  const hasActions =
    userPermissions.includes(purchasePermissions.detail) ||
    userPermissions.includes(purchasePermissions.update) ||
    userPermissions.includes(purchasePermissions.delete);

  const columns: TableColumnType<PurchaseData>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 90,
          fixed: "right",
          render: (_, record) => (
            <PermissionCard permission={purchasePermissions.detail}>
              <Link to={`${record.id}`}>
                <Button icon={<Eye className="size-4" />} />
              </Link>
            </PermissionCard>
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-end">
        <Space>
          <PermissionCard permission={purchasePermissions.create}>
            <Link to="import">
              <Button type="primary" icon={<FileUp className="size-4" />}>
                {t("purchase.importTitle")}
              </Button>
            </Link>
          </PermissionCard>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<PurchaseData>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.results ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
          summary={(pageData) => {
            if (!pageData.length || !currencies.length) return null;
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <b>{t("common.total")}</b>
                  </Table.Summary.Cell>
                  {currencies.map((currency, index) => {
                    const total = pageData.reduce(
                      (sum, row) =>
                        sum + getCurrencyValue(row.prices, currency.currencyId),
                      0,
                    );
                    return (
                      <Table.Summary.Cell
                        key={currency.currencyId}
                        index={index + 4}
                        align="right"
                      >
                        <b>
                          {formatAmount(total)} {currency.currencyCode}
                        </b>
                      </Table.Summary.Cell>
                    );
                  })}
                  {hasActions && (
                    <Table.Summary.Cell index={currencies.length + 4} />
                  )}
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
    </div>
  );
}
