import { Button, Form, Input, Space } from "antd";
import { useTranslation } from "react-i18next";

import {
  getSearchInnMaxLength,
  isValidSearchIdentifier,
  normalizeSearchIdentifier,
  type SearchInnMode,
} from "./searchInn";

export type { SearchInnMode } from "./searchInn";

interface SearchInnFieldProps {
  mode?: SearchInnMode;
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function SearchInnField({
  mode = "auto",
  value,
  onChange,
  onSearch,
  loading = false,
  disabled = false,
  label = "settings.fields.inn",
}: SearchInnFieldProps) {
  const { t } = useTranslation();
  const maxLength = getSearchInnMaxLength(mode);
  const valid = isValidSearchIdentifier(value, mode);
  const expectedLength =
    mode === "inn" ? "9" : mode === "pinfl" ? "14" : "9 yoki 14";

  const handleSearch = () => {
    if (valid && !loading && !disabled) {
      onSearch(normalizeSearchIdentifier(value, mode));
    }
  };

  return (
    <Form.Item
      className="flex! flex-col! mb-6!"
      label={t(label)}
      validateStatus={value.length > 0 && !valid ? "error" : ""}
      help={
        value.length > 0 && !valid
          ? t("settings.lookup.invalidIdentifier", {
              lengths: expectedLength,
            })
          : undefined
      }
    >
      <Space.Compact block>
        <Input
          value={value}
          maxLength={maxLength}
          inputMode="numeric"
          placeholder={t(label)}
          onChange={(event) =>
            onChange(normalizeSearchIdentifier(event.target.value, mode))
          }
          onPressEnter={handleSearch}
          disabled={disabled || loading}
          className="mono"
          style={{ height: "38px" }}
        />
        <Button
          type="primary"
          onClick={handleSearch}
          loading={loading}
          disabled={!valid || disabled || loading}
          style={{ height: "38px" }}
        >
          {t("common.search")}
        </Button>
      </Space.Compact>
    </Form.Item>
  );
}
