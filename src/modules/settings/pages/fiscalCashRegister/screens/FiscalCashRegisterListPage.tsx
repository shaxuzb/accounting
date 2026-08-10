import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import type { TableColumnType, TableColumnsType } from "antd";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import SettingsPageHeader from "../../../shared/components/SettingsPageHeader";
import SettingsTable from "../../../shared/components/SettingsTable";
import CrudActionColumn from "../../../shared/components/CrudActionColumn";
import { fiscalCashRegisterPermissions } from "../constants/permissions";
import { useGetListFiscalCashRegisters } from "../hooks";
import type { FiscalCashRegister } from "../types/type";
import FiscalCashRegisterAddEditPage from "./FiscalCashRegisterAddEditPage";

export default function FiscalCashRegisterListPage() {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const [searchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const { data, refetch, isLoading, isFetching } =
    useGetListFiscalCashRegisters(searchParams);

  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(fiscalCashRegisterPermissions.update) ||
    permissions.includes(fiscalCashRegisterPermissions.delete);

  const tableColumns: TableColumnsType<FiscalCashRegister> = [
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
      dataIndex: "warehouseName",
      title: t("settings.entities.warehouse"),
      minWidth: 170,
      render: (_, record) => record.warehouseName || record.warehouse || "—",
    },
    {
      dataIndex: "registerTypeName",
      title: t("settings.fields.registerType"),
      minWidth: 170,
      render: (_, record) =>
        record.registerTypeName || record.registerType || "—",
    },
    {
      dataIndex: "externalRegisterId",
      title: t("settings.fields.externalRegisterId"),
      minWidth: 180,
      render: (value: string | null) => value || "—",
    },
    {
      dataIndex: "model",
      title: t("settings.fields.model"),
      minWidth: 140,
      render: (value: string | null) => value || "—",
    },
    {
      dataIndex: "serialNumber",
      title: t("settings.fields.serialNumber"),
      minWidth: 160,
      render: (value: string | null) => value || "—",
    },
    {
      dataIndex: "fiscalModuleNumber",
      title: t("settings.fields.fiscalModuleNumber"),
      minWidth: 190,
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

  const columns: TableColumnType<FiscalCashRegister>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 90,
          fixed: "right",
          render: (_, record) => (
            <CrudActionColumn
              deletePath="fiscal-cash-registers"
              record={record}
              permissions={permissions}
              permissionsCode={{
                editCode: fiscalCashRegisterPermissions.update,
                deleteCode: fiscalCashRegisterPermissions.delete,
              }}
              refetch={() => void refetch()}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsFormOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as FiscalCashRegister)?.id ?? null),
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
      <SettingsPageHeader
        search={<SearchFilter />}
        canCreate={permissions.includes(fiscalCashRegisterPermissions.create)}
        onCreate={() => setIsFormOpen(true)}
        onRefresh={() => void refetch()}
      />
      <SettingsTable<FiscalCashRegister>
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={generateKeyTable(data?.items ?? [], "id")}
        scroll={{ x: "max-content" }}
      />
      <FiscalCashRegisterAddEditPage
        open={isFormOpen}
        onClose={closeForm}
        id={editId}
      />
    </div>
  );
}
