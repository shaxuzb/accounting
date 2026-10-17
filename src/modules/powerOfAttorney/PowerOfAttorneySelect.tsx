import { Form, Select } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { useUsablePowersOfAttorney } from "./api";

/**
 * The power of attorney a purchase was received by (NSBU 4 p. 100): the supplier's powers that
 * hold on the purchase date (issued or already partly used). Optional — the head of the
 * organization receives goods without one.
 */
export default function PowerOfAttorneySelect({
  counterpartyId,
  date,
  value,
  onChange,
  disabled,
}: {
  counterpartyId: number | null | undefined;
  date: string | null | undefined;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const day = date ? dayjs(date).format("YYYY-MM-DD") : null;
  const { data = [], isFetching } = useUsablePowersOfAttorney(counterpartyId, day);
  return (
    <Form.Item label={t("powerOfAttorney.purchaseField")} className="mb-4">
      <Select
        allowClear
        className="w-full"
        loading={isFetching}
        disabled={disabled || !counterpartyId}
        value={value ?? null}
        placeholder={t("powerOfAttorney.purchaseFieldPlaceholder")}
        // as the other selects of the form (SelectCustom): no filled background
        style={{ backgroundColor: "transparent" }}
        onChange={(next?: number) => onChange(next ?? null)}
        options={data.map((item) => ({
          value: item.id,
          label: t("powerOfAttorney.option", {
            number: item.docNumber,
            date: dayjs(item.docDate).format("DD.MM.YYYY"),
            agent: item.agentName,
          }),
        }))}
      />
    </Form.Item>
  );
}
