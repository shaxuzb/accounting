import { Alert, Form, Select } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useCorporateTaxRegimes } from "../hooks/usePayrollTaxRegimes";
import { ratesOn } from "../utils/taxRegimes";

const formatDay = (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : null);

/**
 * The organization's tax system (1C «Учетная политика» → «Система налогообложения»): the
 * general regime pays profit tax, the simplified one the turnover tax on total income. The
 * platform keeps the regimes and their rates; the month close charges the tax at the rate.
 */
export default function CorporateTaxRegimeField({
  value,
  onChange,
  date,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  date: string;
}) {
  const { t } = useTranslation();
  const { data: regimes = [], isLoading } = useCorporateTaxRegimes();
  const selected = regimes.find((regime) => regime.id === value);
  const rates = selected ? ratesOn(selected.rates, date) : [];

  return (
    <div className="space-y-2">
      <Form.Item label={t("taxRegime.corporateField")} className="mb-1">
        <Select
          allowClear
          loading={isLoading}
          value={value ?? undefined}
          placeholder={t("taxRegime.corporateNone")}
          onChange={(next?: number) => onChange(next ?? null)}
          options={regimes.map((regime) => ({ value: regime.id, label: regime.name }))}
          notFoundContent={t("taxRegime.noneOffered")}
        />
      </Form.Item>
      <div className="text-xs text-secondary-text">{t("taxRegime.corporateHint")}</div>
      {selected &&
        (rates.length > 0 ? (
          <div className="text-sm">
            {rates.map((rate) => (
              <div key={`${rate.taxKind}-${rate.effectiveFrom}`}>
                {t(`taxRegime.kinds.${rate.taxKind}`)}: <b>{rate.rate} %</b>
              </div>
            ))}
          </div>
        ) : (
          <Alert type="warning" showIcon message={t("taxRegime.corporateNoRate", { date: formatDay(date) })} />
        ))}
    </div>
  );
}
