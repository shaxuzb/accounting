import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import SelectCustom from "@/components/fields/SelectCustom";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import { chartAccountSelectDisplayConfig } from "@/shared/constants/selectLists";
import { useVatPayer } from "@/shared/hooks/useVatPayer";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCancelExtraCost,
  useConfirmExtraCost,
  useDeleteExtraCost,
  useExtraCost,
  useExtraCostDefaults,
  useExtraCostPreview,
  useExtraCostPurchases,
  useSaveExtraCost,
  type ExtraCostDocument,
  type ExtraCostEffect,
  type ExtraCostLine,
  type ExtraCostSave,
} from "./api";
import {
  distributionMethod,
  effectKind,
  extraCostDocumentTypeId,
  extraCostPath,
  extraCostPermissions,
  extraCostStatus,
  money,
} from "./constants";
import { ExtraCostStatusTag } from "./ExtraCostListPage";

/** A value that settles: the preview asks the server only once the user stops typing. */
function useSettled<T>(value: T, delay = 400) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

/**
 * Additional costs of a purchase (1C «Поступление доп. расходов»): a carrier's or a broker's
 * bill put on the goods of one posted purchase. Posting raises the cost of the goods still in
 * stock and charges the share of those already sold to the cost of sales.
 */
export default function ExtraCostEditorPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useExtraCost(id);
  if (id && (isLoading || !data)) return null;
  return (
    <ExtraCostEditor key={`${id}-${data?.statusId ?? 0}`} id={id} data={data} />
  );
}

function ExtraCostEditor({
  id,
  data,
}: {
  id: number | null;
  data?: ExtraCostDocument;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const can = (code: string) => permissions.includes(code);
  const save = useSaveExtraCost();
  const confirm = useConfirmExtraCost();
  const cancel = useCancelExtraCost();
  const remove = useDeleteExtraCost();

  const statusId = data?.statusId ?? extraCostStatus.draft;
  const readOnly =
    statusId !== extraCostStatus.draft || !can(extraCostPermissions.create);

  // «Создать на основании»: opened from a purchase, the document starts on it
  const [searchParams] = useSearchParams();
  const [purchaseId, setPurchaseId] = useState<number | null>(
    () => data?.purchaseDocId ?? (Number(searchParams.get("purchase")) || null),
  );
  const [docDate, setDocDate] = useState(() =>
    data ? dayjs(data.docDate) : dayjs(),
  );
  const [counterpartyId, setCounterpartyId] = useState<number | null>(
    data?.counterpartyId ?? null,
  );
  const [contractId, setContractId] = useState<number | null>(
    data?.contractId ?? null,
  );
  const [content, setContent] = useState(data?.content ?? "");
  const [method, setMethod] = useState<number>(
    data?.distributionMethod ?? distributionMethod.byAmount,
  );
  const [amount, setAmount] = useState<number>(data?.amount ?? 0);
  const [vatRateId, setVatRateId] = useState<number | null>(
    data?.vatRateId ?? null,
  );
  const [vatAmount, setVatAmount] = useState<number>(data?.vatAmount ?? 0);
  const [supplierAccountId, setSupplierAccountId] = useState<number | null>(
    data?.supplierAccountId ?? null,
  );
  const [vatAccountId, setVatAccountId] = useState<number | null>(
    data?.vatAccountId ?? null,
  );
  const [costAccountId, setCostAccountId] = useState<number | null>(
    data?.costAccountId ?? null,
  );
  const [comment, setComment] = useState(data?.comment ?? "");
  const [search, setSearch] = useState("");

  const vatPayer = useVatPayer(docDate.format("YYYY-MM-DD"));
  const { data: purchases = [], isFetching: searching } = useExtraCostPurchases(
    search,
    !readOnly,
  );
  const { data: defaults } = useExtraCostDefaults(
    docDate.format("YYYY-MM-DD"),
    true,
  );
  // the rates with their percent: the VAT is computed as the amount is typed
  const vatRates = defaults?.vatRates ?? [];

  // a new document takes the accounts the settings give until one is chosen (1C fills them so)
  const fallback = data ? undefined : defaults;
  const supplierAccount =
    supplierAccountId ?? fallback?.supplierAccountId ?? null;
  const vatAccount = vatAccountId ?? fallback?.vatAccountId ?? null;
  const costAccount = costAccountId ?? fallback?.costAccountId ?? null;

  // the purchase's supplier bills the costs, under its contract, unless another is chosen
  const purchase = purchases.find((item) => item.id === purchaseId);
  const counterparty = counterpartyId ?? purchase?.counterpartyId ?? null;
  const contract =
    contractId ??
    (counterparty === purchase?.counterpartyId
      ? (purchase?.contractId ?? null)
      : null);

  const changeVatRate = (next: number | null) => {
    setVatRateId(next);
    const rate = vatRates.find((item) => item.id === next)?.rate ?? 0;
    setVatAmount(Math.round(amount * rate) / 100);
  };
  const changeAmount = (next: number) => {
    setAmount(next);
    const rate = vatRates.find((item) => item.id === vatRateId)?.rate ?? 0;
    setVatAmount(Math.round(next * rate) / 100);
  };

  const body = (): ExtraCostSave => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    purchaseDocId: purchaseId ?? 0,
    counterpartyId: counterparty ?? 0,
    contractId: contract,
    content: content || null,
    distributionMethod: method,
    amount,
    vatRateId,
    vatAmount: vatRateId ? vatAmount : null,
    supplierAccountId: supplierAccount,
    vatAccountId: vatAccount,
    costAccountId: costAccount,
    comment: comment || null,
  });

  const previewBody = useSettled(
    !readOnly && purchaseId && amount > 0 ? body() : null,
  );
  const preview = useExtraCostPreview(previewBody);
  const lines: ExtraCostLine[] = readOnly
    ? (data?.lines ?? [])
    : (preview.data ?? []);

  const purchaseOptions = useMemo(() => {
    const options = purchases.map((item) => ({
      value: item.id,
      label: `№${item.docNumber} · ${dayjs(item.docDate).format("DD.MM.YYYY")}${
        item.counterpartyName ? ` · ${item.counterpartyName}` : ""
      } · ${money(item.finalAmount)}`,
    }));
    if (data && !options.some((option) => option.value === data.purchaseDocId))
      options.unshift({
        value: data.purchaseDocId,
        label: `№${data.purchaseDocNumber ?? data.purchaseDocId}`,
      });
    return options;
  }, [purchases, data]);

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("extraCost.saved"));
    if (!id) navigate(`${extraCostPath}/${savedId}`, { replace: true });
    return savedId;
  };

  const run = (action: () => Promise<unknown>) => () =>
    void action().catch(errorHandlers);

  const lineColumns: TableColumnsType<ExtraCostLine> = [
    { dataIndex: "productName", title: t("extraCost.product") },
    {
      dataIndex: "quantity",
      title: t("extraCost.quantity"),
      align: "right",
      width: 120,
    },
    {
      dataIndex: "baseAmount",
      title: t("extraCost.goodsAmount"),
      align: "right",
      width: 160,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "amount",
      title: t("extraCost.share"),
      align: "right",
      width: 160,
      render: (value: number) => <b>{money(value)}</b>,
    },
  ];

  const effectColumns: TableColumnsType<ExtraCostEffect> = [
    { dataIndex: "productName", title: t("extraCost.product") },
    { dataIndex: "warehouseName", title: t("extraCost.warehouse") },
    {
      dataIndex: "batchNumber",
      title: t("extraCost.batch"),
      render: (value?: string | null) => value || "-",
    },
    {
      dataIndex: "kind",
      title: t("extraCost.effect"),
      render: (value: number) =>
        value === effectKind.inStock ? (
          <Tag color="blue">{t("extraCost.effects.inStock")}</Tag>
        ) : (
          <Tag color="orange">{t("extraCost.effects.sold")}</Tag>
        ),
    },
    {
      dataIndex: "quantity",
      title: t("extraCost.quantity"),
      align: "right",
      width: 110,
    },
    {
      dataIndex: "unitCostAdded",
      title: t("extraCost.unitCostAdded"),
      align: "right",
      width: 150,
      render: (value: number, row) =>
        row.kind === effectKind.inStock ? money(value) : "-",
    },
    {
      dataIndex: "amount",
      title: t("extraCost.amount"),
      align: "right",
      width: 150,
      render: (value: number) => money(value),
    },
  ];

  const field = (
    label: string,
    node: React.ReactNode,
    className = "min-w-56 flex-1",
  ) => (
    <div className={className}>
      <div className="mb-1 text-sm text-secondary-text">{label}</div>
      {node}
    </div>
  );

  return (
    <div className="w-full space-y-3">
      <Card className="space-y-4 border border-border p-4">
        {/* the shared selects are form items: laid out label above, as the plain fields */}
        <Form layout="vertical" component={false}>
          <div className="flex flex-wrap items-end gap-4">
            {field(
              "№",
              <Space>
                <b>{data?.docNumber ?? t("extraCost.newNumber")}</b>
                <ExtraCostStatusTag statusId={statusId} />
              </Space>,
              "",
            )}
            {field(
              t("extraCost.date"),
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
            {field(
              t("extraCost.purchase"),
              <Select
                className="w-full"
                showSearch
                filterOption={false}
                loading={searching}
                disabled={readOnly}
                value={purchaseId}
                placeholder={t("extraCost.purchasePlaceholder")}
                options={purchaseOptions}
                onSearch={setSearch}
                onChange={(value: number) => {
                  setPurchaseId(value);
                  setCounterpartyId(null);
                  setContractId(null);
                }}
              />,
              "min-w-96 flex-1",
            )}
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-72 flex-1">
              <CounterpartySelect
                kind="supplier"
                label="extraCost.counterparty"
                marginBottom="mb-0!"
                value={counterparty}
                disabled={readOnly}
                onChange={(value) => {
                  setCounterpartyId((value as number | null) ?? null);
                  setContractId(null);
                }}
              />
            </div>
            {field(
              t("extraCost.content"),
              <Input
                value={content}
                disabled={readOnly}
                placeholder={t("extraCost.contentPlaceholder")}
                onChange={(event) => setContent(event.target.value)}
              />,
              "min-w-72 flex-1",
            )}
          </div>

          <div className="flex flex-wrap items-end gap-4">
            {field(
              t("extraCost.amountNet"),
              <InputNumber<number>
                className="w-full!"
                min={0}
                precision={2}
                value={amount || null}
                disabled={readOnly}
                onChange={(value) => changeAmount(Number(value ?? 0))}
              />,
              "w-48",
            )}
            {field(
              t("extraCost.vatRate"),
              <Select
                className="w-full"
                allowClear
                disabled={readOnly}
                value={vatRateId}
                options={vatRates.map((item) => ({
                  value: item.id,
                  label: item.name ?? `${item.rate}%`,
                }))}
                onChange={(value?: number) => changeVatRate(value ?? null)}
              />,
              "w-48",
            )}
            {field(
              t("extraCost.vatAmount"),
              <InputNumber<number>
                className="w-full!"
                min={0}
                precision={2}
                value={vatAmount}
                disabled={readOnly || !vatRateId}
                onChange={(value) => setVatAmount(Number(value ?? 0))}
              />,
              "w-44",
            )}
            {field(
              t("extraCost.total"),
              <b className="text-lg">
                {money(amount + (vatRateId ? vatAmount : 0))}
              </b>,
              "w-44",
            )}
            {field(
              t("extraCost.method"),
              <Radio.Group
                disabled={readOnly}
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                options={[
                  {
                    value: distributionMethod.byAmount,
                    label: t("extraCost.methods.byAmount"),
                  },
                  {
                    value: distributionMethod.byQuantity,
                    label: t("extraCost.methods.byQuantity"),
                  },
                ]}
              />,
              "",
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
            <SelectCustom
              label="extraCost.supplierAccount"
              path="manuals/chart-accounts"
              search
              displayConfig={chartAccountSelectDisplayConfig}
              value={supplierAccount}
              disabled={readOnly}
              onChange={(value) =>
                setSupplierAccountId((value as number | null) ?? null)
              }
            />
            <SelectCustom
              label="extraCost.vatAccount"
              path="manuals/chart-accounts"
              search
              displayConfig={chartAccountSelectDisplayConfig}
              value={vatAccount}
              disabled={readOnly || !vatPayer.isVatPayer}
              onChange={(value) =>
                setVatAccountId((value as number | null) ?? null)
              }
            />
            <SelectCustom
              label="extraCost.costAccount"
              path="manuals/chart-accounts"
              search
              displayConfig={chartAccountSelectDisplayConfig}
              value={costAccount}
              disabled={readOnly}
              onChange={(value) =>
                setCostAccountId((value as number | null) ?? null)
              }
            />
          </div>
        </Form>

        {field(
          t("extraCost.comment"),
          <Input
            value={comment}
            disabled={readOnly}
            onChange={(event) => setComment(event.target.value)}
          />,
          "",
        )}

        <Space wrap>
          {!readOnly && (
            <Button
              icon={<Save className="size-4" />}
              loading={save.isPending}
              onClick={run(saveDraft)}
            >
              {t("extraCost.saveDraft")}
            </Button>
          )}
          {statusId === extraCostStatus.draft &&
            can(extraCostPermissions.confirm) && (
              <Button
                type="primary"
                icon={<Send className="size-4" />}
                loading={save.isPending || confirm.isPending}
                onClick={run(async () => {
                  const savedId = await saveDraft();
                  await confirm.mutateAsync(savedId);
                  toast.success(t("extraCost.posted"));
                })}
              >
                {t("extraCost.post")}
              </Button>
            )}
          {id &&
            statusId === extraCostStatus.draft &&
            can(extraCostPermissions.delete) && (
              <Popconfirm
                title={t("extraCost.deleteConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={run(() =>
                  remove
                    .mutateAsync(id)
                    .then(() => navigate(extraCostPath, { replace: true })),
                )}
              >
                <Button danger icon={<Trash2 className="size-4" />} />
              </Popconfirm>
            )}
          {id &&
            statusId === extraCostStatus.posted &&
            can(extraCostPermissions.cancel) && (
              <Popconfirm
                title={t("extraCost.cancelConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={run(() =>
                  cancel
                    .mutateAsync(id)
                    .then(() => toast.success(t("extraCost.cancelled"))),
                )}
              >
                <Button danger icon={<Ban className="size-4" />}>
                  {t("extraCost.cancel")}
                </Button>
              </Popconfirm>
            )}
          {id && (
            <AccountingEntriesButton
              documentId={id}
              documentTypeId={extraCostDocumentTypeId}
              statusId={statusId}
            >
              {t("extraCost.entries")}
            </AccountingEntriesButton>
          )}
        </Space>
      </Card>

      {!readOnly && (
        <Alert showIcon type="info" message={t("extraCost.hint")} />
      )}
      {!readOnly && preview.isError && purchaseId && amount > 0 && (
        <Alert showIcon type="warning" message={t("extraCost.previewFailed")} />
      )}

      <Card className="overflow-hidden border border-border">
        <div className="px-4 pt-3 font-semibold">
          {t("extraCost.distribution")}
        </div>
        <Table<ExtraCostLine>
          rowKey="purchaseLineId"
          size="middle"
          loading={!readOnly && preview.isFetching}
          columns={lineColumns}
          dataSource={lines}
          pagination={false}
          footer={() => (
            <div className="text-right">
              {t("extraCost.distributed")}:{" "}
              <b>{money(lines.reduce((sum, line) => sum + line.amount, 0))}</b>
            </div>
          )}
        />
      </Card>

      {data && data.effects.length > 0 && (
        <Card className="overflow-hidden border border-border">
          <div className="px-4 pt-3 font-semibold">
            {t("extraCost.effectsTitle")}
          </div>
          <Table<ExtraCostEffect>
            rowKey={(row) => `${row.batchId}-${row.kind}`}
            size="middle"
            columns={effectColumns}
            dataSource={data.effects}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}
