import { useMemo, useState } from "react";
import { Alert, Button, DatePicker, Descriptions, Form, Input, InputNumber, Popconfirm, Radio, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, CheckCircle, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  commissionReportKinds,
  commissionReportPath,
  commissionReportPermissions,
  commissionReportStatus,
  money,
  useCommissionReport,
  useCommissionReportAction,
  useCommissionSales,
  useCommissionWarehouses,
  useSaveCommissionReport,
  useVatRateOptions,
  type CommissionReport,
  type CommissionReportKind,
  type CommissionReportSale,
} from "./api";
import { CommissionReportStatusTag } from "./CommissionReportListPage";

export default function CommissionReportEditorPage({ kind }: { kind: CommissionReportKind }) {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useCommissionReport(id);
  if (id && (isLoading || !data)) return null;
  return <CommissionReportEditor key={`${id}-${data?.document.statusId ?? 0}`} kind={kind} id={id} data={data} />;
}

/**
 * The commission fee for a period (Tax Code art. 250; 1C «Отчет комиссионера о продажах» /
 * «Отчет комитенту о продажах»): the commission warehouse names the counterparty; the period's
 * sales from it are listed and the fee is a share of them or an amount, its VAT within it.
 */
function CommissionReportEditor({ kind, id, data }: { kind: CommissionReportKind; id: number | null; data?: CommissionReport }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const path = commissionReportPath(kind);
  const fromAgent = kind === commissionReportKinds.fromAgent;
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const doc = data?.document;
  const draft = !doc || doc.statusId === commissionReportStatus.draft;
  const canEdit = permissions.includes(commissionReportPermissions.create) && draft;
  const save = useSaveCommissionReport();
  const action = useCommissionReportAction();
  const { data: warehouses = [] } = useCommissionWarehouses(kind);
  const { data: vatRates = [] } = useVatRateOptions();

  const [docDate, setDocDate] = useState<Dayjs>(() => (doc ? dayjs(doc.docDate) : dayjs()));
  const [warehouseId, setWarehouseId] = useState<number | null>(doc?.warehouseId ?? null);
  const [period, setPeriod] = useState<[Dayjs, Dayjs]>(() =>
    doc ? [dayjs(doc.periodFrom), dayjs(doc.periodTo)] : [dayjs().startOf("month"), dayjs().endOf("month")],
  );
  const [byPercent, setByPercent] = useState<boolean>(doc ? doc.feePercent != null : true);
  const [feePercent, setFeePercent] = useState<number | null>(doc?.feePercent ?? null);
  const [feeAmount, setFeeAmount] = useState<number | null>(doc?.feeAmount ?? null);
  const [vatRateId, setVatRateId] = useState<number | null>(doc?.vatRateId ?? null);
  const [comment, setComment] = useState<string>(doc?.comment ?? "");

  const from = period[0].format("YYYY-MM-DD");
  const to = period[1].format("YYYY-MM-DD");
  const { data: liveSales = [], isFetching: salesLoading } = useCommissionSales(draft ? warehouseId : null, from, to);
  const sales: CommissionReportSale[] = draft ? liveSales : (data?.sales ?? []);
  const salesTotal = draft ? sales.reduce((sum, sale) => sum + sale.totalAmount, 0) : (doc?.salesAmount ?? 0);
  const warehouse = warehouses.find((item) => item.id === warehouseId);

  // the fee with its VAT; the VAT is taken out of it (the agent's base is its fee with VAT, art. 250)
  const fee = useMemo(() => {
    if (!draft) return doc?.feeAmount ?? 0;
    if (byPercent) return Math.round(salesTotal * (feePercent ?? 0)) / 100;
    return feeAmount ?? 0;
  }, [draft, doc, byPercent, salesTotal, feePercent, feeAmount]);
  const rate = Number(vatRates.find((item) => item.id === vatRateId)?.name.match(/\d+(\.\d+)?/)?.[0] ?? 0);
  const vat = draft ? Math.round((fee * rate * 100) / (100 + rate)) / 100 : (doc?.vatAmount ?? 0);

  const body = () => ({
    kind,
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    warehouseId: warehouseId ?? 0,
    periodFrom: from,
    periodTo: to,
    feePercent: byPercent ? feePercent : null,
    feeAmount: byPercent ? 0 : (feeAmount ?? 0),
    vatRateId,
    comment: comment.trim() || null,
  });

  const onSave = async (thenPost = false) => {
    if (!warehouseId) {
      toast.error(t("commissionReport.chooseWarehouse"));
      return;
    }
    try {
      const savedId = await save.mutateAsync({ id, body: body() });
      if (thenPost) await action.mutateAsync({ id: savedId, action: "confirm" });
      toast.success(t(thenPost ? "commissionReport.posted" : "commissionReport.saved"));
      navigate(`${path}/${savedId}`, { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const run = async (name: "cancel" | "delete") => {
    if (!id) return;
    try {
      await action.mutateAsync({ id, action: name });
      toast.success(t(name === "cancel" ? "commissionReport.cancelled" : "commissionReport.deleted"));
      if (name === "delete") navigate(path);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const columns: TableColumnsType<CommissionReportSale> = [
    { dataIndex: "docNumber", title: "№", width: 80 },
    { dataIndex: "docDate", title: t("commissionReport.date"), width: 140, render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm") },
    { dataIndex: "counterpartyName", title: t("commissionReport.buyer") },
    { dataIndex: "amount", title: t("commissionReport.net"), align: "right", render: (value: number) => money(value) },
    { dataIndex: "vatAmount", title: t("commissionReport.vat"), align: "right", render: (value: number) => money(value) },
    { dataIndex: "totalAmount", title: t("commissionReport.total"), align: "right", render: (value: number) => <b>{money(value)}</b> },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
        <Space wrap>
          <b>{doc ? t("commissionReport.titleNumber", { number: doc.docNumber }) : t("commissionReport.new")}</b>
          {doc && <CommissionReportStatusTag statusId={doc.statusId} />}
        </Space>
        <Space wrap>
          {canEdit && (
            <>
              <Button icon={<Save className="size-4" />} loading={save.isPending} onClick={() => void onSave(false)}>
                {t("commissionReport.save")}
              </Button>
              <Button type="primary" icon={<CheckCircle className="size-4" />} loading={save.isPending || action.isPending} onClick={() => void onSave(true)}>
                {t("commissionReport.post")}
              </Button>
            </>
          )}
          {doc?.statusId === commissionReportStatus.posted && permissions.includes(commissionReportPermissions.create) && (
            <Popconfirm title={t("commissionReport.cancelConfirm")} onConfirm={() => void run("cancel")}>
              <Button danger icon={<Ban className="size-4" />} loading={action.isPending}>
                {t("commissionReport.cancel")}
              </Button>
            </Popconfirm>
          )}
          {doc && doc.statusId !== commissionReportStatus.posted && permissions.includes(commissionReportPermissions.delete) && (
            <Popconfirm title={t("commissionReport.deleteConfirm")} onConfirm={() => void run("delete")}>
              <Button danger icon={<Trash2 className="size-4" />} loading={action.isPending}>
                {t("commissionReport.delete")}
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Card>

      <Alert type="info" showIcon message={t(fromAgent ? "commissionReport.fromAgentHint" : "commissionReport.toCommittentHint")} />

      <Card className="border border-border p-4">
        <Form layout="vertical" disabled={!canEdit}>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
            <Form.Item label={t("commissionReport.date")} required>
              <DatePicker className="w-full" format="DD.MM.YYYY" value={docDate} onChange={(value) => value && setDocDate(value)} />
            </Form.Item>
            <Form.Item label={t("commissionReport.warehouse")} required>
              <Select
                className="w-full"
                value={warehouseId}
                placeholder={t("commissionReport.chooseWarehouse")}
                style={{ backgroundColor: "transparent" }}
                onChange={(value: number) => setWarehouseId(value)}
                options={warehouses.map((item) => ({ value: item.id, label: item.name }))}
                notFoundContent={t(fromAgent ? "commissionReport.noAgentWarehouses" : "commissionReport.noCommittentWarehouses")}
              />
            </Form.Item>
            <Form.Item label={t("commissionReport.period")} required>
              <DatePicker.RangePicker
                className="w-full"
                format="DD.MM.YYYY"
                value={period}
                onChange={(value) => value?.[0] && value[1] && setPeriod([value[0], value[1]])}
              />
            </Form.Item>
            <Form.Item label={t(fromAgent ? "commissionReport.agent" : "commissionReport.committent")}>
              <Input value={warehouse?.counterpartyName ?? doc?.counterpartyName ?? ""} readOnly disabled />
            </Form.Item>
            <Form.Item label={t("commissionReport.feeBy")}>
              <Radio.Group value={byPercent} onChange={(event) => setByPercent(event.target.value as boolean)}>
                <Radio value={true}>{t("commissionReport.byPercent")}</Radio>
                <Radio value={false}>{t("commissionReport.byAmount")}</Radio>
              </Radio.Group>
            </Form.Item>
            {byPercent ? (
              <Form.Item label={t("commissionReport.feePercent")} required>
                <InputNumber className="w-full" min={0} max={100} step={0.5} value={feePercent} onChange={(value) => setFeePercent(value)} addonAfter="%" />
              </Form.Item>
            ) : (
              <Form.Item label={t("commissionReport.feeAmount")} required>
                <InputNumber className="w-full" min={0} value={feeAmount} onChange={(value) => setFeeAmount(value)} />
              </Form.Item>
            )}
            <Form.Item label={t("commissionReport.vatRate")} extra={t("commissionReport.vatRateHint")}>
              <Select
                allowClear
                className="w-full"
                value={vatRateId}
                placeholder={t("commissionReport.noVat")}
                style={{ backgroundColor: "transparent" }}
                onChange={(value?: number) => setVatRateId(value ?? null)}
                options={vatRates.map((item) => ({ value: item.id, label: item.name }))}
              />
            </Form.Item>
            <Form.Item label={t("commissionReport.comment")} className="md:col-span-2">
              <Input value={comment} onChange={(event) => setComment(event.target.value)} />
            </Form.Item>
          </div>
        </Form>
        <Descriptions size="small" column={{ xs: 1, md: 4 }} bordered>
          <Descriptions.Item label={t("commissionReport.sales")}>{money(salesTotal)}</Descriptions.Item>
          <Descriptions.Item label={t("commissionReport.fee")}>
            <b>{money(fee)}</b>
          </Descriptions.Item>
          <Descriptions.Item label={t("commissionReport.vat")}>{money(vat)}</Descriptions.Item>
          <Descriptions.Item label={t("commissionReport.net")}>{money(fee - vat)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="overflow-hidden border border-border">
        <div className="border-b border-border p-3 font-medium">{t("commissionReport.salesTitle")}</div>
        <Table<CommissionReportSale>
          rowKey="id"
          size="small"
          loading={draft && salesLoading}
          columns={columns}
          dataSource={sales}
          pagination={false}
          locale={{ emptyText: t("commissionReport.noSales") }}
        />
      </Card>
    </div>
  );
}
