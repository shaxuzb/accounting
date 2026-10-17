import { Alert, Button, DatePicker, Input, InputNumber, Popconfirm, Radio, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Plus, Save, Send, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import { getJson } from "@/modules/accountings/services/request";
import { chartAccountOptionLabel, selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  conversionJournals,
  conversionKinds,
  conversionPermissions,
  conversionStatus,
  direction,
  money,
  useConversion,
  useConversionAction,
  useSaveConversion,
  useStockAccounts,
  type Conversion,
  type ConversionJournal,
  type ConversionKind,
  type ConversionSave,
} from "./api";
import { ConversionStatusTag } from "./ConversionListPage";

interface ProductOption {
  id: number;
  name: string;
  unitCode?: string | null;
  isPieceTracked?: boolean;
}
type ListShape<T> = T[] | { items?: T[]; results?: T[]; data?: T[] } | null | undefined;
const asList = <T,>(response: ListShape<T>): T[] =>
  Array.isArray(response) ? response : (response?.items ?? response?.results ?? response?.data ?? []);

/** A row of the form: a component, a pair (out → in) or an item moved to another account. */
interface Row {
  key: string;
  productId: number;
  quantity: number;
  costShare?: number | null;
  inProductId?: number;
  inQuantity?: number;
  accountId?: number | null;
  // what the posting gave
  outAmount?: number;
  inAmount?: number;
  outAccount?: string | null;
  inAccount?: string | null;
  productName?: string | null;
  inProductName?: string | null;
}

let seq = 0;
const newRow = (): Row => ({ key: `n${++seq}`, productId: 0, quantity: 1, inQuantity: 1 });

export default function ConversionEditorPage({ journal }: { journal: ConversionJournal }) {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useConversion(id);
  if (id && (isLoading || !data)) return null;
  return <ConversionEditor key={`${id}-${data?.statusId ?? 0}`} journal={journal} id={id} data={data} />;
}

/** The set (assembly, disassembly) and its rows from the saved lines. */
function fromLines(data?: Conversion) {
  if (!data) return { head: null as Row | null, rows: [] as Row[] };
  const lines = [...data.lines].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  if (data.kind === conversionKinds.assembly || data.kind === conversionKinds.disassembly) {
    const headDirection = data.kind === conversionKinds.assembly ? direction.in : direction.out;
    const head = lines.find((x) => x.directionId === headDirection);
    return {
      head: head
        ? {
            key: `h${head.id}`,
            productId: head.productId,
            productName: head.productName,
            quantity: head.quantity,
            accountId: head.inventoryAccountId,
            inAmount: head.amount,
            outAmount: head.amount,
            inAccount: head.inventoryAccountNumber,
          }
        : null,
      rows: lines
        .filter((x) => x.directionId !== headDirection)
        .map((x) => ({
          key: `l${x.id}`,
          productId: x.productId,
          productName: x.productName,
          quantity: x.quantity,
          costShare: x.costShare,
          outAmount: x.amount,
          inAmount: x.amount,
          outAccount: x.inventoryAccountNumber,
          inAccount: x.inventoryAccountNumber,
        })),
    };
  }
  const pairs = [...new Set(lines.map((x) => x.pairNo))].sort((a, b) => a - b);
  return {
    head: null,
    rows: pairs.map((pairNo) => {
      const out = lines.find((x) => x.pairNo === pairNo && x.directionId === direction.out);
      const into = lines.find((x) => x.pairNo === pairNo && x.directionId === direction.in);
      return {
        key: `p${pairNo}`,
        productId: out?.productId ?? 0,
        productName: out?.productName,
        quantity: out?.quantity ?? 0,
        inProductId: into?.productId,
        inProductName: into?.productName,
        inQuantity: into?.quantity,
        accountId: into?.inventoryAccountId,
        outAmount: out?.amount,
        inAmount: into?.amount,
        outAccount: out?.inventoryAccountNumber,
        inAccount: into?.inventoryAccountNumber,
      };
    }),
  };
}

function ConversionEditor({ journal, id, data }: { journal: ConversionJournal; id: number | null; data?: Conversion }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const config = conversionJournals[journal];
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => permissions.includes(code);
  const save = useSaveConversion();
  const action = useConversionAction();
  const { data: stockAccounts = [] } = useStockAccounts();

  const statusId = data?.statusId ?? conversionStatus.draft;
  const readOnly = statusId !== conversionStatus.draft || !can(conversionPermissions.create);
  const initial = useMemo(() => fromLines(data), [data]);

  const [kind, setKind] = useState<ConversionKind>(data?.kind ?? config.kinds[0]);
  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [warehouseId, setWarehouseId] = useState<number | null>(data?.warehouseId ?? null);
  const [comment, setComment] = useState(data?.comment ?? "");
  const [head, setHead] = useState<Row>(initial.head ?? newRow());
  const [rows, setRows] = useState<Row[]>(initial.rows.length ? initial.rows : [newRow()]);
  const isSet = kind === conversionKinds.assembly || kind === conversionKinds.disassembly;

  // what the warehouse holds (to give out) and every good (to take in)
  const { data: stock = [], isFetching: stockLoading } = useQuery({
    queryKey: ["conversions", "stock", warehouseId],
    queryFn: async () =>
      asList(await getJson<ListShape<ProductOption>>(selectListEndpoints.productsSelectList, { isService: false, warehouseId, PageSize: 1000 })),
    enabled: !readOnly && Boolean(warehouseId),
    staleTime: 60 * 1000,
  });
  const { data: goods = [], isFetching: goodsLoading } = useQuery({
    queryKey: ["conversions", "goods"],
    queryFn: async () => asList(await getJson<ListShape<ProductOption>>(selectListEndpoints.productsSelectList, { isService: false, PageSize: 1000 })),
    enabled: !readOnly,
    staleTime: 60 * 1000,
  });
  const options = (list: ProductOption[]) =>
    list.filter((x) => !x.isPieceTracked).map((x) => ({ value: x.id, label: x.unitCode ? `${x.name} (${x.unitCode})` : x.name }));
  const stockOptions = options(stock);
  const goodsOptions = options(goods);
  const accountOptions = stockAccounts.map((x) => ({ value: x.id, label: chartAccountOptionLabel(x) }));

  const updateRow = (key: string, patch: Partial<Row>) => setRows((current) => current.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  const productSelect = (value: number | undefined, outgoing: boolean, onChange: (value: number) => void, name?: string | null) =>
    readOnly ? (
      (name ?? "-")
    ) : (
      <Select
        className="w-full"
        showSearch
        optionFilterProp="label"
        loading={outgoing ? stockLoading : goodsLoading}
        placeholder={t(outgoing && !warehouseId ? "conversion.warehouseFirst" : "conversion.productPlaceholder")}
        value={value || null}
        options={outgoing ? stockOptions : goodsOptions}
        onChange={onChange}
      />
    );
  const quantityInput = (value: number | undefined, onChange: (value: number) => void) =>
    readOnly ? value : <InputNumber<number> className="w-full!" min={0} value={value} onChange={(next) => onChange(Number(next ?? 0))} />;

  const body = (): ConversionSave => {
    const lines: ConversionSave["lines"] = [];
    if (isSet) {
      const assembly = kind === conversionKinds.assembly;
      lines.push({
        directionId: assembly ? direction.in : direction.out,
        pairNo: 0,
        productId: head.productId,
        quantity: head.quantity,
        costShare: null,
        inventoryAccountId: assembly ? (head.accountId ?? null) : null,
      });
      for (const row of rows.filter((x) => x.productId))
        lines.push({
          directionId: assembly ? direction.out : direction.in,
          pairNo: 0,
          productId: row.productId,
          quantity: row.quantity,
          costShare: assembly ? null : (row.costShare ?? null),
          inventoryAccountId: null,
        });
    } else
      rows
        .filter((x) => x.productId)
        .forEach((row, index) => {
          const transfer = kind === conversionKinds.accountTransfer;
          lines.push({ directionId: direction.out, pairNo: index + 1, productId: row.productId, quantity: row.quantity, costShare: null, inventoryAccountId: null });
          lines.push({
            directionId: direction.in,
            pairNo: index + 1,
            productId: transfer ? row.productId : (row.inProductId ?? 0),
            quantity: transfer ? row.quantity : (row.inQuantity ?? 0),
            costShare: null,
            inventoryAccountId: transfer ? (row.accountId ?? null) : null,
          });
        });
    return { kind, docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"), warehouseId: warehouseId ?? 0, comment: comment || null, lines };
  };

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("conversion.saved"));
    if (!id) navigate(`${config.path}/${savedId}`, { replace: true });
    return savedId;
  };
  const run = (work: () => Promise<unknown>) => () => void work().catch(errorHandlers);

  const posted = statusId !== conversionStatus.draft;
  const amountColumn = (field: "inAmount" | "outAmount", title: string) =>
    posted ? [{ title, dataIndex: field, width: 140, align: "right" as const, render: (value?: number) => money(value) }] : [];
  const accountColumn = (field: "inAccount" | "outAccount", title: string) =>
    posted ? [{ title, dataIndex: field, width: 110, render: (value?: string | null) => value ?? "-" }] : [];
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

  const columns: TableColumnsType<Row> = isSet
    ? [
        {
          title: t("conversion.component"),
          dataIndex: "productId",
          render: (value: number, row) =>
            productSelect(value, kind === conversionKinds.assembly, (next) => updateRow(row.key, { productId: next }), row.productName),
        },
        { title: t("conversion.quantity"), dataIndex: "quantity", width: 140, render: (value: number, row) => quantityInput(value, (next) => updateRow(row.key, { quantity: next })) },
        ...(kind === conversionKinds.disassembly
          ? [
              {
                title: t("conversion.costShare"),
                dataIndex: "costShare",
                width: 150,
                render: (value: number | null | undefined, row: Row) =>
                  readOnly ? (value ?? "-") : (
                    <InputNumber<number> className="w-full!" min={0} placeholder={t("conversion.byQuantity")} value={value ?? null}
                      onChange={(next) => updateRow(row.key, { costShare: next == null ? null : Number(next) })} />
                  ),
              },
            ]
          : []),
        ...accountColumn(kind === conversionKinds.assembly ? "outAccount" : "inAccount", t("conversion.account")),
        ...amountColumn(kind === conversionKinds.assembly ? "outAmount" : "inAmount", t("conversion.amount")),
        ...removeColumn,
      ]
    : kind === conversionKinds.regrading
      ? [
          { title: t("conversion.outProduct"), dataIndex: "productId", render: (value: number, row) => productSelect(value, true, (next) => updateRow(row.key, { productId: next }), row.productName) },
          { title: t("conversion.quantity"), dataIndex: "quantity", width: 120, render: (value: number, row) => quantityInput(value, (next) => updateRow(row.key, { quantity: next })) },
          { title: t("conversion.inProduct"), dataIndex: "inProductId", render: (value: number, row) => productSelect(value, false, (next) => updateRow(row.key, { inProductId: next }), row.inProductName) },
          { title: t("conversion.quantity"), dataIndex: "inQuantity", width: 120, render: (value: number, row) => quantityInput(value, (next) => updateRow(row.key, { inQuantity: next })) },
          ...amountColumn("outAmount", t("conversion.amount")),
          ...removeColumn,
        ]
      : [
          { title: t("conversion.product"), dataIndex: "productId", render: (value: number, row) => productSelect(value, true, (next) => updateRow(row.key, { productId: next }), row.productName) },
          { title: t("conversion.quantity"), dataIndex: "quantity", width: 120, render: (value: number, row) => quantityInput(value, (next) => updateRow(row.key, { quantity: next })) },
          ...accountColumn("outAccount", t("conversion.fromAccount")),
          {
            title: t("conversion.toAccount"),
            dataIndex: "accountId",
            width: 260,
            render: (value: number | null | undefined, row: Row) =>
              readOnly ? (row.inAccount ?? "-") : (
                <Select className="w-full" showSearch optionFilterProp="label" value={value ?? null} options={accountOptions}
                  style={{ backgroundColor: "transparent" }} onChange={(next: number) => updateRow(row.key, { accountId: next })} />
              ),
          },
          ...amountColumn("outAmount", t("conversion.amount")),
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
          {field("№", <Space><b>{data?.docNumber ?? t("conversion.newNumber")}</b><ConversionStatusTag statusId={statusId} /></Space>, "")}
          {journal === "assembly" &&
            field(
              t("conversion.kind"),
              <Radio.Group disabled={readOnly || Boolean(id)} value={kind} onChange={(event) => setKind(event.target.value as ConversionKind)}>
                <Radio.Button value={conversionKinds.assembly}>{t("conversion.kinds.1")}</Radio.Button>
                <Radio.Button value={conversionKinds.disassembly}>{t("conversion.kinds.2")}</Radio.Button>
              </Radio.Group>,
              "",
            )}
          {field(
            t("conversion.date"),
            <DatePicker showTime={{ format: "HH:mm" }} format="DD.MM.YYYY HH:mm" value={docDate} allowClear={false} disabled={readOnly}
              onChange={(value) => value && setDocDate(value)} />,
            "",
          )}
          <div className="min-w-64 flex-1">
            <SelectCustom label="conversion.warehouse" path={selectListEndpoints.warehousesSelectList} marginBottom="mb-0!"
              value={warehouseId} disabled={readOnly} onChange={(value) => setWarehouseId((value as number | null) ?? null)} />
          </div>
        </div>

        {isSet && (
          <div className="flex flex-wrap items-end gap-4">
            {field(t("conversion.set"), productSelect(head.productId, kind === conversionKinds.disassembly, (next) => setHead({ ...head, productId: next }), head.productName), "min-w-72 flex-1")}
            {field(t("conversion.quantity"), quantityInput(head.quantity, (next) => setHead({ ...head, quantity: next })), "w-40")}
            {kind === conversionKinds.assembly &&
              field(
                t("conversion.setAccount"),
                readOnly ? (head.inAccount ?? "-") : (
                  <Select className="w-full" allowClear showSearch optionFilterProp="label" placeholder={t("conversion.itemAccount")}
                    value={head.accountId ?? null} options={accountOptions} style={{ backgroundColor: "transparent" }}
                    onChange={(next?: number) => setHead({ ...head, accountId: next ?? null })} />
                ),
                "min-w-56",
              )}
            {posted && field(t("conversion.amount"), <b>{money(head.inAmount)}</b>, "")}
          </div>
        )}

        {field(t("conversion.comment"), <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />, "")}

        <Space wrap>
          {!readOnly && (
            <Button icon={<Save className="size-4" />} loading={save.isPending} onClick={run(saveDraft)}>
              {t("conversion.saveDraft")}
            </Button>
          )}
          {statusId === conversionStatus.draft && can(conversionPermissions.confirm) && (
            <Button type="primary" icon={<Send className="size-4" />} loading={save.isPending || action.isPending}
              onClick={run(async () => {
                const savedId = await saveDraft();
                await action.mutateAsync({ id: savedId, action: "confirm" });
                toast.success(t("conversion.posted"));
              })}>
              {t("conversion.post")}
            </Button>
          )}
          {id && statusId !== conversionStatus.posted && can(conversionPermissions.delete) && (
            <Popconfirm title={t("conversion.deleteConfirm")} okButtonProps={{ danger: true }}
              onConfirm={run(() => action.mutateAsync({ id, action: "delete" }).then(() => navigate(config.path, { replace: true })))}>
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
          {id && statusId === conversionStatus.posted && can(conversionPermissions.cancel) && (
            <Popconfirm title={t("conversion.cancelConfirm")} okButtonProps={{ danger: true }}
              onConfirm={run(() => action.mutateAsync({ id, action: "cancel" }).then(() => toast.success(t("conversion.cancelled"))))}>
              <Button danger icon={<Ban className="size-4" />}>{t("conversion.cancel")}</Button>
            </Popconfirm>
          )}
          {id && (
            <AccountingEntriesButton documentId={id} documentTypeId={48} statusId={statusId}>
              {t("conversion.entries")}
            </AccountingEntriesButton>
          )}
        </Space>
      </Card>

      {!readOnly && <Alert showIcon type="info" message={t(`conversion.kindHints.${kind}`)} />}

      <Card className="overflow-hidden border border-border">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="font-semibold">{t(isSet ? "conversion.components" : "conversion.pairs")}</span>
          {!readOnly && (
            <Button size="small" icon={<Plus className="size-4" />} onClick={() => setRows((current) => [...current, newRow()])}>
              {t("conversion.addLine")}
            </Button>
          )}
        </div>
        <Table<Row> rowKey="key" size="middle" columns={columns} dataSource={rows} pagination={false} />
      </Card>
    </div>
  );
}
