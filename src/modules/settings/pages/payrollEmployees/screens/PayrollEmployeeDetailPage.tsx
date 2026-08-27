import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SectionCard from "@/components/ui/card/SectionCard";
import EmployeeCalendarPanel from "@/modules/hr/pages/employees/components/EmployeeCalendarPanel";
import EmployeeWorkSchedulesPanel from "@/modules/hr/pages/employees/components/EmployeeWorkSchedulesPanel";
import {
  componentTypeColor,
  methodUsesRate,
} from "@/modules/payroll/constants/options";
import { displayDate, money } from "@/modules/payroll/utils/format";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { App, Button, Empty, Spin, Table, Tabs, Tag } from "antd";
import type { TableColumnsType } from "antd";
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarDays,
  IdCard,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import EmployeeComponentModal from "../components/EmployeeComponentModal";
import EmployeeEmploymentModal from "../components/EmployeeEmploymentModal";
import { payrollEmployeePermissions } from "../constants/permissions";
import {
  useGetDetailPayrollEmployee,
  useRemovePayrollComponent,
} from "../hooks";
import PayrollEmployeeAddEditPage from "./PayrollEmployeeAddEditPage";
import type {
  PayrollEmployeeComponent,
  PayrollEmployment,
} from "../types/type";

export default function PayrollEmployeeDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const { modal } = App.useApp();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canUpdate = permissions.includes(payrollEmployeePermissions.update);

  const { data: employee, isLoading } = useGetDetailPayrollEmployee(id);
  const removeComponent = useRemovePayrollComponent(id);

  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isEmploymentOpen, setIsEmploymentOpen] = useState(false);
  const [isComponentOpen, setIsComponentOpen] = useState(false);
  const [activeEmployment, setActiveEmployment] =
    useState<PayrollEmployment | null>(null);

  const employments = employee?.employments ?? [];
  const components = employee?.components ?? [];
  const activeContract =
    employments.find((item) => item.isActive) ??
    employments.find((item) => !item.endDate) ??
    employments[0];

  const handleRemoveComponent = (record: PayrollEmployeeComponent) => {
    modal.confirm({
      title: t("payroll.employees.removeComponentTitle"),
      content: record.componentName,
      okText: t("common.delete"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true, type: "primary" },
      onOk: async () => {
        try {
          await removeComponent.mutateAsync(record.id);
          toast.success(t("payroll.messages.componentRemoved"));
        } catch (error) {
          errorHandlers(error);
        }
      },
    });
  };

  const employmentColumns: TableColumnsType<PayrollEmployment> = [
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

  if (canUpdate) {
    componentColumns.push({
      dataIndex: "actions",
      title: t("common.actions"),
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<Trash2 className="size-4" />}
          onClick={() => handleRemoveComponent(record)}
        />
      ),
    });
  }

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

      <SectionCard
        title="payroll.employees.employmentsTitle"
        description="payroll.employees.employmentsHint"
        bodyClassName="p-0!"
        extra={
          <PermissionCard permission={payrollEmployeePermissions.update}>
            <Button
              type="dashed"
              icon={<Plus className="size-4" />}
              onClick={() => {
                setActiveEmployment(null);
                setIsEmploymentOpen(true);
              }}
            >
              {t("payroll.employments.add")}
            </Button>
          </PermissionCard>
        }
      >
        <Table<PayrollEmployment>
          columns={
            canUpdate
              ? [
                  ...employmentColumns,
                  {
                    dataIndex: "actions",
                    title: t("common.actions"),
                    align: "center",
                    width: 80,
                    fixed: "right",
                    render: (_, record) => (
                      <Button
                        type="text"
                        icon={<Pencil className="size-4" />}
                        onClick={() => {
                          setActiveEmployment(record);
                          setIsEmploymentOpen(true);
                        }}
                      />
                    ),
                  },
                ]
              : employmentColumns
          }
          dataSource={employments.map((item) => ({ ...item, key: item.id }))}
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
        extra={
          <PermissionCard permission={payrollEmployeePermissions.update}>
            <Button
              type="dashed"
              icon={<Plus className="size-4" />}
              onClick={() => setIsComponentOpen(true)}
            >
              {t("payroll.employees.assignComponent")}
            </Button>
          </PermissionCard>
        }
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
      <EmployeeEmploymentModal
        open={isEmploymentOpen}
        employeeId={employee.id}
        employment={activeEmployment}
        onClose={() => {
          setIsEmploymentOpen(false);
          setActiveEmployment(null);
        }}
      />
      <EmployeeComponentModal
        open={isComponentOpen}
        employeeId={employee.id}
        onClose={() => setIsComponentOpen(false)}
      />
    </div>
  );
}
