import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { payrollDocumentPermissions } from "@/modules/payroll/constants/permissions";
import { payrollDocumentService } from "@/modules/payroll/pages/documents/services/payrollDocumentService";
import type { PayrollDocument } from "@/modules/payroll/pages/documents/types/type";
import VacationCreateModal from "@/modules/payroll/leave/VacationCreateModal";
import { money } from "@/modules/payroll/leave/api";

/** Annual leaves (1C «Отпуска»): the vacation documents, each a payroll document of one employee. */
export default function HrVacationListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["payroll-documents", "VACATION"],
    queryFn: () => payrollDocumentService.list({ documentKind: "VACATION", pageSize: 200 }),
  });

  const columns: TableColumnsType<PayrollDocument> = [
    { dataIndex: "docNumber", title: "№", width: 90 },
    {
      dataIndex: "docDate",
      title: t("payroll.leave.docDate"),
      width: 120,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    { dataIndex: "employeeName", title: t("payroll.fields.employee") },
    {
      key: "period",
      title: t("payroll.leave.period"),
      width: 220,
      render: (_: unknown, record) =>
        record.leaveStart
          ? `${dayjs(record.leaveStart).format("DD.MM.YYYY")} — ${dayjs(record.leaveEnd).format("DD.MM.YYYY")}`
          : "—",
    },
    {
      dataIndex: "grossAmount",
      title: t("payroll.leave.amount"),
      align: "right",
      width: 160,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "statusId",
      title: t("settings.fields.status"),
      align: "center",
      width: 140,
      render: (_: unknown, record) => <ProcessStatusBadge statusId={record.statusId ?? undefined} statusName={record.statusName ?? undefined} />,
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        actions={
          <PermissionCard permission={payrollDocumentPermissions.calculate}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
              {t("payroll.leave.newVacation")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<PayrollDocument>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data?.items ?? []}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`/main/payroll/documents/${record.id}`),
          })}
        />
      </Card>
      {creating && <VacationCreateModal open onClose={() => setCreating(false)} />}
    </div>
  );
}
