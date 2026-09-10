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
import { useTranslation } from "react-i18next";
import type { PayrollTimesheetForm, PayrollTimesheetLineForm, PayrollTimesheetDayForm } from "../types/form";
import type { PayrollAttendanceStatusOption } from "../types/type";
import { calculateLineFromDays, createTimesheetLine, mapCalendarToTimesheetLine, replaceLineDayStatus, replaceLineWorkedHours } from "../utils/timesheet";
import TimesheetStatusPicker from "./TimesheetStatusPicker";

interface Props {
  formik: FormikProps<PayrollTimesheetForm>;
  disabled?: boolean;
  normWorkDays?: number | null;
  normWorkHours?: number | null;
  dailyWorkHours?: number | null;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
  periodId?: number | null;
  statusOptions?: PayrollAttendanceStatusOption[];
}

type LineRow = PayrollTimesheetLineForm & { key: number; rowIndex: number };

const statusDot: Record<string, string> = { WORKED: "bg-emerald-500", PLANNED_WORK: "bg-blue-500", DAY_OFF: "bg-slate-400", NOT_EMPLOYED: "bg-slate-300" };

const monthDates = (from?: string | null, to?: string | null) => {
  if (!from || !to) return [] as string[];
  const result: string[] = [];
  for (let date = dayjs(from); !date.isAfter(dayjs(to), "day"); date = date.add(1, "day")) result.push(date.format("YYYY-MM-DD"));
  return result;
};

export default function TimesheetLinesEditor({ formik, disabled = false, normWorkDays, normWorkHours, dailyWorkHours = 0, periodStartDate, periodEndDate, periodId, statusOptions = [] }: Props) {
  const { t } = useTranslation();
  const { data: employees } = usePayrollEmployeeLookup();
  const [syncingEmployeeIds, setSyncingEmployeeIds] = useState<number[]>([]);
  const lines = formik.values.lines;
  const selectedIds = useMemo(() => lines.map((line) => line.employeeId), [lines]);
  const dates = useMemo(() => monthDates(periodStartDate, periodEndDate), [periodStartDate, periodEndDate]);
  const totals = useMemo(() => lines.reduce((result, line) => { const derived = line.days.length ? calculateLineFromDays(line.days, dailyWorkHours ?? 0) : line; return { employees: result.employees + 1, normWorkDays: result.normWorkDays + (line.normWorkDays ?? 0), normWorkHours: result.normWorkHours + (line.normWorkHours ?? 0), workedDays: result.workedDays + (derived.workedDays ?? 0), workedHours: result.workedHours + (derived.workedHours ?? 0), leaveDays: result.leaveDays + (derived.leaveDays ?? 0), sickDays: result.sickDays + (derived.sickDays ?? 0), absentDays: result.absentDays + (derived.absentDays ?? 0), overtimeHours: result.overtimeHours + (line.overtimeHours ?? 0) }; }, { employees: 0, normWorkDays: 0, normWorkHours: 0, workedDays: 0, workedHours: 0, leaveDays: 0, sickDays: 0, absentDays: 0, overtimeHours: 0 }), [dailyWorkHours, lines]);
  const noAvailableEmployees = employees != null && !employees.some((employee) => !selectedIds.includes(employee.id));
  const setLines = (next: PayrollTimesheetLineForm[]) => formik.setFieldValue("lines", next, true);
  const patchLine = (index: number, patch: Partial<PayrollTimesheetLineForm>) => setLines(lines.map((line, i) => i === index ? { ...line, ...patch } : line));

  const addLine = () => setLines([...lines, createTimesheetLine({ normWorkDays: normWorkDays ?? 0, normWorkHours: normWorkHours ?? 0 })]);
  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

  const syncEmployee = async (index: number, employeeId: number, patch: Partial<PayrollTimesheetLineForm>) => {
    if (!periodId) return;
    setSyncingEmployeeIds((ids) => [...ids, employeeId]);
    try {
      const calendar = await payrollTimesheetService.calendar(periodId, employeeId);
      patchLine(index, { ...patch, ...mapCalendarToTimesheetLine(calendar, dailyWorkHours ?? 0) });
    } catch (error) { errorHandlers(error); }
    finally { setSyncingEmployeeIds((ids) => ids.filter((id) => id !== employeeId)); }
  };

  const lineDay = (line: LineRow, date: string): PayrollTimesheetDayForm | undefined => line.days.find((day) => day.date === date);
  const columns: TableColumnsType<LineRow> = [
    { title: t("common.rowNumber"), width: 48, fixed: "left", align: "center", render: (_, record) => record.rowIndex + 1 },
    { title: t("payroll.fields.employee"), width: 220, fixed: "left", render: (_, record) => <PayrollEmployeeSelect standalone value={record.employeeId} excludeIds={selectedIds.filter((id) => id !== record.employeeId)} disabled={disabled || !periodId} onChange={(value) => { const employee = (employees ?? []).find((item) => item.id === value); const patch = { employeeId: value, employeeName: employee?.label ?? null, employeeNumber: employee?.employeeNumber ?? null, departmentName: employee?.departmentName ?? null }; if (value) void syncEmployee(record.rowIndex, value, patch); else patchLine(record.rowIndex, patch); }} /> },
    ...dates.map((date) => ({ key: date, title: <div className="text-center text-[10px]"><div>{dayjs(date).format("DD")}</div><div className="text-[9px] text-secondary-text">{dayjs(date).format("ddd")}</div></div>, width: 112, align: "center" as const, render: (_: unknown, record: LineRow) => { const day = lineDay(record, date); if (!day) return <span className="text-secondary-text">-</span>; return <TimesheetStatusPicker day={day} options={statusOptions} dailyWorkHours={dailyWorkHours ?? 0} disabled={disabled || !statusOptions.length || syncingEmployeeIds.includes(record.employeeId ?? 0)} onChange={(option) => { const nextDays = replaceLineDayStatus(record.days, date, option, dailyWorkHours ?? 0); patchLine(record.rowIndex, { days: nextDays, ...calculateLineFromDays(nextDays, dailyWorkHours ?? 0) }); }} onWorkedHoursChange={(hours) => { const nextDays = replaceLineWorkedHours(record.days, date, hours); patchLine(record.rowIndex, { days: nextDays, ...calculateLineFromDays(nextDays, dailyWorkHours ?? 0) }); }} onSpecialHoursChange={(field, hours) => { const nextDays = record.days.map((item) => item.date === date ? { ...item, [field]: hours } : item); patchLine(record.rowIndex, { days: nextDays, ...calculateLineFromDays(nextDays, dailyWorkHours ?? 0) }); }} />; } })),
    { title: t("payroll.fields.normWorkDays"), width: 88, align: "center", render: (_, record) => record.normWorkDays ?? 0 },
    { title: t("payroll.fields.normWorkHours"), width: 88, align: "center", render: (_, record) => record.normWorkHours ?? 0 },
    { title: t("payroll.fields.workedDays"), width: 82, align: "center", render: (_, record) => record.days.length ? calculateLineFromDays(record.days, dailyWorkHours ?? 0).workedDays : record.workedDays ?? 0 },
    { title: t("payroll.fields.workedHours"), width: 96, align: "center", render: (_, record) => record.days.length ? calculateLineFromDays(record.days, dailyWorkHours ?? 0).workedHours : record.workedHours ?? 0 },
    { title: t("payroll.fields.leaveDays"), width: 72, align: "center", render: (_, record) => record.leaveDays ?? 0 },
    { title: t("payroll.fields.sickDays"), width: 72, align: "center", render: (_, record) => record.sickDays ?? 0 },
    { title: t("payroll.fields.absentDays"), width: 72, align: "center", render: (_, record) => record.absentDays ?? 0 },
    { title: t("payroll.fields.overtimeHours"), width: 92, align: "center", render: (_, record) => <Input type="number" min={0} value={record.overtimeHours ?? 0} disabled={disabled} onChange={(event) => patchLine(record.rowIndex, { overtimeHours: Number(event.target.value) || 0 })} style={{ height: 28, width: 80 }} /> },
    { title: t("payroll.fields.note"), width: 150, render: (_, record) => <Input value={record.note ?? ""} disabled={disabled} onChange={(event) => patchLine(record.rowIndex, { note: event.target.value })} style={{ height: 28, backgroundColor: "transparent" }} /> },
  ];
  if (!disabled) columns.push({ title: "", width: 48, fixed: "right", align: "center", render: (_, record) => <Tooltip title={t("common.delete")}><Button type="text" danger icon={<Trash2 className="size-3.5" />} onClick={() => removeLine(record.rowIndex)} /></Tooltip> });
  const dataSource = lines.map((line, rowIndex) => ({ ...line, key: rowIndex, rowIndex }));
  return <SectionCard className="min-w-0 overflow-visible" title="payroll.timesheets.linesTitle" description="payroll.timesheets.linesHint" icon={<Users className="size-4" />} bodyClassName="min-w-0 overflow-visible p-0!" extra={!disabled && <Button type="dashed" size="small" icon={<UserPlus className="size-3.5" />} disabled={!periodId || noAvailableEmployees} onClick={addLine}>{t("payroll.timesheets.addLine")}</Button>}>
    {statusOptions.length > 0 && <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2"><span className="mr-1 text-[11px] text-secondary-text">{t("payroll.timesheets.workedHoursEditHint")}</span>{statusOptions.map((option) => <Tag key={`${option.code}-${option.absenceTypeId ?? ""}`} className="m-0! px-1.5! py-0! text-[10px]! leading-5!"><span className={`mr-1 inline-block size-1.5 rounded-full ${statusDot[option.code] ?? (option.kind === "ABSENCE" ? "bg-amber-500" : "bg-slate-400")}`} />{option.name}</Tag>)}</div>}
    <Table<LineRow> columns={columns} dataSource={dataSource} pagination={false} size="middle" className="text-xs!" scroll={{ x: "max-content", y: 620 }} locale={{ emptyText: <Empty description={t("payroll.timesheets.noLines")} /> }} summary={() => lines.length ? <Table.Summary fixed><Table.Summary.Row className="bg-primary-bg font-semibold text-xs!"><Table.Summary.Cell index={0} colSpan={2}>{t("common.total")}: {totals.employees}</Table.Summary.Cell>{dates.map((date, i) => <Table.Summary.Cell key={date} index={i + 2} align="center">-</Table.Summary.Cell>)}<Table.Summary.Cell index={dates.length + 2} align="center">{totals.normWorkDays}</Table.Summary.Cell><Table.Summary.Cell index={dates.length + 3} align="center">{totals.normWorkHours}</Table.Summary.Cell><Table.Summary.Cell index={dates.length + 4} align="center">{totals.workedDays}</Table.Summary.Cell><Table.Summary.Cell index={dates.length + 5} align="center">{totals.workedHours}</Table.Summary.Cell><Table.Summary.Cell index={dates.length + 6} align="center">{totals.leaveDays}</Table.Summary.Cell><Table.Summary.Cell index={dates.length + 7} align="center">{totals.sickDays}</Table.Summary.Cell><Table.Summary.Cell index={dates.length + 8} align="center">{totals.absentDays}</Table.Summary.Cell><Table.Summary.Cell index={dates.length + 9} /><Table.Summary.Cell index={dates.length + 10} colSpan={disabled ? 1 : 2} /></Table.Summary.Row></Table.Summary> : null} />
  </SectionCard>;
}
