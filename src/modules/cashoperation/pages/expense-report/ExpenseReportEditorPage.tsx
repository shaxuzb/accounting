import { Alert, Button, DatePicker, Input, Popconfirm, Space, Tag } from "antd";
import { Ban, Plus, Save, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import InputNumberFormat from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { getJson } from "@/modules/accountings/services/request";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import AccountSide from "@/modules/accountings/pages/manual-entries/AccountSide";
import {
  useCancelManualEntry,
  useConfirmManualEntry,
  useDeleteManualEntry,
  useManualEntry,
  useSaveManualEntry,
} from "@/modules/accountings/pages/manual-entries/hooks";
import {
  manualEntryPermissions,
  manualEntryStatus,
  type ManualEntry,
  type ManualEntryLine,
} from "@/modules/accountings/pages/manual-entries/types";
import {
  DEFAULT_ADVANCE_ACCOUNT,
  EXPENSE_REPORT_KIND,
  expenseReportsPath,
} from "./constants";

const UZS = 1;
const emptyLine = (): ManualEntryLine => ({
  debitAccountId: 0,
  debitSubkontos: [],
  creditAccountId: 0,
  creditSubkontos: [],
  amount: 0,
  currencyId: UZS,
  currencyAmount: null,
  content: null,
});

const money = (value: number) =>
  value.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * An accountable person's expense report (1C «Авансовый отчет»): what the employee spent of
 * the advance — expenses (Dt 9420, 2510 ...), payments to suppliers (Dt 6010) — each line
 * credited to the advance account and the employee (Kt 4220).
 */
export default function ExpenseReportEditorPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useManualEntry(id);
  if (id && (isLoading || !data)) return null;
  return (
    <ExpenseReportEditor key={`${id}-${data?.statusId ?? 0}`} id={id} data={data} />
  );
}

function ExpenseReportEditor({ id, data }: { id: number | null; data?: ManualEntry }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const save = useSaveManualEntry();
  const confirm = useConfirmManualEntry();
  const cancel = useCancelManualEntry();
  const remove = useDeleteManualEntry();
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const can = (code: string) => userPermissions.includes(code);

  const [docDate, setDocDate] = useState(() => (data ? dayjs(data.docDate) : dayjs()));
  const [comment, setComment] = useState(data?.comment ?? "");
  const [employeeId, setEmployeeId] = useState<number | null>(data?.employeeId ?? null);
  const [advanceAccountId, setAdvanceAccountId] = useState<number | null>(
    data?.advanceAccountId ?? null,
  );
  const [lines, setLines] = useState<ManualEntryLine[]>(() =>
    data?.lines.length ? data.lines : [emptyLine()],
  );

  const statusId = data?.statusId ?? manualEntryStatus.draft;
  const readOnly =
    statusId !== manualEntryStatus.draft || !can(manualEntryPermissions.create);
  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

  // what the employee holds of the advances on the account (a posted report is already in it)
  const { data: balance } = useQuery({
    queryKey: [
      "accountable-balance",
      employeeId,
      advanceAccountId,
      docDate.format("YYYY-MM-DDTHH:mm"),
      statusId,
    ],
    queryFn: () =>
      getJson<{ balance: number }>("/manual-entries/accountable-balance", {
        employeeId,
        accountId: advanceAccountId,
        date: docDate.format("YYYY-MM-DDTHH:mm:ss"),
      }),
    enabled: Boolean(employeeId && advanceAccountId),
  });
  const held = balance?.balance ?? 0;
  const left = statusId === manualEntryStatus.posted ? held : held - total;

  const update = (index: number, changes: Partial<ManualEntryLine>) =>
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...changes } : line)),
    );

  const body = () => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    comment: comment || null,
    kind: EXPENSE_REPORT_KIND,
    employeeId,
    advanceAccountId,
    lines: lines.map((line) => ({
      ...line,
      // the credit is the advance account and the employee; the server sets it
      creditAccountId: advanceAccountId ?? 0,
      creditSubkontos: [],
      amount: Number(line.amount) || 0,
    })),
  });

  const saveDraft = async () => {
    const savedId = (await save.mutateAsync({ id, body: body() })) as number;
    toast.success(t("manualEntries.saved"));
    if (!id) navigate(`${expenseReportsPath}/${savedId}`, { replace: true });
    return savedId;
  };

  const saveAndPost = async () => {
    const savedId = await saveDraft();
    await confirm.mutateAsync(savedId);
    toast.success(t("manualEntries.posted"));
  };

  const statusTag =
    statusId === manualEntryStatus.posted ? (
      <Tag color="green">{t("currency.status.posted")}</Tag>
    ) : statusId === manualEntryStatus.cancelled ? (
      <Tag color="red">{t("currency.status.cancelled")}</Tag>
    ) : (
      <Tag>{t("currency.status.draft")}</Tag>
    );

  return (
    <div className="w-full space-y-3">
      <Card className="space-y-4 border border-border p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="mb-1 text-sm text-secondary-text">
              {t("manualEntries.number")}
            </div>
            <Space>
              <b>{data?.docNumber ?? t("manualEntries.newNumber")}</b>
              {statusTag}
            </Space>
          </div>
          <div>
            <div className="mb-1 text-sm text-secondary-text">
              {t("manualEntries.date")}
            </div>
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD.MM.YYYY HH:mm"
              value={docDate}
              allowClear={false}
              disabled={readOnly}
              onChange={(value) => value && setDocDate(value)}
            />
          </div>
          <div className="min-w-64">
            <div className="mb-1 text-sm text-secondary-text">
              {t("expenseReport.employee")}
            </div>
            <PayrollEmployeeSelect
              standalone
              value={employeeId}
              disabled={readOnly}
              onChange={setEmployeeId}
            />
          </div>
          <div className="min-w-56">
            <SelectCustom
              label={t("expenseReport.advanceAccount")}
              fieldName="advance-account"
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              value={advanceAccountId}
              autoSelectValue={readOnly ? null : DEFAULT_ADVANCE_ACCOUNT}
              autoSelectKeys={["number"]}
              search
              required
              disabled={readOnly}
              marginBottom="mb-0"
              onChange={(value) => setAdvanceAccountId(Number(value) || null)}
            />
          </div>
          <div className="min-w-64 flex-1">
            <div className="mb-1 text-sm text-secondary-text">
              {t("manualEntries.comment")}
            </div>
            <Input
              value={comment}
              disabled={readOnly}
              placeholder={t("expenseReport.commentPlaceholder")}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
        </div>
        <Space wrap>
          {statusId === manualEntryStatus.draft &&
            can(manualEntryPermissions.create) && (
              <Button
                icon={<Save className="size-4" />}
                loading={save.isPending}
                onClick={() => void saveDraft()}
              >
                {t("manualEntries.saveDraft")}
              </Button>
            )}
          {statusId === manualEntryStatus.draft &&
            can(manualEntryPermissions.confirm) && (
              <Button
                type="primary"
                icon={<Send className="size-4" />}
                loading={save.isPending || confirm.isPending}
                onClick={() => void saveAndPost()}
              >
                {t("manualEntries.post")}
              </Button>
            )}
          {id &&
            statusId === manualEntryStatus.draft &&
            can(manualEntryPermissions.delete) && (
              <Popconfirm
                title={t("manualEntries.deleteConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  remove
                    .mutateAsync(id)
                    .then(() => navigate(expenseReportsPath, { replace: true }))
                }
              >
                <Button danger icon={<Trash2 className="size-4" />} />
              </Popconfirm>
            )}
          {id &&
            statusId === manualEntryStatus.posted &&
            can(manualEntryPermissions.cancel) && (
              <Popconfirm
                title={t("manualEntries.cancelConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  cancel
                    .mutateAsync(id)
                    .then(() => toast.success(t("manualEntries.cancelled")))
                }
              >
                <Button danger icon={<Ban className="size-4" />}>
                  {t("manualEntries.cancel")}
                </Button>
              </Popconfirm>
            )}
        </Space>
      </Card>

      {employeeId && advanceAccountId && (
        <Alert
          showIcon
          type={left < 0 ? "warning" : "info"}
          message={
            statusId === manualEntryStatus.posted
              ? t("expenseReport.balancePosted", { left: money(held) })
              : t("expenseReport.balance", {
                  held: money(held),
                  spent: money(total),
                  left: money(left),
                })
          }
          description={left < 0 ? t("expenseReport.overspent") : undefined}
        />
      )}

      {lines.map((line, index) => (
        <Card key={index} className="border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <b>
              {t("manualEntries.line")} {index + 1}
            </b>
            {!readOnly && lines.length > 1 && (
              <Button
                size="small"
                danger
                icon={<Trash2 className="size-4" />}
                onClick={() =>
                  setLines((current) => current.filter((_, i) => i !== index))
                }
              />
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AccountSide
                label={t("expenseReport.expenseAccount")}
                accountId={line.debitAccountId || null}
                subkontos={line.debitSubkontos}
                disabled={readOnly}
                onAccountChange={(accountId) =>
                  update(index, { debitAccountId: accountId ?? 0, debitSubkontos: [] })
                }
                onSubkontosChange={(debitSubkontos) => update(index, { debitSubkontos })}
              />
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-sm">{t("manualEntries.amount")}</div>
                <InputNumberFormat
                  standalone
                  min={0}
                  precision={2}
                  value={line.amount || null}
                  disabled={readOnly}
                  onValueChange={(value) => update(index, { amount: Number(value ?? 0) })}
                />
              </div>
              <div>
                <div className="mb-1 text-sm">{t("manualEntries.content")}</div>
                <Input
                  value={line.content ?? ""}
                  disabled={readOnly}
                  placeholder={t("expenseReport.contentPlaceholder")}
                  onChange={(event) => update(index, { content: event.target.value })}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        {!readOnly ? (
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => setLines((current) => [...current, emptyLine()])}
          >
            {t("manualEntries.addLine")}
          </Button>
        ) : (
          <span />
        )}
        <span className="text-base">
          {t("manualEntries.total")}: <b>{money(total)}</b> UZS
        </span>
      </div>
    </div>
  );
}
