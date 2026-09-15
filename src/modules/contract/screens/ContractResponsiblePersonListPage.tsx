import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ListPagination from "@/components/ui/table/ListPagination";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { useAppSelector } from "@/store/hooks";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { formatDate } from "@/utils/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { contractEndpoints } from "../constants/endpoints";
import { contractPermissions } from "../constants/permissions";
import { useGetListContractResponsiblePersons } from "../hooks/useGetListContractResponsiblePersons";
import type { ContractResponsiblePerson } from "../types/type";
import ContractResponsiblePersonAddEditModal from "./ContractResponsiblePersonAddEditModal";

const stateFilterOptions = [
  { value: 1, label: "contract.filters.active" },
  { value: 2, label: "contract.filters.inactive" },
] as const;

export default function ContractResponsiblePersonListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { queryParams, withRowNumbers, paginationProps } =
    usePaginationParams();
  const { data, isLoading, isFetching, refetch } =
    useGetListContractResponsiblePersons(queryParams);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ContractResponsiblePerson | null>(
    null,
  );

  const openCreate = () => {
    setEditRecord(null);
    setIsFormOpen(true);
  };

  const columns: TableColumnsType<ContractResponsiblePerson> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "fullName",
      title: t("contract.fields.responsiblePerson"),
    },
    {
      dataIndex: "createdDate",
      title: t("settings.fields.createdDate"),
      align: "center",
      width: 160,
      render: (value: string) => formatDate(value),
    },
    {
      dataIndex: "stateId",
      title: t("settings.fields.status"),
      align: "center",
      width: 130,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];

  const hasActions =
    permissions.includes(contractPermissions.update) ||
    permissions.includes(contractPermissions.delete);

  const tableColumns: TableColumnsType<ContractResponsiblePerson> = hasActions
    ? [
        ...columns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 100,
          fixed: "right" as const,
          render: (_: unknown, record: ContractResponsiblePerson) => (
            <ActionColumn
              deletePath={contractEndpoints.responsiblePerson.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: contractPermissions.delete,
                editCode: contractPermissions.update,
              }}
              refetch={() => void refetch()}
              onDeleteSuccess={() => {
                // Shartnoma formasidagi select ham shu ro'yxatdan to'ladi.
                queryClient.invalidateQueries({ queryKey: ["selectlist"] });
              }}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsFormOpen,
                setEditData: (value: unknown) =>
                  setEditRecord(
                    (value as ContractResponsiblePerson | null) ?? null,
                  ),
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
              paramKey="stateId"
              placeholder="settings.fields.status"
              options={stateFilterOptions}
              width={150}
            />
          </>
        }
        actions={
          <PermissionCard permission={contractPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={openCreate}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<ContractResponsiblePerson>
          loading={isLoading || isFetching}
          columns={tableColumns}
          dataSource={withRowNumbers(data?.items)}
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
          pagination={false}
          size="middle"
        />
        <ListPagination {...paginationProps(data?.total)} />
      </Card>

      <ContractResponsiblePersonAddEditModal
        open={isFormOpen}
        record={editRecord}
        onClose={() => {
          setIsFormOpen(false);
          setEditRecord(null);
        }}
      />
    </div>
  );
}
