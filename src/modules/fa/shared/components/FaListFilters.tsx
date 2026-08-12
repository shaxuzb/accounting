import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter, {
  type SelectFilterOption,
} from "@/components/ui/filters/SelectFilter";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

const documentStatusOptions: readonly SelectFilterOption[] = [
  { value: 1, label: "fa.statuses.draft" },
  { value: 2, label: "fa.statuses.posted" },
  { value: 3, label: "fa.statuses.cancelled" },
  { value: 4, label: "fa.statuses.pending" },
];

const assetStatusOptions: readonly SelectFilterOption[] = [
  { value: 1, label: "fa.assetStatuses.notCommissioned" },
  { value: 2, label: "fa.assetStatuses.active" },
  { value: 3, label: "fa.assetStatuses.conservation" },
  { value: 4, label: "fa.assetStatuses.disposed" },
];

interface FaListFiltersProps {
  statusKind?: "document" | "asset" | "none";
  dateParamKeys?: [string, string] | null;
  children?: ReactNode;
}

export default function FaListFilters({
  statusKind = "document",
  dateParamKeys = ["dateFrom", "dateTo"],
  children,
}: FaListFiltersProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateFromKey, dateToKey] = dateParamKeys ?? ["", ""];
  const dateFrom = dateParamKeys ? searchParams.get(dateFromKey) : null;
  const dateTo = dateParamKeys ? searchParams.get(dateToKey) : null;
  const rangeValue: [Dayjs, Dayjs] | null =
    dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null;

  const handleDateChange = (value: [Dayjs | null, Dayjs | null] | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value?.[0] && value[1]) {
      nextParams.set(
        dateFromKey,
        value[0].startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      );
      nextParams.set(
        dateToKey,
        value[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      );
    } else {
      nextParams.delete(dateFromKey);
      nextParams.delete(dateToKey);
    }
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <>
      <SearchFilter />
      {statusKind !== "none" && (
        <SelectFilter
          paramKey="statusId"
          placeholder="settings.fields.status"
          options={
            statusKind === "asset" ? assetStatusOptions : documentStatusOptions
          }
          width={190}
        />
      )}
      {dateParamKeys && (
        <DatePicker.RangePicker
          value={rangeValue}
          format="DD.MM.YYYY"
          allowClear
          placeholder={[t("fa.filters.dateFrom"), t("fa.filters.dateTo")]}
          onChange={(value) =>
            handleDateChange(value as [Dayjs | null, Dayjs | null] | null)
          }
          className="h-8"
        />
      )}
      {children}
    </>
  );
}

export function FaGroupFilter() {
  return (
    <SelectFilter
      paramKey="faGroupId"
      placeholder="fa.fields.faGroup"
      path={selectListEndpoints.faGroupsSelectList}
      width={190}
      search
    />
  );
}
