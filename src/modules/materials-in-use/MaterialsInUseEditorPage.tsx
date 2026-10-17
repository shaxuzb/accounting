import { Alert, Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Plus, Save, Send, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import AccountSide from "@/modules/accountings/pages/manual-entries/AccountSide";
import type { ManualEntrySubkonto } from "@/modules/accountings/pages/manual-entries/types";
import { getJson } from "@/modules/accountings/services/request";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  materialsInUseJournals,
  materialsInUseKinds,
  materialsInUsePermissions,
  materialsInUseStatus,
  money,
  useMaterialsInUse,
  useMaterialsInUseAction,
  useMaterialsInUseBalance,
  useMaterialsInUseDefaults,
  useSaveMaterialsInUse,
  type MaterialsInUse,
  type MaterialsInUseBalance,
  type MaterialsInUseKind,
  type MaterialsInUseLine,
  type MaterialsInUseSave,
} from "./api";
import { MaterialsInUseStatusTag } from "./MaterialsInUseListPage";

interface ProductOption {
  id: number;
  name: string;
  unitCode?: string | null;
  isPieceTracked?: boolean;
}
type ListShape<T> = T[] | { items?: T[]; results?: T[]; data?: T[] } | null | undefined;
const asList = <T,>(response: ListShape<T>): T[] =>
  Array.isArray(response) ? response : (response?.items ?? response?.results ?? response?.data ?? []);

type Row = Partial<MaterialsInUseLine> & { key: string; productId: number; quantity: number; amount: number; inUseAmount: number };

let seq = 0;
const newRow = (inUseAccountId?: number | null): Row => ({ key: `n${++seq}`, productId: 0, quantity: 1, amount: 0, inUseAmount: 0, inUseAccountId });

/** A batch in use: its account, item, transfer and person. */
const balanceKey = (x: { inUseAccountId?: number | null; accountId?: number; productId: number; sourceDocId?: number | null; employeeId?: number | null }) =>
  `${x.inUseAccountId ?? x.accountId}-${x.productId}-${x.sourceDocId}-${x.employeeId ?? 0}`;

export default function MaterialsInUseEditorPage({ kind }: { kind: MaterialsInUseKind }) {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useMaterialsInUse(id);
  if (id && (isLoading || !data)) return null;
  return <MaterialsInUseEditor key={`${id}-${data?.statusId ?? 0}`} kind={data?.kind ?? kind} id={id} data={data} />;
}

function MaterialsInUseEditor({ kind, id, data }: { kind: MaterialsInUseKind; id: number | null; data?: MaterialsInUse }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const config = materialsInUseJournals[kind];
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => permissions.includes(code);
  const save = useSaveMaterialsInUse();
  const action = useMaterialsInUseAction();
  const { data: defaults } = useMaterialsInUseDefaults();

  const statusId = data?.statusId ?? materialsInUseStatus.draft;
  const readOnly = statusId !== materialsInUseStatus.draft || !can(materialsInUsePermissions.create);
  const posted = statusId !== materialsInUseStatus.draft;
  const transfer = kind === materialsInUseKinds.transfer;
  const isReturn = kind === materialsInUseKinds.return;

  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [warehouseId, setWarehouseId] = useState<number | null>(data?.warehouseId ?? null);
  const [expenseAccountId, setExpenseAccountId] = useState<number | null>(data?.expenseAccountId ?? null);
  const [expenseSubkontos, setExpenseSubkontos] = useState<ManualEntrySubkonto[]>(data?.expenseSubkontos ?? []);
  const [incomeAccountId, setIncomeAccountId] = useState<number | null>(data?.incomeAccountId ?? null);
  const [incomeSubkontos, setIncomeSubkontos] = useState<ManualEntrySubkonto[]>(data?.incomeSubkontos ?? []);
  const [comment, setComment] = useState(data?.comment ?? "");
  const [rows, setRows] = useState<Row[]>(() =>
    data?.lines.length ? [...data.lines].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)).map((x) => ({ ...x, key: `l${x.id}` })) : [newRow()],
  );

  // a new transfer's rows start on 014.3 (inventory and household items), a new return takes 9390 «other operating income»
  const inventoryAccount = defaults?.inUseAccounts.find((x) => x.number === "014.3")?.id ?? null;
  useEffect(() => {
    if (readOnly || !defaults) return;
    if (transfer) setRows((current) => current.map((x) => (x.inUseAccountId ? x : { ...x, inUseAccountId: inventoryAccount })));
    if (isReturn && !incomeAccountId && defaults.incomeAccountId) {
      setIncomeAccountId(defaults.incomeAccountId);
      setIncomeSubkontos(defaults.incomeSubkontos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults]);

  // a transfer gives out what the warehouse holds; a write-off and a return take what is in use
  const { data: stock = [], isFetching: stockLoading } = useQuery({
    queryKey: ["materials-in-use", "stock", warehouseId],
    queryFn: async () =>
      asList(await getJson<ListShape<ProductOption>>(selectListEndpoints.productsSelectList, { isService: false, warehouseId, PageSize: 1000 })),
    enabled: !readOnly && transfer && Boolean(warehouseId),
    staleTime: 60 * 1000,
  });
  const stockOptions = stock
    .filter((x) => !x.isPieceTracked)
    .map((x) => ({ value: x.id, label: x.unitCode ? `${x.name} (${x.unitCode})` : x.name }));
  const { data: balance = [], isFetching: balanceLoading } = useMaterialsInUseBalance(
    docDate.add(1, "minute").format("YYYY-MM-DDTHH:mm:ss"),
    id,
    !readOnly && !transfer,
  );
  const balanceByKey = useMemo(() => new Map(balance.map((x) => [balanceKey(x), x])), [balance]);
  const balanceLabel = (x: MaterialsInUseBalance) =>
    [
      x.productName,
      `№${x.sourceDocNumber ?? x.sourceDocId}${x.sourceDocDate ? ` ${dayjs(x.sourceDocDate).format("DD.MM.YYYY")}` : ""}`,
      x.employeeName,
      `${x.accountNumber}: ${x.quantity} ${x.unitName ?? ""}`.trim(),
    ]
      .filter(Boolean)
      .join(" · ");
  const balanceOptions = balance.map((x) => ({ value: balanceKey(x), label: balanceLabel(x) }));
  const accountOptions = (defaults?.inUseAccounts ?? []).map((x) => ({ value: x.id, label: `${x.number} ${x.name}` }));

  // the line whose own expense account is being chosen
  const [expenseRow, setExpenseRow] = useState<{ key: string; accountId: number | null; subkontos: ManualEntrySubkonto[] } | null>(null);

  const updateRow = (key: string, patch: Partial<Row>) => setRows((current) => current.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const quantityInput = (row: Row) =>
    readOnly ? row.quantity : (
      <InputNumber<number> className="w-full!" min={0} value={row.quantity} onChange={(next) => updateRow(row.key, { quantity: Number(next ?? 0) })} />
    );

  const body = (): MaterialsInUseSave => ({
    kind,
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    warehouseId: kind === materialsInUseKinds.writeOff ? null : warehouseId,
    expenseAccountId: transfer ? expenseAccountId : null,
    expenseSubkontos: transfer ? expenseSubkontos : [],
    incomeAccountId: isReturn ? incomeAccountId : null,
    incomeSubkontos: isReturn ? incomeSubkontos : [],
    comment: comment || null,
    lines: rows
      .filter((x) => x.productId)
      .map((x) => ({
        productId: x.productId,
        quantity: x.quantity,
        employeeId: x.employeeId ?? null,
        inUseAccountId: x.inUseAccountId ?? null,
        sourceDocId: transfer ? null : (x.sourceDocId ?? null),
        amount: isReturn ? x.amount : null,
        expenseAccountId: transfer ? (x.expenseAccountId ?? null) : null,
        expenseSubkontos: transfer && x.expenseAccountId ? (x.expenseSubkontos ?? []) : [],
        comment: x.comment ?? null,
      })),
  });

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("materialsInUse.saved"));
    if (!id) navigate(`${config.path}/${savedId}`, { replace: true });
    return savedId;
  };
  const run = (work: () => Promise<unknown>) => () => void work().catch(errorHandlers);

  const removeColumn = readOnly
    ? []
    : [
        {
          title: "",
          key: "remove",
          width: 50,
          render: (_: unknown, row: Row) => (
            <Button type="text" icon={<X className="size-4" />} onClick={() => setRows((current) => current.filter((x) => x.key !== row.key))} />
          ),
        },
      ];

  const transferColumns: TableColumnsType<Row> = [
    {
      title: t("materialsInUse.product"),
      dataIndex: "productId",
      render: (value: number, row) =>
        readOnly ? (row.productName ?? "-") : (
          <Select className="w-full" showSearch optionFilterProp="label" loading={stockLoading} value={value || null} options={stockOptions}
            placeholder={t(warehouseId ? "materialsInUse.productPlaceholder" : "materialsInUse.warehouseFirst")}
            onChange={(next: number) => updateRow(row.key, { productId: next })} />
        ),
    },
    { title: t("materialsInUse.quantity"), dataIndex: "quantity", width: 120, render: (_: number, row) => quantityInput(row) },
    {
      title: t("materialsInUse.employee"),
      dataIndex: "employeeId",
      width: 260,
      render: (value: number | null | undefined, row) =>
        readOnly ? (row.employeeName ?? "-") : (
          <PayrollEmployeeSelect standalone label="" marginBottom="mb-0" value={value ?? null} onChange={(next) => updateRow(row.key, { employeeId: next })} />
        ),
    },
    {
      title: t("materialsInUse.inUseAccount"),
      dataIndex: "inUseAccountId",
      width: 260,
      render: (value: number | null | undefined, row) =>
        readOnly ? (row.inUseAccountNumber ?? "-") : (
          <Select className="w-full" value={value ?? null} options={accountOptions} onChange={(next: number) => updateRow(row.key, { inUseAccountId: next })} />
        ),
    },
    {
      // 1C «Способ отражения расходов» of the line: its own account, else the document's
      title: t("materialsInUse.lineExpense"),
      key: "expense",
      width: 170,
      render: (_: unknown, row: Row) => {
        const label = row.expenseAccountId
          ? [row.expenseAccountNumber, ...(row.expenseSubkontos ?? []).map((x) => x.displayValue)].filter(Boolean).join(" · ") ||
            t("materialsInUse.ownExpense")
          : t("materialsInUse.docExpense");
        return readOnly ? label : (
          <Button size="small" type={row.expenseAccountId ? "default" : "dashed"} className="max-w-full truncate"
            onClick={() => setExpenseRow({ key: row.key, accountId: row.expenseAccountId ?? null, subkontos: row.expenseSubkontos ?? [] })}>
            {label}
          </Button>
        );
      },
    },
    ...(posted
      ? [
          { title: t("materialsInUse.stockAccount"), dataIndex: "inventoryAccountNumber", width: 100 },
          { title: t("materialsInUse.amount"), dataIndex: "amount", width: 140, align: "right" as const, render: (value: number) => money(value) },
        ]
      : []),
    ...removeColumn,
  ];

  const fromUseColumns: TableColumnsType<Row> = [
    {
      title: t("materialsInUse.inUse"),
      key: "batch",
      render: (_: unknown, row) => {
        if (readOnly)
          return [
            row.productName,
            row.sourceDocNumber ? `№${row.sourceDocNumber}${row.sourceDocDate ? ` ${dayjs(row.sourceDocDate).format("DD.MM.YYYY")}` : ""}` : null,
            row.employeeName,
            row.inUseAccountNumber,
          ]
            .filter(Boolean)
            .join(" · ");
        const value = row.productId ? balanceKey(row) : null;
        return (
          <Select className="w-full" showSearch optionFilterProp="label" loading={balanceLoading} value={value}
            options={value && !balanceByKey.has(value) ? [...balanceOptions, { value, label: row.productName ?? String(row.productId) }] : balanceOptions}
            placeholder={t("materialsInUse.inUsePlaceholder")}
            onChange={(next: string) => {
              const chosen = balanceByKey.get(next);
              if (chosen)
                updateRow(row.key, {
                  productId: chosen.productId,
                  productName: chosen.productName,
                  sourceDocId: chosen.sourceDocId,
                  employeeId: chosen.employeeId ?? null,
                  inUseAccountId: chosen.accountId,
                  quantity: chosen.quantity,
                });
            }} />
        );
      },
    },
    { title: t("materialsInUse.quantity"), dataIndex: "quantity", width: 120, render: (_: number, row) => quantityInput(row) },
    ...(isReturn
      ? [
          {
            title: t("materialsInUse.realisableValue"),
            dataIndex: "amount",
            width: 170,
            align: "right" as const,
            render: (value: number, row: Row) =>
              readOnly ? money(value) : (
                <InputNumber<number> className="w-full!" min={0} value={value} onChange={(next) => updateRow(row.key, { amount: Number(next ?? 0) })} />
              ),
          },
        ]
      : []),
    ...(posted
      ? [
          ...(isReturn ? [{ title: t("materialsInUse.stockAccount"), dataIndex: "inventoryAccountNumber", width: 100 }] : []),
          { title: t("materialsInUse.inUseAmount"), dataIndex: "inUseAmount", width: 150, align: "right" as const, render: (value: number) => money(value) },
        ]
      : []),
    ...removeColumn,
  ];

  const field = (label: string, node: React.ReactNode, className = "min-w-56 flex-1") => (
    <div className={className}>
      <div className="mb-1 text-sm text-secondary-text">{label}</div>
      {node}
    </div>
  );

  return (
    <div className="w-full space-y-3">
      <Card className="space-y-4 border border-border p-4">
        <div className="flex flex-wrap items-end gap-4">
          {field("№", <Space><b>{data?.docNumber ?? t("materialsInUse.newNumber")}</b><MaterialsInUseStatusTag statusId={statusId} /></Space>, "")}
          {field(
            t("materialsInUse.date"),
            <DatePicker showTime={{ format: "HH:mm" }} format="DD.MM.YYYY HH:mm" value={docDate} allowClear={false} disabled={readOnly}
              onChange={(value) => value && setDocDate(value)} />,
            "",
          )}
          {kind !== materialsInUseKinds.writeOff && (
            <div className="min-w-64 flex-1">
              <SelectCustom label="materialsInUse.warehouse" path={selectListEndpoints.warehousesSelectList} marginBottom="mb-0!"
                value={warehouseId} disabled={readOnly} onChange={(value) => setWarehouseId((value as number | null) ?? null)} />
            </div>
          )}
        </div>

        {transfer && (
          <Form layout="vertical" component={false}>
          <div className="max-w-3xl">
            <AccountSide label={t("materialsInUse.expenseAccount")} accountId={expenseAccountId} subkontos={expenseSubkontos} disabled={readOnly}
              onAccountChange={(accountId) => {
                setExpenseAccountId(accountId);
                setExpenseSubkontos([]);
              }}
              onSubkontosChange={setExpenseSubkontos} />
          </div>
          </Form>
        )}
        {isReturn && (
          <Form layout="vertical" component={false}>
          <div className="max-w-3xl">
            <AccountSide label={t("materialsInUse.incomeAccount")} accountId={incomeAccountId} subkontos={incomeSubkontos} disabled={readOnly}
              onAccountChange={(accountId) => {
                setIncomeAccountId(accountId);
                setIncomeSubkontos([]);
              }}
              onSubkontosChange={setIncomeSubkontos} />
          </div>
          </Form>
        )}

        {field(t("materialsInUse.comment"), <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />, "")}

        <Space wrap>
          {!readOnly && (
            <Button icon={<Save className="size-4" />} loading={save.isPending} onClick={run(saveDraft)}>
              {t("materialsInUse.saveDraft")}
            </Button>
          )}
          {statusId === materialsInUseStatus.draft && can(materialsInUsePermissions.confirm) && (
            <Button type="primary" icon={<Send className="size-4" />} loading={save.isPending || action.isPending}
              onClick={run(async () => {
                const savedId = await saveDraft();
                await action.mutateAsync({ id: savedId, action: "confirm" });
                toast.success(t("materialsInUse.posted"));
              })}>
              {t("materialsInUse.post")}
            </Button>
          )}
          {id && statusId !== materialsInUseStatus.posted && can(materialsInUsePermissions.delete) && (
            <Popconfirm title={t("materialsInUse.deleteConfirm")} okButtonProps={{ danger: true }}
              onConfirm={run(() => action.mutateAsync({ id, action: "delete" }).then(() => navigate(config.path, { replace: true })))}>
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
          {id && statusId === materialsInUseStatus.posted && can(materialsInUsePermissions.cancel) && (
            <Popconfirm title={t("materialsInUse.cancelConfirm")} okButtonProps={{ danger: true }}
              onConfirm={run(() => action.mutateAsync({ id, action: "cancel" }).then(() => toast.success(t("materialsInUse.cancelled"))))}>
              <Button danger icon={<Ban className="size-4" />}>{t("materialsInUse.cancel")}</Button>
            </Popconfirm>
          )}
          {id && (
            <AccountingEntriesButton documentId={id} documentTypeId={49} statusId={statusId}>
              {t("materialsInUse.entries")}
            </AccountingEntriesButton>
          )}
        </Space>
      </Card>

      {!readOnly && <Alert showIcon type="info" message={t(config.hintKey)} />}

      <Card className="overflow-hidden border border-border">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="font-semibold">{t("materialsInUse.lines")}</span>
          {!readOnly && (
            <Button size="small" icon={<Plus className="size-4" />} onClick={() => setRows((current) => [...current, newRow(transfer ? inventoryAccount : null)])}>
              {t("materialsInUse.addLine")}
            </Button>
          )}
        </div>
        <Table<Row> rowKey="key" size="middle" columns={transfer ? transferColumns : fromUseColumns} dataSource={rows} pagination={false} />
      </Card>

      <Modal open={Boolean(expenseRow)} title={t("materialsInUse.lineExpense")} okText={t("materialsInUse.apply")}
        onCancel={() => setExpenseRow(null)}
        onOk={() => {
          if (expenseRow)
            updateRow(expenseRow.key, {
              expenseAccountId: expenseRow.accountId,
              expenseAccountNumber: null,
              expenseSubkontos: expenseRow.accountId ? expenseRow.subkontos : [],
            });
          setExpenseRow(null);
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <Space>
            <Button onClick={() => setExpenseRow((current) => (current ? { ...current, accountId: null, subkontos: [] } : current))}>
              {t("materialsInUse.useDocExpense")}
            </Button>
            <CancelBtn />
            <OkBtn />
          </Space>
        )}>
        <div className="mb-3 text-sm text-secondary-text">{t("materialsInUse.lineExpenseHint")}</div>
        {expenseRow && (
          <Form layout="vertical" component={false}>
            <AccountSide label={t("materialsInUse.expenseAccount")} accountId={expenseRow.accountId} subkontos={expenseRow.subkontos}
              onAccountChange={(accountId) => setExpenseRow({ ...expenseRow, accountId, subkontos: [] })}
              onSubkontosChange={(subkontos) => setExpenseRow({ ...expenseRow, subkontos })} />
          </Form>
        )}
      </Modal>
    </div>
  );
}
