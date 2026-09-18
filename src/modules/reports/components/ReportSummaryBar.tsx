import { useTranslation } from "react-i18next";
import { numberSpacing } from "@/utils/utils";

export interface ReportSummaryItem {
  labelKey: string;
  value: number;
  /** Salbiy qiymat qizil, musbat yashil ko'rinsin (saldo uchun). */
  signed?: boolean;
  suffix?: string;
}

interface ReportSummaryBarProps {
  items: ReportSummaryItem[];
  /**
   * Yig'indi faqat ochib berilgan satrlar bo'yicha hisoblanganini aytadi:
   * backend sahifalab beradi, shuning uchun jami butun filtr bo'yicha emas.
   */
  scopeNote?: string;
}

export default function ReportSummaryBar({
  items,
  scopeNote,
}: ReportSummaryBarProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {items.map((item) => (
          <div key={item.labelKey} className="flex flex-col">
            <span className="text-xs text-secondary-text">
              {t(item.labelKey)}
            </span>
            <span
              className={`text-base font-semibold tabular-nums ${
                item.signed
                  ? item.value < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                  : ""
              }`}
            >
              {numberSpacing(item.value, undefined, true)}
              {item.suffix ? ` ${item.suffix}` : ""}
            </span>
          </div>
        ))}
      </div>
      {scopeNote && (
        <p className="mt-2 text-xs text-secondary-text">{scopeNote}</p>
      )}
    </div>
  );
}
