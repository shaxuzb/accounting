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
import ContractDetailModal from "./ContractDetailModal";

const toPositiveInteger = (value: string | null, fallback: number) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0
    ? numberValue
    : fallback;
};

export default function ContractListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const contractTypeId = pathname.startsWith("/main/sales/contracts") ? 2 : 1;
  const isSaleContract = contractTypeId === 2;
  const newParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("ContractTypeId", String(contractTypeId));
    return params;
  }, [contractTypeId, searchParams]);
  const { data, refetch, isLoading, isFetching } = useGetListContract(
    newParams,
    contractTypeId,
  );
  const currentPage = toPositiveInteger(
    searchParams.get("page"),
    data?.page ?? 1,
  );
  const pageSize = toPositiveInteger(
    searchParams.get("pageSize"),
    data?.pageSize ?? 20,
  );
  const tableData = generateKeyTable(data?.items ?? [], "id")?.map(
    (item, index) => ({
      ...item,
      indexId: (currentPage - 1) * pageSize + index + 1,
    }),
  );

  const handlePaginationChange = (page: number, nextPageSize: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPageSize === pageSize ? page : 1));
    nextParams.set("pageSize", String(nextPageSize));
    setSearchParams(nextParams, { replace: true });
  };
  const permissions = user?.user.permissions ?? [];
  const canViewDetail = permissions.includes(contractPermissions.detail);

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
      render: (value, record) =>
        canViewDetail ? (
          <Button
            type="link"
            className="h-auto! p-0!"
            onClick={() => setDetailId(record.id)}
          >
            {value || record.id}
          </Button>
        ) : (
          value || record.id
        ),
    },
    {
      title: t(
        isSaleContract
          ? "contract.fields.customerName"
          : "contract.fields.supplierName",
      ),
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
      render: (_, record) =>
        record.contractTypeName || record.contractType || "-",
    },
    {
      title: t("contract.fields.stateName"),
      dataIndex: "stateId",
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
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
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => refetch()}
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
        <Table
          loading={isLoading || isFetching}
          columns={columns}
          scroll={{
            x: "max-content",
            y: "calc(100vh - 230px)",
          }}
          dataSource={tableData}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} ta`,
            onChange: handlePaginationChange,
          }}
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
      <ContractDetailModal
        id={detailId}
        contractTypeId={contractTypeId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
