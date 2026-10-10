import { Alert, Button, Input, Modal, Popconfirm, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

const editPermission = "CHART_ACCOUNT_VIEW";
const endpoint = "units";
const queryKey = ["units"] as const;

interface UnitRow {
  id: number;
  code: string;
  name: string;
  isShared: boolean;
  productCount: number;
}

interface Draft {
  id: number | null;
  code: string;
  name: string;
}

/**
 * Units of measure (1C «Классификатор единиц измерения»): the platform's shared units, which
 * no organization changes, and the organization's own — a bag, a block, a pallet. A unit
 * products are counted in is not removed.
 */
export default function UnitsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => $axiosPrivate.get<UnitRow[]>(endpoint).then((response) => response.data),
  });

  const onSaved = () => {
    void queryClient.invalidateQueries({ queryKey });
    // the unit pickers on products and documents
    void queryClient.invalidateQueries({ queryKey: ["selectlist"] });
  };

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const body = { code: value.code.trim(), name: value.name.trim() };
      if (value.id) await $axiosPrivate.put(`${endpoint}/${value.id}`, body);
      else await $axiosPrivate.post(endpoint, body);
    },
    onError: errorHandlers,
    onSuccess: () => {
      toast.success(t("units.saved"));
      setDraft(null);
      onSaved();
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${endpoint}/${id}`),
    onError: errorHandlers,
    onSuccess: () => {
      toast.success(t("units.deleted"));
      onSaved();
    },
  });

  const submit = () => {
    if (!draft) return;
    if (!draft.code.trim() || !draft.name.trim()) {
      toast.error(t("units.required"));
      return;
    }
    save.mutate(draft);
  };

  const columns: TableColumnsType<UnitRow> = [
    { dataIndex: "code", title: t("units.code"), width: 160, render: (value: string) => <b>{value}</b> },
    { dataIndex: "name", title: t("units.name") },
    {
      dataIndex: "isShared",
      title: t("units.owner"),
      width: 180,
      render: (value: boolean) =>
        value ? <Tag>{t("units.shared")}</Tag> : <Tag color="blue">{t("units.own")}</Tag>,
    },
    { dataIndex: "productCount", title: t("units.products"), width: 140, align: "right" },
    {
      key: "actions",
      width: 60,
      align: "center",
      render: (_, row) =>
        !row.isShared && row.productCount === 0 ? (
          <PermissionCard permission={editPermission}>
            <Popconfirm
              title={t("units.deleteConfirm")}
              onConfirm={(event) => {
                event?.stopPropagation();
                remove.mutate(row.id);
              }}
              onCancel={(event) => event?.stopPropagation()}
            >
              <Button type="text" danger icon={<Trash className="size-4" />} onClick={(event) => event.stopPropagation()} />
            </Popconfirm>
          </PermissionCard>
        ) : null,
    },
  ];

  return (
    <div className="w-full space-y-3">
      <ListToolbar
        actions={
          <PermissionCard permission={editPermission}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => setDraft({ id: null, code: "", name: "" })}>
              {t("units.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Alert type="info" showIcon message={t("units.hint")} />
      <Card className="overflow-hidden border border-border">
        <Table<UnitRow>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={false}
          onRow={(record) => ({
            className: record.isShared ? undefined : "cursor-pointer",
            onClick: () => {
              if (!record.isShared) setDraft({ id: record.id, code: record.code, name: record.name });
            },
          })}
        />
      </Card>

      <Modal
        open={!!draft}
        title={draft?.id ? t("units.edit") : t("units.new")}
        okText={t("units.save")}
        confirmLoading={save.isPending}
        onOk={submit}
        onCancel={() => setDraft(null)}
        destroyOnHidden
      >
        {draft && (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm">{t("units.code")} *</span>
              <Input
                value={draft.code}
                maxLength={20}
                placeholder={t("units.codePlaceholder")}
                onChange={(event) => setDraft({ ...draft, code: event.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm">{t("units.name")} *</span>
              <Input
                value={draft.name}
                maxLength={100}
                placeholder={t("units.namePlaceholder")}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
