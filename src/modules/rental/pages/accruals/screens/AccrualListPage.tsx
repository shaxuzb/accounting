import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import ListPagination from "@/components/ui/table/ListPagination";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { customDate2 } from "@/utils/utils";
import { numberSpacing } from "@/utils/utils";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import {
  isRentalDraft,
  rentalStatusOptions,
} from "@/modules/rental/shared/constants/statuses";
import { rentalAccrualPermissions } from "../constants/permissions";
import { useGenerateRentalAccruals, useRentalAccruals } from "../hooks";
import type { RentalAccrualListItem } from "../types/type";
import GenerateDueModal from "../components/GenerateDueModal";
import ContractFilter from "../components/ContractFilter";
import { formatRentalLessors } from "../../contracts/utils/lessor";
import type { RentalGenerateDuePayload } from "../types/type";

const toPositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default function AccrualListPage() {
  const { t } = useTranslation();
  const [isGenerateOpen, setGenerateOpen] = useState(false);
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } =
    useRentalAccruals(searchParams);
  const generateMutation = useGenerateRentalAccruals();
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
  const generateDue = async (payload: RentalGenerateDuePayload) => {
    try {
      const result = await generateMutation.mutateAsync(payload);
      toast.success(
        t("rental.messages.generated", { count: result.createdDocumentCount }),
      );
      setGenerateOpen(false);
      await refetch();
    } catch (error) {
      errorHandlers(error);
      setGenerateOpen(false);
    }
  };
  const columns: TableColumnsType<RentalAccrualListItem & { indexId: number }> =
    [
      {
        title: t("common.rowNumber"),
        dataIndex: "indexId",
        align: "center",
        width: 65,
      },
      {
        title: t("rental.fields.docNumber"),
        dataIndex: "docNumber",
        width: 130,
        render: (value, record) =>
          permissions.includes(rentalAccrualPermissions.detail) ? (
            <Link to={`/main/rentals/accruals/${record.id}`}>
              {value || record.id}
            </Link>
          ) : (
            value || record.id
          ),
      },
      { title: t("rental.fields.contractNumber"), dataIndex: "contractNumber" },
      {
        title: t("rental.fields.lessors"),
        render: (_, record) => formatRentalLessors(record.lessors),
      },
      {
        title: t("rental.fields.docDate"),
        dataIndex: "docDate",
        render: (value) => customDate2(value),
      },
      {
        title: t("rental.fields.taxAmount"),
        dataIndex: "taxAmount",
        align: "right",
        render: (value) => numberSpacing(value, " ", true),
      },
      {
        title: t("rental.fields.payableAmount"),
        dataIndex: "payableAmount",
        align: "right",
        render: (value) => numberSpacing(value, " ", true),
      },
      {
        title: t("rental.fields.amount"),
        dataIndex: "amount",
        align: "right",
        render: (value) => numberSpacing(value, " ", true),
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
                    permission !== rentalAccrualPermissions.update &&
                    permission !== rentalAccrualPermissions.delete,
                );
          return (
            <ActionColumn
              record={record}
              permissions={rowPermissions}
              refetch={refetch}
              deletePath="rental-accrual-docs"
              customPath={`/main/rentals/accruals/edit/${record.id}`}
              permissionsCode={{
                editCode: rentalAccrualPermissions.update,
                deleteCode: rentalAccrualPermissions.delete,
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
            <ContractFilter />
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
          <PermissionCard permission={rentalAccrualPermissions.generate}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setGenerateOpen(true)}
            >
              {t("rental.actions.generate")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => refetch()}
        refreshing={isFetching}
      />
      <Card className="overflow-hidden border border-border">
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
      </Card>
      <GenerateDueModal
        open={isGenerateOpen}
        loading={generateMutation.isPending}
        onClose={() => setGenerateOpen(false)}
        onSubmit={generateDue}
      />
    </div>
  );
}
