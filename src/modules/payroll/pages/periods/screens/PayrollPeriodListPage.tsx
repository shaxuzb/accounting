import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import { periodStatusOptions } from "@/modules/payroll/constants/options";
import { payrollPeriodPermissions } from "@/modules/payroll/constants/permissions";
import { displayDate } from "@/modules/payroll/utils/format";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { App, Button, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { CalendarPlus, Lock, LockOpen } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import PayrollPeriodModal from "../components/PayrollPeriodModal";
import {
  useClosePayrollPeriod,
  useGetPayrollPeriods,
  useReopenPayrollPeriod,
} from "../hooks";
import type { PayrollPeriod } from "../types/type";

const yearOptions = Array.from({ length: 7 }, (_, index) => {
  const year = dayjs().year() - 3 + index;
  return { value: year, label: String(year) };
});

export default function PayrollPeriodListPage() {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canManage = permissions.includes(payrollPeriodPermissions.manage);

  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } =
    useGetPayrollPeriods(searchParams);
  const closeMutation = useClosePayrollPeriod();
  const reopenMutation = useReopenPayrollPeriod();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const runAction = (
    record: PayrollPeriod,
    action: "close" | "reopen",
  ) => {
    modal.confirm({
      title: t(
        action === "close"
          ? "payroll.periods.closeConfirmTitle"
          : "payroll.periods.reopenConfirmTitle",
      ),
      content: t(
        action === "close"
          ? "payroll.periods.closeConfirmText"
          : "payroll.periods.reopenConfirmText",
      ),
      okText: t(action === "close" ? "payroll.periods.close" : "payroll.periods.reopen"),
      cancelText: t("common.cancel"),
      okButtonProps: { type: "primary", danger: action === "close" },
      onOk: async () => {
        try {
          if (action === "close") {
            await closeMutation.mutateAsync(record.id);
            toast.success(t("payroll.messages.periodClosed"));
          } else {
            await reopenMutation.mutateAsync(record.id);
            toast.success(t("payroll.messages.periodReopened"));
          }
        } catch (error) {
          errorHandlers(error);
        }
      },
    });
  };

  const columns: TableColumnsType<PayrollPeriod> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "month",
      title: t("payroll.fields.period"),
      minWidth: 180,
      render: (_, record) => (
        <span className="font-medium">
          {t(`payroll.months.${record.month}`, {
            defaultValue: record.monthName ?? String(record.month),
          })}{" "}
          {record.year}
        </span>
      ),
    },
    {
      dataIndex: "startDate",
      title: t("payroll.fields.periodRange"),
      align: "center",
      width: 220,
      render: (_, record) =>
        record.startDate
          ? `${displayDate(record.startDate)} — ${displayDate(record.endDate)}`
          : "—",
    },
    {
      dataIndex: "normWorkDays",
      title: t("payroll.fields.normWorkDays"),
      align: "center",
      width: 140,
    },
    {
      dataIndex: "normWorkHours",
      title: t("payroll.fields.normWorkHours"),
      align: "center",
      width: 150,
    },
    {
      dataIndex: "status",
      title: t("settings.fields.status"),
      align: "center",
      width: 140,
      render: (_, record) => (
        <Tag
          className="m-0!"
          color={record.status === "OPEN" ? "green" : "default"}
        >
          {t(`payroll.enums.periodStatus.${record.status}`, {
            defaultValue: record.statusName ?? record.status,
          })}
        </Tag>
      ),
    },
    {
      dataIndex: "closedDate",
      title: t("payroll.fields.closedDate"),
      align: "center",
      width: 150,
      render: (value: string | null) => (value ? displayDate(value) : "—"),
    },
  ];

  if (canManage) {
    columns.push({
      dataIndex: "actions",
      title: t("common.actions"),
      align: "center",
      width: 170,
      fixed: "right",
      render: (_, record) =>
        record.status === "OPEN" ? (
          <Button
            size="small"
            icon={<Lock className="size-3.5" />}
            loading={closeMutation.isPending}
            onClick={() => runAction(record, "close")}
          >
            {t("payroll.periods.close")}
          </Button>
        ) : (
          <Button
            size="small"
            icon={<LockOpen className="size-3.5" />}
            loading={reopenMutation.isPending}
            onClick={() => runAction(record, "reopen")}
          >
            {t("payroll.periods.reopen")}
          </Button>
        ),
    });
  }

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <Space>
            <SelectFilter
              paramKey="year"
              placeholder="payroll.fields.year"
              options={yearOptions}
              width={140}
            />
            <SelectFilter
              paramKey="status"
              placeholder="settings.fields.status"
              options={periodStatusOptions}
              width={160}
            />
          </Space>
        }
        actions={
          <PermissionCard permission={payrollPeriodPermissions.manage}>
            <Button
              type="primary"
              icon={<CalendarPlus className="size-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              {t("payroll.periods.create")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<PayrollPeriod>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={withRowNumbers(data?.items)}
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
          pagination={paginationProps(data?.total)}
          size="middle"
        />
      </Card>

      <PayrollPeriodModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
