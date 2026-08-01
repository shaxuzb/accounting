import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ReadonlyDetailsCard from "@/components/fields/ReadonlyDetailsCard";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { customDate, numberSpacing } from "@/utils/utils";
import type { CashOperation } from "../pages/cashoperation/types/type";
import { useTranslation } from "react-i18next";

interface ChartAccountOption {
  id: number;
  number?: string | number;
  code?: string | number;
  name?: string;
}

interface CashReadonlyDetailsCardProps {
  record: CashOperation;
}

export default function CashReadonlyDetailsCard({
  record,
}: CashReadonlyDetailsCardProps) {
  const { t } = useTranslation();
  const { data: chartAccounts = [] } = useQuery<ChartAccountOption[]>({
    queryKey: ["selectlist", selectListEndpoints.chartAccountsSelectList, undefined, {}],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<ChartAccountOption[]>(
        selectListEndpoints.chartAccountsSelectList,
      );
      return data ?? [];
    },
  });

  const chartAccountById = useMemo(
    () =>
      new Map(
        chartAccounts.map((account) => [Number(account.id), account] as const),
      ),
    [chartAccounts],
  );

  const getChartAccountLabel = (id?: number | null) => {
    if (id === null || id === undefined) return "-";
    const account = chartAccountById.get(Number(id));
    return account ? chartAccountSelectedLabel(account) : id;
  };

  return (
    <ReadonlyDetailsCard
      items={[
        { label: t("cash.fields.date"), value: customDate(record.docDate) },
        { label: t("cash.fields.cashBox"), value: record.cashBoxName ?? record.cashBoxId },
        {
          label: t("cash.fields.operationType"),
          value: record.operationTypeName ?? record.operationTypeId,
        },
        {
          label: t("cash.fields.cashChartAccount"),
          value: getChartAccountLabel(record.cashChartAccountId),
        },
        {
          label: t("cash.fields.offsetAccount"),
          value: getChartAccountLabel(record.offsetAccountId),
        },
        {
          label: t("cash.fields.counterparty"),
          value: record.counterpartyName ?? record.counterpartyId,
        },
        {
          label: t("cash.fields.paymentType"),
          value: record.paymentTypeName ?? record.paymentTypeId,
        },

        {
          label: t("cash.fields.currency"),
          value: record.currencyName ?? record.currencyId,
        },
        {
          label: t("cash.fields.amount"),
          value: `${numberSpacing(record.amount)} ${record.currencyName ?? ""}`,
        },
        { label: t("cash.fields.exchangeRate"), value: record.exchangeRate },
        { label: t("cash.fields.comment"), value: record.comment || "-", className: "md:col-span-2" },
      ]}
    />
  );
}
