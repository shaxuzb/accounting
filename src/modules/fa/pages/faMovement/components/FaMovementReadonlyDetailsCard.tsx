import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ReadonlyDetailsCard from "@/components/fields/ReadonlyDetailsCard";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useAppSelector } from "@/store/hooks";
import { customDate } from "@/utils/utils";
import type { FaMovement } from "../types/type";

type SelectOption = Record<string, unknown> & {
  id: number;
  name?: string;
  fullName?: string;
  inventoryNumber?: string;
};

type SelectResponse = SelectOption[] | { items?: SelectOption[] };

const fetchOptions = async (path: string) => {
  const { data } = await $axiosPrivate.get<SelectResponse>(path);
  return Array.isArray(data) ? data : (data.items ?? []);
};

const joinValues = (...values: Array<string | number | null | undefined>) =>
  values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" - ") || "-";

export default function FaMovementReadonlyDetailsCard({
  record,
}: {
  record: FaMovement;
}) {
  const { t } = useTranslation();
  const lang = useAppSelector((state) => state.lang.lang);
  const needsAssetOptions = (record.lines ?? []).some(
    (line) =>
      !line.faAssetName &&
      !line.assetName &&
      !line.faAssetInventoryNumber &&
      !line.inventoryNumber,
  );
  const selectQueryOptions = {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false as const,
  };

  const { data: departments = [] } = useQuery({
    queryKey: [
      "selectlist",
      lang,
      selectListEndpoints.departmentsSelectList,
      undefined,
      {},
    ],
    queryFn: () => fetchOptions(selectListEndpoints.departmentsSelectList),
    enabled: !record.toDepartmentName,
    ...selectQueryOptions,
  });
  const { data: users = [] } = useQuery({
    queryKey: [
      "selectlist",
      lang,
      selectListEndpoints.usersSelectList,
      undefined,
      {},
    ],
    queryFn: () => fetchOptions(selectListEndpoints.usersSelectList),
    enabled: !record.toResponsibleUserName,
    ...selectQueryOptions,
  });
  const { data: assets = [] } = useQuery({
    queryKey: [
      "selectlist",
      lang,
      selectListEndpoints.faAssetsSelectList,
      undefined,
      {},
    ],
    queryFn: () => fetchOptions(selectListEndpoints.faAssetsSelectList),
    enabled: needsAssetOptions,
    ...selectQueryOptions,
  });

  const departmentById = useMemo(
    () => new Map(departments.map((item) => [Number(item.id), item] as const)),
    [departments],
  );
  const userById = useMemo(
    () => new Map(users.map((item) => [Number(item.id), item] as const)),
    [users],
  );
  const assetById = useMemo(
    () => new Map(assets.map((item) => [Number(item.id), item] as const)),
    [assets],
  );

  const department = departmentById.get(Number(record.toDepartmentId));
  const responsibleUser = userById.get(Number(record.toResponsibleUserId));

  return (
    <ReadonlyDetailsCard
      items={[
        {
          label: t("fa.fields.docDate"),
          value: customDate(record.docDate),
        },
        {
          label: t("fa.fields.toDepartmentId"),
          value:
            record.toDepartmentName ??
            (department
              ? getLocalizedLabel(department, lang) || undefined
              : undefined) ??
            record.toDepartmentId,
        },
        {
          label: t("fa.fields.toResponsibleUserId"),
          value:
            record.toResponsibleUserName ??
            responsibleUser?.fullName ??
            (responsibleUser
              ? getLocalizedLabel(responsibleUser, lang) || undefined
              : undefined) ??
            record.toResponsibleUserId,
        },
        {
          label: t("fa.fields.note"),
          value: record.note,
          className: "md:col-span-3",
        },
        ...(record.lines ?? []).flatMap((line, index) => {
          const asset = assetById.get(Number(line.faAssetId));
          const lineLabel = t("fa.sections.lineNumber", { number: index + 1 });
          const assetLabel = joinValues(
            line.faAssetInventoryNumber ??
              line.inventoryNumber ??
              asset?.inventoryNumber,
            line.faAssetName ??
              line.assetName ??
              (asset ? getLocalizedLabel(asset, lang) || undefined : undefined),
          );

          return [
            {
              label: `${lineLabel} — ${t("fa.fields.faAssetId")}`,
              value: assetLabel === "-" ? line.faAssetId : assetLabel,
              className: "md:col-span-2",
            },
            {
              label: `${lineLabel} — ${t("fa.fields.note")}`,
              value: line.note,
            },
          ];
        }),
      ]}
    />
  );
}
