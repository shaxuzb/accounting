import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ReadonlyDetailsCard from "@/components/fields/ReadonlyDetailsCard";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { customDate, numberSpacing } from "@/utils/utils";
import type { FaAsset } from "../types/type";

interface ChartAccountOption {
  id: number;
  number?: string | number;
  code?: string | number;
  name?: string;
}

type ChartAccountResponse =
  | ChartAccountOption[]
  | { items?: ChartAccountOption[] };

interface FaAssetReadonlyDetailsCardProps {
  record: FaAsset;
}

const joinValues = (...values: Array<string | number | null | undefined>) =>
  values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" - ") || "-";

export default function FaAssetReadonlyDetailsCard({
  record,
}: FaAssetReadonlyDetailsCardProps) {
  const { t } = useTranslation();
  const lang = useAppSelector((state) => state.lang.lang);
  const { data: chartAccounts = [] } = useQuery<ChartAccountOption[]>({
    queryKey: [
      "selectlist",
      lang,
      selectListEndpoints.chartAccountsSelectList,
      undefined,
      {},
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<ChartAccountResponse>(
        selectListEndpoints.chartAccountsSelectList,
      );
      if (Array.isArray(data)) return data;
      return data?.items ?? [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });

  const chartAccountById = useMemo(
    () =>
      new Map(
        chartAccounts.map((account) => [Number(account.id), account] as const),
      ),
    [chartAccounts],
  );

  const getChartAccountLabel = (id?: number | null) => {
    if (id == null) return "-";
    const account = chartAccountById.get(Number(id));
    return account ? chartAccountSelectedLabel(account) : id;
  };

  return (
    <ReadonlyDetailsCard
      items={[
        {
          label: t("fa.fields.inventoryNumber"),
          value: record.inventoryNumber,
        },
        { label: t("fa.fields.name"), value: record.name },
        {
          label: t("fa.fields.faGroup"),
          value: joinValues(record.faGroupCode, record.faGroupName),
        },
        {
          label: t("fa.fields.okof"),
          value: joinValues(record.okofCode, record.okofName),
        },
        {
          label: t("fa.fields.depreciationMethod"),
          value: joinValues(
            record.depreciationMethodCode,
            record.depreciationMethodName,
          ),
        },
        {
          label: t("fa.fields.usefulLifeMonths"),
          value: record.usefulLifeMonths,
        },
        {
          label: t("fa.fields.initialCost"),
          value:
            record.initialCost == null
              ? "-"
              : numberSpacing(record.initialCost),
        },
        {
          label: t("fa.fields.salvageValue"),
          value:
            record.salvageValue == null
              ? "-"
              : numberSpacing(record.salvageValue),
        },
        {
          label: t("fa.fields.commissioningDate"),
          value: customDate(record.commissioningDate),
        },
        {
          label: t("fa.fields.deprStartDate"),
          value: customDate(record.deprStartDate),
        },
        {
          label: t("fa.fields.plannedUnitsTotal"),
          value:
            record.plannedUnitsTotal == null
              ? "-"
              : numberSpacing(record.plannedUnitsTotal),
        },
        {
          label: t("fa.fields.sourceProductTable"),
          value: record.sourceProductTableSerialNumber,
 
        },
        {
          label: t("fa.fields.department"),
          value: record.departmentName ?? record.departmentId,
        },
        {
          label: t("fa.fields.responsibleUser"),
          value: record.responsibleUserName ?? record.responsibleUserId,
        },
        {
          label: t("fa.fields.assetAccount"),
          value: getChartAccountLabel(record.assetAccountId),
        },
        {
          label: t("fa.fields.accumulatedDepreciationAccount"),
          value: getChartAccountLabel(
            record.accumulatedDepreciationAccountId,
          ),
        },
        {
          label: t("fa.fields.depreciationExpenseAccount"),
          value: getChartAccountLabel(record.depreciationExpenseAccountId),
        },
        {
          label: t("fa.fields.state"),
          value: record.stateName ?? record.stateId,
        },
      ]}
    />
  );
}
