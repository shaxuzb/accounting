import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import toast from "react-hot-toast";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { settingsBankPermissions } from "../constants/permissions";
import { useDetachBank, useGetOrganizationBanks } from "../hooks";
import type { SettingsBank } from "../types/type";
import BankPickerModal from "./BankPickerModal";

/**
 * The organization's banks, as 1C «Банки»: not typed in but picked from the common directory
 * (the Central Bank's register). A bank its bank accounts use is on the list by itself.
 */
export default function SettingsBankListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? undefined;
  const { data, refetch, isLoading, isFetching } =
    useGetOrganizationBanks(search);
  const detach = useDetachBank();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleDetach = (bank: SettingsBank) =>
    detach.mutate(bank.id, {
      onSuccess: () => toast.success(t("settings.orgBanks.detached")),
      onError: errorHandlers,
    });

  const columns: TableColumnsType<SettingsBank> = [
    {
      key: "index",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
      render: (_value, _record, index) => index + 1,
    },
    { dataIndex: "name", title: t("settings.fields.name"), minWidth: 260 },
    {
      dataIndex: "mfo",
      title: t("settings.fields.mfo"),
      width: 120,
      render: (value: string | null) => value || "-",
    },
    {
      dataIndex: "inn",
      title: t("settings.orgBanks.inn"),
      width: 130,
      render: (value: string | null) => value || "-",
    },
    {
      key: "used",
      width: 150,
      render: (_value, record) =>
        record.isUsed ? (
          <Tag color="blue">{t("settings.orgBanks.used")}</Tag>
        ) : null,
    },
    {
      dataIndex: "stateId",
      title: t("settings.fields.status"),
      align: "center",
      width: 120,
      render: (_value, record) => stateStatus(record.stateId, record.stateName),
    },
    {
      key: "actions",
      title: t("common.actions"),
      align: "center",
      width: 90,
      fixed: "right",
      render: (_value, record) =>
        record.isPicked && !record.isUsed ? (
          <PermissionCard permission={settingsBankPermissions.delete}>
            <Popconfirm
              title={t("settings.orgBanks.detachConfirm")}
              onConfirm={() => handleDetach(record)}
            >
              <Button
                type="text"
                danger
                title={t("settings.orgBanks.detach")}
                icon={<Trash2 className="size-4" />}
              />
            </Popconfirm>
          </PermissionCard>
        ) : null,
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => refetch()}
          />
          <PermissionCard permission={settingsBankPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsPickerOpen(true)}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        </Space>
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<SettingsBank>
          rowKey="id"
          loading={isLoading || isFetching || detach.isPending}
          columns={columns}
          scroll={{ x: "max-content", y: "calc(100vh - 350px)" }}
          dataSource={data ?? []}
          pagination={false}
          locale={{ emptyText: t("settings.orgBanks.empty") }}
        />
      </Card>

      <BankPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        attachedIds={(data ?? []).map((bank) => bank.id)}
      />
    </div>
  );
}
