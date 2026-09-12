import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { hrOrderTypeOptions } from "@/modules/payroll/constants/options";
import { displayDate, money } from "@/modules/payroll/utils/format";
import { usePayrollEmployeeLookup } from "@/modules/payroll/hooks";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { useAppSelector } from "@/store/hooks";
import { Button, Select, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { FilePlus2, Pencil, Printer } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { hrOrderPermissions } from "../../../constants/permissions";
import { documentStatusFilterOptions } from "@/modules/payroll/constants/options";
import ListPagination from "@/components/ui/table/ListPagination";
import { useHrOrders } from "../hooks";
import type { PayrollHrOrderListItem } from "../types/type";

const LIST_PATH = "/main/hr/orders";

export default function HrOrderListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } = useHrOrders(searchParams);
  const { data: employeeOptions = [] } = usePayrollEmployeeLookup();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(searchParams.get("employeeId") ?? undefined);

  const updateEmployeeFilter = (value: string | undefined) => {
    setEmployeeFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set("employeeId", value);
    else next.delete("employeeId");
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const columns: TableColumnsType<PayrollHrOrderListItem> = [
    { dataIndex: "indexId", title: t("common.rowNumber"), width: 60, align: "center" },
    {
      dataIndex: "orderNumber",
      title: t("payroll.fields.orderNumber", { defaultValue: "Buyruq raqami" }),
      render: (value: string, record) => <Link to={`${LIST_PATH}/${record.id}`} className="font-medium">{value ?? record.id}</Link>,
    },
    { dataIndex: "orderDate", title: t("payroll.fields.orderDate", { defaultValue: "Buyruq sanasi" }), align: "center", render: displayDate },
    { dataIndex: "employeeName", title: t("payroll.fields.employee"), render: (value: string) => <span className="font-medium">{value}</span> },
    {
      dataIndex: "orderType",
      title: t("payroll.fields.orderType", { defaultValue: "Buyruq turi" }),
      align: "center",
      render: (value: string) => <Tag className="m-0!" color="blue">{t(`payroll.enums.hrOrderType.${value}`, { defaultValue: value })}</Tag>,
    },
    { dataIndex: "effectiveDate", title: t("payroll.fields.effectiveDate", { defaultValue: "Amal qilish sanasi" }), align: "center", render: displayDate },
    {
      dataIndex: "positionName",
      title: t("payroll.fields.position"),
      render: (value: string | null, record) => <div><div>{value ?? "—"}</div><div className="text-xs text-secondary-text">{record.departmentName ?? ""}</div></div>,
    },
    { dataIndex: "monthlySalary", title: t("payroll.fields.monthlySalary"), align: "right", render: (value: number | null) => value == null ? "—" : money(value) },
    { dataIndex: "statusId", title: t("settings.fields.status"), align: "center", render: (_, record) => <ProcessStatusBadge statusId={record.statusId} /> },
    {
      dataIndex: "actions",
      title: t("common.actions"),
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <Tooltip title={t("common.view")}><Link to={`${LIST_PATH}/${record.id}`}><Button type="text" icon={<Pencil className="size-4" />} /></Link></Tooltip>
          {permissions.includes(hrOrderPermissions.view) && record.statusId === 2 && <Tooltip title={t("payroll.hrOrders.print", { defaultValue: "Chop etish" })}><Link to={`${LIST_PATH}/${record.id}?print=1`}><Button type="text" icon={<Printer className="size-4" />} /></Link></Tooltip>}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={<>
          <SearchFilter />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={t("payroll.fields.employee")}
            value={employeeFilter}
            onChange={(value) => updateEmployeeFilter(value)}
            options={employeeOptions.map((employee) => ({ value: String(employee.id), label: `${employee.label} · ${employee.employeeNumber}` }))}
            style={{ width: 230, height: 32 }}
          />
          <SelectFilter paramKey="orderType" placeholder="payroll.fields.orderType" options={hrOrderTypeOptions.map((option) => ({ value: option.value, label: option.label }))} width={180} />
          <SelectFilter paramKey="statusId" placeholder="settings.fields.status" options={documentStatusFilterOptions} width={170} />
          <DateRangeFilter placeholderKeys={["payroll.fields.orderDate", "payroll.fields.effectiveDate"]} width={250} />
        </>}
        actions={<PermissionCard permission={hrOrderPermissions.create}><Link to={`${LIST_PATH}/add`}><Button type="primary" icon={<FilePlus2 className="size-4" />}>{t("payroll.hrOrders.create", { defaultValue: "Kadr buyrug'i yaratish" })}</Button></Link></PermissionCard>}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />
      <Card className="overflow-hidden border border-border">
        <Table<PayrollHrOrderListItem> loading={isLoading || isFetching} columns={columns} dataSource={withRowNumbers(data?.items)} pagination={false} size="middle" scroll={{ x: "max-content", y: "calc(100vh - 330px)" }} />
        <ListPagination {...paginationProps(data?.total ?? data?.totalCount)} />
      </Card>
    </div>
  );
}
