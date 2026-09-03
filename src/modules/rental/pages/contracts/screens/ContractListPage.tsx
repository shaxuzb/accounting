import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import ListPagination from "@/components/ui/table/ListPagination";
import CardComponent from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { customDate2 } from "@/utils/utils";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import {
  isRentalDraft,
  rentalStatusOptions,
} from "@/modules/rental/shared/constants/statuses";
import { rentalContractPermissions } from "../constants/permissions";
import { useRentalContracts } from "../hooks";
import type { RentalContractListItem } from "../types/type";

const toPositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default function ContractListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useRentalContracts(searchParams);
  const current = toPositiveInteger(searchParams.get("page"), data?.page ?? 1);
  const pageSize = toPositiveInteger(
    searchParams.get("pageSize"),
    data?.pageSize ?? 50,
  );
  const rows = (data?.items ?? []).map((item, index) => ({
    ...item,
    indexId: (current - 1) * pageSize + index + 1,
  }));

  const onPageChange = (page: number, nextPageSize: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPageSize === pageSize ? page : 1));
    next.set("pageSize", String(nextPageSize));
    setSearchParams(next, { replace: true });
  };

  const columns: TableColumnsType<
    RentalContractListItem & { indexId: number }
  > = [
    {
      title: t("common.rowNumber"),
      dataIndex: "indexId",
      align: "center",
      width: 65,
    },
    {
      title: t("rental.fields.contractNumber"),
      dataIndex: "contractNumber",
      width: 160,
      render: (value, record) =>
        permissions.includes(rentalContractPermissions.detail) ? (
          <Link to={`/main/rentals/contracts/${record.id}`}>
            {value || record.id}
          </Link>
        ) : (
          value || record.id
        ),
    },
    { title: t("rental.fields.lessorFullName"), dataIndex: "lessorFullName" },
    {
      title: t("rental.fields.contractDate"),
      dataIndex: "contractDate",
      render: (value) => customDate2(value),
    },
    {
      title: t("rental.fields.period"),
      render: (_, record) =>
        `${customDate2(record.startDate)} — ${customDate2(record.endDate)}`,
    },
    {
      title: t("rental.fields.currency"),
      render: (_, record) => record.currencyCode || record.currencyId,
      align: "center",
    },
    {
      title: t("rental.fields.objectCount"),
      dataIndex: "objectCount",
      align: "center",
    },
    {
      title: t("common.status"),
      render: (_, record) => (
        <ProcessStatusBadge
          statusId={record.statusId}
          statusName={record.statusName}
        />
      ),
      align: "center",
    },
    {
      title: t("common.actions"),
      fixed: "right",
      width: 70,
      render: (_, record) => {
        const rowPermissions =
          isRentalDraft(record.statusId)
            ? permissions
            : permissions.filter(
                (permission) =>
                  permission !== rentalContractPermissions.update &&
                  permission !== rentalContractPermissions.delete,
              );
        return (
          <ActionColumn
            record={record}
            permissions={rowPermissions}
            refetch={refetch}
            deletePath="rental-contracts"
            customPath={`/main/rentals/contracts/edit/${record.id}`}
            permissionsCode={{
              editCode: rentalContractPermissions.update,
              deleteCode: rentalContractPermissions.delete,
            }}
          />
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <SelectFilter
              paramKey="statusId"
              placeholder="common.status"
              options={rentalStatusOptions}
              width={170}
            />
            <DateRangeFilter
              placeholderKeys={[
                "rental.fields.dateFrom",
                "rental.fields.dateTo",
              ]}
            />
          </>
        }
        actions={
          <PermissionCard permission={rentalContractPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate("/main/rentals/contracts/add")}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => refetch()}
        refreshing={isFetching}
      />
      <CardComponent className="overflow-hidden border border-border">
        <Table
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={rows}
          rowKey="id"
          scroll={{ x: "max-content", y: "calc(100vh - 270px)" }}
          pagination={false}
        />
        <ListPagination
          current={current}
          pageSize={pageSize}
          total={data?.total ?? 0}
          onChange={onPageChange}
        />
      </CardComponent>
    </div>
  );
}
