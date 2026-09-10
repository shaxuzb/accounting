import SectionCard from "@/components/ui/card/SectionCard";
import { Empty, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { CalendarDays, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  PayrollTimesheetAttendanceStatus,
  PayrollTimesheetCalendar,
  PayrollTimesheetDailyAttendance,
  PayrollTimesheetDailyEmployee,
  PayrollTimesheetMonthlySummary,
} from "../types/type";

interface Props {
  calendar: PayrollTimesheetCalendar;
  actions?: ReactNode;
}

type SummaryKey =
  | "normWorkDays"
  | "normWorkHours"
  | "plannedWorkDays"
  | "plannedWorkHours"
  | "workedDays"
  | "workedHours"
  | "leaveDays"
  | "sickDays"
  | "absentDays"
  | "overtimeHours"
  | "nightHours"
  | "holidayHours"
  | "weekendHours";

interface CalendarRow {
  key: number;
  employeeId: number;
  employeeName?: string | null;
  employeeNumber?: string | null;
  summary?: PayrollTimesheetMonthlySummary;
  attendance: Map<string, PayrollTimesheetDailyEmployee>;
}

const STATUS_ORDER: PayrollTimesheetAttendanceStatus[] = [
  "WORKED",
  "PLANNED_WORK",
  "DAY_OFF",
  "NOT_EMPLOYED",
  "ANNUAL_LEAVE",
  "SICK_LEAVE",
  "UNPAID_LEAVE",
  "UNEXCUSED_ABSENCE",
  "MATERNITY_LEAVE",
  "STUDY_LEAVE",
  "OTHER_ABSENCE",
];

const STATUS_STYLES: Record<
  PayrollTimesheetAttendanceStatus,
  { cell: string; dot: string }
> = {
  WORKED: {
    cell: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  PLANNED_WORK: {
    cell: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  DAY_OFF: {
    cell: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
  NOT_EMPLOYED: {
    cell: "border-slate-200 bg-slate-50 text-slate-500",
    dot: "bg-slate-300",
  },
  ANNUAL_LEAVE: {
    cell: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  SICK_LEAVE: {
    cell: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  UNPAID_LEAVE: {
    cell: "border-orange-200 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  UNEXCUSED_ABSENCE: {
    cell: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  MATERNITY_LEAVE: {
    cell: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  STUDY_LEAVE: {
    cell: "border-indigo-200 bg-indigo-50 text-indigo-700",
    dot: "bg-indigo-500",
  },
  OTHER_ABSENCE: {
    cell: "border-gray-200 bg-gray-50 text-gray-700",
    dot: "bg-gray-500",
  },
};

const SUMMARY_COLUMNS: Array<{
  key: SummaryKey;
  title: string;
  width: number;
}> = [
  { key: "normWorkDays", title: "payroll.fields.normWorkDays", width: 84 },
  { key: "normWorkHours", title: "payroll.fields.normWorkHours", width: 88 },
  {
    key: "plannedWorkDays",
    title: "payroll.fields.plannedWorkDays",
    width: 90,
  },
  {
    key: "plannedWorkHours",
    title: "payroll.fields.plannedWorkHours",
    width: 94,
  },
  { key: "workedDays", title: "payroll.fields.workedDays", width: 78 },
  { key: "workedHours", title: "payroll.fields.workedHours", width: 84 },
  { key: "leaveDays", title: "payroll.fields.leaveDays", width: 74 },
  { key: "sickDays", title: "payroll.fields.sickDays", width: 78 },
  { key: "absentDays", title: "payroll.fields.absentDays", width: 84 },
  { key: "overtimeHours", title: "payroll.fields.overtimeHours", width: 86 },
  { key: "nightHours", title: "payroll.fields.nightHours", width: 78 },
  { key: "holidayHours", title: "payroll.fields.holidayHours", width: 82 },
  { key: "weekendHours", title: "payroll.fields.weekendHours", width: 82 },
];

const EMPTY_ATTENDANCE: PayrollTimesheetDailyAttendance[] = [];
const EMPTY_SUMMARIES: PayrollTimesheetMonthlySummary[] = [];

const formatHours = (value?: number | null) => {
  if (value == null) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const formatMetric = (value?: number | null) =>
  value == null ? "-" : formatHours(value);

const AttendanceCell = ({
  attendance,
  getStatusLabel,
  getStatusShortLabel,
}: {
  attendance?: PayrollTimesheetDailyEmployee;
  getStatusLabel: (
    code: PayrollTimesheetAttendanceStatus,
    fallback?: string | null,
  ) => string;
  getStatusShortLabel: (code: PayrollTimesheetAttendanceStatus) => string;
}) => {
  if (!attendance) {
    return <span className="text-secondary-text">-</span>;
  }

  const style =
    STATUS_STYLES[attendance.statusCode] ?? STATUS_STYLES.OTHER_ABSENCE;
  const statusLabel = getStatusLabel(
    attendance.statusCode,
    attendance.statusName,
  );
  const hours =
    attendance.statusCode === "WORKED"
      ? attendance.workedHours
      : attendance.plannedHours;

  return (
    // <Tooltip
    //   title={
    //     <div className="space-y-1">
    //       <div className="font-medium">{statusLabel}</div>
    //       {attendance.absenceTypeName && (
    //         <div>{attendance.absenceTypeName}</div>
    //       )}
    //       {attendance.plannedHours != null && (
    //         <div>
    //           {getStatusShortLabel("PLANNED_WORK")}:{" "}
    //           {formatHours(attendance.plannedHours)}
    //         </div>
    //       )}
    //       {attendance.workedHours != null && (
    //         <div>
    //           {getStatusShortLabel("WORKED")}:{" "}
    //           {formatHours(attendance.workedHours)}
    //         </div>
    //       )}
    //     </div>
    //   }
    // >
    //   </Tooltip>
    <div
      aria-label={statusLabel}
      className={`relative mx-auto flex min-h-7 w-12 flex-col items-center justify-center rounded-md border px-0.5 py-0.5 text-[10px] leading-tight ${style.cell}`}
    >
      {attendance.statusCode !== "WORKED" && (
        <span className="font-medium">
          {getStatusShortLabel(attendance.statusCode).slice(0, 1).toUpperCase()}
        </span>
      )}
      {hours != null && attendance.statusCode === "WORKED" && (
        <span className="mt-0.5 font-semibold">{formatHours(hours)} s</span>
      )}
      {attendance.isOverridden && (
        <span
          className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-violet-500"
          title="HR shablonidan o'zgartirilgan"
        />
      )}
    </div>
  );
};

export default function TimesheetCalendarView({ calendar, actions }: Props) {
  const { t } = useTranslation();
  const attendance = calendar.dailyAttendance ?? EMPTY_ATTENDANCE;
  const summaries = calendar.monthlySummary ?? EMPTY_SUMMARIES;

  const getStatusLabel = useCallback(
    (code: PayrollTimesheetAttendanceStatus, fallback?: string | null) =>
      t(`hr.calendar.status.${code}`, {
        defaultValue: fallback ?? code,
      }),
    [t],
  );

  const getStatusShortLabel = useCallback(
    (code: PayrollTimesheetAttendanceStatus) =>
      t(`hr.calendar.statusShort.${code}`, {
        defaultValue: getStatusLabel(code),
      }),
    [getStatusLabel, t],
  );

  const { rows, dates, statusCodes } = useMemo(() => {
    const summaryByEmployee = new Map(
      summaries.map((summary) => [summary.employeeId, summary]),
    );
    const employeeInfo = new Map<
      number,
      { employeeName?: string | null; employeeNumber?: string | null }
    >();
    const attendanceByEmployee = new Map<
      number,
      Map<string, PayrollTimesheetDailyEmployee>
    >();
    const statusSet = new Set<PayrollTimesheetAttendanceStatus>();

    summaries.forEach((summary) => {
      employeeInfo.set(summary.employeeId, {
        employeeName: summary.employeeName,
        employeeNumber: summary.employeeNumber,
      });
    });

    attendance.forEach((day) => {
      day.employees.forEach((employee) => {
        statusSet.add(employee.statusCode);
        if (!employeeInfo.has(employee.employeeId)) {
          employeeInfo.set(employee.employeeId, {
            employeeName: employee.employeeName,
            employeeNumber: employee.employeeNumber,
          });
        }
        const employeeAttendance =
          attendanceByEmployee.get(employee.employeeId) ??
          new Map<string, PayrollTimesheetDailyEmployee>();
        employeeAttendance.set(day.date, employee);
        attendanceByEmployee.set(employee.employeeId, employeeAttendance);
      });
    });

    const employeeIds = Array.from(employeeInfo.keys());

    return {
      rows: employeeIds.map((employeeId) => ({
        key: employeeId,
        employeeId,
        employeeName: employeeInfo.get(employeeId)?.employeeName,
        employeeNumber: employeeInfo.get(employeeId)?.employeeNumber,
        summary: summaryByEmployee.get(employeeId),
        attendance: attendanceByEmployee.get(employeeId) ?? new Map(),
      })),
      dates: attendance,
      statusCodes: Array.from(statusSet),
    };
  }, [attendance, summaries]);

  const totals = useMemo(
    () =>
      summaries.reduce<Record<SummaryKey, number>>(
        (result, summary) => {
          SUMMARY_COLUMNS.forEach(({ key }) => {
            result[key] += summary[key] ?? 0;
          });
          return result;
        },
        {
          normWorkDays: 0,
          normWorkHours: 0,
          plannedWorkDays: 0,
          plannedWorkHours: 0,
          workedDays: 0,
          workedHours: 0,
          leaveDays: 0,
          sickDays: 0,
          absentDays: 0,
          overtimeHours: 0,
          nightHours: 0,
          holidayHours: 0,
          weekendHours: 0,
        },
      ),
    [summaries],
  );

  const columns = useMemo<TableColumnsType<CalendarRow>>(
    () => [
      {
        dataIndex: "employeeName",
        title: t("payroll.fields.employee"),
        fixed: "left",
        width: 200,
        className: "text-xs!",
        render: (_, row) => (
          <div className="min-w-0 py-0.5">
            <div className="truncate font-medium text-text text-xs!">
              {row.employeeName ?? "-"}
            </div>
            {/* {row.employeeNumber && (
              <div className="text-xs text-secondary-text">
                {row.employeeNumber}
              </div>
            )} */}
          </div>
        ),
      },
      ...dates.map((day) => ({
        key: day.date,
        dataIndex: day.date,
        title: (
          // <Tooltip title={`${displayDate(day.date)} - ${day.dayName ?? ""}`}>
          // </Tooltip>
          <div className="text-center leading-tight">
            <div className="text-[11px]!">{dayjs(day.date).format("DD")}</div>
            <div className="text-[9px] font-normal text-secondary-text">
              {(day.dayName ?? "").slice(0, 3)}
            </div>
          </div>
        ),
        align: "center" as const,
        width: 54,
        className: "text-xs!",
        render: (_: unknown, row: CalendarRow) => (
          <AttendanceCell
            attendance={row.attendance.get(day.date)}
            getStatusLabel={getStatusLabel}
            getStatusShortLabel={getStatusShortLabel}
          />
        ),
      })),
      ...SUMMARY_COLUMNS.map(({ key, title, width }) => ({
        dataIndex: ["summary", key],
        title: <div className="text-[11px]! leading-tight">{t(title)}</div>,
        align: "center" as const,
        width,
        className: "text-xs!",
        render: (_: unknown, row: CalendarRow) =>
          formatMetric(row.summary?.[key]),
      })),
    ],
    [dates, getStatusLabel, getStatusShortLabel, t],
  );

  if (!attendance.length && !summaries.length) {
    return (
      <SectionCard
        title="payroll.timesheets.calendarTitle"
        description="payroll.timesheets.calendarHint"
        icon={<CalendarDays className="size-4" />}
      >
        <Empty description={t("payroll.timesheets.calendarEmpty")} />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="payroll.timesheets.calendarTitle"
      description="payroll.timesheets.calendarHint"
      icon={<CalendarDays className="size-4" />}
      extra={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
          <Tag className="bg-primary-bg text-primary-text flex! items-center gap-1.5">
            <Clock3 className="size-3.5" /> {calendar.periodName ?? "-"}
          </Tag>
        </div>
      }
      bodyClassName="min-w-0 overflow-hidden p-0!"
    >
      <div className="border-b border-border px-4 py-2">
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set([...STATUS_ORDER, ...statusCodes])).map((code) => (
            <Tag key={code} className="m-0! px-1.5! py-0! text-[10px]! leading-5!">
              <span
                className={`mr-1 inline-block size-1.5 rounded-full ${(STATUS_STYLES[code] ?? STATUS_STYLES.OTHER_ABSENCE).dot}`}
              />
              {getStatusLabel(code)}
            </Tag>
          ))}
        </div>
      </div>

      <Table<CalendarRow>
        rowKey="key"
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="small"
        className="text-xs!"
        scroll={{ x: "max-content", y: 520 }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row className="bg-primary-bg font-semibold text-xs!">
              <Table.Summary.Cell index={0}>
                {t("common.total")}: {rows.length}
              </Table.Summary.Cell>
              {dates.map((day, index) => (
                <Table.Summary.Cell
                  key={day.date}
                  index={index + 1}
                  align="center"
                >
                  -
                </Table.Summary.Cell>
              ))}
              {SUMMARY_COLUMNS.map(({ key }, index) => (
                <Table.Summary.Cell
                  key={key}
                  index={dates.length + index + 1}
                  align="center"
                >
                  {formatMetric(totals[key])}
                </Table.Summary.Cell>
              ))}
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </SectionCard>
  );
}
