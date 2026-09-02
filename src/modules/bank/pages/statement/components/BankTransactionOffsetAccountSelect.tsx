import { Select } from "antd";
import { useEffect } from "react";
import type { BankChartAccountOption } from "../types/type";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
} from "@/shared/constants/selectLists";
import { useTranslation } from "react-i18next";

interface BankTransactionOffsetAccountSelectProps {
  options: BankChartAccountOption[];
  value?: number | null;
  loading: boolean;
  disabled?: boolean;
  onChange: (accountId: number | null) => void;
}

export default function BankTransactionOffsetAccountSelect({
  options,
  value,
  loading,
  disabled = false,
  onChange,
}: BankTransactionOffsetAccountSelectProps) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!disabled && !value && options.length === 1) {
      onChange(options[0].id);
    }
  }, [disabled, onChange, options, value]);

  return (
    <Select
      showSearch
      value={value || undefined}
      placeholder={t("bank.placeholders.selectAccount")}
      loading={loading}
      optionFilterProp="label"
      options={options.map((option) => ({
        value: option.id,
        label: chartAccountOptionLabel(option),
      }))}
      labelRender={(props) => {
        const option = options.find((item) => item.id === Number(props.value));
        return option ? chartAccountSelectedLabel(option) : props.label;
      }}
      allowClear
      onChange={(accountId) => onChange(accountId ? Number(accountId) : null)}
      onClear={() => onChange(null)}
      disabled={loading || disabled}
    />
  );
}
