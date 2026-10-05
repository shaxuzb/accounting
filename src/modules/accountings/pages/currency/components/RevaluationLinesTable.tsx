import { Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import type { RevaluationLine } from "../types";

const money = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A contract's analytics is stored as {"number","date"}; the rest is plain text. */
const subkontoText = (value?: string | null, entityId?: number) => {
  if (!value) return String(entityId ?? "");
  try {
    const parsed = JSON.parse(value) as { number?: string; date?: string };
    if (parsed && typeof parsed === "object" && parsed.number)
      return `№${parsed.number}${parsed.date ? ` (${parsed.date.slice(0, 10).split("-").reverse().join(".")})` : ""}`;
  } catch {
    // plain text
  }
  return value;
};

const rate = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 6 });

/**
 * The balances of a revaluation: the account and its analytics, the balance in currency, its
 * UZS amount in the ledger and at the new rate, and the difference with the entry it makes.
 */
export default function RevaluationLinesTable({
  lines,
  loading,
}: {
  lines: RevaluationLine[];
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const totalGain = lines.filter((x) => x.differenceAmount > 0).reduce((sum, x) => sum + x.differenceAmount, 0);
  const totalLoss = lines.filter((x) => x.differenceAmount < 0).reduce((sum, x) => sum - x.differenceAmount, 0);

  const columns: TableColumnsType<RevaluationLine> = [
    {
      key: "account",
      title: t("currency.revaluation.account"),
      width: 300,
      render: (_, line) => (
        <div>
          <b>{line.accountNumber ?? "—"}</b>{" "}
          <span className="text-secondary-text">{line.accountName}</span>
          {line.subkontos.length > 0 && (
            <div className="text-xs text-secondary-text">
              {line.subkontos.map((x) => subkontoText(x.displayValue, x.entityId)).join(" · ")}
            </div>
          )}
        </div>
      ),
    },
    {
      dataIndex: "balanceAmount",
      title: t("currency.revaluation.balance"),
      align: "right",
      render: (value: number, line) => `${money(value)} ${line.targetCurrencyCode}`,
    },
    {
      dataIndex: "carryingAmount",
      title: t("currency.revaluation.carrying"),
      align: "right",
      render: (value: number, line) => (
        <div>
          {money(value)}
          {line.openingRate !== 0 && (
            <div className="text-xs text-secondary-text">{rate(line.openingRate)}</div>
          )}
        </div>
      ),
    },
    {
      key: "revalued",
      title: t("currency.revaluation.revalued"),
      align: "right",
      render: (_, line) => (
        <div>
          {money(line.carryingAmount + line.differenceAmount)}
          <div className="text-xs text-secondary-text">{rate(line.currentRate)}</div>
        </div>
      ),
    },
    {
      dataIndex: "differenceAmount",
      title: t("currency.revaluation.difference"),
      align: "right",
      render: (value: number, line) => (
        <div>
          <span className={value > 0 ? "text-green-600" : "text-red-600"}>
            {value > 0 ? "+" : ""}
            {money(value)}
          </span>
          <div>
            <Tag color={value > 0 ? "green" : "red"} className="m-0 mt-1 text-xs">
              {value > 0
                ? `Dt ${line.accountNumber} — Kt 9540`
                : `Dt 9620 — Kt ${line.accountNumber}`}
            </Tag>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Table<RevaluationLine>
      rowKey={(line) =>
        `${line.accountId}-${line.targetCurrencyId}-${line.subkontos.map((x) => `${x.subkontoTypeId}:${x.entityId}`).join(",")}`
      }
      size="small"
      loading={loading}
      columns={columns}
      dataSource={lines}
      pagination={false}
      tableLayout="fixed"
      scroll={{ y: 420 }}
      locale={{ emptyText: t("currency.revaluation.noLines") }}
      summary={() =>
        lines.length > 0 ? (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right">
                <b>{t("currency.revaluation.totals")}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <div className="text-green-600">9540: +{money(totalGain)}</div>
                <div className="text-red-600">9620: −{money(totalLoss)}</div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        ) : null
      }
    />
  );
}
