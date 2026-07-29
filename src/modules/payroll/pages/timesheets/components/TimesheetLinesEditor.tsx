import InputNumber from "@/components/fields/InputNumber";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { usePayrollEmployeeLookup } from "@/modules/payroll/hooks";
import { App, Button, Empty, Input, Table, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import type { FormikProps } from "formik";
import { Trash2, UserPlus, Users } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  PayrollTimesheetForm,
  PayrollTimesheetLineForm,
} from "../types/form";
import { createTimesheetLine, summarizeTimesheet } from "../utils/timesheet";

interface Props {
  formik: FormikProps<PayrollTimesheetForm>;
  disabled?: boolean;
  /** Davrdagi me'yoriy kun va soat — avtomatik to'ldirish uchun. */
  normWorkDays?: number | null;
  normWorkHours?: number | null;
}

type LineRow = PayrollTimesheetLineForm & { key: number; rowIndex: number };

export default function TimesheetLinesEditor({
  formik,
  disabled = false,
  normWorkDays,
  normWorkHours,
}: Props) {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { data: employees, isFetching } = usePayrollEmployeeLookup();

  const lines = formik.values.lines;
  const totals = useMemo(() => summarizeTimesheet(lines), [lines]);
  const selectedIds = useMemo(
    () => lines.map((line) => line.employeeId),
    [lines],
  );

  const setLines = (next: PayrollTimesheetLineForm[]) =>
    formik.setFieldValue("lines", next, true);

  const patchLine = (
    index: number,
    patch: Partial<PayrollTimesheetLineForm>,
  ) =>
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

  const removeLine = (index: number) =>
    setLines(lines.filter((_, current) => current !== index));

  /** Barcha faol xodimlarni me'yor bo'yicha to'ldiradi. */
  const fillAllEmployees = () => {
    const existing = new Set(
      lines
        .map((line) => line.employeeId)
        .filter((id): id is number => Boolean(id)),
    );
    const newLines = (employees ?? [])
      .filter((employee) => !existing.has(employee.id))
      .map((employee) =>
        createTimesheetLine({
          employeeId: employee.id,
          employeeName: employee.label,
          employeeNumber: employee.employeeNumber,
          departmentName: employee.departmentName,
          workedDays: normWorkDays ?? 0,
          workedHours: normWorkHours ?? 0,
        }),
      );

    if (!newLines.length) return;
    modal.confirm({
      title: t("payroll.timesheets.fillAllTitle"),
      content: t("payroll.timesheets.fillAllText", { count: newLines.length }),
      okText: t("common.submit"),
      cancelText: t("common.cancel"),
      onOk: () => setLines([...lines, ...newLines]),
    });
  };

  const numberColumn = (
    key: keyof PayrollTimesheetLineForm,
    title: string,
    max?: number,
  ) => ({
    dataIndex: key as string,
    title: t(title),
    align: "center" as const,
    width: 110,
    render: (_: unknown, record: LineRow) => (
      <InputNumber
        standalone
        height={32}
        min={0}
        max={max}
        precision={1}
        emptyZero
        placeholder="0"
        disabled={disabled}
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
      title: t("common.rowNumber"),
      align: "center",
      width: 60,
      fixed: "left",
      render: (_, record) => record.rowIndex + 1,
    },
    {
      dataIndex: "employeeId",
      title: t("payroll.fields.employee"),
      width: 280,
      fixed: "left",
      render: (_, record) => (
        <div className="py-1">
          <PayrollEmployeeSelect
            standalone
            value={record.employeeId}
            excludeIds={selectedIds}
            disabled={disabled}
            onChange={(value) => {
              const employee = (employees ?? []).find(
                (item) => item.id === value,
              );
              patchLine(record.rowIndex, {
                employeeId: value,
                employeeName: employee?.label ?? null,
                employeeNumber: employee?.employeeNumber ?? null,
                departmentName: employee?.departmentName ?? null,
              });
            }}
          />
          {record.departmentName && (
            <div className="mt-1 text-xs text-secondary-text">
              {record.departmentName}
            </div>
          )}
        </div>
      ),
    },
    numberColumn("workedDays", "payroll.fields.workedDays", 31),
    numberColumn("workedHours", "payroll.fields.workedHours"),
    numberColumn("leaveDays", "payroll.fields.leaveDays", 31),
    numberColumn("sickDays", "payroll.fields.sickDays", 31),
    numberColumn("absentDays", "payroll.fields.absentDays", 31),
    numberColumn("overtimeHours", "payroll.fields.overtimeHours"),
    {
      dataIndex: "note",
      title: t("payroll.fields.note"),
      width: 190,
      render: (_, record) => (
        <Input
          value={record.note ?? ""}
          disabled={disabled}
          placeholder={t("payroll.fields.note")}
          onChange={(event) =>
            patchLine(record.rowIndex, { note: event.target.value })
          }
          style={{ height: 32, backgroundColor: "transparent" }}
        />
      ),
    },
  ];

  if (!disabled) {
    columns.push({
      dataIndex: "actions",
      title: "",
      align: "center",
      width: 56,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title={t("common.delete")}>
          <Button
            type="text"
            danger
            icon={<Trash2 className="size-4" />}
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
      title="payroll.timesheets.linesTitle"
      description="payroll.timesheets.linesHint"
      icon={<Users className="size-4" />}
      bodyClassName="p-0!"
      extra={
        !disabled && (
          <>
            <Button
              icon={<Users className="size-4" />}
              loading={isFetching}
              onClick={fillAllEmployees}
            >
              {t("payroll.timesheets.fillAll")}
            </Button>
            <Button
              type="dashed"
              icon={<UserPlus className="size-4" />}
              onClick={addLine}
            >
              {t("payroll.timesheets.addLine")}
            </Button>
          </>
        )
      }
    >
      <Table<LineRow>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        scroll={{ x: "max-content", y: 460 }}
        locale={{
          emptyText: (
            <Empty description={t("payroll.timesheets.noLines")} />
          ),
        }}
        summary={() =>
          lines.length ? (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-primary-bg font-semibold">
                <Table.Summary.Cell index={0} colSpan={2}>
                  {t("common.total")}: {totals.employees}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="center">
                  {totals.workedDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  {totals.workedHours}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  {totals.leaveDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="center">
                  {totals.sickDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="center">
                  {totals.absentDays}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  {totals.overtimeHours}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} colSpan={disabled ? 1 : 2} />
              </Table.Summary.Row>
            </Table.Summary>
          ) : null
        }
      />
      {typeof formik.errors.lines === "string" && (
        <div className="px-4 py-2 text-sm text-red-500">
          {formik.errors.lines}
        </div>
      )}
    </SectionCard>
  );
}
