import { Button, Collapse, DatePicker, Empty, Spin, Tag } from "antd";
import dayjs from "dayjs";
import { CircleAlert, CircleCheck, CircleX, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { numberSpacing } from "@/utils/utils";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import AccountingReportPageShell from "../accounting-report/components/AccountingReportPageShell";
import { useExpressCheck, type ExpressCheckStatus } from "./api";

const statusView: Record<ExpressCheckStatus, { color: string; icon: React.ReactNode }> = {
  OK: { color: "green", icon: <CircleCheck className="size-5 text-green-600" /> },
  WARNING: { color: "gold", icon: <CircleAlert className="size-5 text-amber-500" /> },
  ERROR: { color: "red", icon: <CircleX className="size-5 text-red-500" /> },
};

/** The ledger checks before the statements are drawn up (1C «Экспресс-проверка ведения учета»). */
export default function ExpressCheckPage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "express-check");
  const [state, setState] = usePersistedState<{ dateTo: string }>(key, { dateTo: dayjs().format("YYYY-MM-DD") }, { debounceMs: 0 });
  const query = useExpressCheck(state);
  const data = query.data;

  return (
    <AccountingReportPageShell>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <DatePicker
          value={dayjs(state.dateTo)}
          format="DD.MM.YYYY"
          allowClear={false}
          onChange={(value) => value && setState({ dateTo: value.format("YYYY-MM-DD") })}
        />
        {data && (
          <span className="text-sm text-secondary-text">
            {t("app.regulatedForms.checkSummary", { errors: data.errors, warnings: data.warnings, total: data.items.length })}
          </span>
        )}
        <Button className="ml-auto" icon={<RefreshCw className="size-4" />} onClick={() => void query.refetch()} loading={query.isFetching}>
          {t("app.regulatedForms.runCheck")}
        </Button>
      </div>

      <Spin spinning={query.isFetching}>
        {data ? (
          <Collapse
            items={data.items.map((item) => ({
              key: item.code,
              collapsible: item.details.length > 0 ? undefined : "disabled",
              label: (
                <div className="flex items-start gap-3">
                  {statusView[item.status].icon}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-text">{item.title}</div>
                    <div className="text-sm text-secondary-text">{item.message}</div>
                  </div>
                  <Tag color={statusView[item.status].color} className="m-0!">
                    {t(`app.regulatedForms.status.${item.status}`)}
                  </Tag>
                </div>
              ),
              children: (
                <ul className="space-y-1 text-sm">
                  {item.details.map((detail, index) => (
                    <li key={index} className="flex justify-between gap-4 border-b border-border py-1 last:border-0">
                      <span>{detail.text}</span>
                      <span className="whitespace-nowrap tabular-nums text-secondary-text">
                        {detail.count != null && `${detail.count} ${t("app.regulatedForms.entries")} · `}
                        {detail.amount != null && numberSpacing(detail.amount, undefined, true)}
                      </span>
                    </li>
                  ))}
                </ul>
              ),
            }))}
          />
        ) : (
          <Empty />
        )}
      </Spin>
    </AccountingReportPageShell>
  );
}
