import { Alert, Form, Select, Table } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { usePayrollTaxRegimes } from "../hooks/usePayrollTaxRegimes";
import type { PayrollTaxRegimeRate } from "../types/type";
import { ratesOn } from "../utils/taxRegimes";

const formatDay = (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : null);

export function PayrollTaxRegimeRates({ rates }: { rates: PayrollTaxRegimeRate[] }) {
  const { t } = useTranslation();
  const columns: TableColumnsType<PayrollTaxRegimeRate> = [
    { title: t("taxRegime.kind"), dataIndex: "taxKind", render: (kind: string) => t(`taxRegime.kinds.${kind}`) },
    { title: t("taxRegime.rate"), dataIndex: "rate", align: "right", render: (rate: number) => `${rate} %` },
    {
      title: t("taxRegime.nonResidentRate"),
      dataIndex: "nonResidentRate",
      align: "right",
      render: (rate?: number | null) => (rate == null ? "—" : `${rate} %`),
    },
    {
      title: t("taxRegime.period"),
      key: "period",
      render: (_, rate) => `${formatDay(rate.effectiveFrom)} — ${formatDay(rate.effectiveTo) ?? t("accountingPolicy.view.openEnded")}`,
    },
    { title: t("taxRegime.legalBasis"), dataIndex: "legalBasis", render: (value?: string | null) => value ?? "—" },
  ];
  return (
    <Table<PayrollTaxRegimeRate>
      size="small"
      rowKey={(rate) => `${rate.taxKind}-${rate.effectiveFrom}`}
      columns={columns}
      dataSource={rates}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

/**
 * The payroll tax regime the organization is entitled to (1C: the social tax rate chosen in
 * «Учетная политика»). The platform keeps the regimes and their rates by decree; the
 * organization only picks one, and payroll charges its rates from the version's date.
 */
export default function PayrollTaxRegimeField({
  value,
  onChange,
  date,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  date: string;
}) {
  const { t } = useTranslation();
  const { data: regimes = [], isLoading } = usePayrollTaxRegimes();
  const selected = regimes.find((regime) => regime.id === value);

  return (
    <div className="space-y-2">
      <Form.Item label={t("taxRegime.field")} className="mb-1">
        <Select
          allowClear
          loading={isLoading}
          value={value ?? undefined}
          placeholder={t("taxRegime.none")}
          onChange={(next?: number) => onChange(next ?? null)}
          options={regimes.map((regime) => ({ value: regime.id, label: regime.name }))}
          notFoundContent={t("taxRegime.noneOffered")}
        />
      </Form.Item>
      <div className="text-xs text-secondary-text">{t("taxRegime.hint")}</div>
      {selected && (
        <>
          {selected.description && <div className="text-sm">{selected.description}</div>}
          {ratesOn(selected.rates, date).length > 0 ? (
            <PayrollTaxRegimeRates rates={ratesOn(selected.rates, date)} />
          ) : (
            <Alert type="warning" showIcon message={t("taxRegime.noRatesOnDate", { date: formatDay(date) })} />
          )}
        </>
      )}
    </div>
  );
}
