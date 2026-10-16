import { Alert, InputNumber, Modal, Select, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

const editPermission = "FA_ASSET_UPDATE";
const endpoint = "fa-groups";
const queryKey = ["fa-groups", "settings"] as const;
// fixed assets only: intangible assets are amortized under art. 307, not by these groups
const fixedAssetKind = 1;

interface FaGroupRow {
  id: number;
  code: string;
  name: string;
  assetKindId: number;
  taxDepreciationGroupId?: number | null;
  taxDepreciationGroupCode?: string | null;
  taxMaxRate?: number | null;
  usefulLifeMonths?: number | null;
}

interface TaxGroup {
  id: number;
  code: string;
  name: string;
  maxRate: number;
}

interface Draft {
  id: number;
  title: string;
  taxDepreciationGroupId: number | null;
  usefulLifeMonths: number | null;
}

/**
 * Asset groups (1C «Группы ОС»): the Tax Code art. 306 depreciation group of each — the profit
 * tax return deducts depreciation up to its highest rate — and the useful life the
 * organization usually sets (NSBU 5), offered when an asset of the group is put into use.
 */
export default function FaGroupsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const canEdit = permissions.includes(editPermission);
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      $axiosPrivate
        .get<FaGroupRow[]>(endpoint, { params: { assetKindId: fixedAssetKind } })
        .then((response) => response.data),
  });
  const { data: taxGroups = [] } = useQuery({
    queryKey: ["fa-groups", "tax-groups"],
    queryFn: () => $axiosPrivate.get<TaxGroup[]>(`${endpoint}/tax-groups`).then((response) => response.data),
    staleTime: 10 * 60 * 1000,
  });

  const save = useMutation({
    mutationFn: (value: Draft) =>
      $axiosPrivate.put(`${endpoint}/${value.id}`, {
        taxDepreciationGroupId: value.taxDepreciationGroupId,
        usefulLifeMonths: value.usefulLifeMonths,
      }),
    onError: errorHandlers,
    onSuccess: () => {
      toast.success(t("faGroups.saved"));
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey });
      // the asset pickers offer the group's useful life
      void queryClient.invalidateQueries({ queryKey: ["selectlist"] });
    },
  });

  const years = (months?: number | null) =>
    months ? t("faGroups.years", { years: Math.round((months / 12) * 10) / 10 }) : "";

  const columns: TableColumnsType<FaGroupRow> = [
    { dataIndex: "code", title: t("faGroups.code"), width: 110, render: (value: string) => <b>{value}</b> },
    { dataIndex: "name", title: t("faGroups.name") },
    {
      dataIndex: "taxDepreciationGroupId",
      title: t("faGroups.taxGroup"),
      width: 360,
      render: (value: number | null | undefined, row) => {
        const group = taxGroups.find((item) => item.id === value);
        return group ? (
          <span>
            <Tag color="blue">{group.code}</Tag>
            {group.name}
          </span>
        ) : (
          <span className="text-secondary-text">{row.code === "0110" ? t("faGroups.notDepreciated") : "—"}</span>
        );
      },
    },
    {
      dataIndex: "taxMaxRate",
      title: t("faGroups.maxRate"),
      width: 130,
      align: "right",
      render: (value?: number | null) => (value ? `${value} %` : "—"),
    },
    {
      dataIndex: "usefulLifeMonths",
      title: t("faGroups.usefulLife"),
      width: 170,
      align: "right",
      render: (value?: number | null) =>
        value ? (
          <span>
            {value} <span className="text-xs text-secondary-text">({years(value)})</span>
          </span>
        ) : (
          "—"
        ),
    },
  ];

  const draftGroup = taxGroups.find((item) => item.id === draft?.taxDepreciationGroupId);
  // a life shorter than the tax rate allows depreciates faster than the tax deducts
  const fasterThanTax =
    draftGroup && draft?.usefulLifeMonths ? 1200 / draft.usefulLifeMonths > Number(draftGroup.maxRate) : false;

  return (
    <div className="w-full space-y-3">
      <ListToolbar refreshing={isFetching} onRefresh={() => void refetch()} />
      <Alert type="info" showIcon message={t("faGroups.hint")} />
      <Card className="overflow-hidden border border-border">
        <Table<FaGroupRow>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={false}
          onRow={(record) => ({
            className: canEdit ? "cursor-pointer" : undefined,
            onClick: () => {
              if (!canEdit) return;
              setDraft({
                id: record.id,
                title: `${record.code} — ${record.name}`,
                taxDepreciationGroupId: record.taxDepreciationGroupId ?? null,
                usefulLifeMonths: record.usefulLifeMonths ?? null,
              });
            },
          })}
        />
      </Card>

      <Modal
        open={!!draft}
        title={draft?.title}
        okText={t("faGroups.save")}
        confirmLoading={save.isPending}
        onOk={() => draft && save.mutate(draft)}
        onCancel={() => setDraft(null)}
        destroyOnHidden
      >
        {draft && (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm">{t("faGroups.taxGroup")}</span>
              <Select
                className="w-full"
                allowClear
                value={draft.taxDepreciationGroupId}
                placeholder={t("faGroups.taxGroupPlaceholder")}
                options={taxGroups.map((item) => ({
                  value: item.id,
                  label: `${item.code} — ${item.name} (${item.maxRate} %)`,
                }))}
                onChange={(value?: number) => setDraft({ ...draft, taxDepreciationGroupId: value ?? null })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm">{t("faGroups.usefulLife")}</span>
              <InputNumber
                className="w-full"
                min={1}
                max={1200}
                precision={0}
                value={draft.usefulLifeMonths}
                addonAfter={years(draft.usefulLifeMonths) || t("faGroups.months")}
                onChange={(value) => setDraft({ ...draft, usefulLifeMonths: value ?? null })}
              />
            </label>
            {draftGroup && (
              <div className="text-xs text-secondary-text">
                {t("faGroups.taxLife", { months: Math.ceil(1200 / Number(draftGroup.maxRate)) })}
              </div>
            )}
            {fasterThanTax && <Alert type="warning" showIcon message={t("faGroups.fasterThanTax")} />}
          </div>
        )}
      </Modal>
    </div>
  );
}
