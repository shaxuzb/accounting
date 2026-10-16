import { useState } from "react";
import { App, Button, Checkbox, Form, Input, InputNumber, Modal, Radio, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  priceTypePermissions,
  useDeletePriceType,
  usePriceTypes,
  useSavePriceType,
  type PriceType,
  type PriceTypeSave,
} from "./api";

const emptyType: PriceTypeSave = {
  name: "",
  currencyId: 1,
  priceIncludesVat: false,
  roundingPrecision: null,
  roundingUp: false,
  isDefault: false,
};

/**
 * 1C «Типы цен номенклатуры»: the organization's price lists. Each has its currency, whether its
 * prices hold VAT and how they are rounded; the default one prices a sale whose contract names none.
 */
export default function PriceTypeListPage() {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { data = [], isFetching } = usePriceTypes();
  const save = useSavePriceType();
  const remove = useDeletePriceType();
  const [editing, setEditing] = useState<{ id: number | null; values: PriceTypeSave } | null>(null);

  const open = (row?: PriceType) =>
    setEditing(
      row
        ? {
            id: row.id,
            values: {
              name: row.name,
              currencyId: row.currencyId,
              priceIncludesVat: row.priceIncludesVat,
              roundingPrecision: row.roundingPrecision ?? null,
              roundingUp: row.roundingUp,
              isDefault: row.isDefault,
            },
          }
        : { id: null, values: { ...emptyType, isDefault: data.length === 0 } },
    );

  const submit = async () => {
    if (!editing) return;
    try {
      await save.mutateAsync({ id: editing.id, body: editing.values });
      toast.success(t("priceType.saved"));
      setEditing(null);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const set = (patch: Partial<PriceTypeSave>) =>
    setEditing((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));

  const columns: TableColumnsType<PriceType> = [
    {
      dataIndex: "name",
      title: t("priceType.name"),
      render: (value: string, row) => (
        <span className="font-medium">
          {value} {row.isDefault && <Tag color="blue">{t("priceType.default")}</Tag>}
        </span>
      ),
    },
    { dataIndex: "currencyCode", title: t("priceType.currency"), width: 110 },
    {
      dataIndex: "priceIncludesVat",
      title: t("priceType.includesVat"),
      width: 150,
      render: (value: boolean) => (value ? t("priceType.yes") : t("priceType.no")),
    },
    {
      key: "rounding",
      title: t("priceType.rounding"),
      width: 220,
      render: (_, row) =>
        row.roundingPrecision
          ? t(row.roundingUp ? "priceType.roundingUpTo" : "priceType.roundingTo", { step: row.roundingPrecision })
          : "—",
    },
    {
      key: "actions",
      width: 100,
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <PermissionCard permission={priceTypePermissions.create}>
            <Button size="small" type="text" icon={<Pencil className="size-4" />} onClick={() => open(row)} />
          </PermissionCard>
          <PermissionCard permission={priceTypePermissions.delete}>
            <Button
              size="small"
              type="text"
              danger
              icon={<Trash2 className="size-4" />}
              onClick={() =>
                modal.confirm({
                  title: t("priceType.deleteConfirm", { name: row.name }),
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await remove.mutateAsync(row.id);
                    } catch (error) {
                      errorHandlers(error);
                    }
                  },
                })
              }
            />
          </PermissionCard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
        <div className="max-w-3xl text-sm text-secondary-text">{t("priceType.hint")}</div>
        <PermissionCard permission={priceTypePermissions.create}>
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => open()}>
            {t("priceType.new")}
          </Button>
        </PermissionCard>
      </Card>
      <Card className="overflow-hidden border border-border">
        <Table<PriceType>
          rowKey="id"
          size="middle"
          loading={isFetching}
          columns={columns}
          dataSource={data}
          pagination={false}
          locale={{ emptyText: t("priceType.empty") }}
        />
      </Card>

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? t("priceType.edit") : t("priceType.new")}
        okText={t("priceType.save")}
        confirmLoading={save.isPending}
        onOk={() => void submit()}
        onCancel={() => setEditing(null)}
        destroyOnHidden
      >
        {editing && (
          <Form layout="vertical" component={false}>
            <Form.Item label={t("priceType.name")} required>
              <Input
                autoFocus
                value={editing.values.name}
                placeholder={t("priceType.namePlaceholder")}
                onChange={(event) => set({ name: event.target.value })}
              />
            </Form.Item>
            <SelectCustom
              label="priceType.currency"
              fieldName="priceTypeCurrency"
              path={selectListEndpoints.currenciesSelectList}
              value={editing.values.currencyId}
              onChange={(value) => set({ currencyId: Number(value) || 1 })}
            />
            <Form.Item>
              <Checkbox
                checked={editing.values.priceIncludesVat}
                onChange={(event) => set({ priceIncludesVat: event.target.checked })}
              >
                {t("priceType.includesVat")}
              </Checkbox>
            </Form.Item>
            <Form.Item label={t("priceType.roundingStep")} extra={t("priceType.roundingHint")}>
              <InputNumber
                className="w-full!"
                min={0.01}
                value={editing.values.roundingPrecision ?? null}
                placeholder={t("priceType.noRounding")}
                onChange={(value) => set({ roundingPrecision: value ? Number(value) : null })}
              />
            </Form.Item>
            {Boolean(editing.values.roundingPrecision) && (
              <Form.Item>
                <Radio.Group
                  value={editing.values.roundingUp}
                  onChange={(event) => set({ roundingUp: event.target.value })}
                  options={[
                    { value: false, label: t("priceType.roundArithmetic") },
                    { value: true, label: t("priceType.roundUp") },
                  ]}
                />
              </Form.Item>
            )}
            <Form.Item extra={t("priceType.defaultHint")}>
              <Checkbox checked={editing.values.isDefault} onChange={(event) => set({ isDefault: event.target.checked })}>
                {t("priceType.isDefault")}
              </Checkbox>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
