import { Button, Dropdown, InputNumber, Popover } from "antd";
import { ChevronDown } from "lucide-react";
import type { PayrollTimesheetDayForm } from "../types/form";
import type { PayrollAttendanceStatusOption } from "../types/type";

interface Props {
  day: PayrollTimesheetDayForm;
  options: PayrollAttendanceStatusOption[];
  dailyWorkHours: number;
  disabled?: boolean;
  onChange: (option: PayrollAttendanceStatusOption) => void;
  onWorkedHoursChange?: (hours: number) => void;
  onSpecialHoursChange?: (field: "overtimeHours" | "nightHours" | "holidayHours" | "weekendHours", hours: number) => void;
}

const color = (day: PayrollTimesheetDayForm) => {
  if (day.statusCode === "WORKED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (day.timesheetCategory === "SICK") return "border-rose-200 bg-rose-50 text-rose-700";
  if (day.timesheetCategory === "LEAVE") return "border-amber-200 bg-amber-50 text-amber-700";
  if (day.timesheetCategory === "ABSENT") return "border-red-200 bg-red-50 text-red-700";
  if (day.statusCode === "PLANNED_WORK") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
};

export default function TimesheetStatusPicker({ day, options, dailyWorkHours, disabled, onChange, onWorkedHoursChange, onSpecialHoursChange }: Props) {
  const label = day.statusName ?? day.statusCode;
  const menu = {
    items: options.map((option) => ({ key: `${option.code}:${option.absenceTypeId ?? ""}`, label: option.name, onClick: () => onChange(option) })),
  };
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Dropdown menu={menu} trigger={["click"]} disabled={disabled}>
        <Button type="text" size="small" disabled={disabled} className={`relative mx-auto! flex! min-h-7! w-12! flex-col! items-center! justify-center! rounded-md! border! px-0.5! py-0.5! text-[10px]! leading-tight! ${color(day)}`} title={day.isOverridden ? `${label} • HR shablonidan o'zgartirilgan` : label}>
          <span className="max-w-11 truncate font-medium">{day.statusCode === "WORKED" ? "Ishlagan" : label.slice(0, 4)}</span>
          {day.isOverridden && <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-violet-500" />}
          {!disabled && <ChevronDown className="size-2.5 opacity-50" />}
        </Button>
      </Dropdown>
      {day.statusCode === "WORKED" && onWorkedHoursChange && (
        <InputNumber
          size="small"
          min={1}
          max={dailyWorkHours}
          step={0.25}
          precision={2}
          value={day.workedHours ?? dailyWorkHours}
          aria-label="Ishlangan soat"
          title={`Ishlangan soat (1-${dailyWorkHours})`}
          disabled={disabled}
          controls={false}
          onChange={(value) => value != null && onWorkedHoursChange(value)}
          suffix="s"
          style={{ width: 78, height: 24, fontSize: 11 }}
        />
      )}
      {day.statusCode === "WORKED" && onSpecialHoursChange && (
        <Popover
          trigger="click"
          placement="bottom"
          content={<div className="grid grid-cols-2 gap-1.5">
            {(["overtimeHours", "nightHours", "holidayHours", "weekendHours"] as const).map((field) => (
              <label key={field} className="flex items-center gap-1 text-[10px] text-secondary-text">
                <span className="w-8">{field === "overtimeHours" ? "OT" : field === "nightHours" ? "Tun" : field === "holidayHours" ? "Bayram" : "Dam"}</span>
                <InputNumber size="small" min={0} max={day.workedHours ?? dailyWorkHours} step={0.25} precision={2} controls={false} value={day[field] ?? 0} disabled={disabled} onChange={(value) => value != null && onSpecialHoursChange(field, value)} style={{ width: 62 }} />
              </label>
            ))}
          </div>}
        >
          <Button type="link" size="small" disabled={disabled} className="h-4! p-0! text-[9px]!">Maxsus soat</Button>
        </Popover>
      )}
    </div>
  );
}
