import InputNumber from "@/components/fields/InputNumber";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { usePayrollEmployeeLookup } from "@/modules/payroll/hooks";
import { payrollTimesheetService } from "@/modules/payroll/pages/timesheets/services/payrollTimesheetService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Button, Empty, Input, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import { Trash2, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type {
  PayrollTimesheetForm,
  PayrollTimesheetLineForm,
} from "../types/form";
import type {
  PayrollTimesheetAttendanceStatus,
  PayrollTimesheetCalendar,
  PayrollTimesheetCalendarDay,
} from "../types/type";
import {
  createTimesheetLine,
  mapCalendarToTimesheetLine,
  summarizeTimesheet,
} from "../utils/timesheet";

interface Props {
  formik: FormikProps<PayrollTimesheetForm>;
  disabled?: boolean;
  /** Davrdagi me'yoriy kun va soat — avtomatik to'ldirish uchun. */
  normWorkDays?: number | null;
  normWorkHours?: number | null;
  periodId?: number | null;
}

type LineRow = PayrollTimesheetLineForm & { key: number; rowIndex: number };

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

const STATUS_STYLES: Record<PayrollTimesheetAttendanceStatus, { dot: string }> =
  {
    WORKED: { dot: "bg-emerald-500" },
    PLANNED_WORK: { dot: "bg-blue-500" },
    DAY_OFF: { dot: "bg-slate-400" },
    NOT_EMPLOYED: { dot: "bg-slate-300" },
    ANNUAL_LEAVE: { dot: "bg-amber-500" },
    SICK_LEAVE: { dot: "bg-rose-500" },
    UNPAID_LEAVE: { dot: "bg-orange-500" },
    UNEXCUSED_ABSENCE: { dot: "bg-red-500" },
    MATERNITY_LEAVE: { dot: "bg-violet-500" },
    STUDY_LEAVE: { dot: "bg-indigo-500" },
    OTHER_ABSENCE: { dot: "bg-gray-500" },
  };

const getStatusColorClass = (statusCode: PayrollTimesheetAttendanceStatus) =>
  statusCode === "WORKED"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : statusCode.includes("LEAVE")
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : statusCode === "SICK_LEAVE"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : statusCode === "UNEXCUSED_ABSENCE"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

export default function TimesheetLinesEditor({
  formik,
  disabled = false,
  normWorkDays,
  normWorkHours,
  periodId,
}: Props) {
  const { t } = useTranslation();
  const { data: employees } = usePayrollEmployeeLookup();
  const [syncingEmployeeIds, setSyncingEmployeeIds] = useState<number[]>([]);
  const [employeeCalendars, setEmployeeCalendars] = useState<
    Record<number, PayrollTimesheetCalendar>
  >({});

  const lines = formik.values.lines;
  const totals = useMemo(() => summarizeTimesheet(lines), [lines]);
  const selectedIds = useMemo(
    () => lines.map((line) => line.employeeId),
    [lines],
  );
  const noAvailableEmployees = useMemo(
    () =>
      employees != null &&
      !employees.some((employee) => !selectedIds.includes(employee.id)),
    [employees, selectedIds],
  );
  const calendarDays = useMemo(() => {
    const daysByDate = new Map<string, PayrollTimesheetCalendarDay>();
    Object.values(employeeCalendars).forEach((calendar) =>
      (calendar.days ?? []).forEach((day) => daysByDate.set(day.date, day)),
    );
    return Array.from(daysByDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [employeeCalendars]);
  const dailyByEmployee = useMemo(() => {
    const result = new Map<number, Map<string, PayrollTimesheetCalendarDay>>();
    Object.entries(employeeCalendars).forEach(([employeeId, calendar]) => {
      result.set(
        Number(employeeId),
        new Map((calendar.days ?? []).map((day) => [day.date, day])),
      );
    });
    return result;
  }, [employeeCalendars]);
  const statusCodes = useMemo(() => {
    const available = new Set<PayrollTimesheetAttendanceStatus>();
    Object.values(employeeCalendars).forEach((calendar) =>
      (calendar.days ?? []).forEach((day) => available.add(day.statusCode)),
    );
    return STATUS_ORDER.filter((statusCode) => available.has(statusCode));
  }, [employeeCalendars]);
  const getStatusLabel = (code: PayrollTimesheetAttendanceStatus) =>
    t(`hr.calendar.status.${code}`, { defaultValue: code });

  const setLines = (next: PayrollTimesheetLineForm[]) =>
    formik.setFieldValue("lines", next, true);

  const patchLine = (index: number, patch: Partial<PayrollTimesheetLineForm>) =>
    setLines(
      lines.map((line, current) =>
        current === index ? { ...line, ...patch } : line,
      ),
    );

  const addLine = () =>
    setLines([
      ...lines,
      createTimesheetLine({
        workedDays: normWorkDays ?? 0,
        workedHours: normWorkHours ?? 0,
      }),
    ]);

  const removeLine = (index: number) => {
    const employeeId = lines[index]?.employeeId;
    if (employeeId != null) {
      setEmployeeCalendars((current) => {
        const next = { ...current };
        delete next[employeeId];
        return next;
      });
    }
    setLines(lines.filter((_, current) => current !== index));
  };

  const syncLineCalendar = async (
    index: number,
    employeeId: number,
    employeePatch: Partial<PayrollTimesheetLineForm> = {},
  ) => {
    if (!periodId) {
      patchLine(index, employeePatch);
      toast.error(t("hr.messages.selectPeriodFirst"));
      return;
    }
    setSyncingEmployeeIds((current) => [...current, employeeId]);
    try {
      const calendar = await payrollTimesheetService.calendar(
        periodId,
        employeeId,
      );
      const calendarPatch = mapCalendarToTimesheetLine(calendar);
      patchLine(index, { ...employeePatch, ...calendarPatch });
      setEmployeeCalendars((current) => ({
        ...current,
        [employeeId]: calendar,
      }));
    } catch (error) {
      patchLine(index, employeePatch);
      errorHandlers(error);
    } finally {
      setSyncingEmployeeIds((current) =>
        current.filter((id) => id !== employeeId),
      );
    }
  };

  const renderCalendarDay = (day?: PayrollTimesheetCalendarDay) => {
    if (!day) return <span className="text-secondary-text">-</span>;

    const statusLabel = t(`hr.calendar.status.${day.statusCode}`, {
      defaultValue: day.statusName ?? day.statusCode,
    });
    const shortLabel = t(`hr.calendar.statusShort.${day.statusCode}`, {
      defaultValue: statusLabel,
    });
    const hours =
      day.statusCode === "WORKED"
        ? (day.workedHours ?? day.workHours)
        : day.plannedHours;
    const colorClass = getStatusColorClass(day.statusCode);

    return (
      <div
        aria-label={statusLabel}
        className={`mx-auto flex min-h-7 w-12 flex-col items-center justify-center rounded-md border px-0.5 py-0.5 text-[10px] leading-tight ${colorClass}`}
        title={statusLabel}
      >
        {day.statusCode !== "WORKED" && (
          <span className="font-medium">
            {shortLabel.slice(0, 1).toUpperCase()}
          </span>
        )}
        {day.statusCode === "WORKED" && hours != null && (
          <span className="mt-0.5 font-semibold">
            {Number.isInteger(hours) ? hours : hours.toFixed(1)} s
          </span>
        )}
      </div>
    );
  };

  const numberColumn = (
    key: keyof PayrollTimesheetLineForm,
    title: string,
    max?: number,
  ) => ({
    dataIndex: key as string,
    title: <span className="text-[11px]! leading-tight">{t(title)}</span>,
    align: "center" as const,
    width: 88,
    className: "text-xs!",
    render: (_: unknown, record: LineRow) => (
      <InputNumber
        standalone
        height={28}
        min={0}
        max={max}
        precision={1}
        emptyZero
        placeholder="0"
        disabled={
          disabled ||
          Boolean(
            record.employeeId && syncingEmployeeIds.includes(record.employeeId),
          )
        }
        value={record[key] as number | null}
        onValueChange={(value) =>
          patchLine(record.rowIndex, { [key]: value ?? 0 })
        }
      />
    ),
  });

  const columns: TableColumnsType<LineRow> = [
    {
      dataIndex: "rowIndex",
      title: <span className="text-[11px]!">{t("common.rowNumber")}</span>,
      align: "center",
      width: 48,
      fixed: "left",
      className: "text-xs!",
      render: (_, record) => record.rowIndex + 1,
    },
    {
      dataIndex: "employeeId",
      title: <span className="text-[11px]!">{t("payroll.fields.employee")}</span>,
      width: 220,
      fixed: "left",
      className: "text-xs!",
      render: (_, record) => (
        <div className="py-0.5">
          <PayrollEmployeeSelect
            standalone
            value={record.employeeId}
            excludeIds={selectedIds.filter((id) => id !== record.employeeId)}
            disabled={disabled || !periodId}
            onChange={(value) => {
              if (record.employeeId != null && record.employeeId !== value) {
                setEmployeeCalendars((current) => {
                  const next = { ...current };
                  delete next[record.employeeId!];
                  return next;
                });
              }
              const employee = (employees ?? []).find(
                (item) => item.id === value,
              );
              const employeePatch = {
                employeeId: value,
                employeeName: employee?.label ?? null,
                employeeNumber: employee?.employeeNumber ?? null,
                departmentName: employee?.departmentName ?? null,
              };
              if (value) {
                void syncLineCalendar(record.rowIndex, value, employeePatch);
              } else {
                patchLine(record.rowIndex, employeePatch);
              }
            }}
          />
          {/* {record.departmentName && (
            <div className="mt-1 text-xs text-secondary-text">
              {record.departmentName}
            </div>
          )} */}
        </div>
      ),
    },
    ...calendarDays.map((day) => ({
      key: `calendar-${day.date}`,
      dataIndex: `calendar-${day.date}`,
      title: (
        <div className="text-center leading-tight">
          <div className="text-[11px]!">{dayjs(day.date).format("DD")}</div>
          <div className="text-[9px] font-normal text-secondary-text">
            {(day.dayName ?? dayjs(day.date).format("ddd")).slice(0, 3)}
          </div>
        </div>
      ),
      align: "center" as const,
      width: 54,
      className: "text-xs!",
      render: (_: unknown, record: LineRow) =>
        renderCalendarDay(
          record.employeeId == null
            ? undefined
            : dailyByEmployee.get(record.employeeId)?.get(day.date),
        ),
    })),
    numberColumn("normWorkDays", "payroll.fields.normWorkDays", 31),
    numberColumn("normWorkHours", "payroll.fields.normWorkHours"),
    numberColumn("workedDays", "payroll.fields.workedDays", 31),
    numberColumn("workedHours", "payroll.fields.workedHours"),
    numberColumn("leaveDays", "payroll.fields.leaveDays", 31),
    numberColumn("sickDays", "payroll.fields.sickDays", 31),
    numberColumn("absentDays", "payroll.fields.absentDays", 31),
    numberColumn("overtimeHours", "payroll.fields.overtimeHours"),
    {
      dataIndex: "note",
      title: <span className="text-[11px]!">{t("payroll.fields.note")}</span>,
      width: 150,
      className: "text-xs!",
      render: (_, record) => (
        <Input
          value={record.note ?? ""}
          disabled={disabled}
          placeholder={t("payroll.fields.note")}
          onChange={(event) =>
            patchLine(record.rowIndex, { note: event.target.value })
          }
          style={{ height: 28, backgroundColor: "transparent" }}
        />
      ),
    },
  ];

  if (!disabled) {
    columns.push({
      dataIndex: "actions",
      title: "",
      align: "center",
      width: 48,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title={t("common.delete")}>
          <Button
            type="text"
            danger
            icon={<Trash2 className="size-3.5" />}
            onClick={() => removeLine(record.rowIndex)}
          />
        </Tooltip>
      ),
    });
  }

  const dataSource: LineRow[] = lines.map((line, index) => ({
    ...line,
    key: index,
    rowIndex: index,
  }));

  return (
    <SectionCard
      className="min-w-0 overflow-hidden"
      title="payroll.timesheets.linesTitle"
      description="payroll.timesheets.linesHint"
      icon={<Users className="size-4" />}
      bodyClassName="min-w-0 overflow-hidden p-0!"
      extra={
        !disabled && (
          <Button
            type="dashed"
            size="small"
            icon={<UserPlus className="size-3.5" />}
            disabled={!periodId || noAvailableEmployees}
            onClick={addLine}
          >
            {t("payroll.timesheets.addLine")}
          </Button>
        )
      }
    >
      {statusCodes.length > 0 && (
        <div className="border-b border-border px-3 py-1.5">
          <div className="flex flex-wrap gap-1">
            {STATUS_ORDER.filter((code) => statusCodes.includes(code)).map(
              (code) => (
                <Tag
                  key={code}
                  className="m-0! px-1.5! py-0! text-[10px]! leading-5!"
                >
                  <span
                    className={`mr-1 inline-block size-1.5 rounded-full ${STATUS_STYLES[code].dot}`}
                  />
                  {getStatusLabel(code)}
                </Tag>
              ),
            )}
          </div>
        </div>
      )}
      <Table<LineRow>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        className="text-xs!"
        scroll={{ x: "max-content", y: 460 }}
        locale={{
          emptyText: <Empty description={t("payroll.timesheets.noLines")} />,
        }}
        summary={() =>
          lines.length ? (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-primary-bg font-semibold text-xs!">
                <Table.Summary.Cell index={0} colSpan={2}>
                  {t("common.total")}: {totals.employees}
                </Table.Summary.Cell>
                {calendarDays.map((day, dayIndex) => (
                  <Table.Summary.Cell
                    key={day.date}
                    index={dayIndex + 2}
                    align="center"
                  >
                    -
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell
                  index={calendarDays.length + 2}
                  align="center"
                >
                  {totals.normWorkDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={calendarDays.length + 3}
                  align="center"
                >
                  {totals.normWorkHours}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={calendarDays.length + 4}
                  align="center"
                >
                  {totals.workedDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={calendarDays.length + 5}
                  align="center"
                >
                  {totals.workedHours}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={calendarDays.length + 6}
                  align="center"
                >
                  {totals.leaveDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={calendarDays.length + 7}
                  align="center"
                >
                  {totals.sickDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={calendarDays.length + 8}
                  align="center"
                >
                  {totals.absentDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={calendarDays.length + 9}
                  align="center"
                >
                  {totals.overtimeHours}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={calendarDays.length + 10}
                  colSpan={disabled ? 1 : 2}
                />
              </Table.Summary.Row>
            </Table.Summary>
          ) : null
        }
      />
      {typeof formik.errors.lines === "string" && (
        <div className="px-3 py-1.5 text-xs text-red-500">
          {formik.errors.lines}
        </div>
      )}
    </SectionCard>
  );
}
