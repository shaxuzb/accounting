import { Alert, Button, DatePicker, Input, Modal, Radio, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import AccountSide from "../manual-entries/AccountSide";
import type { ManualEntrySubkonto } from "../manual-entries/types";
import { useDeferredExpenses, useSaveDeferredExpense } from "./hooks";
import { deferredExpenseMethods, type DeferredExpense } from "./types";

const money = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const createPermission = "MANUAL_ENTRY_CREATE";

interface Draft {
  itemId: number | null;
  name: string;
  method: number;
  term: [Dayjs, Dayjs] | null;
  expenseAccountId: number | null;
  expenseSubkontos: ManualEntrySubkonto[];
}

const emptyDraft = (): Draft => ({
  itemId: null,
  name: "",
  method: deferredExpenseMethods.byMonths,
  // the usual case: a year from this month on (insurance, a licence, a subscription)
  term: [dayjs().startOf("month"), dayjs().startOf("month").add(11, "month").endOf("month")],
  expenseAccountId: null,
  expenseSubkontos: [],
});

const toDraft = (row: DeferredExpense): Draft => ({
  itemId: row.itemId,
  name: row.name,
  method: row.recognitionMethod ?? deferredExpenseMethods.byMonths,
  term:
    row.startDate && row.endDate
      ? [dayjs(row.startDate), dayjs(row.endDate)]
      : emptyDraft().term,
  expenseAccountId: row.expenseAccountId ?? null,
  expenseSubkontos: row.expenseSubkontos ?? [],
});

/**
 * Deferred expenses (1C «Расходы будущих периодов»): what is kept on 31xx, by item, and how
 * the month close writes each off — evenly by months or by days to its expense account.
 */
export default function DeferredExpensesPage() {
  const { t } = useTranslation();
  const { data = [], isLoading, isFetching, refetch } = useDeferredExpenses();
  const save = useSaveDeferredExpense();
  const [draft, setDraft] = useState<Draft | null>(null);

  const update = (patch: Partial<Draft>) => setDraft((current) => (current ? { ...current, ...patch } : current));

  const submit = async () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.term || !draft.expenseAccountId) {
      toast.error(t("deferredExpenses.fillRequired"));
      return;
    }
    await save.mutateAsync({
      itemId: draft.itemId,
      body: {
        name: draft.name.trim(),
        recognitionMethod: draft.method,
        startDate: draft.term[0].format("YYYY-MM-DD"),
        endDate: draft.term[1].format("YYYY-MM-DD"),
        expenseAccountId: draft.expenseAccountId,
        expenseSubkontos: draft.expenseSubkontos,
      },
    });
    toast.success(t("deferredExpenses.saved"));
    setDraft(null);
  };

  const columns: TableColumnsType<DeferredExpense> = [
    { dataIndex: "name", title: t("deferredExpenses.name") },
    {
      dataIndex: "balance",
      title: t("deferredExpenses.balance"),
      align: "right",
      width: 160,
      render: (value: number) => money(value),
    },
    {
      key: "term",
      title: t("deferredExpenses.term"),
      width: 220,
      render: (_, row) =>
        row.hasSchedule ? (
          `${dayjs(row.startDate).format("DD.MM.YYYY")} — ${dayjs(row.endDate).format("DD.MM.YYYY")}`
        ) : (
          <Tag color="orange">{t("deferredExpenses.noSchedule")}</Tag>
        ),
    },
    {
      dataIndex: "recognitionMethod",
      title: t("deferredExpenses.method"),
      width: 150,
      render: (value?: number | null) =>
        value == null
          ? "—"
          : value === deferredExpenseMethods.byDays
            ? t("deferredExpenses.byDays")
            : t("deferredExpenses.byMonths"),
    },
    {
      key: "expense",
      title: t("deferredExpenses.expenseAccount"),
      render: (_, row) =>
        row.expenseAccountNumber ? (
          <div>
            <div>
              <b>{row.expenseAccountNumber}</b> {row.expenseAccountName}
            </div>
            {row.expenseSubkontos.length > 0 && (
              <div className="text-xs text-secondary-text">
                {row.expenseSubkontos.map((x) => x.displayValue).join(" · ")}
              </div>
            )}
          </div>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        actions={
          <PermissionCard permission={createPermission}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => setDraft(emptyDraft())}>
              {t("deferredExpenses.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Alert className="mb-3" type="info" showIcon message={t("deferredExpenses.hint")} />
      <Card className="overflow-hidden border border-border">
        <Table<DeferredExpense>
          rowKey="itemId"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          locale={{ emptyText: t("deferredExpenses.empty") }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => setDraft(toDraft(record)),
          })}
        />
      </Card>

      <Modal
        open={!!draft}
        title={draft?.itemId ? draft.name : t("deferredExpenses.new")}
        okText={t("deferredExpenses.save")}
        confirmLoading={save.isPending}
        onOk={() => void submit()}
        onCancel={() => setDraft(null)}
        width={640}
        destroyOnHidden
      >
        {draft && (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm">{t("deferredExpenses.name")} *</span>
              <Input
                value={draft.name}
                maxLength={300}
                placeholder={t("deferredExpenses.namePlaceholder")}
                onChange={(event) => update({ name: event.target.value })}
              />
            </label>
            <div>
              <span className="mb-1 block text-sm">{t("deferredExpenses.method")}</span>
              <Radio.Group
                value={draft.method}
                onChange={(event) => update({ method: Number(event.target.value) })}
                options={[
                  { value: deferredExpenseMethods.byMonths, label: t("deferredExpenses.byMonths") },
                  { value: deferredExpenseMethods.byDays, label: t("deferredExpenses.byDays") },
                ]}
              />
            </div>
            <div>
              <span className="mb-1 block text-sm">{t("deferredExpenses.term")} *</span>
              <DatePicker.RangePicker
                className="w-full"
                format="DD.MM.YYYY"
                value={draft.term}
                allowClear={false}
                onChange={(value) => {
                  if (value?.[0] && value[1]) update({ term: [value[0], value[1]] });
                }}
              />
            </div>
            <AccountSide
              label={t("deferredExpenses.expenseAccount")}
              accountId={draft.expenseAccountId}
              subkontos={draft.expenseSubkontos}
              onAccountChange={(accountId) => update({ expenseAccountId: accountId, expenseSubkontos: [] })}
              onSubkontosChange={(expenseSubkontos) => update({ expenseSubkontos })}
            />
            <div className="text-xs text-secondary-text">{t("deferredExpenses.formHint")}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
