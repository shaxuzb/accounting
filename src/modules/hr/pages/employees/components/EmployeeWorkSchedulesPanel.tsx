import PermissionCard from "@/components/ui/card/PermissionCard";
import { hrEmployeePermissions } from "@/modules/hr/constants/permissions";
import { displayDate } from "@/modules/payroll/utils/format";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { App, Button, Empty, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDeleteHrWorkSchedule, useHrWorkSchedules } from "../hooks";
import type { HrWorkSchedule } from "../types/type";
import WorkScheduleModal from "./WorkScheduleModal";

interface Props {
  employeeId: string | number;
}

export default function EmployeeWorkSchedulesPanel({ employeeId }: Props) {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data = [], isLoading } = useHrWorkSchedules(employeeId);
  const deleteMutation = useDeleteHrWorkSchedule(employeeId);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<HrWorkSchedule | null>(
    null,
  );
  const canUpdate = permissions.includes(hrEmployeePermissions.update);
  const canDelete = permissions.includes(hrEmployeePermissions.delete);

  const closeModal = () => {
    setIsOpen(false);
    setActiveSchedule(null);
  };

  const handleDelete = (schedule: HrWorkSchedule) => {
    modal.confirm({
      title: t("hr.schedules.deleteTitle"),
      content: schedule.name,
      okText: t("common.delete"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(schedule.id);
          toast.success(t("hr.messages.scheduleDeleted"));
        } catch (error) {
          errorHandlers(error);
        }
      },
    });
  };

  const columns: TableColumnsType<HrWorkSchedule> = [
    {
      dataIndex: "name",
      title: t("hr.fields.scheduleName"),
      minWidth: 220,
      render: (value: string) => (
        <span className="font-medium text-text">{value}</span>
      ),
    },
    {
      dataIndex: "period",
      title: t("hr.fields.effectivePeriod"),
      align: "center",
      width: 210,
      render: (_, record) =>
        `${displayDate(record.effectiveFrom)} - ${
          record.effectiveTo
            ? displayDate(record.effectiveTo)
            : t("hr.fields.indefinite")
        }`,
    },
    {
      dataIndex: "days",
      title: t("hr.schedules.workDays"),
      minWidth: 260,
      render: (days: HrWorkSchedule["days"]) => (
        <div className="flex flex-wrap gap-1">
          {(days ?? []).map((day) => (
            <Tag key={day.dayOfWeek} className="m-0!">
              {t(`hr.weekDaysShort.${day.dayOfWeek}`)}: {day.workHours}{" "}
              {t("hr.units.hour")}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  if (canUpdate || canDelete) {
    columns.push({
      dataIndex: "actions",
      title: t("common.actions"),
      align: "center",
      fixed: "right",
      width: 92,
      render: (_, record) => (
        <div className="flex justify-center">
          {canUpdate && (
            <Tooltip title={t("common.edit")}>
              <Button
                type="text"
                icon={<Pencil className="size-4" />}
                onClick={() => {
                  setActiveSchedule(record);
                  setIsOpen(true);
                }}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title={t("common.delete")}>
              <Button
                type="text"
                danger
                icon={<Trash2 className="size-4" />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </div>
      ),
    });
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-secondary-text">
          {t("hr.schedules.description")}
        </p>
        <PermissionCard permission={hrEmployeePermissions.update}>
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setIsOpen(true)}
          >
            {t("hr.schedules.add")}
          </Button>
        </PermissionCard>
      </div>
      <Table<HrWorkSchedule>
        loading={isLoading}
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item.id }))}
        pagination={false}
        size="small"
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: <Empty description={t("hr.schedules.empty")} />,
        }}
      />
      <WorkScheduleModal
        open={isOpen}
        employeeId={employeeId}
        schedule={activeSchedule}
        onClose={closeModal}
      />
    </>
  );
}
