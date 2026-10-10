import { Alert, Button, DatePicker, Input, InputNumber, Popconfirm, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Plus, Save, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import { CorrectionStatusTag } from "@/modules/corrections/CorrectionListPage";
import { money } from "@/modules/corrections/constants";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useFaModernization,
  useFaModernizationAction,
  useFaModernizationCandidates,
  useSaveFaModernization,
  type FaModernizationCandidate,
  type FaModernizationDocument,
  type FaModernizationLine,
  type FaModernizationSave,
} from "./api";
import {
  faModernizationDocumentTypeId,
  faModernizationPath,
  faModernizationPermissions,
  faModernizationStatus,
} from "./constants/permissions";

/** One asset and one 08 account: a candidate and a line are matched by both. */
const lineKey = (assetId: number, accountId: number) => `${assetId}-${accountId}`;

interface EditLine extends FaModernizationLine {
  key: string;
}

export default function FaModernizationEditorPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useFaModernization(id);
  if (id && (isLoading || !data)) return null;
  return <FaModernizationEditor key={`${id}-${data?.statusId ?? 0}`} id={id} data={data} />;
}

/**
 * 1C «Модернизация ОС»: the improvement costs gathered on 08 by the asset go to its cost
 * (Dt 01 Kt 08); a longer life may be set. Depreciation takes them from the next month.
 */
function FaModernizationEditor({ id, data }: { id: number | null; data?: FaModernizationDocument }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => permissions.includes(code);
  const save = useSaveFaModernization();
  const confirm = useFaModernizationAction("confirm");
  const cancel = useFaModernizationAction("cancel");
  const remove = useFaModernizationAction("delete");

  const statusId = data?.statusId ?? faModernizationStatus.draft;
  const readOnly = statusId !== faModernizationStatus.draft || !can(faModernizationPermissions.create);

  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [comment, setComment] = useState(data?.comment ?? "");
  const [lines, setLines] = useState<EditLine[]>(() =>
    (data?.lines ?? []).map((line) => ({ ...line, key: lineKey(line.faAssetId, line.capitalInvestmentAccountId) })),
  );
  const { data: candidates = [], isFetching: loadingCandidates } = useFaModernizationCandidates(
    docDate.format("YYYY-MM-DD"),
    !readOnly,
  );
  const candidateByKey = new Map(candidates.map((item) => [lineKey(item.faAssetId, item.capitalInvestmentAccountId), item]));
  const free = candidates.filter((item) => !lines.some((line) => line.key === lineKey(item.faAssetId, item.capitalInvestmentAccountId)));

  const addCandidate = (candidate: FaModernizationCandidate) =>
    setLines((current) => [
      ...current,
      {
        key: lineKey(candidate.faAssetId, candidate.capitalInvestmentAccountId),
        faAssetId: candidate.faAssetId,
        inventoryNumber: candidate.inventoryNumber,
        assetName: candidate.assetName,
        amount: candidate.balance,
        capitalInvestmentAccountId: candidate.capitalInvestmentAccountId,
        capitalInvestmentAccountNumber: candidate.capitalInvestmentAccountNumber,
        oldInitialCost: candidate.initialCost,
        oldUsefulLifeMonths: candidate.usefulLifeMonths,
        newUsefulLifeMonths: null,
      },
    ]);
  const patch = (key: string, change: Partial<EditLine>) =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...change } : line)));

  const body = (): FaModernizationSave => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    comment: comment || null,
    lines: lines.map((line) => ({
      faAssetId: line.faAssetId,
      amount: line.amount,
      capitalInvestmentAccountId: line.capitalInvestmentAccountId,
      newUsefulLifeMonths: line.newUsefulLifeMonths ?? null,
      note: line.note || null,
    })),
  });

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("fa.modernization.saved"));
    if (!id) navigate(`${faModernizationPath}/${savedId}`, { replace: true });
    return savedId;
  };
  const run = (action: () => Promise<unknown>) => () => void action().catch(errorHandlers);

  // a draft shows the cost now, a posted document the cost it found
  const costBefore = (line: EditLine) =>
    readOnly ? line.oldInitialCost : (candidateByKey.get(line.key)?.initialCost ?? line.oldInitialCost);
  const lifeBefore = (line: EditLine) =>
    readOnly ? line.oldUsefulLifeMonths : (candidateByKey.get(line.key)?.usefulLifeMonths ?? line.oldUsefulLifeMonths);

  const columns: TableColumnsType<EditLine> = [
    {
      dataIndex: "assetName",
      title: t("fa.modernization.asset"),
      render: (_: unknown, line) => (
        <span>
          <span className="text-secondary-text">{line.inventoryNumber}</span> {line.assetName}
        </span>
      ),
    },
    { dataIndex: "capitalInvestmentAccountNumber", title: t("fa.modernization.account"), width: 140 },
    ...(!readOnly
      ? [
          {
            key: "balance",
            title: t("fa.modernization.balance"),
            align: "right" as const,
            width: 150,
            render: (_: unknown, line: EditLine) => {
              const balance = candidateByKey.get(line.key)?.balance;
              return balance === undefined ? "-" : money(balance);
            },
          },
        ]
      : []),
    {
      dataIndex: "amount",
      title: t("fa.modernization.amount"),
      align: "right",
      width: 170,
      render: (value: number, line) =>
        readOnly ? (
          <b>{money(value)}</b>
        ) : (
          <InputNumber<number>
            className="w-full!"
            min={0.01}
            precision={2}
            value={value}
            onChange={(next) => patch(line.key, { amount: Number(next ?? 0) })}
          />
        ),
    },
    {
      key: "oldCost",
      title: t("fa.modernization.oldCost"),
      align: "right",
      width: 150,
      render: (_: unknown, line) => {
        const cost = costBefore(line);
        return cost == null ? "-" : money(cost);
      },
    },
    {
      key: "newCost",
      title: t("fa.modernization.newCost"),
      align: "right",
      width: 150,
      render: (_: unknown, line) => {
        const cost = costBefore(line);
        return cost == null ? "-" : <b>{money(cost + line.amount)}</b>;
      },
    },
    {
      key: "oldLife",
      title: t("fa.modernization.oldLife"),
      align: "right",
      width: 130,
      render: (_: unknown, line) => lifeBefore(line) ?? "-",
    },
    {
      dataIndex: "newUsefulLifeMonths",
      title: t("fa.modernization.newLife"),
      align: "right",
      width: 150,
      render: (value: number | null | undefined, line) =>
        readOnly ? (
          (value ?? "-")
        ) : (
          <InputNumber<number>
            className="w-full!"
            min={1}
            precision={0}
            placeholder={t("fa.modernization.newLifeHint")}
            value={value ?? null}
            onChange={(next) => patch(line.key, { newUsefulLifeMonths: next ?? null })}
          />
        ),
    },
    {
      dataIndex: "note",
      title: t("fa.modernization.note"),
      width: 200,
      render: (value: string | null | undefined, line) =>
        readOnly ? (value ?? "") : <Input value={value ?? ""} onChange={(event) => patch(line.key, { note: event.target.value })} />,
    },
    ...(!readOnly
      ? [
          {
            key: "remove",
            width: 50,
            render: (_: unknown, line: EditLine) => (
              <Button
                type="text"
                danger
                icon={<X className="size-4" />}
                onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}
              />
            ),
          },
        ]
      : []),
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
              <b>{data?.docNumber ?? t("fa.modernization.newNumber")}</b>
              <CorrectionStatusTag statusId={statusId} />
            </Space>,
            "",
          )}
          {field(
            t("fa.modernization.date"),
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
            t("fa.modernization.comment"),
            <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />,
          )}
        </div>

        <Space wrap>
          {!readOnly && (
            <Button icon={<Save className="size-4" />} loading={save.isPending} disabled={lines.length === 0} onClick={run(saveDraft)}>
              {t("fa.modernization.saveDraft")}
            </Button>
          )}
          {statusId === faModernizationStatus.draft && can(faModernizationPermissions.confirm) && (
            <Button
              type="primary"
              icon={<Send className="size-4" />}
              disabled={lines.length === 0}
              loading={save.isPending || confirm.isPending}
              onClick={run(async () => {
                const savedId = await saveDraft();
                await confirm.mutateAsync(savedId);
                toast.success(t("fa.modernization.posted"));
              })}
            >
              {t("fa.modernization.post")}
            </Button>
          )}
          {id && statusId === faModernizationStatus.draft && can(faModernizationPermissions.delete) && (
            <Popconfirm
              title={t("fa.modernization.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => remove.mutateAsync(id).then(() => navigate(faModernizationPath, { replace: true })))}
            >
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
          {id && statusId === faModernizationStatus.posted && can(faModernizationPermissions.cancel) && (
            <Popconfirm
              title={t("fa.modernization.cancelConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => cancel.mutateAsync(id).then(() => toast.success(t("fa.modernization.cancelled"))))}
            >
              <Button danger icon={<Ban className="size-4" />}>
                {t("fa.modernization.cancel")}
              </Button>
            </Popconfirm>
          )}
          {id && (
            <AccountingEntriesButton documentId={id} documentTypeId={faModernizationDocumentTypeId} statusId={statusId}>
              {t("fa.modernization.entries")}
            </AccountingEntriesButton>
          )}
        </Space>
      </Card>

      {!readOnly && <Alert showIcon type="info" message={t("fa.modernization.hint")} />}
      {!readOnly && !loadingCandidates && candidates.length === 0 && (
        <Alert showIcon type="warning" message={t("fa.modernization.noCandidates")} />
      )}

      <Card className="overflow-hidden border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
          <span className="font-semibold">{t("fa.modernization.lines")}</span>
          {!readOnly && (
            <Select<string>
              className="min-w-96"
              showSearch
              optionFilterProp="label"
              value={null}
              loading={loadingCandidates}
              placeholder={
                <span className="flex items-center gap-1">
                  <Plus className="size-4" /> {t("fa.modernization.addLine")}
                </span>
              }
              options={free.map((item) => ({
                value: lineKey(item.faAssetId, item.capitalInvestmentAccountId),
                label: `${item.inventoryNumber} · ${item.assetName} · ${item.capitalInvestmentAccountNumber} · ${money(item.balance)}`,
              }))}
              onChange={(value) => {
                const candidate = candidateByKey.get(value);
                if (candidate) addCandidate(candidate);
              }}
            />
          )}
        </div>
        <Table<EditLine>
          rowKey="key"
          size="middle"
          columns={columns}
          dataSource={lines}
          pagination={false}
          scroll={{ x: "max-content" }}
          footer={() => (
            <div className="flex justify-end gap-2">
              {t("fa.modernization.amount")}: <b>{money(lines.reduce((sum, line) => sum + line.amount, 0))}</b>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
