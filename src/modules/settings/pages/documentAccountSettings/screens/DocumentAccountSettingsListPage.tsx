import { Button, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import Card from "@/components/ui/card/Card";
import { useGetListDocumentAccountSettings } from "../hooks";
import type { DocumentAccountSettingsListItem } from "../types/type";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useTranslation } from "react-i18next";

export default function DocumentAccountSettingsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } =
    useGetListDocumentAccountSettings();

  const columns: TableColumnsType<DocumentAccountSettingsListItem> = [
    {
      title: t("common.rowNumber"),
      key: "index",
      width: 70,
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: t("settings.documentAccounts.documentType"),
      dataIndex: "documentTypeName",
      render: (value: string, record) => (
        <Button
          type="link"
          className="px-0! font-semibold"
          onClick={() =>
            navigate(
              `/main/settings/document-account-settings/${record.documentTypeId}`,
            )
          }
        >
          {value}
        </Button>
      ),
    },
    {
      title: t("settings.fields.code"),
      dataIndex: "documentTypeCode",
      width: 220,
    },
    {
      title: t("settings.fields.description"),
      dataIndex: "documentTypeDescription",
      render: (value?: string) => value || "—",
    },
    {
      title: t("settings.fields.status"),
      dataIndex: "stateName",
      width: 120,
      align: "center",
      render: (value?: string) =>
        value ? <Tag color="green">{value}</Tag> : <span>—</span>,
    },
    {
      title: t("common.actions"),
      key: "action",
      width: 110,
      align: "center",
      render: (_value, record) => (
        <Button
          icon={<Eye className="size-4" />}
          onClick={() =>
            navigate(
              `/main/settings/document-account-settings/${record.documentTypeId}`,
            )
          }
        >
          {t("common.view")}
        </Button>
      ),
    },
  ];

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
          >
            {t("common.refresh")}
          </Button>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<DocumentAccountSettingsListItem>
          rowKey="documentTypeId"
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={data?.items ?? []}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 350px)" }}
        />
      </Card>
    </div>
  );
}
