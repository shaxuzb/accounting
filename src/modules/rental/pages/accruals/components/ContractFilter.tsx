import { Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { useRentalContracts } from "../../contracts/hooks";

export default function ContractFilter() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isFetching } = useRentalContracts({ page: 1, pageSize: 100 });
  const options = useMemo(
    () =>
      (data?.items ?? []).map((item) => ({
        value: String(item.id),
        label: `${item.contractNumber} — ${item.lessorFullName}`,
      })),
    [data?.items],
  );
  return (
    <Select
      allowClear
      showSearch
      optionFilterProp="label"
      loading={isFetching}
      value={searchParams.get("contractId") ?? undefined}
      placeholder={t("rental.fields.contractNumber")}
      options={options}
      onChange={(value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set("contractId", String(value));
        else next.delete("contractId");
        next.delete("page");
        setSearchParams(next, { replace: true });
      }}
      className="min-w-52 [&_.ant-select-selector]:h-8!"
    />
  );
}
