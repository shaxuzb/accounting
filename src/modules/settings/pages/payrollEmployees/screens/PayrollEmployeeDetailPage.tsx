import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import SectionCard from "@/components/ui/card/SectionCard";
import EmployeeLeavePanel from "@/modules/payroll/leave/EmployeeLeavePanel";
import EmployeeRecordsPanel from "@/modules/payroll/employeeRecords/EmployeeRecordsPanel";
import EmployeeCalendarPanel from "@/modules/hr/pages/employees/components/EmployeeCalendarPanel";
import EmployeeWorkSchedulesPanel from "@/modules/hr/pages/employees/components/EmployeeWorkSchedulesPanel";
import {
  componentTypeColor,
  methodUsesRate,
} from "@/modules/payroll/constants/options";
import { displayDate, money } from "@/modules/payroll/utils/format";
import { hrOrderPermissions } from "@/modules/hr/constants/permissions";
import { useAppSelector } from "@/store/hooks";
import { Button, Empty, Spin, Table, Tabs, Tag } from "antd";
import type { TableColumnsType } from "antd";
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarDays,
  FilePlus2,
  IdCard,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { payrollEmployeePermissions } from "../constants/permissions";
import {
  useGetDetailPayrollEmployee,
  useGetPayrollEmployeeHistory,
} from "../hooks";
import PayrollEmployeeAddEditPage from "./PayrollEmployeeAddEditPage";
import type {
  PayrollEmployeeComponent,
  PayrollEmployment,
} from "../types/type";

export default function PayrollEmployeeDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canUpdate = permissions.includes(payrollEmployeePermissions.update);

  const { data: employee, isLoading } = useGetDetailPayrollEmployee(id);
  const { data: history } = useGetPayrollEmployeeHistory(id);

  const [isMainOpen, setIsMainOpen] = useState(false);
  const canOrder = permissions.includes(hrOrderPermissions.create);

  const employments = employee?.employments ?? [];
  const employmentHistory = history ?? employments;
  const components = employee?.components ?? [];
  // the open jobs: a main job and a part-time one (1C «внутреннее совместительство»), the main first
  const openJobs = employments
    .filter((item) => !item.endDate)
    .sort((a, b) => Number(b.employmentType === "PRIMARY") - Number(a.employmentType === "PRIMARY"));
  const activeContract =
    openJobs[0] ??
    employments.find((item) => item.isActive) ??
    employments[0];
  // 1C: the personnel changes are documents — the card only opens a new HR order
  const isEmployed = openJobs.length > 0;
  const openOrder = (type: string, extra = "") =>
    navigate(`/main/hr/orders/add?type=${type}&employeeId=${id}${extra}`);
  const jobOrder = (type: string, job: PayrollEmployment) =>
    openOrder(type, `&employmentId=${job.jobId ?? job.id}`);
  const severalJobs = openJobs.length > 1;

  const employmentColumns: TableColumnsType<PayrollEmployment> = [
    {
      dataIndex: "actionType",
      title: t("payroll.fields.actionType", { defaultValue: "Amal" }),
      align: "center",
      render: (value: string | null) => value ? <Tag className="m-0!" color="purple">{t(`payroll.enums.hrOrderType.${value}`, { defaultValue: value })}</Tag> : "—",
    },
    {
      dataIndex: "startDate",
      title: t("payroll.fields.period"),
      align: "center",
      render: (_, record) => (
        <span>
          {displayDate(record.startDate)} —{" "}
          {record.endDate
            ? displayDate(record.endDate)
            : t("payroll.fields.now")}
        </span>
      ),
    },
    {
      dataIndex: "employmentType",
      title: t("payroll.fields.employmentType"),
      align: "center",
      render: (_, record) => (
        <Tag className="m-0!" color="blue">
          {t(`payroll.enums.employmentType.${record.employmentType}`, {
            defaultValue: record.employmentTypeName ?? record.employmentType,
          })}
        </Tag>
      ),
    },
    {
      dataIndex: "departmentName",
      title: t("payroll.fields.department"),
      align: "center",
      render: (value: string | null) => value ?? "—",
    },
    {
      dataIndex: "positionName",
      title: t("payroll.fields.position"),
      align: "center",
      render: (value: string | null) => value ?? "—",
    },
    {
      dataIndex: "monthlySalary",
      title: t("payroll.fields.monthlySalary"),
      align: "center",

      render: (_, record) => (
        <span className="font-medium">
          {money(record.monthlySalary)}{" "}
          <span className="text-xs text-secondary-text">
            {record.currencyName ?? ""}
          </span>
        </span>
      ),
    },
    {
      dataIndex: "employmentRate",
      title: t("payroll.fields.employmentRate"),
      align: "center",
    },
    {
      dataIndex: "weeklyHours",
      title: t("payroll.fields.weeklyHours"),
      align: "center",
    },
    {
      dataIndex: "advanceValue",
      title: t("payroll.fields.advanceAmount", { defaultValue: "Avans" }),
      align: "center",
      render: (_: number | null, record) => record.advanceValue == null ? "—" : `${record.advanceValue} ${record.advanceMethod === "PERCENT" ? "%" : record.currencyName ?? ""}`,
    },
  ];

  const jobColumns: TableColumnsType<PayrollEmployment> = [
    employmentColumns[2],
    employmentColumns[3],
    employmentColumns[4],
    employmentColumns[5],
    employmentColumns[6],
    {
      dataIndex: "startDate",
      title: t("payroll.fields.startDate"),
      align: "center",
      render: (value: string) => displayDate(value),
    },
    ...(canOrder
      ? [{
          key: "actions",
          title: "",
          align: "right" as const,
          render: (_: unknown, job: PayrollEmployment) => (
            <div className="flex flex-wrap justify-end gap-1">
              <Button size="small" onClick={() => jobOrder("TRANSFER", job)}>{t("payroll.employees.orderTransfer")}</Button>
              <Button size="small" onClick={() => jobOrder("PAY_CHANGE", job)}>{t("payroll.employees.orderPayChange")}</Button>
              <Button size="small" danger onClick={() => jobOrder("DISMISSAL", job)}>{t("payroll.employees.orderDismissal")}</Button>
            </div>
          ),
        }]
      : []),
  ];

  const componentColumns: TableColumnsType<PayrollEmployeeComponent> = [
    // {
    //   dataIndex: "componentCode",
    //   title: t("payroll.fields.componentCode"),
    //   align: "center",
    //   render: (value: string | null) => value ?? "—",
    // },
    {
      dataIndex: "componentName",
      title: t("payroll.fields.componentName"),
      align: "center",
      render: (value: string | null) => value ?? "—",
    },
    {
      dataIndex: "componentType",
      title: t("payroll.fields.componentType"),
      align: "center",
      render: (_, record) =>
        record.componentType ? (
          <Tag
            className="m-0!"
            color={componentTypeColor[record.componentType] ?? "default"}
          >
            {t(`payroll.enums.componentType.${record.componentType}`, {
              defaultValue: record.componentType,
            })}
          </Tag>
        ) : (
          "—"
        ),
    },
    {
      dataIndex: "amount",
      title: t("payroll.fields.value"),
      align: "center",
      render: (_, record) =>
        methodUsesRate(record.calculationMethod)
          ? record.rate != null
            ? `${record.rate}${record.calculationMethod === "PERCENT_OF_GROSS" ? " %" : ""}`
            : "—"
          : money(record.amount),
    },
    {
      dataIndex: "effectiveFrom",
      title: t("payroll.fields.effectivePeriod"),
      align: "center",
      render: (_, record) => (
        <span className="text-sm">
          {displayDate(record.effectiveFrom)} —{" "}
          {record.effectiveTo ? displayDate(record.effectiveTo) : "∞"}
        </span>
      ),
    },
    {
      dataIndex: "note",
      title: t("payroll.fields.note"),
      render: (value: string | null) => value ?? "—",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (!employee) {
    return (
      <Card className="border border-border p-10">
        <Empty description={t("payroll.employees.notFound")} />
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {/* <Card className="border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-text">
                {employeeFullName(employee)}
              </span>
              {stateStatus(employee.stateId, employee.stateName)}
            </div>
            <div className="mt-1 text-sm text-secondary-text">
              {t("payroll.fields.employeeNumber")}: {employee.employeeNumber}
              {employee.phoneNumber && ` • ${employee.phoneNumber}`}
              {employee.email && ` • ${employee.email}`}
            </div>
          </div>
          <PermissionCard permission={payrollEmployeePermissions.update}>
            <Button
              icon={<Pencil className="size-4" />}
              onClick={() => setIsMainOpen(true)}
            >
              {t("common.edit")}
            </Button>
          </PermissionCard>
        </div>
      </Card> */}

      <DocumentSummary className="lg:grid-cols-3 2xl:grid-cols-5">
        <DocumentSummaryItem
          icon={<Building2 className="size-5" />}
          label={t("payroll.fields.department")}
          value={activeContract?.departmentName ?? "—"}
        />
        <DocumentSummaryItem
          icon={<BriefcaseBusiness className="size-5" />}
          label={t("payroll.fields.position")}
          value={activeContract?.positionName ?? "—"}
        />
        <DocumentSummaryItem
          icon={<Banknote className="size-5" />}
          label={t("payroll.fields.monthlySalary")}
          value={`${money(activeContract?.monthlySalary)} ${activeContract?.currencyName ?? ""}`}
          emphasized
        />
        <DocumentSummaryItem
          icon={<CalendarClock className="size-5" />}
          label={t("payroll.fields.startDate")}
          value={displayDate(activeContract?.startDate)}
        />
        <DocumentSummaryItem
          icon={<IdCard className="size-5" />}
          label={t("payroll.fields.pinfl")}
          value={employee.pinfl ?? "—"}
        />
      </DocumentSummary>

      <EmployeeLeavePanel employeeId={employee.id} active={employee.stateId !== 2} />
      <EmployeeRecordsPanel employeeId={employee.id} canEdit={canUpdate} />

      <SectionCard
        title="payroll.employees.employmentsTitle"
        description="payroll.employees.employmentsHint"
        bodyClassName="p-0!"
        extra={
          <div className="flex flex-wrap gap-2">
            {canUpdate && (
              <Button icon={<Pencil className="size-4" />} onClick={() => setIsMainOpen(true)}>
                {t("payroll.employees.editPersonal")}
              </Button>
            )}
            {canOrder && employee.stateId !== 2 && !isEmployed && (
              <Button type="primary" icon={<FilePlus2 className="size-4" />} onClick={() => openOrder("HIRE")}>
                {t("payroll.employees.orderHire")}
              </Button>
            )}
            {canOrder && isEmployed && !severalJobs && (
              <>
                <Button icon={<FilePlus2 className="size-4" />} onClick={() => jobOrder("TRANSFER", openJobs[0])}>
                  {t("payroll.employees.orderTransfer")}
                </Button>
                <Button icon={<FilePlus2 className="size-4" />} onClick={() => jobOrder("PAY_CHANGE", openJobs[0])}>
                  {t("payroll.employees.orderPayChange")}
                </Button>
                <Button danger icon={<FilePlus2 className="size-4" />} onClick={() => jobOrder("DISMISSAL", openJobs[0])}>
                  {t("payroll.employees.orderDismissal")}
                </Button>
              </>
            )}
            {canOrder && isEmployed && (
              <Button icon={<FilePlus2 className="size-4" />} onClick={() => openOrder("HIRE", "&employmentType=PART_TIME")}>
                {t("payroll.employees.orderPartTime")}
              </Button>
            )}
          </div>
        }
      >
        {severalJobs && (
          <div className="border-b border-border">
            <div className="px-4 pt-3 text-sm font-medium text-text">{t("payroll.employees.currentJobs")}</div>
            <Table<PayrollEmployment>
              columns={jobColumns}
              dataSource={openJobs.map((item) => ({ ...item, key: `job-${item.id}` }))}
              pagination={false}
              size="small"
              scroll={{ x: "max-content" }}
            />
          </div>
        )}
        <Table<PayrollEmployment>
          columns={employmentColumns}
          dataSource={employmentHistory.map((item) => ({ ...item, key: item.id }))}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty description={t("payroll.employees.noEmployment")} />
            ),
          }}
        />
      </SectionCard>

      <SectionCard
        title="payroll.employees.componentsTitle"
        description="payroll.employees.componentsHint"
        bodyClassName="p-0!"
      >
        <Table<PayrollEmployeeComponent>
          columns={componentColumns}
          dataSource={components.map((item) => ({ ...item, key: item.id }))}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty description={t("payroll.employees.noComponents")} />
            ),
          }}
        />
      </SectionCard>

      <SectionCard
        title="hr.employees.workTimeTitle"
        description="hr.employees.workTimeHint"
        icon={<CalendarDays className="size-4" />}
        bodyClassName="pt-2!"
      >
        <Tabs
          destroyOnHidden
          items={[
            {
              key: "schedules",
              label: t("hr.schedules.title"),
              children: <EmployeeWorkSchedulesPanel employeeId={employee.id} />,
            },
            {
              key: "calendar",
              label: t("hr.calendar.title"),
              children: <EmployeeCalendarPanel employeeId={employee.id} />,
            },
          ]}
        />
      </SectionCard>

      <PayrollEmployeeAddEditPage
        open={isMainOpen}
        id={employee.id}
        onClose={() => setIsMainOpen(false)}
      />
    </div>
  );
}
