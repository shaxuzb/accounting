import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { stateFilterOptions } from "@/modules/payroll/constants/options";
import { employeeFullName, money } from "@/modules/payroll/utils/format";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { useAppSelector } from "@/store/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { stateStatus } from "@/utils/helpers/statusHelper";
import ListPagination from "@/components/ui/table/ListPagination";
import { Button, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { payrollEmployeeEndpoints } from "../constants/endpoints";
import { payrollEmployeePermissions } from "../constants/permissions";
import { payrollEmployeeKeys } from "../constants/queryKeys";
import { useGetListPayrollEmployees } from "../hooks";
import type { PayrollEmployee } from "../types/type";
import PayrollEmployeeAddEditPage from "./PayrollEmployeeAddEditPage";

export default function PayrollEmployeeListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const queryClient = useQueryClient();
  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } =
    useGetListPayrollEmployees(searchParams);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const columns: TableColumnsType<PayrollEmployee> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 45,
    },
    {
      dataIndex: "employeeNumber",
      title: t("payroll.fields.employeeNumber"),
      align: "center",
      render: (value: string, record) => (
        <Link to={`/main/hr/employees/${record.id}`} className="font-medium">
          {value || record.id}
        </Link>
      ),
    },
    {
      dataIndex: "fullName",
      title: t("payroll.fields.employee"),
      align: "center",
      render: (_, record) => (
        <Link to={`/main/hr/employees/${record.id}`}>
          {employeeFullName(record)}
        </Link>
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
      dataIndex: "employmentType",
      title: t("payroll.fields.employmentType"),
      align: "center",
      render: (_, record) =>
        record.employmentType ? (
          <Tag className="m-0!" color="blue">
            {t(`payroll.enums.employmentType.${record.employmentType}`, {
              defaultValue: record.employmentType,
            })}
          </Tag>
        ) : (
          "—"
        ),
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
      dataIndex: "phoneNumber",
      title: t("settings.fields.phoneNumber"),
      align: "center",
      render: (value: string | null) => value ?? "—",
    },
    {
      dataIndex: "stateId",
      title: t("settings.fields.status"),
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];

  const hasActions =
    permissions.includes(payrollEmployeePermissions.update) ||
    permissions.includes(payrollEmployeePermissions.delete);

  const tableColumns = hasActions
    ? [
        ...columns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center" as const,
          fixed: "right" as const,
          render: (_: unknown, record: PayrollEmployee) => (
            <ActionColumn
              deletePath={payrollEmployeeEndpoints.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: payrollEmployeePermissions.delete,
                editCode: payrollEmployeePermissions.update,
              }}
              deleteLabel={t("payroll.employees.deactivate", { defaultValue: "Faolsizlantirish" })}
              deleteConfirmTitle={t("payroll.employees.deactivateTitle", { defaultValue: "Xodimni faolsizlantirasizmi?" })}
              deleteConfirmContent={t("payroll.employees.deactivateText", { defaultValue: "Xodim o'chirilmaydi, faqat passiv holatga o'tkaziladi." })}
              refetch={() => void refetch()}
              onDeleteSuccess={() =>
                queryClient.invalidateQueries({
                  queryKey: payrollEmployeeKeys.all,
                })
              }
              editModal={{
                isModal: true,
                setOpenEditModal: setIsFormOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as PayrollEmployee)?.id ?? null),
              }}
            />
          ),
        },
      ]
    : columns;

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <SelectFilter
              paramKey="departmentId"
              placeholder="payroll.fields.department"
              path={selectListEndpoints.departmentsSelectList}
              search
              width={190}
            />
            <SelectFilter
              paramKey="positionId"
              placeholder="payroll.fields.position"
              path={selectListEndpoints.positionsSelectList}
              search
              width={190}
            />
            <SelectFilter
              paramKey="stateId"
              placeholder="settings.fields.status"
              options={stateFilterOptions}
              width={150}
            />
          </>
        }
        actions={
          <PermissionCard permission={payrollEmployeePermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => {
                setEditId(null);
                setIsFormOpen(true);
              }}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<PayrollEmployee>
          loading={isLoading || isFetching}
          columns={tableColumns}
          dataSource={withRowNumbers(data?.items)}
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
          pagination={false}
          size="middle"
        />
        <ListPagination {...paginationProps(data?.total ?? data?.totalCount)} />
      </Card>

      <PayrollEmployeeAddEditPage
        open={isFormOpen}
        id={editId}
        onClose={() => {
          setIsFormOpen(false);
          setEditId(null);
        }}
      />
    </div>
  );
}
