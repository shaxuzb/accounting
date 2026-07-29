import { Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { usePayrollPeriodLookup } from "../pages/periods/hooks";

interface Props {
  paramKey?: string;
  width?: number;
}

/** Ro'yxat sahifalari uchun hisoblash davri filtri. */
export default function PayrollPeriodFilter({
  paramKey = "periodId",
  width = 190,
}: Props) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isFetching } = usePayrollPeriodLookup();

  const options = useMemo(
    () =>
      (data ?? []).map((period) => ({
        value: String(period.id),
        label: `${t(`payroll.months.${period.month}`, {
          defaultValue: period.monthName ?? String(period.month),
        })} ${period.year}`,
      })),
    [data, t],
  );

  const handleChange = (value?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(paramKey, value);
    else nextParams.delete(paramKey);
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <Select
      value={searchParams.get(paramKey) ?? undefined}
      onChange={handleChange}
      onClear={() => handleChange(undefined)}
      allowClear
      showSearch
      optionFilterProp="label"
      loading={isFetching}
      placeholder={t("payroll.fields.period")}
      options={options}
      style={{ width, height: 32 }}
      className="[&_.ant-select-selector]:h-8!"
    />
  );
}
