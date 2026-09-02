import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import type { TableColumnType, TableColumnsType } from "antd";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { paymentAcceptancePointPermissions } from "../constants/permissions";
import { useGetListPaymentAcceptancePoints } from "../hooks";
import type { PaymentAcceptancePoint } from "../types/type";
import PaymentAcceptancePointAddEditPage from "./PaymentAcceptancePointAddEditPage";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import SettingsPageHeader from "@/modules/settings/shared/components/SettingsPageHeader";
import SettingsTable from "@/modules/settings/shared/components/SettingsTable";

export default function PaymentAcceptancePointListPage() {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const [searchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const { data, refetch, isLoading, isFetching, isError } =
    useGetListPaymentAcceptancePoints(searchParams);

  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(paymentAcceptancePointPermissions.update) ||
    permissions.includes(paymentAcceptancePointPermissions.delete);

  const tableColumns: TableColumnsType<PaymentAcceptancePoint> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "name",
      title: t("settings.fields.name"),
      minWidth: 180,
      render: (value: string | null) => value || "—",
    },
    {
      dataIndex: "typeName",
      title: t("settings.fields.paymentAcceptancePointType"),
      minWidth: 150,
      render: (_, record) => record.typeName || record.typeCode || "—",
    },
    {
      dataIndex: "bankAccountName",
      title: t("settings.fields.bankAccount"),
      minWidth: 200,
      render: (_, record) =>
        record.bankAccountName || record.bankAccountNumber || "—",
    },
    {
      dataIndex: "merchantId",
      title: t("settings.fields.merchantId"),
      minWidth: 160,
      render: (value: string | null) => value || "—",
    },
    {
      dataIndex: "externalId",
      title: t("settings.fields.externalId"),
      minWidth: 190,
      render: (value: string | null) => value || "—",
    },
    {
      dataIndex: "serialNumber",
      title: t("settings.fields.serialNumber"),
      minWidth: 160,
      render: (value: string | null) => value || "—",
    },
    {
      dataIndex: "stateId",
      title: t("settings.fields.status"),
      align: "center",
      width: 120,
      render: (_, record) =>
        record.stateId == null
          ? "—"
          : stateStatus(record.stateId, record.stateName ?? ""),
    },
  ];

  const columns: TableColumnType<PaymentAcceptancePoint>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 90,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="payment-acceptance-points"
              record={record}
              permissions={permissions}
              permissionsCode={{
                editCode: paymentAcceptancePointPermissions.update,
                deleteCode: paymentAcceptancePointPermissions.delete,
              }}
              refetch={() => void refetch()}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsFormOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as PaymentAcceptancePoint)?.id ?? null),
              }}
            />
          ),
        },
      ]
    : tableColumns;

  const closeForm = () => {
    setIsFormOpen(false);
    setEditId(null);
  };

  return (
    <div className="w-full">
      {isError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {t("error.title")}
        </div>
      )}
      <SettingsPageHeader
        search={<SearchFilter />}
        canCreate={permissions.includes(paymentAcceptancePointPermissions.create)}
        onCreate={() => setIsFormOpen(true)}
        onRefresh={() => void refetch()}
      />
      <SettingsTable<PaymentAcceptancePoint>
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={generateKeyTable(data?.items ?? [], "id")}
        scroll={{ x: "max-content" }}
      />
      <PaymentAcceptancePointAddEditPage
        open={isFormOpen}
        onClose={closeForm}
        id={editId}
      />
    </div>
  );
}
