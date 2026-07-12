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
        { label: "Sana", value: customDate(record.docDate) },
        { label: "Kassa", value: record.cashBoxName ?? record.cashBoxId },
        {
          label: "Operatsiya turi",
          value: record.operationTypeName ?? record.operationTypeId,
        },
        {
          label: "Kassa schyoti",
          value: getChartAccountLabel(record.cashChartAccountId),
        },
        {
          label: "Qarama-qarshi schyot",
          value: getChartAccountLabel(record.offsetAccountId),
        },
        {
          label: "Kontragent",
          value: record.counterpartyName ?? record.counterpartyId,
        },
        {
          label: "To'lov turi",
          value: record.paymentTypeName ?? record.paymentTypeId,
        },

        {
          label: "Valyuta",
          value: record.currencyName ?? record.currencyId,
        },
        {
          label: "Summa",
          value: `${numberSpacing(record.amount)} ${record.currencyName ?? ""}`,
        },
        { label: "Kurs", value: record.exchangeRate },
        { label: "Izoh", value: record.comment || "-", className: "md:col-span-2" },
      ]}
    />
  );
}
