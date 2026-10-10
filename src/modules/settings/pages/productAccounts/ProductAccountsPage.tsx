import { Alert, Button, Modal, Popconfirm, Segmented, Select, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SelectCustom from "@/components/fields/SelectCustom";
import { $axiosPrivate } from "@/services/AxiosService";
import { chartAccountSelectDisplayConfig, selectListEndpoints } from "@/shared/constants/selectLists";
import {
  invalidateProductAccounts,
  productAccountEndpoints,
  productAccountQueryKeys,
  type ProductAccountRef,
  type ProductKind,
} from "@/shared/productAccounts";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

const editPermission = "DOCUMENT_ACCOUNT_SETTING_SAVE";

type Target = "organization" | "kind" | "group" | "product";

interface ProductAccountRow {
  id: number;
  productKindId?: number | null;
  productKindName?: string | null;
  productGroupId?: number | null;
  productGroupName?: string | null;
  productId?: number | null;
  productName?: string | null;
  stockAccount?: ProductAccountRef | null;
  incomeAccount?: ProductAccountRef | null;
  costAccount?: ProductAccountRef | null;
}

interface Overview {
  kinds: ProductKind[];
  rules: ProductAccountRow[];
}

interface Draft {
  id: number | null;
  target: Target;
  productKindId: number | null;
  productGroupId: number | null;
  productId: number | null;
  stockAccountId: number | null;
  incomeAccountId: number | null;
  costAccountId: number | null;
}

const emptyDraft = (): Draft => ({
  id: null,
  target: "kind",
  productKindId: null,
  productGroupId: null,
  productId: null,
  stockAccountId: null,
  incomeAccountId: null,
  costAccountId: null,
});

const toDraft = (row: ProductAccountRow): Draft => ({
  id: row.id,
  target: row.productId ? "product" : row.productGroupId ? "group" : row.productKindId ? "kind" : "organization",
  productKindId: row.productKindId ?? null,
  productGroupId: row.productGroupId ?? null,
  productId: row.productId ?? null,
  stockAccountId: row.stockAccount?.id ?? null,
  incomeAccountId: row.incomeAccount?.id ?? null,
  costAccountId: row.costAccount?.id ?? null,
});

const AccountCell = ({ account, fallback }: { account?: ProductAccountRef | null; fallback?: string }) =>
  account ? (
    <span>
      <b>{account.number}</b> <span className="text-secondary-text">{account.name}</span>
    </span>
  ) : (
    <span className="text-secondary-text">{fallback ?? "—"}</span>
  );

/**
 * Nomenclature accounts (1C «Счета учета номенклатуры»): which account keeps a product and
 * where its sale goes. The kind gives the standard accounts; a row here overrides them for the
 * whole organization, a kind, a group (with its subgroups) or one product — the most specific
 * row wins, account by account. Document lines take the result when the product is chosen.
 */
export default function ProductAccountsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: productAccountQueryKeys.overview,
    queryFn: () => $axiosPrivate.get<Overview>(productAccountEndpoints.root).then((response) => response.data),
  });
  const kinds = data?.kinds ?? [];
  const rules = data?.rules ?? [];

  const onSaved = () => {
    invalidateProductAccounts(queryClient);
    void queryClient.invalidateQueries({ queryKey: ["selectlist"] });
  };

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const body = {
        productKindId: value.target === "kind" ? value.productKindId : null,
        productGroupId: value.target === "group" ? value.productGroupId : null,
        productId: value.target === "product" ? value.productId : null,
        stockAccountId: value.stockAccountId,
        incomeAccountId: value.incomeAccountId,
        costAccountId: value.costAccountId,
      };
      if (value.id) await $axiosPrivate.put(productAccountEndpoints.byId(value.id), body);
      else await $axiosPrivate.post(productAccountEndpoints.root, body);
    },
    onError: errorHandlers,
    onSuccess: () => {
      toast.success(t("productAccounts.saved"));
      setDraft(null);
      onSaved();
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(productAccountEndpoints.byId(id)),
    onError: errorHandlers,
    onSuccess: () => {
      toast.success(t("productAccounts.deleted"));
      onSaved();
    },
  });

  const update = (patch: Partial<Draft>) => setDraft((current) => (current ? { ...current, ...patch } : current));
  const draftKind = kinds.find((kind) => kind.id === draft?.productKindId);
  const serviceOnly = draft?.target === "kind" && draftKind?.isService;

  const submit = () => {
    if (!draft) return;
    const objectMissing =
      (draft.target === "kind" && !draft.productKindId) ||
      (draft.target === "group" && !draft.productGroupId) ||
      (draft.target === "product" && !draft.productId);
    if (objectMissing) {
      toast.error(t("productAccounts.objectRequired"));
      return;
    }
    if (!draft.stockAccountId && !draft.incomeAccountId && !draft.costAccountId) {
      toast.error(t("productAccounts.accountRequired"));
      return;
    }
    save.mutate(serviceOnly ? { ...draft, stockAccountId: null, costAccountId: null } : draft);
  };

  const kindColumns: TableColumnsType<ProductKind> = [
    {
      dataIndex: "name",
      title: t("productAccounts.kind"),
      render: (value: string, row) => (
        <span>
          {value} {row.isService && <Tag>{t("productAccounts.service")}</Tag>}
        </span>
      ),
    },
    {
      key: "stock",
      title: t("productAccounts.stockAccount"),
      render: (_, row) =>
        row.isService ? (
          "—"
        ) : (
          <AccountCell
            account={row.stockAccount}
            fallback={
              row.stockAccountNumber
                ? t("productAccounts.notInChart", { number: row.stockAccountNumber })
                : t("productAccounts.fromDocumentSettings")
            }
          />
        ),
    },
    {
      key: "income",
      title: t("productAccounts.incomeAccount"),
      render: (_, row) => (
        <AccountCell
          account={row.incomeAccount}
          fallback={
            row.incomeAccountNumber
              ? t("productAccounts.notInChart", { number: row.incomeAccountNumber })
              : t("productAccounts.fromDocumentSettings")
          }
        />
      ),
    },
    {
      key: "cost",
      title: t("productAccounts.costAccount"),
      render: (_, row) =>
        row.isService ? (
          "—"
        ) : (
          <AccountCell
            account={row.costAccount}
            fallback={
              row.costAccountNumber
                ? t("productAccounts.notInChart", { number: row.costAccountNumber })
                : t("productAccounts.fromDocumentSettings")
            }
          />
        ),
    },
  ];

  const targetLabel = (row: ProductAccountRow) =>
    row.productId ? (
      <span>
        <Tag color="blue">{t("productAccounts.targets.product")}</Tag>
        {row.productName}
      </span>
    ) : row.productGroupId ? (
      <span>
        <Tag color="purple">{t("productAccounts.targets.group")}</Tag>
        {row.productGroupName}
      </span>
    ) : row.productKindId ? (
      <span>
        <Tag color="green">{t("productAccounts.targets.kind")}</Tag>
        {row.productKindName}
      </span>
    ) : (
      <Tag color="gold">{t("productAccounts.targets.organization")}</Tag>
    );

  const ruleColumns: TableColumnsType<ProductAccountRow> = [
    { key: "target", title: t("productAccounts.target"), render: (_, row) => targetLabel(row) },
    { key: "stock", title: t("productAccounts.stockAccount"), render: (_, row) => <AccountCell account={row.stockAccount} /> },
    { key: "income", title: t("productAccounts.incomeAccount"), render: (_, row) => <AccountCell account={row.incomeAccount} /> },
    { key: "cost", title: t("productAccounts.costAccount"), render: (_, row) => <AccountCell account={row.costAccount} /> },
    {
      key: "actions",
      width: 60,
      align: "center",
      render: (_, row) => (
        <PermissionCard permission={editPermission}>
          <Popconfirm
            title={t("productAccounts.deleteConfirm")}
            onConfirm={(event) => {
              event?.stopPropagation();
              remove.mutate(row.id);
            }}
            onCancel={(event) => event?.stopPropagation()}
          >
            <Button type="text" danger icon={<Trash className="size-4" />} onClick={(event) => event.stopPropagation()} />
          </Popconfirm>
        </PermissionCard>
      ),
    },
  ];

  const accountSelect = (label: string, field: "stockAccountId" | "incomeAccountId" | "costAccountId", hint: string) => (
    <div>
      <SelectCustom
        label={label}
        fieldName={`product-account-${field}`}
        path={selectListEndpoints.chartAccountsSelectList}
        displayConfig={chartAccountSelectDisplayConfig}
        value={draft?.[field] ?? null}
        search
        clearable
        onChange={(value) => update({ [field]: value ? Number(value) : null })}
      />
      <div className="-mt-2 mb-2 text-xs text-secondary-text">{hint}</div>
    </div>
  );

  return (
    <div className="w-full space-y-3">
      <ListToolbar
        actions={
          <PermissionCard permission={editPermission}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => setDraft(emptyDraft())}>
              {t("productAccounts.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Alert type="info" showIcon message={t("productAccounts.hint")} />

      <Card className="overflow-hidden border border-border">
        <div className="px-4 pt-3 font-medium">{t("productAccounts.kindsTitle")}</div>
        <Table<ProductKind>
          rowKey="id"
          size="small"
          loading={isLoading}
          columns={kindColumns}
          dataSource={kinds}
          pagination={false}
        />
      </Card>

      <Card className="overflow-hidden border border-border">
        <div className="px-4 pt-3 font-medium">{t("productAccounts.rulesTitle")}</div>
        <Table<ProductAccountRow>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={ruleColumns}
          dataSource={rules}
          pagination={false}
          locale={{ emptyText: t("productAccounts.empty") }}
          onRow={(record) => ({ className: "cursor-pointer", onClick: () => setDraft(toDraft(record)) })}
        />
      </Card>

      <Modal
        open={!!draft}
        title={draft?.id ? t("productAccounts.edit") : t("productAccounts.new")}
        okText={t("productAccounts.save")}
        confirmLoading={save.isPending}
        onOk={submit}
        onCancel={() => setDraft(null)}
        width={640}
        destroyOnHidden
      >
        {draft && (
          <div className="space-y-3">
            <div>
              <span className="mb-1 block text-sm">{t("productAccounts.target")}</span>
              <Segmented<Target>
                block
                value={draft.target}
                onChange={(target) => update({ target, productKindId: null, productGroupId: null, productId: null })}
                options={(["organization", "kind", "group", "product"] as Target[]).map((value) => ({
                  value,
                  label: t(`productAccounts.targets.${value}`),
                }))}
              />
            </div>
            {draft.target === "kind" && (
              <div>
                <span className="mb-1 block text-sm">{t("productAccounts.kind")} *</span>
                <Select
                  className="w-full"
                  value={draft.productKindId ?? undefined}
                  onChange={(productKindId: number) => update({ productKindId })}
                  options={kinds.map((kind) => ({ value: kind.id, label: kind.name }))}
                />
              </div>
            )}
            {draft.target === "group" && (
              <SelectCustom
                label="productAccounts.group"
                fieldName="product-account-group"
                path={selectListEndpoints.productGroupsSelectList}
                value={draft.productGroupId}
                search
                required
                onChange={(value) => update({ productGroupId: value ? Number(value) : null })}
              />
            )}
            {draft.target === "product" && (
              <SelectCustom
                label="productAccounts.product"
                fieldName="product-account-product"
                path={selectListEndpoints.productsSelectList}
                value={draft.productId}
                search
                required
                onChange={(value) => update({ productId: value ? Number(value) : null })}
              />
            )}
            {!serviceOnly &&
              accountSelect(t("productAccounts.stockAccount"), "stockAccountId", t("productAccounts.stockHint"))}
            {accountSelect(t("productAccounts.incomeAccount"), "incomeAccountId", t("productAccounts.incomeHint"))}
            {!serviceOnly &&
              accountSelect(t("productAccounts.costAccount"), "costAccountId", t("productAccounts.costHint"))}
            <div className="text-xs text-secondary-text">{t("productAccounts.formHint")}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
