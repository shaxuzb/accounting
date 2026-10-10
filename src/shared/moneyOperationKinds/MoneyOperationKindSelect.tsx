import { Form, Select } from "antd";
import { useTranslation } from "react-i18next";
import { useMoneyOperationKinds, type MoneyChannel, type MoneyOperationKind } from "./index";

interface KindSelectProps {
  channel: MoneyChannel;
  direction: number | null;
  value: number | null | undefined;
  disabled?: boolean;
  /** Called with the kind picked; the form fills in its default account and drops what it does not ask. */
  onChange: (kind: MoneyOperationKind | undefined) => void;
}

/**
 * The operation kind of a cash order or a bank operation: picking it fills the offset account in
 * (4010 for a customer's payment, 6810 for a loan ...) and says which fields the operation asks.
 */
export function MoneyOperationKindSelect({ channel, direction, value, disabled, onChange }: KindSelectProps) {
  const { t } = useTranslation();
  const { data: kinds = [], isLoading } = useMoneyOperationKinds(channel, direction);
  return (
    <Form.Item label={t("moneyOperationKinds.field")} tooltip={t("moneyOperationKinds.hint")} required>
      <Select
        showSearch
        optionFilterProp="label"
        loading={isLoading}
        disabled={disabled}
        value={value ?? undefined}
        placeholder={t("moneyOperationKinds.placeholder")}
        onChange={(id: number) => onChange(kinds.find((kind) => kind.id === id))}
        options={kinds.map((kind) => ({ value: kind.id, label: kind.name }))}
      />
    </Form.Item>
  );
}
