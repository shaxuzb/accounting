import { Alert, Button, Checkbox, DatePicker, Form, Input, InputNumber, Popconfirm, Radio, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, ClipboardList, FileMinus, FilePlus, Plus, Printer, Save, Send, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import type { Dayjs } from "dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import { CorrectionStatusTag } from "@/modules/corrections/CorrectionListPage";
import { money } from "@/modules/corrections/constants";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import FaAssetKindSwitch from "../../shared/components/FaAssetKindSwitch";
import FaAssetKindTag from "../../shared/components/FaAssetKindTag";
import { faAssetKindFromParams, faKindLabel, type FaAssetKindId } from "../../shared/constants/assetKinds";
import {
  fetchFaInventoryFill,
  useFaInventory,
  useFaInventoryAction,
  useSaveFaInventory,
  type FaInventoryDocument,
  type FaInventoryLine,
  type FaInventoryMember,
  type FaInventorySave,
} from "./api";
import { faInventoryPath, faInventoryPermissions, faInventoryStatus } from "./constants";
import { printComparisonSheet, printInventoryList } from "./print";

interface EditLine extends FaInventoryLine {
  key: string;
}

interface EditMember extends FaInventoryMember {
  key: string;
}

let keySeed = 0;
const nextKey = () => `k${++keySeed}`;

export default function FaInventoryEditorPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = useFaInventory(id);
  if (id && (isLoading || !data)) return null;
  return <FaInventoryEditor key={`${id}-${data?.statusId ?? 0}`} id={id} data={data} />;
}

/**
 * 1C «Инвентаризация ОС» / «Инвентаризация НМА» (NSBU 19): filled with what the books hold as
 * of the date, the commission takes off what it did not find and adds what it found beyond the
 * books at the market value. Posted, it fixes the results; the shortage is disposed of and the
 * surplus received by documents made from it.
 */
function FaInventoryEditor({ id, data }: { id: number | null; data?: FaInventoryDocument }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const organizationName = useAppSelector((state) => state.organization.name) ?? "";
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => permissions.includes(code);
  const save = useSaveFaInventory();
  const confirm = useFaInventoryAction("confirm");
  const cancel = useFaInventoryAction("cancel");
  const remove = useFaInventoryAction("delete");

  const statusId = data?.statusId ?? faInventoryStatus.draft;
  const readOnly = statusId !== faInventoryStatus.draft || !can(faInventoryPermissions.create);

  const [assetKindId, setAssetKindId] = useState<FaAssetKindId>(
    () => (data?.assetKindId as FaAssetKindId | undefined) ?? faAssetKindFromParams(searchParams),
  );
  const [docDate, setDocDate] = useState<Dayjs>(() => (data ? dayjs(data.docDate) : dayjs()));
  const [departmentId, setDepartmentId] = useState<number | null>(data?.departmentId ?? null);
  const [responsibleUserId, setResponsibleUserId] = useState<number | null>(data?.responsibleUserId ?? null);
  const [period, setPeriod] = useState<[Dayjs | null, Dayjs | null]>(() => [
    data?.startDate ? dayjs(data.startDate) : null,
    data?.endDate ? dayjs(data.endDate) : null,
  ]);
  const [reason, setReason] = useState(data?.reason ?? "");
  const [basis, setBasis] = useState(data?.basis ?? "");
  const [comment, setComment] = useState(data?.comment ?? "");
  const [members, setMembers] = useState<EditMember[]>(() =>
    (data?.members ?? []).map((member) => ({ ...member, key: nextKey() })),
  );
  const [lines, setLines] = useState<EditLine[]>(() => (data?.lines ?? []).map((line) => ({ ...line, key: nextKey() })));
  const [filling, setFilling] = useState(false);

  const patchLine = (key: string, change: Partial<EditLine>) =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...change } : line)));
  const patchMember = (key: string, change: Partial<EditMember>) =>
    setMembers((current) => current.map((member) => (member.key === key ? { ...member, ...change } : member)));

  const fill = async () => {
    setFilling(true);
    try {
      const filled = await fetchFaInventoryFill({
        date: docDate.format("YYYY-MM-DDTHH:mm:ss"),
        assetKindId,
        departmentId,
        responsibleUserId,
      });
      // what was found beyond the books stays; the books are taken again
      setLines((current) => [
        ...filled.map((line) => ({ ...line, key: nextKey() })),
        ...current.filter((line) => !line.isOnBooks),
      ]);
      if (filled.length === 0) toast(t("fa.inventory.nothingToFill"));
    } catch (error) {
      errorHandlers(error);
    } finally {
      setFilling(false);
    }
  };

  const addSurplus = () =>
    setLines((current) => [
      ...current,
      {
        key: nextKey(),
        name: "",
        inventoryNumber: "",
        isOnBooks: false,
        isFound: true,
        bookCost: 0,
        bookValue: 0,
        actualValue: 0,
      },
    ]);

  const body = (): FaInventorySave => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    assetKindId,
    departmentId,
    responsibleUserId,
    startDate: period[0] ? period[0].format("YYYY-MM-DDT00:00:00") : null,
    endDate: period[1] ? period[1].format("YYYY-MM-DDT00:00:00") : null,
    reason: reason || null,
    basis: basis || null,
    comment: comment || null,
    members: members.map(({ fullName, position, isChairman }) => ({ fullName, position: position || null, isChairman })),
    lines: lines.map((line) => ({
      faAssetId: line.faAssetId ?? null,
      name: line.isOnBooks ? null : line.name,
      inventoryNumber: line.isOnBooks ? null : line.inventoryNumber || null,
      isFound: line.isFound,
      actualValue: line.isFound ? Number(line.actualValue || 0) : 0,
      note: line.note || null,
    })),
  });

  const saveDraft = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("fa.inventory.saved"));
    if (!id) navigate(`${faInventoryPath}/${savedId}`, { replace: true });
    return savedId;
  };
  const run = (action: () => Promise<unknown>) => () => void action().catch(errorHandlers);

  const totals = useMemo(() => {
    const onBooks = lines.filter((line) => line.isOnBooks);
    const shortage = onBooks.filter((line) => !line.isFound);
    const surplus = lines.filter((line) => !line.isOnBooks);
    return {
      onBooks: onBooks.length,
      found: onBooks.length - shortage.length,
      bookValue: onBooks.reduce((sum, line) => sum + line.bookValue, 0),
      shortage: shortage.length,
      shortageValue: shortage.reduce((sum, line) => sum + line.bookValue, 0),
      surplus: surplus.length,
      surplusValue: surplus.reduce((sum, line) => sum + Number(line.actualValue || 0), 0),
    };
  }, [lines]);

  // which shortages are still to be disposed of, whether the surplus is received
  const activeDisposals = (data?.shortageDisposals ?? []).filter((doc) => doc.statusId !== faInventoryStatus.cancelled);
  const activeReceipts = (data?.surplusReceipts ?? []).filter((doc) => doc.statusId !== faInventoryStatus.cancelled);
  const posted = statusId === faInventoryStatus.posted;

  const lineColumns: TableColumnsType<EditLine> = [
    { key: "index", title: "№", width: 50, align: "center", render: (_: unknown, __: EditLine, index: number) => index + 1 },
    {
      dataIndex: "inventoryNumber",
      title: t("fa.fields.inventoryNumber"),
      width: 140,
      render: (value: string | null | undefined, line) =>
        line.isOnBooks || readOnly ? (
          <span className="font-mono">{value}</span>
        ) : (
          <Input value={value ?? ""} placeholder="—" onChange={(event) => patchLine(line.key, { inventoryNumber: event.target.value })} />
        ),
    },
    {
      dataIndex: "name",
      title: t(faKindLabel(assetKindId, "fa.fields.faAssetId")),
      width: 320,
      render: (value: string, line) =>
        line.isOnBooks || readOnly ? (
          <div>
            <div className="font-medium">
              {value} {!line.isOnBooks && <Tag color="green">{t("fa.inventory.surplusTag")}</Tag>}
            </div>
            {(line.groupName || line.departmentName) && (
              <div className="text-xs text-secondary-text">
                {[line.groupName, line.departmentName, line.responsibleUserName].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        ) : (
          <Input
            value={value}
            status={value.trim() ? undefined : "error"}
            placeholder={t("fa.inventory.surplusName")}
            onChange={(event) => patchLine(line.key, { name: event.target.value })}
          />
        ),
    },
    {
      dataIndex: "bookCost",
      title: t("fa.inventory.bookCost"),
      align: "right",
      width: 150,
      render: (value: number, line) => (line.isOnBooks ? money(value) : "—"),
    },
    {
      dataIndex: "bookValue",
      title: t("fa.inventory.bookValue"),
      align: "right",
      width: 150,
      render: (value: number, line) => (line.isOnBooks ? money(value) : "—"),
    },
    {
      dataIndex: "isFound",
      title: t("fa.inventory.found"),
      align: "center",
      width: 110,
      render: (value: boolean, line) =>
        line.isOnBooks ? (
          <Checkbox
            checked={value}
            disabled={readOnly}
            onChange={(event) =>
              patchLine(line.key, {
                isFound: event.target.checked,
                actualValue: event.target.checked ? line.bookValue : 0,
              })
            }
          />
        ) : (
          <Tag color="green">{t("fa.inventory.surplusTag")}</Tag>
        ),
    },
    {
      dataIndex: "actualValue",
      title: t("fa.inventory.actualValue"),
      align: "right",
      width: 170,
      render: (value: number, line) =>
        !line.isFound ? (
          <span className="text-red-600">{t("fa.inventory.notFound")}</span>
        ) : readOnly ? (
          money(value)
        ) : (
          <InputNumber<number>
            className="w-full!"
            min={0}
            precision={2}
            // thousands spaced in the whole part only (12 666 666.67)
            formatter={(input) => {
              const [whole, fraction] = String(input ?? "").split(".");
              const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
              return fraction === undefined ? spaced : `${spaced}.${fraction}`;
            }}
            parser={(input) => Number(String(input ?? "").replace(/\s/g, "")) as unknown as number}
            status={!line.isOnBooks && !(Number(value) > 0) ? "error" : undefined}
            value={value}
            onChange={(next) => patchLine(line.key, { actualValue: Number(next ?? 0) })}
          />
        ),
    },
    {
      dataIndex: "note",
      title: t("fa.fields.note"),
      width: 200,
      render: (value: string | null | undefined, line) =>
        readOnly ? (value ?? "") : <Input value={value ?? ""} onChange={(event) => patchLine(line.key, { note: event.target.value })} />,
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

  const memberColumns: TableColumnsType<EditMember> = [
    {
      dataIndex: "fullName",
      title: t("fa.inventory.memberName"),
      render: (value: string, member) =>
        readOnly ? value : (
          <Input
            value={value}
            status={value.trim() ? undefined : "error"}
            onChange={(event) => patchMember(member.key, { fullName: event.target.value })}
          />
        ),
    },
    {
      dataIndex: "position",
      title: t("fa.inventory.memberPosition"),
      render: (value: string | null | undefined, member) =>
        readOnly ? (value ?? "") : <Input value={value ?? ""} onChange={(event) => patchMember(member.key, { position: event.target.value })} />,
    },
    {
      dataIndex: "isChairman",
      title: t("fa.inventory.chairman"),
      align: "center",
      width: 130,
      render: (value: boolean, member) => (
        <Radio
          checked={value}
          disabled={readOnly}
          onChange={() => setMembers((current) => current.map((item) => ({ ...item, isChairman: item.key === member.key })))}
        />
      ),
    },
    ...(!readOnly
      ? [
          {
            key: "remove",
            width: 50,
            render: (_: unknown, member: EditMember) => (
              <Button
                type="text"
                danger
                icon={<X className="size-4" />}
                onClick={() => setMembers((current) => current.filter((item) => item.key !== member.key))}
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

  const printable = (): FaInventoryDocument | null =>
    data ? { ...data, lines: lines.map(({ key: _key, ...line }) => line), members } : null;

  return (
    <div className="w-full space-y-3">
      <Card className="space-y-4 border border-border p-4">
        <div className="flex flex-wrap items-end gap-4">
          {field(
            "№",
            <Space>
              <b>{data?.docNumber ?? t("fa.inventory.newNumber")}</b>
              <CorrectionStatusTag statusId={statusId} />
              {readOnly && <FaAssetKindTag assetKindId={assetKindId} />}
            </Space>,
            "",
          )}
          {!readOnly &&
            field(
              "",
              <FaAssetKindSwitch
                value={assetKindId}
                onChange={(kind) => {
                  setAssetKindId(kind);
                  setLines([]);
                }}
              />,
              "",
            )}
          {field(
            t("fa.inventory.asOf"),
            <DatePicker
              format="DD.MM.YYYY"
              value={docDate}
              allowClear={false}
              disabled={readOnly}
              onChange={(value) => value && setDocDate(value)}
            />,
            "",
          )}
          {field(
            t("fa.inventory.period"),
            <DatePicker.RangePicker
              format="DD.MM.YYYY"
              value={period}
              disabled={readOnly}
              allowEmpty={[true, true]}
              onChange={(value) => setPeriod([value?.[0] ?? null, value?.[1] ?? null])}
            />,
            "",
          )}
        </div>
        <Form layout="vertical" component="div" className="flex flex-wrap items-start gap-4">
          <div className="min-w-56 flex-1">
            <SelectCustom
              label="fa.inventory.department"
              fieldName="inventory-department"
              path={selectListEndpoints.departmentsSelectList}
              value={departmentId}
              placeholder={t("fa.inventory.allPlaces")}
              search
              clearable
              autoSelectSingle={false}
              disabled={readOnly}
              marginBottom="mb-0"
              onChange={(value) => setDepartmentId(Number(value) || null)}
            />
          </div>
          <div className="min-w-56 flex-1">
            <SelectCustom
              label="fa.inventory.responsible"
              fieldName="inventory-responsible"
              path={selectListEndpoints.usersSelectList}
              value={responsibleUserId}
              placeholder={t("fa.inventory.allPersons")}
              search
              clearable
              autoSelectSingle={false}
              disabled={readOnly}
              marginBottom="mb-0"
              onChange={(value) => setResponsibleUserId(Number(value) || null)}
            />
          </div>
          {field(
            t("fa.inventory.reason"),
            <Input
              value={reason}
              disabled={readOnly}
              placeholder={t("fa.inventory.reasonHint")}
              onChange={(event) => setReason(event.target.value)}
            />,
          )}
          {field(
            t("fa.inventory.basis"),
            <Input
              value={basis}
              disabled={readOnly}
              placeholder={t("fa.inventory.basisHint")}
              onChange={(event) => setBasis(event.target.value)}
            />,
          )}
        </Form>
        {field(
          t("fa.inventory.comment"),
          <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />,
          "w-full",
        )}

        <Space wrap>
          {!readOnly && (
            <Button icon={<Save className="size-4" />} loading={save.isPending} disabled={lines.length === 0} onClick={run(saveDraft)}>
              {t("fa.inventory.saveDraft")}
            </Button>
          )}
          {statusId === faInventoryStatus.draft && can(faInventoryPermissions.confirm) && (
            <Button
              type="primary"
              icon={<Send className="size-4" />}
              disabled={lines.length === 0}
              loading={save.isPending || confirm.isPending}
              onClick={run(async () => {
                const savedId = await saveDraft();
                await confirm.mutateAsync(savedId);
                toast.success(t("fa.inventory.posted"));
              })}
            >
              {t("fa.inventory.post")}
            </Button>
          )}
          {id && statusId === faInventoryStatus.draft && can(faInventoryPermissions.delete) && (
            <Popconfirm
              title={t("fa.inventory.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => remove.mutateAsync(id).then(() => navigate(faInventoryPath, { replace: true })))}
            >
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
          {id && posted && can(faInventoryPermissions.cancel) && (
            <Popconfirm
              title={t("fa.inventory.cancelConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => cancel.mutateAsync(id).then(() => toast.success(t("fa.inventory.cancelled"))))}
            >
              <Button danger icon={<Ban className="size-4" />}>
                {t("fa.inventory.cancel")}
              </Button>
            </Popconfirm>
          )}
          {id && (
            <>
              <Button
                icon={<Printer className="size-4" />}
                onClick={() => {
                  const doc = printable();
                  if (doc) printInventoryList(t, doc, organizationName);
                }}
              >
                {t("fa.inventory.printList")}
              </Button>
              <Button
                icon={<Printer className="size-4" />}
                onClick={() => {
                  const doc = printable();
                  if (doc) printComparisonSheet(t, doc, organizationName);
                }}
              >
                {t("fa.inventory.printComparison")}
              </Button>
            </>
          )}
        </Space>
      </Card>

      {posted && (totals.shortage > 0 || totals.surplus > 0) && (
        <Card className="space-y-3 border border-border p-4">
          <div className="font-semibold">{t("fa.inventory.results")}</div>
          <Alert showIcon type="info" message={t("fa.inventory.resultsHint")} />
          <div className="flex flex-wrap gap-6">
            {totals.shortage > 0 && (
              <div className="space-y-2">
                <div className="text-sm">
                  {t("fa.inventory.shortage")}: <b className="text-red-600">{totals.shortage} · {money(totals.shortageValue)}</b>
                </div>
                {activeDisposals.map((doc) => (
                  <div key={doc.id} className="text-sm">
                    <Link to={`/main/fa/disposals/${doc.id}`}>
                      {t("fa.inventory.disposalDoc", { number: doc.docNumber, date: dayjs(doc.docDate).format("DD.MM.YYYY") })}
                    </Link>{" "}
                    <CorrectionStatusTag statusId={doc.statusId} />
                  </div>
                ))}
                {activeDisposals.length === 0 && (
                  <Button
                    danger
                    icon={<FileMinus className="size-4" />}
                    onClick={() => navigate(`/main/fa/disposals/add?kind=${assetKindId}&inventoryId=${id}`)}
                  >
                    {t("fa.inventory.makeDisposal")}
                  </Button>
                )}
              </div>
            )}
            {totals.surplus > 0 && (
              <div className="space-y-2">
                <div className="text-sm">
                  {t("fa.inventory.surplus")}: <b className="text-green-700">{totals.surplus} · {money(totals.surplusValue)}</b>
                </div>
                {activeReceipts.map((doc) => (
                  <div key={doc.id} className="text-sm">
                    <Link to={`/main/fa/receipts/${doc.id}`}>
                      {t("fa.inventory.receiptDoc", { number: doc.docNumber, date: dayjs(doc.docDate).format("DD.MM.YYYY") })}
                    </Link>{" "}
                    <CorrectionStatusTag statusId={doc.statusId} />
                  </div>
                ))}
                {activeReceipts.length === 0 && (
                  <Button
                    type="primary"
                    ghost
                    icon={<FilePlus className="size-4" />}
                    onClick={() => navigate(`/main/fa/receipts/add?kind=${assetKindId}&inventoryId=${id}`)}
                  >
                    {t("fa.inventory.makeReceipt")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
          <span className="font-semibold">{t("fa.inventory.commission")}</span>
          {!readOnly && (
            <Button
              icon={<Plus className="size-4" />}
              onClick={() =>
                setMembers((current) => [
                  ...current,
                  { key: nextKey(), fullName: "", position: "", isChairman: current.length === 0 },
                ])
              }
            >
              {t("fa.inventory.addMember")}
            </Button>
          )}
        </div>
        <Table<EditMember>
          rowKey="key"
          size="small"
          columns={memberColumns}
          dataSource={members}
          pagination={false}
          locale={{ emptyText: t("fa.inventory.noMembers") }}
        />
      </Card>

      {!readOnly && <Alert showIcon type="info" message={t("fa.inventory.hint")} />}

      <Card className="overflow-hidden border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
          <span className="font-semibold">{t("fa.inventory.lines")}</span>
          {!readOnly && (
            <Space wrap>
              <Popconfirm
                title={t("fa.inventory.refillConfirm")}
                disabled={!lines.some((line) => line.isOnBooks)}
                onConfirm={() => void fill()}
              >
                <Button
                  type="primary"
                  icon={<ClipboardList className="size-4" />}
                  loading={filling}
                  onClick={() => {
                    if (!lines.some((line) => line.isOnBooks)) void fill();
                  }}
                >
                  {t("fa.inventory.fill")}
                </Button>
              </Popconfirm>
              <Button icon={<Plus className="size-4" />} onClick={addSurplus}>
                {t("fa.inventory.addSurplus")}
              </Button>
            </Space>
          )}
        </div>
        <Table<EditLine>
          rowKey="key"
          size="middle"
          columns={lineColumns}
          dataSource={lines}
          pagination={false}
          scroll={{ x: "max-content" }}
          rowClassName={(line) => (!line.isFound ? "[&>td]:bg-red-50!" : !line.isOnBooks ? "[&>td]:bg-green-50!" : "")}
          footer={() => (
            <div className="flex flex-wrap justify-end gap-6 text-sm">
              <span>
                {t("fa.inventory.onBooks")}: <b>{totals.onBooks}</b> · {money(totals.bookValue)}
              </span>
              <span>
                {t("fa.inventory.foundCount")}: <b>{totals.found}</b>
              </span>
              <span>
                {t("fa.inventory.shortage")}: <b className="text-red-600">{totals.shortage}</b> · {money(totals.shortageValue)}
              </span>
              <span>
                {t("fa.inventory.surplus")}: <b className="text-green-700">{totals.surplus}</b> · {money(totals.surplusValue)}
              </span>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
