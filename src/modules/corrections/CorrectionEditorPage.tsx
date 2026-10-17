import { Alert, Button, DatePicker, Input, InputNumber, Popconfirm, Radio, Select, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import DocumentEsfButton from "@/modules/settings/pages/integrations/edo/components/DocumentEsfButton";
import { effectTag } from "@/modules/extraCosts/constants";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCorrection,
  useCorrectionAction,
  useCorrectionBases,
  useCorrectionPreview,
  useSaveCorrection,
  type CorrectionDocument,
  type CorrectionEffect,
  type CorrectionLine,
  type CorrectionSave,
} from "./api";
import {
  correctionPermissions,
  correctionReason,
  corrections,
  correctionStatus,
  money,
  type CorrectionKind,
} from "./constants";
import { CorrectionStatusTag } from "./CorrectionListPage";

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
 * A correction of a posted sale or purchase (1C «Корректировка реализации / поступления»):
 * the base document's lines with a new price each; the difference posts on the correction's date.
 */
export default function CorrectionEditorPage({ kind }: { kind: CorrectionKind }) {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useCorrection(kind, id);
  if (id && (isLoading || !data)) return null;
  return <CorrectionEditor key={`${kind}-${id}-${data?.statusId ?? 0}`} kind={kind} id={id} data={data} />;
}

function CorrectionEditor({ kind, id, data }: { kind: CorrectionKind; id: number | null; data?: CorrectionDocument }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const doc = corrections[kind];
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => permissions.includes(code);
  const save = useSaveCorrection(kind);
  const confirm = useCorrectionAction(kind, "confirm");
  const cancel = useCorrectionAction(kind, "cancel");
  const remove = useCorrectionAction(kind, "delete");

  const statusId = data?.statusId ?? correctionStatus.draft;
  const readOnly = statusId !== correctionStatus.draft || !can(correctionPermissions.create);

  // «Создать на основании»: opened from a posted sale or purchase, the correction starts on it
  const [searchParams] = useSearchParams();
  const [baseId, setBaseId] = useState<number | null>(() => data?.baseDocumentId ?? (Number(searchParams.get("base")) || null));
  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [reason, setReason] = useState<number>(data?.reason ?? correctionReason.price);
  const [comment, setComment] = useState(data?.comment ?? "");
  const [prices, setPrices] = useState<Record<number, number>>(() =>
    Object.fromEntries((data?.lines ?? []).map((line) => [line.baseLineId, line.newUnitPrice])),
  );
  const [search, setSearch] = useState("");
  const { data: bases = [], isFetching: searching } = useCorrectionBases(kind, search, !readOnly);

  const body = (): CorrectionSave => ({
    kind: doc.kind,
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    baseDocumentId: baseId ?? 0,
    reason,
    comment: comment || null,
    lines: Object.entries(prices).map(([baseLineId, newUnitPrice]) => ({
      baseLineId: Number(baseLineId),
      newUnitPrice,
    })),
  });

  const previewBody = useSettled(!readOnly && baseId ? body() : null);
  const preview = useCorrectionPreview(kind, previewBody);
  const view = readOnly ? data : (preview.data ?? data);
  const lines = view?.lines ?? [];
  const baseDocNumber = view?.baseDocNumber;

  const baseOptions = useMemo(() => {
    const options = bases.map((item) => ({
      value: item.id,
      label: `№${item.docNumber} · ${dayjs(item.docDate).format("DD.MM.YYYY")}${
        item.counterpartyName ? ` · ${item.counterpartyName}` : ""
      } · ${money(item.finalAmount)}`,
    }));
    if (baseId && baseDocNumber && !options.some((option) => option.value === baseId))
      options.unshift({ value: baseId, label: `№${baseDocNumber}` });
    return options;
  }, [bases, baseId, baseDocNumber]);

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("correction.saved"));
    if (!id) navigate(`${doc.path}/${savedId}`, { replace: true });
    return savedId;
  };
  const run = (action: () => Promise<unknown>) => () => void action().catch(errorHandlers);

  const delta = (value: number) =>
    value === 0 ? <span className="text-secondary-text">0</span> : <b className={value < 0 ? "text-red-600" : "text-green-700"}>{money(value)}</b>;

  const columns: TableColumnsType<CorrectionLine> = [
    { dataIndex: "productName", title: t("correction.product") },
    { dataIndex: "quantity", title: t("correction.quantity"), align: "right", width: 100 },
    { dataIndex: "vatRateName", title: t("correction.vatRate"), width: 110, render: (value?: string | null) => value || "-" },
    { dataIndex: "oldUnitPrice", title: t("correction.oldPrice"), align: "right", width: 140, render: (value: number) => money(value) },
    {
      dataIndex: "newUnitPrice",
      title: t("correction.newPrice"),
      align: "right",
      width: 160,
      render: (value: number, line) =>
        readOnly ? (
          <b>{money(value)}</b>
        ) : (
          <InputNumber<number>
            className="w-full!"
            min={0}
            precision={2}
            value={prices[line.baseLineId] ?? value}
            onChange={(next) =>
              setPrices((current) => ({ ...current, [line.baseLineId]: Number(next ?? line.oldUnitPrice) }))
            }
          />
        ),
    },
    { dataIndex: "oldAmount", title: t("correction.oldAmount"), align: "right", width: 140, render: (value: number) => money(value) },
    { dataIndex: "newAmount", title: t("correction.newAmount"), align: "right", width: 140, render: (value: number) => money(value) },
    { dataIndex: "amountDelta", title: t("correction.amountDelta"), align: "right", width: 140, render: delta },
    { dataIndex: "vatDelta", title: t("correction.vatDelta"), align: "right", width: 120, render: delta },
  ];

  const effectColumns: TableColumnsType<CorrectionEffect> = [
    { dataIndex: "productName", title: t("correction.product") },
    { dataIndex: "batchId", title: t("correction.batch"), width: 100 },
    {
      dataIndex: "kind",
      title: t("correction.effect"),
      render: (value: number) =>
        <Tag color={effectTag(value).color}>{t(`correction.effects.${effectTag(value).key}`)}</Tag>,
    },
    { dataIndex: "quantity", title: t("correction.quantity"), align: "right", width: 110 },
    { dataIndex: "unitCostAdded", title: t("correction.unitCostAdded"), align: "right", width: 150, render: (value: number, row) => (row.kind === 1 || row.kind === 4 ? money(value) : "-") },
    { dataIndex: "amount", title: t("correction.amount"), align: "right", width: 150, render: (value: number) => money(value) },
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
          {field(
            "№",
            <Space>
              <b>{data?.docNumber ?? t("correction.newNumber")}</b>
              <CorrectionStatusTag statusId={statusId} />
            </Space>,
            "",
          )}
          {field(
            t("correction.date"),
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
            t(kind === "sale" ? "correction.baseSale" : "correction.basePurchase"),
            <Select
              className="w-full"
              showSearch
              filterOption={false}
              loading={searching}
              disabled={readOnly || Boolean(id)}
              value={baseId}
              placeholder={t("correction.basePlaceholder")}
              options={baseOptions}
              onSearch={setSearch}
              onChange={(value: number) => {
                setBaseId(value);
                setPrices({});
              }}
            />,
            "min-w-96 flex-1",
          )}
          {view?.counterpartyName && field(t("correction.counterparty"), <b>{view.counterpartyName}</b>, "")}
        </div>

        {kind === "sale" &&
          field(
            t("correction.reason"),
            <Radio.Group
              disabled={readOnly}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              options={[
                { value: correctionReason.price, label: t("correction.reasons.price") },
                { value: correctionReason.discount, label: t("correction.reasons.discount") },
              ]}
            />,
            "",
          )}

        {field(
          t("correction.comment"),
          <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />,
          "",
        )}

        <Space wrap>
          {!readOnly && (
            <Button icon={<Save className="size-4" />} loading={save.isPending} disabled={!baseId} onClick={run(saveDraft)}>
              {t("correction.saveDraft")}
            </Button>
          )}
          {statusId === correctionStatus.draft && can(correctionPermissions.confirm) && (
            <Button
              type="primary"
              icon={<Send className="size-4" />}
              disabled={!baseId}
              loading={save.isPending || confirm.isPending}
              onClick={run(async () => {
                const savedId = await saveDraft();
                await confirm.mutateAsync(savedId);
                toast.success(t("correction.posted"));
              })}
            >
              {t("correction.post")}
            </Button>
          )}
          {id && statusId === correctionStatus.draft && can(correctionPermissions.delete) && (
            <Popconfirm
              title={t("correction.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => remove.mutateAsync(id).then(() => navigate(doc.path, { replace: true })))}
            >
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
          {id && statusId === correctionStatus.posted && can(correctionPermissions.cancel) && (
            <Popconfirm
              title={t("correction.cancelConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => cancel.mutateAsync(id).then(() => toast.success(t("correction.cancelled"))))}
            >
              <Button danger icon={<Ban className="size-4" />}>
                {t("correction.cancel")}
              </Button>
            </Popconfirm>
          )}
          {id && (
            <AccountingEntriesButton documentId={id} documentTypeId={doc.documentTypeId} statusId={statusId}>
              {t("correction.entries")}
            </AccountingEntriesButton>
          )}
          {/* a sale correction: the additional ESF of the change of price (Tax Code 257) */}
          {id && statusId === 2 && kind === "sale" && <DocumentEsfButton kind="correction" documentId={id} />}
        </Space>
      </Card>

      {!readOnly && <Alert showIcon type="info" message={t(kind === "sale" ? "correction.sale.hint" : "correction.purchase.hint")} />}
      {!readOnly && preview.isError && baseId && (
        <Alert showIcon type="warning" message={t("correction.previewFailed")} />
      )}

      <Card className="overflow-hidden border border-border">
        <div className="px-4 pt-3 font-semibold">{t("correction.lines")}</div>
        <Table<CorrectionLine>
          rowKey="baseLineId"
          size="middle"
          loading={!readOnly && preview.isFetching}
          columns={columns}
          dataSource={lines}
          pagination={false}
          scroll={{ x: "max-content" }}
          footer={() => (
            <div className="flex flex-wrap justify-end gap-6">
              <span>
                {t("correction.amountDelta")}: {delta(view?.amountDelta ?? 0)}
              </span>
              <span>
                {t("correction.vatDelta")}: {delta(view?.vatDelta ?? 0)}
              </span>
              <span>
                {t("correction.totalDelta")}: {delta(view?.totalDelta ?? 0)}
              </span>
            </div>
          )}
        />
      </Card>

      {data && data.effects.length > 0 && (
        <Card className="overflow-hidden border border-border">
          <div className="px-4 pt-3 font-semibold">{t("correction.effectsTitle")}</div>
          <Table<CorrectionEffect>
            rowKey={(row) => `${row.batchId}-${row.kind}-${row.amount}`}
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
