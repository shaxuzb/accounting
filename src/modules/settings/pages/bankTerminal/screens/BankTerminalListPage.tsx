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
import { bankTerminalPermissions } from "../constants/permissions";
import { useGetListBankTerminals } from "../hooks";
import type { BankTerminal } from "../types/type";
import BankTerminalAddEditPage from "./BankTerminalAddEditPage";

export default function BankTerminalListPage() {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const [searchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const { data, refetch, isLoading, isFetching } =
    useGetListBankTerminals(searchParams);

  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(bankTerminalPermissions.update) ||
    permissions.includes(bankTerminalPermissions.delete);

  const tableColumns: TableColumnsType<BankTerminal> = [
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
      dataIndex: "bankAccountName",
      title: t("settings.fields.bankAccount"),
      minWidth: 200,
      render: (_, record) =>
        record.bankAccountName ||
        record.bankAccountNumber ||
        record.bankAccount ||
        "—",
    },
    {
      dataIndex: "merchantId",
      title: t("settings.fields.merchantId"),
      minWidth: 160,
      render: (value: string | null) => value || "—",
    },
    {
      dataIndex: "externalTerminalId",
      title: t("settings.fields.externalTerminalId"),
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

  const columns: TableColumnType<BankTerminal>[] = hasActions
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
              deletePath="bank-terminals"
              record={record}
              permissions={permissions}
              permissionsCode={{
                editCode: bankTerminalPermissions.update,
                deleteCode: bankTerminalPermissions.delete,
              }}
              refetch={() => void refetch()}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsFormOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as BankTerminal)?.id ?? null),
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
        canCreate={permissions.includes(bankTerminalPermissions.create)}
        onCreate={() => setIsFormOpen(true)}
        onRefresh={() => void refetch()}
      />
      <SettingsTable<BankTerminal>
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={generateKeyTable(data?.items ?? [], "id")}
        scroll={{ x: "max-content" }}
      />
      <BankTerminalAddEditPage
        open={isFormOpen}
        onClose={closeForm}
        id={editId}
      />
    </div>
  );
}
