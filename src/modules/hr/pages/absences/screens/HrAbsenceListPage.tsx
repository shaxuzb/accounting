import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import { hrAbsencePermissions } from "@/modules/hr/constants/permissions";
import { displayDate } from "@/modules/payroll/utils/format";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { App, Button, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { FilePlus2, Paperclip, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import HrAbsenceAttachmentsModal from "../components/HrAbsenceAttachmentsModal";
import HrAbsenceFormModal from "../components/HrAbsenceFormModal";
import { hrAbsenceEndpoints } from "../constants/endpoints";
import { useDeleteHrAbsence, useHrAbsences } from "../hooks";
import type { HrAbsence } from "../types/type";



export default function HrAbsenceListPage() {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } = useHrAbsences(searchParams);
  const deleteMutation = useDeleteHrAbsence();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [attachmentAbsenceId, setAttachmentAbsenceId] = useState<number | null>(
    null,
  );

  const canUpdate = permissions.includes(hrAbsencePermissions.update);
  const canDelete = permissions.includes(hrAbsencePermissions.delete);

  const handleDelete = (record: HrAbsence) => {
    modal.confirm({
      title: t("hr.absences.deleteTitle"),
      content: `${record.employeeName ?? record.employeeNumber ?? record.id}: ${displayDate(record.startDate)} - ${displayDate(record.endDate)}`,
      okText: t("common.delete"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(record.id);
          toast.success(t("hr.messages.absenceDeleted"));
        } catch (error) {
          errorHandlers(error);
        }
      },
    });
  };

  const columns: TableColumnsType<HrAbsence> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "docNumber",
      title: t("hr.fields.docNumber"),
      width: 160,
      align: "center",
      render: (value: string | null) => value ?? "-",
    },
    {
      dataIndex: "employeeName",
      title: t("hr.fields.employee"),
      render: (_, record) => (
        <div>
          <div className="font-medium text-text">
            {record.employeeName ?? "-"}
          </div>
        </div>
      ),
    },
    {
      dataIndex: "absenceTypeName",
      title: t("hr.fields.absenceType"),
      align: "center",
      render: (value: string | null, record) => (
        <Tag color="blue" className="m-0!">
          {value ?? record.absenceTypeCode ?? "-"}
        </Tag>
      ),
    },
    {
      dataIndex: "startDate",
      title: t("hr.fields.dateFrom"),
      align: "center",
      width: 130,
      render: displayDate,
    },
    {
      dataIndex: "endDate",
      title: t("hr.fields.dateTo"),
      align: "center",
      width: 130,
      render: displayDate,
    },
    {
      dataIndex: "calendarDays",
      title: t("hr.fields.calendarDays"),
      align: "center",
      width: 110,
      render: (value: number | null) => value ?? "-",
    },
    {
      dataIndex: "attachmentCount",
      title: t("hr.fields.attachments"),
      align: "center",
      width: 125,
      render: (value: number | null, record) =>
        value ? (
          <Tooltip title={t("hr.absences.viewDocuments")}>
            <Button
              type="link"
              className="inline-flex items-center gap-1"
              icon={<Paperclip className="size-4" />}
              onClick={() => setAttachmentAbsenceId(record.id)}
            >
              {value}
            </Button>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      dataIndex: "docDate",
      title: t("hr.fields.documentDate"),
      align: "center",
      width: 130,
      render: displayDate,
    },
    {
      dataIndex: "statusName",
      title: t("hr.fields.status"),
      align: "center",
      width: 140,
      render: (value: string | null, record) =>
        value || record.statusCode ? (
          <Tag className="m-0!">{value ?? record.statusCode}</Tag>
        ) : (
          "-"
        ),
    },
    {
      dataIndex: "note",
      title: t("hr.fields.note"),
      minWidth: 180,
      ellipsis: true,
      render: (value: string | null) => value ?? "-",
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
                  setEditId(record.id);
                  setIsFormOpen(true);
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
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <SelectFilter
              paramKey="absenceTypeId"
              placeholder="hr.fields.absenceType"
              path={hrAbsenceEndpoints.types}
              width={190}
            />
          </>
        }
        actions={
          <PermissionCard permission={hrAbsencePermissions.create}>
            <Button
              type="primary"
              icon={<FilePlus2 className="size-4" />}
              onClick={() => {
                setEditId(null);
                setIsFormOpen(true);
              }}
            >
              {t("hr.absences.create")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<HrAbsence>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={withRowNumbers(data?.items)}
          pagination={paginationProps(data?.total)}
          size="middle"
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
        />
      </Card>

      <HrAbsenceFormModal
        open={isFormOpen}
        id={editId}
        onClose={() => {
          setIsFormOpen(false);
          setEditId(null);
        }}
      />

      <HrAbsenceAttachmentsModal
        open={Boolean(attachmentAbsenceId)}
        absenceId={attachmentAbsenceId}
        onClose={() => setAttachmentAbsenceId(null)}
      />
    </div>
  );
}
