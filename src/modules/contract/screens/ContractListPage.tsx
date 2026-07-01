import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { useLocation, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { formatDate, generateKeyTable } from "@/utils/utils";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { stateStatus } from "@/utils/helpers/statusHelper";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useMemo, useState } from "react";
import ContractAddEditPage from "./ContractAddEditPage";
import { useGetListContract } from "../hooks/useGetListContract";
import type { Contract } from "../types/type";
import { contractPermissions } from "../constants/permissions";

export default function ContractListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const contractTypeId = pathname.startsWith("/main/sales/contracts") ? 2 : 1;
  const newParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("ContractTypeId", String(contractTypeId));
    return params;
  }, [contractTypeId, searchParams]);
  const { data, refetch, isLoading, isFetching } =
    useGetListContract(newParams,pathname);

  const tableColumns: TableColumnsType<Contract> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      title: t("contract.fields.contractNumber"),
      dataIndex: "contractNumber",
    },
    {
      title: t("contract.fields.counterpartyName"),
      dataIndex: "counterpartyName",
    },
    {
      title: t("contract.fields.contractDate"),
      dataIndex: "contractDate",
      align: "center",
      render: (value) => {
        return formatDate(value);
      },
    },
    {
      title: t("contract.fields.contractType"),
      dataIndex: "contractTypeName",
    },
    {
      title: t("contract.fields.stateName"),
      dataIndex: "stateId",
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(contractPermissions.update) ||
    permissions.includes(contractPermissions.delete);

  const columns: TableColumnType<Contract>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 100,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="contracts"
              customPath={`/main/settings/contracts/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: contractPermissions.delete,
                editCode: contractPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as Contract)?.id ?? null),
              }}
            />
          ),
        },
      ]
    : tableColumns;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
          <PermissionCard permission={contractPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsAddOpen(true)}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<Contract>
          loading={isLoading || isFetching}
          columns={columns}
          scroll={{
            x: "max-content",
            y: "calc(100vh - 350px)",
          }}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
        />
      </Card>
      <ContractAddEditPage
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditId(null);
        }}
        id={editId}
        contractTypeId={contractTypeId}
      />
    </div>
  );
}
