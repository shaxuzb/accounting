import { useMemo } from "react";
import type { Dayjs } from "dayjs";
// Lokal va isoWeek plagini shu yerda ulanadi, shuning uchun dayjs loyihaning
// o'z konfiguratsiyasidan olinadi.
import "@/config/dayjs";
import type { PayrollPeriodCalendarDayForm } from "../types/form";

interface Props {
  /** Ko'rsatilayotgan oy (uning birinchi kuni). */
  monthValue: Dayjs;
  days: PayrollPeriodCalendarDayForm[];
  selectedDate: string | null;
  readOnly?: boolean;
  onSelect: (date: string) => void;
}

interface Cell {
  date: Dayjs;
  key: string;
  inMonth: boolean;
  day?: PayrollPeriodCalendarDayForm;
}

const WEEKS = 6;
const DAYS_IN_WEEK = 7;

/**
 * Oy panjarasi har doim 6 qator: shunda oy almashganda modal balandligi
 * sakramaydi.
 */
const buildCells = (
  monthValue: Dayjs,
  days: PayrollPeriodCalendarDayForm[],
): Cell[] => {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const monthStart = monthValue.startOf("month");
  // isoWeekday: dushanba = 1, shuning uchun hafta boshiga qaytish shu qadar kun.
  const gridStart = monthStart.subtract(monthStart.isoWeekday() - 1, "day");

  return Array.from({ length: WEEKS * DAYS_IN_WEEK }, (_, index) => {
    const date = gridStart.add(index, "day");
    const key = date.format("YYYY-MM-DD");
    return {
      date,
      key,
      inMonth: date.isSame(monthStart, "month"),
      day: byDate.get(key),
    };
  });
};

/** Kun turiga qarab chipning ko'rinishi. */
const dayChipClass = (day?: PayrollPeriodCalendarDayForm) => {
  if (!day) return "bg-red-50 text-red-500";
  switch (day.dayType) {
    case "HOLIDAY":
      return "bg-red-50 text-red-500";
    case "SHORTENED":
      return "bg-amber-50 text-amber-600";
    case "TRANSFERRED":
      return "bg-violet-50 text-violet-600";
    default:
      return day.isWorkDay
        ? "bg-primary text-white"
        : "bg-red-50 text-red-500";
  }
};

export default function PayrollPeriodCalendarGrid({
  monthValue,
  days,
  selectedDate,
  readOnly = false,
  onSelect,
}: Props) {
  const cells = useMemo(() => buildCells(monthValue, days), [monthValue, days]);

  // Hafta nomlari panjaraning birinchi qatoridan olinadi: u dushanbadan
  // boshlanadi va dayjs lokalidan kelgani uchun til almashganda o'zi
  // moslashadi.
  const weekdayLabels = useMemo(
    () => cells.slice(0, DAYS_IN_WEEK).map((cell) => cell.date.format("dd")),
    [cells],
  );

  return (
    <div className="mb-4 border-t border-border pt-4">
      {/*
        Ustunlar orasida gap yo'q: oydan tashqaridagi kunlar uzluksiz kulrang
        tasma bo'lib ko'rinishi kerak. Kunlar orasidagi bo'shliq chipning o'z
        yon paddingidan hosil bo'ladi.
      */}
      <div className="grid grid-cols-7 gap-y-1">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-sm font-medium text-secondary-text capitalize"
          >
            {label}
          </div>
        ))}

        {cells.map((cell, index) => {
          const positionInWeek = index % DAYS_IN_WEEK;
          const previous = cells[index - 1];
          const next = cells[index + 1];
          // Oydan tashqaridagi kunlar yaxlit kulrang tasma bo'lib ko'rinadi,
          // shuning uchun burchaklar faqat tasmaning chetida yumaloqlanadi.
          const bandStart =
            !cell.inMonth && (positionInWeek === 0 || previous?.inMonth !== false);
          const bandEnd =
            !cell.inMonth &&
            (positionInWeek === DAYS_IN_WEEK - 1 || next?.inMonth !== false);

          if (!cell.inMonth) {
            return (
              <div
                key={cell.key}
                className={[
                  "flex h-9 items-center justify-center bg-surface-muted text-sm text-muted",
                  bandStart ? "rounded-l-lg" : "",
                  bandEnd ? "rounded-r-lg" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {String(cell.date.date()).padStart(2, "0")}
              </div>
            );
          }

          const isSelected = selectedDate === cell.key;
          return (
            <div key={cell.key} className="px-1">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onSelect(cell.key)}
                title={cell.date.format("DD.MM.YYYY")}
                className={[
                  "flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition",
                  dayChipClass(cell.day),
                  isSelected ? "ring-2 ring-primary ring-offset-1" : "",
                  readOnly ? "cursor-default" : "cursor-pointer hover:opacity-80",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {String(cell.date.date()).padStart(2, "0")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
