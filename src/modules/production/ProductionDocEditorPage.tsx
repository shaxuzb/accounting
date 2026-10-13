import { Alert, Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Space, Table } from "antd";
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
  fetchPlannedCosts,
  useProductionAction,
  useProductionDefaults,
  useProductionDoc,
  useSaveProductionDoc,
  type ProductionDocument,
  type ProductionDocLine,
  type ProductionDocSave,
} from "./api";
import { costItemsSubkontoTypeId, money, productionDocs, productionStatus, type ProductionDocKind } from "./constants";
import { ProductionStatusTag } from "./ProductionDocListPage";

interface ProductOption {
  id: number;
  name: string;
  unitId: number;
  unitCode?: string | null;
  isPieceTracked?: boolean;
}

type ListShape<T> = T[] | { items?: T[]; results?: T[]; data?: T[] } | null | undefined;
const asList = <T,>(response: ListShape<T>): T[] =>
  Array.isArray(response) ? response : (response?.items ?? response?.results ?? response?.data ?? []);

interface EditLine extends ProductionDocLine {
  key: string;
}

let lineSeq = 0;
const newLine = (): EditLine => ({ key: `n${++lineSeq}`, productId: 0, quantity: 1, unitCost: null });

/**
 * A material requisition (1C «Требование-накладная»: materials out of a warehouse to a cost
 * account) or a production report (1C «Отчет производства за смену»: products into a warehouse at
 * their planned cost, brought to the actual one by the month close).
 */
export default function ProductionDocEditorPage({ kind }: { kind: ProductionDocKind }) {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useProductionDoc(kind, id);
  if (id && (isLoading || !data)) return null;
  return <ProductionDocEditor key={`${kind}-${id}-${data?.statusId ?? 0}`} kind={kind} id={id} data={data} />;
}

function ProductionDocEditor({ kind, id, data }: { kind: ProductionDocKind; id: number | null; data?: ProductionDocument }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const doc = productionDocs[kind];
  const isReport = kind === "report";
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => permissions.includes(code);
  const save = useSaveProductionDoc(kind);
  const confirm = useProductionAction(kind, "confirm");
  const cancel = useProductionAction(kind, "cancel");
  const remove = useProductionAction(kind, "delete");

  const statusId = data?.statusId ?? productionStatus.draft;
  const readOnly = statusId !== productionStatus.draft || !can(doc.permissions.create);

  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [warehouseId, setWarehouseId] = useState<number | null>(data?.warehouseId ?? null);
  const [costAccountId, setCostAccountId] = useState<number | null>(data?.costAccountId ?? null);
  const [productGroupId, setProductGroupId] = useState<number | null>(data?.productGroupId ?? null);
  const [costItemId, setCostItemId] = useState<number | null>(data?.costItemId ?? null);
  const [comment, setComment] = useState(data?.comment ?? "");
  const [lines, setLines] = useState<EditLine[]>(() =>
    data?.lines.length ? data.lines.map((line) => ({ ...line, key: `l${line.id}` })) : [newLine()],
  );

  const { data: defaults } = useProductionDefaults(kind);
  // a new document takes the production account (2010) until another is chosen, as 1C fills it
  const costAccount = costAccountId ?? (data ? null : (defaults?.costAccountId ?? null));

  // the accounts the document may use (2010, 2510 ... — the server brings the standard ones in)
  const accountOptions = (defaults?.costAccounts ?? []).map((item) => ({
    value: item.id,
    label: chartAccountOptionLabel(item),
  }));

  // a requisition issues what the warehouse has had; a report may bring a product in for the first time
  const { data: products = [], isFetching: productsLoading } = useQuery({
    queryKey: ["production-docs", "products", kind, isReport ? null : warehouseId],
    queryFn: async () =>
      asList(
        await getJson<ListShape<ProductOption>>(selectListEndpoints.productsSelectList, {
          isService: false,
          warehouseId: isReport ? undefined : warehouseId,
          PageSize: 1000,
        }),
      ),
    enabled: !readOnly && (isReport || Boolean(warehouseId)),
    staleTime: 60 * 1000,
  });
  const productOptions = useMemo(() => {
    const options = products
      .filter((item) => !item.isPieceTracked)
      .map((item) => ({ value: item.id, label: item.unitCode ? `${item.name} (${item.unitCode})` : item.name }));
    for (const line of lines)
      if (line.productId && !options.some((option) => option.value === line.productId))
        options.push({ value: line.productId, label: line.productName ?? String(line.productId) });
    return options;
  }, [products, lines]);

  const updateLine = (key: string, patch: Partial<EditLine>) =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const pickProduct = async (key: string, productId: number) => {
    const product = products.find((item) => item.id === productId);
    updateLine(key, { productId, productName: product?.name, unitId: product?.unitId, unitName: product?.unitCode });
    if (!isReport) return;
    // the planned cost starts as what the product's last output actually cost (1C «Плановая цена»)
    const costs = await fetchPlannedCosts([productId]).catch(() => []);
    const unitCost = costs.find((item) => item.productId === productId)?.unitCost;
    if (unitCost) updateLine(key, { unitCost });
  };

  const filledLines = lines.filter((line) => line.productId);
  const body = (): ProductionDocSave => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    warehouseId: warehouseId ?? 0,
    costAccountId: costAccount,
    productGroupId,
    costItemId: isReport ? null : costItemId,
    comment: comment || null,
    lines: filledLines.map((line) => ({
      productId: line.productId,
      unitId: line.unitId ?? 0,
      quantity: line.quantity,
      unitCost: isReport ? line.unitCost : null,
      comment: line.comment || null,
    })),
  });

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("production.saved"));
    if (!id) navigate(`${doc.path}/${savedId}`, { replace: true });
    return savedId;
  };
  const run = (action: () => Promise<unknown>) => () => void action().catch(errorHandlers);

  const total = isReport
    ? filledLines.reduce((sum, line) => sum + Math.round(line.quantity * (line.unitCost ?? 0) * 100) / 100, 0)
    : (data?.amount ?? 0);

  const columns: TableColumnsType<EditLine> = [
    {
      title: t("production.product"),
      dataIndex: "productId",
      render: (_: number, line) =>
        readOnly ? (
          line.productName
        ) : (
          <Select
            className="w-full"
            showSearch
            optionFilterProp="label"
            loading={productsLoading}
            placeholder={t(isReport || warehouseId ? "production.productPlaceholder" : "production.warehouseFirst")}
            value={line.productId || null}
            options={productOptions}
            onChange={(value: number) => void pickProduct(line.key, value)}
          />
        ),
    },
    {
      title: t("production.unit"),
      dataIndex: "unitName",
      width: 90,
      render: (value?: string | null) => value || "-",
    },
    {
      title: t("production.quantity"),
      dataIndex: "quantity",
      width: 140,
      align: "right",
      render: (value: number, line) =>
        readOnly ? (
          value
        ) : (
          <InputNumber<number>
            className="w-full!"
            min={0}
            value={value}
            onChange={(next) => updateLine(line.key, { quantity: Number(next ?? 0) })}
          />
        ),
    },
    ...(isReport
      ? [
          {
            title: t("production.plannedCost"),
            dataIndex: "unitCost",
            width: 170,
            align: "right" as const,
            render: (value: number | null | undefined, line: EditLine) =>
              readOnly ? (
                money(value ?? 0)
              ) : (
                <InputNumber<number>
                  className="w-full!"
                  min={0}
                  precision={2}
                  value={value ?? null}
                  onChange={(next) => updateLine(line.key, { unitCost: next == null ? null : Number(next) })}
                />
              ),
          },
        ]
      : []),
    {
      title: t(isReport ? "production.plannedAmount" : "production.costAmount"),
      dataIndex: "amount",
      width: 160,
      align: "right",
      render: (value: number | undefined, line) =>
        isReport && !readOnly
          ? money(Math.round(line.quantity * (line.unitCost ?? 0) * 100) / 100)
          : statusId === productionStatus.draft && !isReport
            ? "-"
            : money(value ?? 0),
    },
    ...(readOnly
      ? [
          {
            title: t("production.stockAccount"),
            dataIndex: "inventoryAccountNumber",
            width: 120,
            render: (value?: string | null) => value || "-",
          },
        ]
      : [
          {
            title: "",
            key: "remove",
            width: 50,
            render: (_: unknown, line: EditLine) => (
              <Button
                type="text"
                icon={<X className="size-4" />}
                onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}
              />
            ),
          },
        ]),
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
        <Form layout="vertical" component={false}>
          <div className="flex flex-wrap items-end gap-4">
            {field(
              "№",
              <Space>
                <b>{data?.docNumber ?? t("production.newNumber")}</b>
                <ProductionStatusTag statusId={statusId} />
              </Space>,
              "",
            )}
            {field(
              t("production.date"),
              <DatePicker
                showTime={{ format: "HH:mm" }}
                format="DD.MM.YYYY HH:mm"
                value={docDate}
                allowClear={false}
                disabled={readOnly}
                onChange={(value) => value && setDocDate(value)}
              />,
              "",
            )}
            <div className="min-w-64 flex-1">
              <SelectCustom
                label={isReport ? "production.receiveWarehouse" : "production.issueWarehouse"}
                path={selectListEndpoints.warehousesSelectList} createWith="warehouse"
                marginBottom="mb-0!"
                value={warehouseId}
                disabled={readOnly}
                onChange={(value) => setWarehouseId((value as number | null) ?? null)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            {field(
              t(isReport ? "production.productionAccount" : "production.costAccount"),
              <Select
                className="w-full"
                showSearch
                optionFilterProp="label"
                disabled={readOnly}
                value={costAccount}
                options={
                  costAccount && !accountOptions.some((option) => option.value === costAccount)
                    ? [...accountOptions, { value: costAccount, label: data?.costAccountNumber ?? String(costAccount) }]
                    : accountOptions
                }
                onChange={(value: number) => setCostAccountId(value)}
              />,
              "min-w-64 flex-1",
            )}
            <div className="min-w-64 flex-1">
              <SelectCustom
                label="production.productGroup"
                path={selectListEndpoints.productGroupsSelectList}
                marginBottom="mb-0!"
                clearable
                search
                value={productGroupId}
                disabled={readOnly}
                onChange={(value) => setProductGroupId((value as number | null) ?? null)}
              />
            </div>
            {!isReport && (
              <div className="min-w-64 flex-1">
                <SelectCustom
                  label="production.costItem"
                  path={`subkonto-values/${costItemsSubkontoTypeId}`}
                  marginBottom="mb-0!"
                  clearable
                  search
                  value={costItemId}
                  disabled={readOnly}
                  onChange={(value) => setCostItemId((value as number | null) ?? null)}
                />
              </div>
            )}
          </div>
        </Form>

        {field(
          t("production.comment"),
          <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />,
          "",
        )}

        <Space wrap>
          {!readOnly && (
            <Button icon={<Save className="size-4" />} loading={save.isPending} onClick={run(saveDraft)}>
              {t("production.saveDraft")}
            </Button>
          )}
          {statusId === productionStatus.draft && can(doc.permissions.confirm) && (
            <Button
              type="primary"
              icon={<Send className="size-4" />}
              loading={save.isPending || confirm.isPending}
              onClick={run(async () => {
                const savedId = await saveDraft();
                await confirm.mutateAsync(savedId);
                toast.success(t("production.posted"));
              })}
            >
              {t("production.post")}
            </Button>
          )}
          {id && statusId === productionStatus.draft && can(doc.permissions.delete) && (
            <Popconfirm
              title={t("production.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => remove.mutateAsync(id).then(() => navigate(doc.path, { replace: true })))}
            >
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
          {id && statusId === productionStatus.posted && can(doc.permissions.cancel) && (
            <Popconfirm
              title={t("production.cancelConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => cancel.mutateAsync(id).then(() => toast.success(t("production.cancelled"))))}
            >
              <Button danger icon={<Ban className="size-4" />}>
                {t("production.cancel")}
              </Button>
            </Popconfirm>
          )}
          {id && (
            <AccountingEntriesButton documentId={id} documentTypeId={doc.documentTypeId} statusId={statusId}>
              {t("production.entries")}
            </AccountingEntriesButton>
          )}
        </Space>
      </Card>

      {!readOnly && (
        <Alert showIcon type="info" message={t(isReport ? "production.report.hint" : "production.requisition.hint")} />
      )}

      <Card className="overflow-hidden border border-border">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="font-semibold">{t(isReport ? "production.report.lines" : "production.requisition.lines")}</span>
          {!readOnly && (
            <Button size="small" icon={<Plus className="size-4" />} onClick={() => setLines((current) => [...current, newLine()])}>
              {t("production.addLine")}
            </Button>
          )}
        </div>
        <Table<EditLine>
          rowKey="key"
          size="middle"
          columns={columns}
          dataSource={lines}
          pagination={false}
          footer={() => (
            <div className="text-right">
              {t(isReport ? "production.plannedAmount" : "production.costAmount")}: <b>{money(total)}</b>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
