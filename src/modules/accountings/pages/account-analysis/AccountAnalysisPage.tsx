import { DatePicker, Empty } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import AccountDrill from "./AccountDrill";
import type { DrillSide } from "./api";

/**
 * An account's analysis on a page of its own (opened from the trial balance's panel, or by a
 * link): the account and the period are in the URL.
 */
export default function AccountAnalysisPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const accountId = Number(params.get("accountId")) || null;
  const dateFrom = params.get("dateFrom");
  const dateTo = params.get("dateTo");
  const side = (params.get("side") as DrillSide | null) ?? null;

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("side");
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-end gap-3 border border-border p-4">
        <div className="w-80">
          <div className="mb-1 text-sm text-secondary-text">{t("app.accountDrill.account")}</div>
          <SelectCustom
            placeholder="app.reports.fields.account"
            value={accountId ?? undefined}
            path={selectListEndpoints.chartAccountsSelectList}
            search
            marginBottom="0"
            optionLabel={chartAccountOptionLabel}
            selectedLabel={chartAccountSelectedLabel}
            onChange={(value) => update({ accountId: typeof value === "number" ? String(value) : null })}
          />
        </div>
        <div>
          <div className="mb-1 text-sm text-secondary-text">{t("app.accountDrill.period")}</div>
          <DatePicker.RangePicker
            format="DD.MM.YYYY"
            allowEmpty={[true, true]}
            value={[dateFrom ? dayjs(dateFrom) : null, dateTo ? dayjs(dateTo) : null]}
            onChange={(range) =>
              update({
                dateFrom: range?.[0] ? range[0].format("YYYY-MM-DD") : null,
                dateTo: range?.[1] ? range[1].format("YYYY-MM-DD") : null,
              })
            }
          />
        </div>
      </Card>
      <Card className="border border-border p-4">
        {accountId ? (
          <AccountDrill
            key={`${accountId}-${dateFrom}-${dateTo}-${side}`}
            accountId={accountId}
            dateFrom={dateFrom}
            dateTo={dateTo}
            initialSide={side}
            onOpenAccount={(id) => update({ accountId: String(id) })}
          />
        ) : (
          <Empty description={t("app.analyticReports.pickAccount")} />
        )}
      </Card>
    </div>
  );
}
