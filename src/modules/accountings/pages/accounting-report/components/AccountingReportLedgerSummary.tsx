import type { ReactNode } from "react";
import Card from "@/components/ui/card/Card";
import { numberSpacing } from "@/utils/utils";

export type LedgerSummaryTone = "opening" | "period" | "closing";

export interface LedgerSummaryStage {
  key: string;
  title: string;
  icon: ReactNode;
  debit: number;
  credit: number;
  tone: LedgerSummaryTone;
}

interface Props {
  stages: LedgerSummaryStage[];
  debitLabel: string;
  creditLabel: string;
}

const toneClasses: Record<
  LedgerSummaryTone,
  { header: string; icon: string; debit: string }
> = {
  opening: {
    header: "bg-brand-soft",
    icon: "bg-primary-bg text-brand-text",
    debit: "text-brand-text",
  },
  period: {
    header: "bg-warning-soft",
    icon: "bg-primary-bg text-warning",
    debit: "text-brand-text",
  },
  closing: {
    header: "bg-success-soft",
    icon: "bg-primary-bg text-success",
    debit: "text-success",
  },
};

export default function AccountingReportLedgerSummary({
  stages,
  debitLabel,
  creditLabel,
}: Props) {
  return (
    <Card className="grid overflow-hidden border border-border shadow-sm lg:grid-cols-3">
      {stages.map((stage) => {
        const tone = toneClasses[stage.tone];

        return (
          <section
            key={stage.key}
            className="min-w-0 border-b border-border last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
          >
            <div
              className={`flex items-center justify-center gap-2 border-b border-border px-4 py-3 ${tone.header}`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full border border-border/60 ${tone.icon}`}
              >
                {stage.icon}
              </span>
              <h2 className="text-sm font-semibold text-heading">
                {stage.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="min-w-0 px-4 py-4 text-center">
                <div className="text-xs font-medium text-brand-text">
                  {debitLabel}
                </div>
                <div
                  className={`mt-1 truncate text-lg font-semibold tabular-nums ${tone.debit}`}
                  title={String(stage.debit)}
                >
                  {numberSpacing(stage.debit, undefined, true)}
                </div>
              </div>
              <div className="min-w-0 px-4 py-4 text-center">
                <div className="text-xs font-medium text-warning">
                  {creditLabel}
                </div>
                <div
                  className="mt-1 truncate text-lg font-semibold text-warning tabular-nums"
                  title={String(stage.credit)}
                >
                  {numberSpacing(stage.credit, undefined, true)}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </Card>
  );
}
