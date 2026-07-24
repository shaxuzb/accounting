import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "antd";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import Card from "@/components/ui/card/Card";
import { numberSpacing } from "@/utils/utils";

interface OpeningBalanceAccountOverviewProps {
  accountSelector: ReactNode;
  balance: number;
  balanceSide: "debit" | "credit" | null;
  credit: number;
  debit: number;
  isLoading?: boolean;
}

interface OverviewStatProps {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: number;
  badge?: ReactNode;
}

function OverviewStat({
  icon,
  iconClassName,
  label,
  value,
  badge,
}: OverviewStatProps) {
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-xl border border-border bg-primary-bg px-4 py-3">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-text">
          <span>{label}</span>
          {badge}
        </div>
        <div className="mt-1 truncate text-xl font-semibold tabular-nums text-heading">
          {numberSpacing(value, undefined, true)}
        </div>
      </div>
    </div>
  );
}

export default function OpeningBalanceAccountOverview({
  accountSelector,
  balance,
  balanceSide,
  credit,
  debit,
  isLoading,
}: OpeningBalanceAccountOverviewProps) {
  const { t } = useTranslation();

  return (
    <Card className="border border-border p-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(360px,1.45fr)_repeat(3,minmax(175px,0.55fr))]">
        <div className="min-w-0 rounded-xl border border-border bg-primary-bg p-4">
          {accountSelector}
        </div>
        <OverviewStat
          icon={<ArrowDownLeft className="size-5" />}
          iconClassName="bg-blue-500/10 text-blue-600"
          label={t("openingBalance.fields.totalDebit")}
          value={debit}
        />
        <OverviewStat
          icon={<ArrowUpRight className="size-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
          label={t("openingBalance.fields.totalCredit")}
          value={credit}
        />
        <OverviewStat
          icon={<Scale className="size-5" />}
          iconClassName="bg-violet-500/10 text-violet-600"
          label={t("openingBalance.fields.balance")}
          value={balance}
          badge={
            balanceSide ? (
              <Tag
                bordered={false}
                color={balanceSide === "debit" ? "blue" : "green"}
                className="m-0!"
              >
                {t(
                  balanceSide === "debit"
                    ? "openingBalance.fields.debit"
                    : "openingBalance.fields.credit",
                )}
              </Tag>
            ) : null
          }
        />
      </div>
      {isLoading && (
        <div className="mt-2 text-xs text-secondary-text">
          {t("openingBalance.messages.loadingAccountMeta")}
        </div>
      )}
    </Card>
  );
}
