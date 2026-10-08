import { Alert, Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Save, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import SelectCustom from "@/components/fields/SelectCustom";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import type { ExtraCostEffect } from "@/modules/extraCosts/api";
import { effectKind, money } from "@/modules/extraCosts/constants";
import { ExtraCostStatusTag } from "@/modules/extraCosts/ExtraCostListPage";
import { chartAccountSelectDisplayConfig } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCancelCustomsDeclaration,
  useConfirmCustomsDeclaration,
  useCustomsBase,
  useCustomsDeclaration,
  useCustomsDefaults,
  useCustomsPurchases,
  useDeleteCustomsDeclaration,
  useSaveCustomsDeclaration,
  type CustomsDocument,
  type CustomsLine,
  type CustomsSave,
} from "./api";
import { customsDocumentTypeId, customsPath, customsPermissions, customsStatus } from "./constants";

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * The customs declaration of an import (1C «Таможенная декларация (импорт)»): on the basis of
 * a posted purchase, each goods line with its customs value, duty, excise and import VAT; the
 * customs fee of the whole declaration is shared by customs value.
 */
export default function CustomsEditorPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useCustomsDeclaration(id);
  if (id && (isLoading || !data)) return null;
  return <CustomsEditor key={`${id}-${data?.statusId ?? 0}`} id={id} data={data} />;
}

function CustomsEditor({ id, data }: { id: number | null; data?: CustomsDocument }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => permissions.includes(code);
  const save = useSaveCustomsDeclaration();
  const confirm = useConfirmCustomsDeclaration();
  const cancel = useCancelCustomsDeclaration();
  const remove = useDeleteCustomsDeclaration();

  const statusId = data?.statusId ?? customsStatus.draft;
  const readOnly = statusId !== customsStatus.draft || !can(customsPermissions.create);

  const [searchParams] = useSearchParams();
  const [purchaseId, setPurchaseId] = useState<number | null>(
    () => data?.purchaseDocId ?? (Number(searchParams.get("purchase")) || null),
  );
  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [declarationNumber, setDeclarationNumber] = useState(data?.declarationNumber ?? "");
  const [counterpartyId, setCounterpartyId] = useState<number | null>(data?.counterpartyId ?? null);
  const [customsFee, setCustomsFee] = useState<number>(data?.customsFee ?? 0);
  const [settlementAccountId, setSettlementAccountId] = useState<number | null>(data?.settlementAccountId ?? null);
  const [vatAccountId, setVatAccountId] = useState<number | null>(data?.vatAccountId ?? null);
  const [costAccountId, setCostAccountId] = useState<number | null>(data?.costAccountId ?? null);
  const [comment, setComment] = useState(data?.comment ?? "");
  const [search, setSearch] = useState("");
  // the lines as the user changed them; until then the purchase's goods (or the saved lines)
  const [edited, setEdited] = useState<CustomsLine[] | null>(data?.lines ?? null);

  const { data: purchases = [], isFetching: searching } = useCustomsPurchases(search, !readOnly);
  const { data: base } = useCustomsBase(!readOnly && !edited ? purchaseId : null);
  const { data: defaults } = useCustomsDefaults(docDate.format("YYYY-MM-DD"));
  const vatRates = defaults?.vatRates ?? [];
  const percentOf = (rateId?: number | null) => vatRates.find((x) => x.id === rateId)?.rate ?? 0;

  const fallback = data ? undefined : defaults;
  const settlementAccount = settlementAccountId ?? fallback?.settlementAccountId ?? null;
  const vatAccount = vatAccountId ?? fallback?.vatAccountId ?? null;
  const costAccount = costAccountId ?? fallback?.costAccountId ?? null;

  const rawLines: CustomsLine[] = useMemo(
    () =>
      edited ??
      (base?.lines ?? []).map((line) => {
        const vat = round((line.customsValue * percentOf(line.vatRateId)) / 100);
        return { ...line, dutyRate: 0, dutyAmount: 0, exciseAmount: 0, feeAmount: 0, vatAmount: vat };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edited, base, vatRates],
  );

  // the fee of the whole declaration falls on the lines by customs value, the last the rounding
  const lines = useMemo(() => {
    if (readOnly) return rawLines;
    const total = rawLines.reduce((sum, line) => sum + line.customsValue, 0);
    let left = round(customsFee);
    return rawLines.map((line, index) => {
      const share = index === rawLines.length - 1 ? left : total > 0 ? round((customsFee * line.customsValue) / total) : 0;
      left = round(left - share);
      return { ...line, feeAmount: share };
    });
  }, [rawLines, customsFee, readOnly]);

  // a change to the value, the rate or the excise computes the duty and the VAT again
  const change = (purchaseLineId: number, patch: Partial<CustomsLine>, recompute: boolean) =>
    setEdited((current) =>
      (current ?? rawLines).map((line) => {
        if (line.purchaseLineId !== purchaseLineId) return line;
        const next = { ...line, ...patch };
        if (!recompute) return next;
        const duty = "dutyAmount" in patch ? next.dutyAmount : round((next.customsValue * next.dutyRate) / 100);
        const vat = round(((next.customsValue + duty + next.exciseAmount) * percentOf(next.vatRateId)) / 100);
        return { ...next, dutyAmount: duty, vatAmount: vat };
      }),
    );

  const totals = lines.reduce(
    (sum, line) => ({
      value: sum.value + line.customsValue,
      duty: sum.duty + line.dutyAmount,
      excise: sum.excise + line.exciseAmount,
      vat: sum.vat + line.vatAmount,
    }),
    { value: 0, duty: 0, excise: 0, vat: 0 },
  );
  const fee = readOnly ? (data?.customsFee ?? 0) : round(customsFee);
  const grandTotal = round(totals.duty + totals.excise + totals.vat + fee);

  const body = (): CustomsSave => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    purchaseDocId: purchaseId ?? 0,
    counterpartyId,
    declarationNumber: declarationNumber || null,
    customsFee,
    settlementAccountId: settlementAccount,
    vatAccountId: vatAccount,
    costAccountId: costAccount,
    comment: comment || null,
    lines: lines.map((line) => ({
      purchaseLineId: line.purchaseLineId,
      customsValue: line.customsValue,
      dutyRate: line.dutyRate,
      dutyAmount: line.dutyAmount,
      exciseAmount: line.exciseAmount,
      vatRateId: line.vatRateId ?? null,
      vatAmount: line.vatAmount,
    })),
  });

  const purchaseOptions = useMemo(() => {
    const options = purchases.map((item) => ({
      value: item.id,
      label: `№${item.docNumber} · ${dayjs(item.docDate).format("DD.MM.YYYY")}${
        item.counterpartyName ? ` · ${item.counterpartyName}` : ""
      } · ${money(item.finalAmount)}`,
    }));
    if (data && !options.some((option) => option.value === data.purchaseDocId))
      options.unshift({ value: data.purchaseDocId, label: `№${data.purchaseDocNumber ?? data.purchaseDocId}` });
    return options;
  }, [purchases, data]);

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("customs.saved"));
    if (!id) navigate(`${customsPath}/${savedId}`, { replace: true });
    return savedId;
  };

  const run = (action: () => Promise<unknown>) => () => void action().catch(errorHandlers);

  const numberInput = (value: number, onChange: (value: number) => void, precision = 2) =>
    readOnly ? (
      money(value)
    ) : (
      <InputNumber<number>
        className="w-full!"
        min={0}
        precision={precision}
        value={value}
        onChange={(next) => onChange(Number(next ?? 0))}
      />
    );

  const lineColumns: TableColumnsType<CustomsLine> = [
    { dataIndex: "productName", title: t("customs.product"), width: 200 },
    { dataIndex: "quantity", title: t("customs.quantity"), align: "right", width: 90 },
    {
      dataIndex: "customsValue",
      title: t("customs.customsValue"),
      width: 160,
      render: (value: number, line) => numberInput(value, (next) => change(line.purchaseLineId, { customsValue: next }, true)),
    },
    {
      dataIndex: "dutyRate",
      title: t("customs.dutyRate"),
      width: 100,
      render: (value: number, line) =>
        readOnly ? `${value}%` : numberInput(value, (next) => change(line.purchaseLineId, { dutyRate: next }, true), 4),
    },
    {
      dataIndex: "dutyAmount",
      title: t("customs.duty"),
      width: 150,
      render: (value: number, line) => numberInput(value, (next) => change(line.purchaseLineId, { dutyAmount: next }, true)),
    },
    {
      dataIndex: "exciseAmount",
      title: t("customs.excise"),
      width: 140,
      render: (value: number, line) => numberInput(value, (next) => change(line.purchaseLineId, { exciseAmount: next }, true)),
    },
    { dataIndex: "feeAmount", title: t("customs.feeShare"), align: "right", width: 130, render: (value: number) => money(value) },
    {
      dataIndex: "vatRateId",
      title: t("customs.vatRate"),
      width: 130,
      render: (value: number | null, line) =>
        readOnly ? (
          (vatRates.find((x) => x.id === value)?.name ?? "-")
        ) : (
          <Select
            className="w-full"
            allowClear
            value={value ?? undefined}
            options={vatRates.map((rate) => ({ value: rate.id, label: rate.name }))}
            onChange={(next?: number) => change(line.purchaseLineId, { vatRateId: next ?? null }, true)}
          />
        ),
    },
    {
      dataIndex: "vatAmount",
      title: t("customs.vat"),
      width: 150,
      render: (value: number, line) => numberInput(value, (next) => change(line.purchaseLineId, { vatAmount: next }, false)),
    },
  ];

  const effectColumns: TableColumnsType<ExtraCostEffect> = [
    { dataIndex: "productName", title: t("customs.product") },
    { dataIndex: "warehouseName", title: t("extraCost.warehouse") },
    { dataIndex: "batchNumber", title: t("extraCost.batch"), render: (value?: string | null) => value || "-" },
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
    { dataIndex: "quantity", title: t("customs.quantity"), align: "right", width: 110 },
    {
      dataIndex: "unitCostAdded",
      title: t("extraCost.unitCostAdded"),
      align: "right",
      width: 150,
      render: (value: number, row) => (row.kind === effectKind.inStock ? money(value) : "-"),
    },
    { dataIndex: "amount", title: t("extraCost.amount"), align: "right", width: 150, render: (value: number) => money(value) },
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
                <b>{data?.docNumber ?? t("customs.newNumber")}</b>
                <ExtraCostStatusTag statusId={statusId} />
              </Space>,
              "",
            )}
            {field(
              t("customs.date"),
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
              t("customs.declarationNumber"),
              <Input
                value={declarationNumber}
                disabled={readOnly}
                placeholder={t("customs.declarationPlaceholder")}
                onChange={(event) => setDeclarationNumber(event.target.value)}
              />,
              "w-56",
            )}
            {field(
              t("customs.purchase"),
              <Select
                className="w-full"
                showSearch
                filterOption={false}
                loading={searching}
                disabled={readOnly}
                value={purchaseId}
                placeholder={t("customs.purchasePlaceholder")}
                options={purchaseOptions}
                onSearch={setSearch}
                onChange={(value: number) => {
                  setPurchaseId(value);
                  setEdited(null);
                }}
              />,
              "min-w-96 flex-1",
            )}
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-72 flex-1">
              <CounterpartySelect
                kind="supplier"
                label="customs.customsOffice"
                marginBottom="mb-0!"
                clearable
                value={counterpartyId}
                disabled={readOnly}
                onChange={(value) => setCounterpartyId((value as number | null) ?? null)}
              />
            </div>
            {field(
              t("customs.fee"),
              <InputNumber<number>
                className="w-full!"
                min={0}
                precision={2}
                value={readOnly ? (data?.customsFee ?? 0) : customsFee}
                disabled={readOnly}
                onChange={(value) => setCustomsFee(Number(value ?? 0))}
              />,
              "w-48",
            )}
            {field(t("customs.total"), <b className="text-lg">{money(grandTotal)}</b>, "w-48")}
          </div>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
            <SelectCustom
              label="customs.settlementAccount"
              path="manuals/chart-accounts"
              search
              displayConfig={chartAccountSelectDisplayConfig}
              value={settlementAccount}
              disabled={readOnly}
              onChange={(value) => setSettlementAccountId((value as number | null) ?? null)}
            />
            <SelectCustom
              label="customs.vatAccount"
              path="manuals/chart-accounts"
              search
              displayConfig={chartAccountSelectDisplayConfig}
              value={vatAccount}
              disabled={readOnly || defaults?.vatPayer === false}
              onChange={(value) => setVatAccountId((value as number | null) ?? null)}
            />
            <SelectCustom
              label="customs.costAccount"
              path="manuals/chart-accounts"
              search
              displayConfig={chartAccountSelectDisplayConfig}
              value={costAccount}
              disabled={readOnly}
              onChange={(value) => setCostAccountId((value as number | null) ?? null)}
            />
          </div>
        </Form>

        {field(
          t("customs.comment"),
          <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />,
          "",
        )}

        <Space wrap>
          {!readOnly && (
            <Button icon={<Save className="size-4" />} loading={save.isPending} disabled={!purchaseId} onClick={run(saveDraft)}>
              {t("customs.saveDraft")}
            </Button>
          )}
          {statusId === customsStatus.draft && can(customsPermissions.confirm) && (
            <Button
              type="primary"
              icon={<Send className="size-4" />}
              disabled={!purchaseId}
              loading={save.isPending || confirm.isPending}
              onClick={run(async () => {
                const savedId = await saveDraft();
                await confirm.mutateAsync(savedId);
                toast.success(t("customs.posted"));
              })}
            >
              {t("customs.post")}
            </Button>
          )}
          {id && statusId === customsStatus.draft && can(customsPermissions.delete) && (
            <Popconfirm
              title={t("customs.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => remove.mutateAsync(id).then(() => navigate(customsPath, { replace: true })))}
            >
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
          {id && statusId === customsStatus.posted && can(customsPermissions.cancel) && (
            <Popconfirm
              title={t("customs.cancelConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => cancel.mutateAsync(id).then(() => toast.success(t("customs.cancelled"))))}
            >
              <Button danger icon={<Ban className="size-4" />}>
                {t("customs.cancel")}
              </Button>
            </Popconfirm>
          )}
          {id && (
            <AccountingEntriesButton documentId={id} documentTypeId={customsDocumentTypeId} statusId={statusId}>
              {t("customs.entries")}
            </AccountingEntriesButton>
          )}
        </Space>
      </Card>

      {!readOnly && <Alert showIcon type="info" message={t("customs.hint")} />}

      <Card className="overflow-hidden border border-border">
        <div className="px-4 pt-3 font-semibold">{t("customs.lines")}</div>
        <Table<CustomsLine>
          rowKey="purchaseLineId"
          size="middle"
          scroll={{ x: 1300 }}
          columns={lineColumns}
          dataSource={lines}
          pagination={false}
          footer={() => (
            <div className="flex flex-wrap justify-end gap-6">
              <span>
                {t("customs.customsValue")}: <b>{money(totals.value)}</b>
              </span>
              <span>
                {t("customs.duty")}: <b>{money(totals.duty)}</b>
              </span>
              <span>
                {t("customs.excise")}: <b>{money(totals.excise)}</b>
              </span>
              <span>
                {t("customs.fee")}: <b>{money(fee)}</b>
              </span>
              <span>
                {t("customs.vat")}: <b>{money(totals.vat)}</b>
              </span>
            </div>
          )}
        />
      </Card>

      {data && data.effects.length > 0 && (
        <Card className="overflow-hidden border border-border">
          <div className="px-4 pt-3 font-semibold">{t("extraCost.effectsTitle")}</div>
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
