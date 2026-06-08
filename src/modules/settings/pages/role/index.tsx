import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Input, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { Role } from "../../types/settings";
import { useGetListRole } from "../../hooks/role/useGetListRole";

export default function RoleListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const { data, isLoading } = useGetListRole({ search: debounced });

  const columns: TableColumnsType<Role> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: t("common.name", "Name"), dataIndex: "name", key: "name" },
    {
      title: t("common.actions", "Actions"),
      key: "actions",
      width: 120,
      render: (_, record) => <Link to={`${record.id}`}>{t("common.view", "View")}</Link>,
    },
  ];

  return (
    <Card
      title="Role"
      extra={
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate("add")}>
          {t("common.add", "Add")}
        </Button>
      }
    >
      <Input.Search
        className="mb-4 max-w-xs"
        placeholder={t("common.search", "Search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
      />
      <Table<Role>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.items ?? []}
        pagination={{ total: data?.total ?? 0, showSizeChanger: true }}
      />
    </Card>
  );
}
