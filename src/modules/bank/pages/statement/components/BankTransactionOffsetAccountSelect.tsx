import { Select } from "antd";
import { useEffect } from "react";
import type { BankChartAccountOption } from "../types/type";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
} from "@/shared/constants/selectLists";

interface BankTransactionOffsetAccountSelectProps {
  options: BankChartAccountOption[];
  value?: number | null;
  loading: boolean;
  onChange: (accountId: number | null) => void;
}

export default function BankTransactionOffsetAccountSelect({
  options,
  value,
  loading,
  onChange,
}: BankTransactionOffsetAccountSelectProps) {
  useEffect(() => {
    if (!value && options.length === 1) {
      onChange(options[0].id);
    }
  }, [onChange, options, value]);

  return (
    <Select
      showSearch
      value={value || undefined}
      placeholder="Schyotni tanlang"
      loading={loading}
      options={options.map((option) => ({
        value: option.id,
        label: chartAccountOptionLabel(option),
      }))}
      labelRender={(props) => {
        const option = options.find((item) => item.id === Number(props.value));
        return option ? chartAccountSelectedLabel(option) : props.label;
      }}
      allowClear
      onChange={(accountId) =>
        onChange(accountId ? Number(accountId) : null)
      }
      onClear={() => onChange(null)}
      disabled={loading}
    />
  );
}
