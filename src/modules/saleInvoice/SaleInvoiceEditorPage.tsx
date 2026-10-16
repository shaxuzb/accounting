import { useMemo, useState } from "react";
import { Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Copy, Plus, Printer, Save, ShoppingCart, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import { getJson } from "@/modules/accountings/services/request";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { contractTypeIds, takeMainOrOnlyContract } from "@/shared/constants/contractSelect";
import { useVatPayer } from "@/shared/hooks/useVatPayer";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import {
  saleInvoicePath,
  saleInvoicePermissions,
  useDeleteSaleInvoice,
  useSaleInvoice,
  useSaveSaleInvoice,
  useSetSaleInvoiceStatus,
  type SaleInvoice,
  type SaleInvoiceLine,
} from "./api";
import SaleInvoiceStatusTag from "./SaleInvoiceStatusTag";

const round2 = (value: number) => Math.round(value * 100) / 100;
const percentOf = (name?: string | null) => Number(name?.match(/(\d+(?:[.,]\d+)?)/)?.[1]?.replace(",", ".") ?? 0);
const emptyLine = (): SaleInvoiceLine => ({ productId: null, quantity: 1, price: 0, vatRateId: null });

export default function SaleInvoiceEditorPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useSaleInvoice(id);
  if (id && (isLoading || !data)) return null;
  return <SaleInvoiceEditor key={`${id}-${data?.statusId ?? 0}`} id={id} data={data} />;
}

/**
 * 1C «Счет на оплату покупателю»: the customer and its contract (the main or only one taken),
 * the account to pay to, the term (from the contract when left empty) and the lines at prices
 * without VAT. It posts nothing; «Sotuv yaratish» opens a sale on its basis.
 */
function SaleInvoiceEditor({ id, data }: { id: number | null; data?: SaleInvoice }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const canEdit = permissions.includes(saleInvoicePermissions.create);
  const save = useSaveSaleInvoice();
  const setStatus = useSetSaleInvoiceStatus();
  const remove = useDeleteSaleInvoice();

  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [counterpartyId, setCounterpartyId] = useState<number | null>(data?.counterpartyId ?? null);
  const [contractId, setContractId] = useState<number | null>(data?.contractId ?? null);
  const [bankAccountId, setBankAccountId] = useState<number | null>(data?.bankAccountId ?? null);
  const [currencyId, setCurrencyId] = useState<number | null>(data?.currencyId ?? 1);
  const [dueDate, setDueDate] = useState(data?.dueDate ? dayjs(data.dueDate) : null);
  const [comment, setComment] = useState(data?.comment ?? "");
  const [lines, setLines] = useState<SaleInvoiceLine[]>(() =>
    data?.lines?.length ? data.lines.map((line) => ({ ...line })) : [emptyLine()],
  );
  const vatPayer = useVatPayer(docDate.format("YYYY-MM-DD"));

  const { data: vatRates = [] } = useQuery({
    queryKey: ["sale-invoice", "vat-rates"],
    queryFn: () => getJson<{ id: number; name: string }[]>(`/${selectListEndpoints.vatRatesSelectList}`),
    staleTime: 10 * 60 * 1000,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["sale-invoice", "products"],
    queryFn: () => getJson<{ id: number; name: string; code?: string | null }[]>(`/${selectListEndpoints.productsSelectList}`),
    staleTime: 5 * 60 * 1000,
  });
  const rateOf = (vatRateId?: number | null) =>
    vatPayer.isVatPayer ? percentOf(vatRates.find((rate) => rate.id === vatRateId)?.name) : 0;

  const computed = useMemo(
    () =>
      lines.map((line) => {
        const amount = round2((Number(line.quantity) || 0) * (Number(line.price) || 0));
        const vat = round2((amount * rateOf(line.vatRateId)) / 100);
        return { ...line, amount, vatAmount: vat, totalAmount: amount + vat };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, vatRates, vatPayer.isVatPayer],
  );
  const totals = computed.reduce(
    (sum, line) => ({ amount: sum.amount + line.amount, vat: sum.vat + line.vatAmount, total: sum.total + line.totalAmount }),
    { amount: 0, vat: 0, total: 0 },
  );

  const patchLine = (index: number, patch: Partial<SaleInvoiceLine>) =>
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  const body = () => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    counterpartyId: counterpartyId ?? 0,
    contractId,
    bankAccountId,
    currencyId: currencyId ?? 1,
    dueDate: dueDate ? dueDate.format("YYYY-MM-DD") : null,
    comment: comment.trim() || null,
    lines: lines
      .filter((line) => line.productId)
      .map((line) => ({
        productId: Number(line.productId),
        unitId: line.unitId ?? null,
        quantity: Number(line.quantity) || 0,
        price: Number(line.price) || 0,
        vatRateId: vatPayer.isVatPayer ? line.vatRateId ?? null : null,
      })),
  });

  const run = (action: () => Promise<unknown>) => () => void action().catch(errorHandlers);
  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("saleInvoice.saved"));
    if (!id) navigate(`${saleInvoicePath}/${savedId}`, { replace: true });
    return savedId;
  };

  const columns: TableColumnsType<SaleInvoiceLine & { amount: number; vatAmount: number; totalAmount: number }> = [
    { key: "n", title: "№", width: 50, render: (_, __, index) => index + 1 },
    {
      key: "product",
      title: t("saleInvoice.product"),
      render: (_, line, index) => (
        <Select
          showSearch
          className="w-full min-w-64"
          disabled={!canEdit}
          value={line.productId ?? undefined}
          placeholder={t("saleInvoice.productPlaceholder")}
          optionFilterProp="label"
          options={products.map((product) => ({
            value: product.id,
            label: product.code ? `${product.name} (${product.code})` : product.name,
          }))}
          onChange={(value: number) => patchLine(index, { productId: value, unitId: null })}
        />
      ),
    },
    {
      key: "quantity",
      title: t("saleInvoice.quantity"),
      width: 130,
      render: (_, line, index) => (
        <InputNumber min={0} disabled={!canEdit} value={line.quantity} onChange={(value) => patchLine(index, { quantity: Number(value ?? 0) })} />
      ),
    },
    {
      key: "price",
      title: vatPayer.isVatPayer ? t("saleInvoice.priceNet") : t("saleInvoice.price"),
      width: 160,
      render: (_, line, index) => (
        <InputNumber min={0} disabled={!canEdit} value={line.price} onChange={(value) => patchLine(index, { price: Number(value ?? 0) })} />
      ),
    },
    ...(vatPayer.isVatPayer
      ? ([
          {
            key: "vat",
            title: t("saleInvoice.vatRate"),
            width: 140,
            render: (_: unknown, line: SaleInvoiceLine, index: number) => (
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                className="w-full"
                disabled={!canEdit}
                value={line.vatRateId ?? undefined}
                options={vatRates.map((rate) => ({ value: rate.id, label: rate.name }))}
                onChange={(value?: number) => patchLine(index, { vatRateId: value ?? null })}
              />
            ),
          },
          {
            dataIndex: "vatAmount",
            title: t("saleInvoice.vatAmount"),
            width: 140,
            align: "right",
            render: (value: number) => numberSpacing(value, undefined, true),
          },
        ] as TableColumnsType<SaleInvoiceLine & { amount: number; vatAmount: number; totalAmount: number }>)
      : []),
    {
      dataIndex: "totalAmount",
      title: t("saleInvoice.total"),
      width: 150,
      align: "right",
      render: (value: number) => <b>{numberSpacing(value, undefined, true)}</b>,
    },
    {
      key: "remove",
      width: 50,
      render: (_, __, index) =>
        canEdit && lines.length > 1 ? (
          <Button type="text" danger icon={<Trash2 className="size-4" />} onClick={() => setLines((current) => current.filter((_, i) => i !== index))} />
        ) : null,
    },
  ];

  return (
    <div className="w-full space-y-3">
      <Card className="space-y-4 border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <b>№ {data?.docNumber ?? t("saleInvoice.newNumber")}</b>
          {data && <SaleInvoiceStatusTag statusId={data.statusId} />}
        </div>
        <Form layout="vertical" component="div">
        <div className="grid gap-x-4 md:grid-cols-3 xl:grid-cols-6">
          <div>
            <div className="mb-1 text-sm text-secondary-text">{t("saleInvoice.date")}</div>
            <DatePicker className="w-full" format="DD.MM.YYYY" allowClear={false} disabled={!canEdit} value={docDate} onChange={(value) => value && setDocDate(value)} />
          </div>
          <div className="xl:col-span-2">
            <SelectCustom
              label="saleInvoice.customer"
              path={selectListEndpoints.counterpartiesSelectList}
              value={counterpartyId}
              disabled={!canEdit}
              search
              required
              onChange={(value) => {
                setCounterpartyId(value ? Number(value) : null);
                setContractId(null);
              }}
              marginBottom="mb-4"
            />
          </div>
          <div>
            <SelectCustom
              key={`contract-${counterpartyId}`}
              label="saleInvoice.contract"
              path={selectListEndpoints.contractsSelectList}
              queryParams={{
                [filterIds.counterparty]: counterpartyId,
                [filterIds.contractType]: contractTypeIds.customer,
                choosedDate: docDate.format("YYYY-MM-DD"),
              }}
              enabled={Boolean(counterpartyId)}
              disabled={!canEdit || !counterpartyId}
              value={contractId}
              getFirstWhen={takeMainOrOnlyContract}
              onChange={(value) => setContractId(value ? Number(value) : null)}
              clearable
              marginBottom="mb-4"
            />
          </div>
          <div>
            <SelectCustom
              label="saleInvoice.bankAccount"
              path={selectListEndpoints.orgBankAccountsSelectList}
              value={bankAccountId}
              disabled={!canEdit}
              clearable
              onChange={(value) => setBankAccountId(value ? Number(value) : null)}
              marginBottom="mb-4"
            />
          </div>
          <div>
            <SelectCustom
              label="saleInvoice.currency"
              path={selectListEndpoints.currenciesSelectList}
              value={currencyId}
              disabled={!canEdit}
              onChange={(value) => setCurrencyId(value ? Number(value) : null)}
              marginBottom="mb-4"
            />
          </div>
          <div>
            <div className="mb-1 text-sm text-secondary-text">{t("saleInvoice.dueDate")}</div>
            <DatePicker
              className="w-full"
              format="DD.MM.YYYY"
              disabled={!canEdit}
              value={dueDate}
              placeholder={t("saleInvoice.dueDateAuto")}
              onChange={(value) => setDueDate(value)}
            />
          </div>
          <div className="md:col-span-2 xl:col-span-5">
            <div className="mb-1 text-sm text-secondary-text">{t("saleInvoice.comment")}</div>
            <Input value={comment} disabled={!canEdit} onChange={(event) => setComment(event.target.value)} />
          </div>
        </div>
        </Form>

        <Space wrap>
          {canEdit && (
            <Button type="primary" icon={<Save className="size-4" />} loading={save.isPending} onClick={run(saveDraft)}>
              {t("saleInvoice.save")}
            </Button>
          )}
          {id && (
            <Button icon={<Printer className="size-4" />} onClick={() => navigate(`${saleInvoicePath}/${id}/print`)}>
              {t("saleInvoice.print")}
            </Button>
          )}
          {id && data && data.statusId !== 4 && (
            <Button icon={<ShoppingCart className="size-4" />} onClick={() => navigate(`/main/sales/sale/add?invoice=${id}`)}>
              {t("saleInvoice.createSale")}
            </Button>
          )}
          {id && canEdit && (
            <Select
              className="w-52"
              value={data?.statusId}
              loading={setStatus.isPending}
              options={[1, 2, 3, 4].map((status) => ({ value: status, label: t(`saleInvoice.status.${status}`) }))}
              onChange={(status: number) =>
                void setStatus
                  .mutateAsync({ id, statusId: status })
                  .then(() => toast.success(t("saleInvoice.statusSaved")))
                  .catch(errorHandlers)
              }
            />
          )}
          {id && permissions.includes(saleInvoicePermissions.delete) && (
            <Popconfirm
              title={t("saleInvoice.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => remove.mutateAsync(id).then(() => navigate(saleInvoicePath, { replace: true })))}
            >
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
        </Space>
        {data?.sales?.length ? (
          <div className="text-sm text-secondary-text">
            {t("saleInvoice.sales")}:{" "}
            {data.sales.map((sale) => (
              <Button key={sale.id} type="link" size="small" onClick={() => navigate(`/main/sales/sale/${sale.id}`)}>
                №{sale.docNumber} · {dayjs(sale.docDate).format("DD.MM.YYYY")}
              </Button>
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden border border-border">
        <Table
          rowKey={(_, index) => String(index)}
          size="middle"
          pagination={false}
          columns={columns}
          dataSource={computed}
          scroll={{ x: "max-content" }}
          footer={() => (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {canEdit ? (
                <Space>
                  <Button icon={<Plus className="size-4" />} onClick={() => setLines((current) => [...current, emptyLine()])}>
                    {t("saleInvoice.addLine")}
                  </Button>
                  {lines.length > 0 && (
                    <Button
                      icon={<Copy className="size-4" />}
                      onClick={() => setLines((current) => [...current, { ...current[current.length - 1], id: undefined }])}
                    >
                      {t("saleInvoice.copyLine")}
                    </Button>
                  )}
                </Space>
              ) : (
                <span />
              )}
              <div className="text-right">
                {vatPayer.isVatPayer && (
                  <span className="mr-6">
                    {t("saleInvoice.amountNet")}: <b>{numberSpacing(totals.amount, undefined, true)}</b> · {t("saleInvoice.vatAmount")}:{" "}
                    <b>{numberSpacing(totals.vat, undefined, true)}</b>
                  </span>
                )}
                {t("saleInvoice.total")}: <b>{numberSpacing(totals.total, undefined, true)}</b>
              </div>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
