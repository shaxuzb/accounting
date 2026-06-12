import ImportButton from "@/components/ui/buttons/ImportButton";
import PermissionCard from "@/components/ui/card/PermissionCard";
import StartEndDateFilter from "@/components/ui/filters/StartEndDateFilter";
import SupplierFilter from "@/components/ui/filters/SupplierFilter";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { salePermission } from "@/modules/sales/constants/permissions";
import { rolePermission } from "@/modules/settings/constants/permissions";
import { useGetListPurchase } from "@/modules/purchases/hooks/useGetListPurchase";
import { PurchaseData } from "@/modules/purchases/types/purchase";
import { useAppSelector } from "@/store/hooks";
import { customProductStatus } from "@/shared/utils/helpers/goodMovementStatus";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { Table, TableColumnType } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { useMemo } from "react";
import {
  buildCurrencyColumnsFromRecords,
  buildCurrencyTotals,
  getCurrencyMetricValue,
} from "@/shared/utils/helpers/currencyColumns";

const Purchase = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth?.user);
  const org = useAppSelector((state) => state.organization);
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } =
    useGetListPurchase(searchParams);
  const currencyColumns = useMemo(() => {
    return buildCurrencyColumnsFromRecords(data?.results, {
      getCurrencies: (record) => record.prices,
      getCurrencyId: (currency) => currency.currencyId,
      getCurrencyName: (currency) => currency.currencyName,
      getCurrencyCode: (currency) => currency.currencyCode,
    });
  }, [data]);

  const getBalanceByCurrency = (record: PurchaseData, currencyId: number) => {
    return getCurrencyMetricValue(record, currencyId, {
      getCurrencies: (row) => row.prices,
      getCurrencyId: (currency) => currency.currencyId,
      getValue: (currency) => currency.totalPrice,
    });
  };
  const tableColumnLabels: TableColumnType<PurchaseData>[] = [
    {
      dataIndex: "indexId",
      title: t("Table.ordinalNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "docNumber",
      title: t("Table.documentNumber"),
      minWidth: 140,
      render: (value, record) => {
        return <Link to={`view/${record.id.toString()}`}>{value}</Link>;
      },
    },
    ...(org.useContractAccounting
      ? [
          {
            dataIndex: "contractName",
            title: "Shartnoma",
            align: "center",
          } as TableColumnType<PurchaseData>,
        ]
      : []),
    {
      dataIndex: "docDate",
      title: t("Table.date"),
      render: (val) => customDate(val),
    },
    {
      dataIndex: "supplier",
      title: t("Table.supplier"),
      align: "center",
    },
    ...currencyColumns.map((currency) => ({
      dataIndex: `balance_${currency.currencyId}`,
      align: "center" as const,
      title: `Summa  ${currency.currencyName}`,
      render: (_: unknown, record: PurchaseData) => {
        const amount = getBalanceByCurrency(record, currency.currencyId);
        return (
          <span className={amount < 0 ? "text-[#db1414]" : ""}>
            {`${numberSpacing(amount, " ", true)} ${currency.currencyCode}`}
          </span>
        );
      },
    })),
    {
      dataIndex: "statusId",
      title: t("Table.state"),
      align: "center",
      render(value) {
        return customProductStatus(value);
      },
    },
  ];
  const hasActions =
    user?.user.permissions.includes(rolePermission.UPDATE) ||
    user?.user.permissions.includes(rolePermission.DELETE);

  const columns: TableColumnType<PurchaseData>[] = hasActions
    ? [
        ...tableColumnLabels,
        {
          dataIndex: "actions",
          title: t("Table.actions"),
          align: "center",
          width: 100,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="roles"
              customPatn={`/main/role/edit/${record.id}`}
              record={record}
              permissions={user?.user.permissions || []}
              permissionsCode={{
                deleteCode: rolePermission.DELETE,
                editCode: rolePermission.UPDATE,
              }}
              refetch={refetch}
            />
          ),
        },
      ]
    : tableColumnLabels;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 shrink grow">
          {/* <ButtonAdd to="add" /> */}
          <PermissionCard permission={salePermission.CREATE}>
            <ImportButton />
          </PermissionCard>
        </div>
        <div className="flex gap-3 items-center flex-wrap justify-end">
          <SupplierFilter />
          <StartEndDateFilter />
        </div>
      </div>
      <Table
        dataSource={generateKeyTable(data?.results)}
        pagination={false}
        virtual={data?.results?.length > 100}
        scroll={{
          y: "calc(100vh - 220px)",
          x: "max-content",
        }}
        loading={isLoading || isFetching}
        columns={columns}
        summary={(pageData) => {
          const totalsByCurrency = buildCurrencyTotals(
            [...pageData],
            currencyColumns,
            {
              getCurrencies: (row) => row.prices,
              getCurrencyId: (currency) => currency.currencyId,
              getValue: (currency) => currency.totalPrice,
            },
          );
          const leadColumnsCount = 4; // index, docNumber, client
          const trailingColumnsCount = hasActions ? 3 : 2; // docDate, status, actions?

          return (
            <Table.Summary fixed>
              <Table.Summary.Row className="[&>td]:!py-2 [&>td]:font-semibold !rounded-4xl">
                <Table.Summary.Cell colSpan={leadColumnsCount} index={0}>
                  {t("Table.total")}
                </Table.Summary.Cell>
                {totalsByCurrency.map((item, index) => (
                  <Table.Summary.Cell
                    className="text-center"
                    index={leadColumnsCount + index}
                    key={item.currencyId}
                  >
                    <span className="text-nowrap">
                      {numberSpacing(item.total)} {item.currencyCode}
                    </span>
                  </Table.Summary.Cell>
                ))}
                {Array.from({ length: trailingColumnsCount }).map(
                  (_, tailIndex) => (
                    <Table.Summary.Cell
                      key={`tail-${tailIndex}`}
                      className="text-center"
                      index={
                        leadColumnsCount + totalsByCurrency.length + tailIndex
                      }
                    />
                  ),
                )}
                {/* <Table.Summary.Cell className="text-center" index={3}>
                  <span>{numberSpacing(totalDiscountUzs)} UZS</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="text-center" index={4}>
                  <span>{numberSpacing(totalDiscountUsd)} $</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="text-center" index={5} />
                <Table.Summary.Cell className="text-center" index={6} /> */}
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    </div>
  );
};

export default Purchase;
