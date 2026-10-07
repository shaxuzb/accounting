import { Alert, Button, DatePicker, Input, InputNumber, Popconfirm, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Save, Send, Trash2, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/modules/accountings/services/request";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import {
  useCancelReturn,
  useConfirmReturn,
  useDeleteReturn,
  useReturn,
  useReturnBaseDocument,
  useReturnBaseDocuments,
  useSaveReturn,
  type ReturnDocument,
  type ReturnLine,
} from "./api";
import {
  returnDocumentTypeId,
  returnKind,
  returnPaths,
  returnPermissions,
  returnStatus,
  type ReturnKind,
} from "./constants";
import { ReturnStatusTag } from "./ReturnListPage";

const money = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * A return on the basis of a posted document (1C «Возврат товаров … на основании»): the base
 * gives the lines, prices, VAT and accounts; the user only says how much of each goes back.
 */
export default function ReturnEditorPage({ kind }: { kind: ReturnKind }) {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useReturn(id);
  if (id && (isLoading || !data)) return null;
  return <ReturnEditor key={`${id}-${data?.statusId ?? 0}`} kind={kind} id={id} data={data} />;
}

function ReturnEditor({ kind, id, data }: { kind: ReturnKind; id: number | null; data?: ReturnDocument }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const path = returnPaths[kind];
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => permissions.includes(code);
  const save = useSaveReturn();
  const confirm = useConfirmReturn();
  const cancel = useCancelReturn();
  const remove = useDeleteReturn();

  const statusId = data?.statusId ?? returnStatus.draft;
  const readOnly = statusId !== returnStatus.draft || !can(returnPermissions.create);

  const [baseDocumentId, setBaseDocumentId] = useState<number | null>(data?.baseDocumentId ?? null);
  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [comment, setComment] = useState(data?.comment ?? "");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries((data?.lines ?? []).map((line) => [line.baseLineId, line.quantity])),
  );
  // goods kept by marking code come back by code
  const [codes, setCodes] = useState<Record<number, number[]>>(() =>
    Object.fromEntries((data?.lines ?? []).map((line) => [line.baseLineId, line.productTableIds ?? []])),
  );

  const { data: baseDocuments = [], isFetching: searching } = useReturnBaseDocuments(kind, search);
  const { data: baseDocument } = useReturnBaseDocument(kind, readOnly ? null : baseDocumentId);

  // a draft edits the base's lines; a posted return shows its own as they were posted
  const lines: ReturnLine[] = useMemo(() => {
    if (readOnly && data) return data.lines;
    return (baseDocument?.lines ?? []).map((line) => {
      const quantity = quantities[line.baseLineId] ?? 0;
      const amount = Math.round(line.unitPrice * quantity * 100) / 100;
      return { ...line, quantity, amount, totalAmount: amount };
    });
  }, [readOnly, data, baseDocument, quantities]);

  // the money is in the base document's currency (a purchase in USD is returned in USD)
  const currencyId = baseDocument?.currencyId ?? data?.currencyId ?? 1;
  const { data: currencies = [] } = useQuery({
    queryKey: ["selectlist", "currencies-codes"],
    queryFn: () => getJson<{ id: number; code?: string; name?: string }[]>("/manuals/currencies"),
    staleTime: 10 * 60 * 1000,
  });
  const currencyCode =
    currencies.find((item) => item.id === currencyId)?.code ??
    currencies.find((item) => item.id === currencyId)?.name ??
    "UZS";

  const total = lines.reduce((sum, line) => sum + (readOnly ? line.totalAmount : line.amount), 0);

  const baseOptions = useMemo(() => {
    const options = baseDocuments.map((item) => ({
      value: item.id,
      label: `№${item.docNumber} · ${dayjs(item.docDate).format("DD.MM.YYYY")}${
        item.counterpartyName ? ` · ${item.counterpartyName}` : ""
      } · ${money(item.finalAmount)}`,
    }));
    if (data && !options.some((option) => option.value === data.baseDocumentId))
      options.unshift({ value: data.baseDocumentId, label: `№${data.baseDocNumber ?? data.baseDocumentId}` });
    return options;
  }, [baseDocuments, data]);

  const body = () => ({
    kind,
    baseDocumentId: baseDocumentId ?? 0,
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    comment: comment || null,
    lines: Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([baseLineId, quantity]) => ({
        baseLineId: Number(baseLineId),
        quantity,
        productTableIds: codes[Number(baseLineId)] ?? [],
      })),
  });

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("returnDoc.saved"));
    if (!id) navigate(`${path}/${savedId}`, { replace: true });
    return savedId;
  };

  const run = (action: () => Promise<unknown>) => () => void action().catch(errorHandlers);

  const columns: TableColumnsType<ReturnLine> = [
    {
      dataIndex: "productName",
      title: t("returnDoc.product"),
      render: (value: string, line) =>
        readOnly && line.productTableIds?.length ? (
          <div>
            <div>{value}</div>
            <div className="text-xs text-secondary-text">
              {line.productTableIds
                .map((id) => line.units?.find((unit) => unit.productTableId === id)?.markingNumber ?? `#${id}`)
                .join(", ")}
            </div>
          </div>
        ) : (
          value
        ),
    },
    {
      dataIndex: "unitPrice",
      title: t("returnDoc.price"),
      align: "right",
      width: 140,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "returnableQuantity",
      title: t("returnDoc.returnable"),
      align: "right",
      width: 130,
    },
    {
      dataIndex: "quantity",
      title: t("returnDoc.quantity"),
      align: "right",
      width: 150,
      render: (value: number, line) =>
        readOnly ? (
          value
        ) : line.isPieceTracked ? (
          <Select
            mode="multiple"
            className="min-w-56"
            popupMatchSelectWidth={false}
            placeholder={t("returnDoc.chooseCodes")}
            value={codes[line.baseLineId] ?? []}
            options={(line.units ?? []).map((unit) => ({
              value: unit.productTableId,
              label: unit.markingNumber || unit.serialNumber || `#${unit.productTableId}`,
            }))}
            onChange={(next: number[]) => {
              setCodes((current) => ({ ...current, [line.baseLineId]: next }));
              setQuantities((current) => ({ ...current, [line.baseLineId]: next.length }));
            }}
          />
        ) : (
          <InputNumber
            min={0}
            max={line.returnableQuantity}
            value={value || null}
            onChange={(next) =>
              setQuantities((current) => ({ ...current, [line.baseLineId]: Number(next ?? 0) }))
            }
          />
        ),
    },
    {
      dataIndex: readOnly ? "totalAmount" : "amount",
      title: readOnly ? t("returnDoc.total") : t("returnDoc.amountNet"),
      align: "right",
      width: 160,
      render: (value: number) => money(value),
    },
  ];

  return (
    <div className="w-full space-y-3">
      <Card className="space-y-4 border border-border p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="mb-1 text-sm text-secondary-text">№</div>
            <Space>
              <b>{data?.docNumber ?? t("returnDoc.newNumber")}</b>
              <ReturnStatusTag statusId={statusId} />
            </Space>
          </div>
          <div>
            <div className="mb-1 text-sm text-secondary-text">{t("returnDoc.date")}</div>
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD.MM.YYYY HH:mm"
              value={docDate}
              allowClear={false}
              disabled={readOnly}
              onChange={(value) => value && setDocDate(value)}
            />
          </div>
          <div className="min-w-96 flex-1">
            <div className="mb-1 text-sm text-secondary-text">{t("returnDoc.baseDocument")}</div>
            <Select
              className="w-full"
              showSearch
              filterOption={false}
              loading={searching}
              disabled={readOnly || Boolean(id)}
              value={baseDocumentId}
              placeholder={t(`returnDoc.basePlaceholder.${kind}`)}
              options={baseOptions}
              onSearch={setSearch}
              onChange={(value: number) => {
                setBaseDocumentId(value);
                setQuantities({});
                setCodes({});
              }}
            />
          </div>
          <div className="min-w-64 flex-1">
            <div className="mb-1 text-sm text-secondary-text">{t("returnDoc.comment")}</div>
            <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />
          </div>
        </div>

        {(baseDocument || data) && (
          <div className="text-sm text-secondary-text">
            {kind !== returnKind.fromRetail && (
              <span className="mr-4">
                {t("returnDoc.counterparty")}: <b>{baseDocument?.counterpartyName ?? data?.counterpartyName}</b>
              </span>
            )}
            <span className="mr-4">
              {t("returnDoc.warehouse")}: <b>{baseDocument?.warehouseName ?? data?.warehouseName}</b>
            </span>
            <span>
              {t("returnDoc.currency")}: <b>{currencyCode}</b>
            </span>
          </div>
        )}

        <Space wrap>
          {!readOnly && (
            <>
              <Button
                icon={<Undo2 className="size-4" />}
                disabled={!baseDocument}
                onClick={() => {
                  const baseLines = baseDocument?.lines ?? [];
                  setQuantities(Object.fromEntries(baseLines.map((line) => [line.baseLineId, line.returnableQuantity])));
                  setCodes(
                    Object.fromEntries(
                      baseLines
                        .filter((line) => line.isPieceTracked)
                        .map((line) => [line.baseLineId, (line.units ?? []).map((unit) => unit.productTableId)]),
                    ),
                  );
                }}
              >
                {t("returnDoc.returnAll")}
              </Button>
              <Button icon={<Save className="size-4" />} loading={save.isPending} onClick={run(saveDraft)}>
                {t("returnDoc.saveDraft")}
              </Button>
            </>
          )}
          {statusId === returnStatus.draft && can(returnPermissions.confirm) && (
            <Button
              type="primary"
              icon={<Send className="size-4" />}
              loading={save.isPending || confirm.isPending}
              onClick={run(async () => {
                const savedId = await saveDraft();
                await confirm.mutateAsync(savedId);
                toast.success(t("returnDoc.posted"));
              })}
            >
              {t("returnDoc.post")}
            </Button>
          )}
          {id && statusId === returnStatus.draft && can(returnPermissions.delete) && (
            <Popconfirm
              title={t("returnDoc.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => remove.mutateAsync(id).then(() => navigate(path, { replace: true })))}
            >
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
          {id && statusId === returnStatus.posted && can(returnPermissions.cancel) && (
            <Popconfirm
              title={t("returnDoc.cancelConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => cancel.mutateAsync(id).then(() => toast.success(t("returnDoc.cancelled"))))}
            >
              <Button danger icon={<Ban className="size-4" />}>
                {t("returnDoc.cancel")}
              </Button>
            </Popconfirm>
          )}
          {id && (
            <AccountingEntriesButton documentId={id} documentTypeId={returnDocumentTypeId(kind)} statusId={statusId}>
              {t("returnDoc.entries")}
            </AccountingEntriesButton>
          )}
        </Space>
      </Card>

      {!readOnly && !baseDocumentId && <Alert showIcon type="info" message={t(`returnDoc.hint.${kind}`)} />}

      <Card className="overflow-hidden border border-border">
        <Table<ReturnLine>
          rowKey="baseLineId"
          size="middle"
          columns={columns}
          dataSource={lines}
          pagination={false}
          footer={() => (
            <div className="text-right">
              {readOnly ? t("returnDoc.total") : t("returnDoc.amountNet")}: <b>{money(total)} {currencyCode}</b>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
