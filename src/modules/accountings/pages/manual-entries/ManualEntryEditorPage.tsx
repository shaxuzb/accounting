import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Space,
  Tag,
} from "antd";
import { Ban, Plus, Save, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import InputNumberFormat from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import AccountSide from "./AccountSide";
import { useAccountDefinitions } from "./useAccountDefinitions";
import {
  useCancelManualEntry,
  useConfirmManualEntry,
  useDeleteManualEntry,
  useManualEntry,
  useSaveManualEntry,
} from "./hooks";
import {
  manualEntryPermissions,
  manualEntryStatus,
  type ManualEntry,
  type ManualEntryLine,
} from "./types";

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
 * A manual journal entry (1C "Операция"): lines of Dt / Kt with each side's analytics, an
 * amount in UZS and, for a currency account, the amount in its currency.
 */
export default function ManualEntryEditorPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useManualEntry(id);
  if (id && (isLoading || !data)) return null;
  // a new form for every loaded entry, so its fields start from what was saved
  return (
    <ManualEntryEditor
      key={`${id}-${data?.statusId ?? 0}`}
      id={id}
      data={data}
    />
  );
}

function ManualEntryEditor({
  id,
  data,
}: {
  id: number | null;
  data?: ManualEntry;
}) {
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

  const [docDate, setDocDate] = useState(() =>
    data ? dayjs(data.docDate) : dayjs(),
  );
  const [comment, setComment] = useState(data?.comment ?? "");
  const [lines, setLines] = useState<ManualEntryLine[]>(() =>
    data?.lines.length ? data.lines : [emptyLine()],
  );

  const statusId = data?.statusId ?? manualEntryStatus.draft;
  const readOnly =
    statusId !== manualEntryStatus.draft || !can(manualEntryPermissions.create);
  const total = lines.reduce(
    (sum, line) => sum + (Number(line.amount) || 0),
    0,
  );

  const update = (index: number, changes: Partial<ManualEntryLine>) =>
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...changes } : line)),
    );

  const body = () => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    comment: comment || null,
    lines: lines.map((line) => ({ ...line, amount: Number(line.amount) || 0 })),
  });

  const saveDraft = async () => {
    const savedId = (await save.mutateAsync({ id, body: body() })) as number;
    toast.success(t("manualEntries.saved"));
    if (!id)
      navigate(`/main/accountings/manual-entries/${savedId}`, {
        replace: true,
      });
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
      <Card className="flex flex-wrap items-end gap-4 border border-border p-4">
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
        <div className="min-w-80 flex-1">
          <div className="mb-1 text-sm text-secondary-text">
            {t("manualEntries.comment")}
          </div>
          <Input
            value={comment}
            disabled={readOnly}
            placeholder={t("manualEntries.commentPlaceholder")}
            onChange={(event) => setComment(event.target.value)}
          />
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
                  remove.mutateAsync(id).then(() =>
                    navigate("/main/accountings/manual-entries", {
                      replace: true,
                    }),
                  )
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

      {statusId === manualEntryStatus.posted && (
        <Alert type="info" showIcon message={t("manualEntries.postedHint")} />
      )}

      {lines.map((line, index) => (
        <LineCard
          key={index}
          index={index}
          line={line}
          readOnly={readOnly}
          canRemove={lines.length > 1}
          onChange={(changes) => update(index, changes)}
          onRemove={() =>
            setLines((current) => current.filter((_, i) => i !== index))
          }
        />
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

function LineCard({
  index,
  line,
  readOnly,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  line: ManualEntryLine;
  readOnly: boolean;
  canRemove: boolean;
  onChange: (changes: Partial<ManualEntryLine>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const debit = useAccountDefinitions(line.debitAccountId || null);
  const credit = useAccountDefinitions(line.creditAccountId || null);
  const needsCurrency = Boolean(
    debit.account?.isCurrency || credit.account?.isCurrency,
  );
  const foreign = line.currencyId !== UZS;

  return (
    <Card className="border border-border p-4">
      <Form layout="vertical" component={false}>
        <div className="mb-3 flex items-center justify-between">
          <b>
            {t("manualEntries.line")} {index + 1}
          </b>
          {!readOnly && canRemove && (
            <Button
              size="small"
              danger
              icon={<Trash2 className="size-4" />}
              onClick={onRemove}
            />
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <AccountSide
            label={t("manualEntries.debit")}
            accountId={line.debitAccountId || null}
            subkontos={line.debitSubkontos}
            disabled={readOnly}
            onAccountChange={(accountId) =>
              onChange({ debitAccountId: accountId ?? 0, debitSubkontos: [] })
            }
            onSubkontosChange={(debitSubkontos) => onChange({ debitSubkontos })}
          />
          <AccountSide
            label={t("manualEntries.credit")}
            accountId={line.creditAccountId || null}
            subkontos={line.creditSubkontos}
            disabled={readOnly}
            onAccountChange={(accountId) =>
              onChange({ creditAccountId: accountId ?? 0, creditSubkontos: [] })
            }
            onSubkontosChange={(creditSubkontos) =>
              onChange({ creditSubkontos })
            }
          />
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-4">
          <div>
            <div className="mb-1 text-sm">{t("manualEntries.amount")}</div>
            <InputNumberFormat
              standalone
              min={0}
              precision={2}
              value={line.amount || null}
              disabled={readOnly}
              onValueChange={(value) =>
                onChange({ amount: Number(value ?? 0) })
              }
            />
          </div>
          <SelectCustom
            label={t("manualEntries.currency")}
            fieldName={`currency-${index}`}
            path={selectListEndpoints.currenciesSelectList}
            value={line.currencyId}
            disabled={readOnly}
            marginBottom="mb-0"
            onChange={(value) =>
              onChange({
                currencyId: Number(value) || UZS,
                currencyAmount: null,
              })
            }
          />
          {foreign && (
            <div>
              <div className="mb-1 text-sm">
                {t("manualEntries.currencyAmount")}
              </div>
              <InputNumberFormat
                standalone
                min={0}
                precision={2}
                value={line.currencyAmount ?? null}
                disabled={readOnly}
                onValueChange={(value) =>
                  onChange({
                    currencyAmount: value == null ? null : Number(value),
                  })
                }
              />
            </div>
          )}
          <div className={foreign ? "" : "md:col-span-2"}>
            <div className="mb-1 text-sm">{t("manualEntries.content")}</div>
            <Input
              value={line.content ?? ""}
              disabled={readOnly}
              onChange={(event) => onChange({ content: event.target.value })}
            />
          </div>
        </div>
        {needsCurrency && !foreign && !readOnly && (
          <Alert
            className="mt-3"
            type="warning"
            showIcon
            message={t("manualEntries.currencyNeeded")}
          />
        )}
      </Form>
    </Card>
  );
}
