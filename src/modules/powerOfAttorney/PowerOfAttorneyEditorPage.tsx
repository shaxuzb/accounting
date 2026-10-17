import { useState } from "react";
import { Alert, Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Plus, Printer, RotateCcw, Save, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import { getJson } from "@/modules/accountings/services/request";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { contractTypeIds, takeMainOrOnlyContract } from "@/shared/constants/contractSelect";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  powerOfAttorneyPath,
  powerOfAttorneyPermissions,
  powerOfAttorneyStatus,
  useDeletePowerOfAttorney,
  usePowerOfAttorney,
  usePowerOfAttorneyAgents,
  useSavePowerOfAttorney,
  useSetPowerOfAttorneyStatus,
  type PowerOfAttorney,
  type PowerOfAttorneyLine,
} from "./api";
import { PowerOfAttorneyStatusTag } from "./PowerOfAttorneyListPage";

const emptyLine = (): PowerOfAttorneyLine => ({ productId: null, name: "", unitId: null, quantity: 1 });

export default function PowerOfAttorneyEditorPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const { data, isLoading } = usePowerOfAttorney(id);
  if (id && (isLoading || !data)) return null;
  return <PowerOfAttorneyEditor key={`${id}-${data?.statusId ?? 0}`} id={id} data={data} />;
}

/**
 * 1C «Доверенность», NSBU 4 ch. 12: the employee and position (only an employee is given one),
 * the passport, the supplier and contract or document, the goods (name, unit, quantity — it is
 * not given half filled in, p. 96) and the term. Done once a posted purchase names it; an unused
 * one is returned the day after its term (p. 99).
 */
function PowerOfAttorneyEditor({ id, data }: { id: number | null; data?: PowerOfAttorney }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const done = data?.statusId === powerOfAttorneyStatus.done;
  const closed = data?.statusId === powerOfAttorneyStatus.returned || data?.statusId === powerOfAttorneyStatus.cancelled;
  const canEdit = permissions.includes(powerOfAttorneyPermissions.create) && !done && !closed;
  const save = useSavePowerOfAttorney();
  const setStatus = useSetPowerOfAttorneyStatus();
  const remove = useDeletePowerOfAttorney();
  const { data: agents = [] } = usePowerOfAttorneyAgents();

  const [docDate, setDocDate] = useState<Dayjs>(() => (data ? dayjs(data.docDate) : dayjs()));
  const [validUntil, setValidUntil] = useState<Dayjs>(() => (data ? dayjs(data.validUntil) : dayjs().add(10, "day")));
  const [employeeId, setEmployeeId] = useState<number | null>(data?.employeeId ?? null);
  const [agentPosition, setAgentPosition] = useState(data?.agentPosition ?? "");
  const [passportSeries, setPassportSeries] = useState(data?.passportSeries ?? "");
  const [passportNumber, setPassportNumber] = useState(data?.passportNumber ?? "");
  const [passportIssuedBy, setPassportIssuedBy] = useState(data?.passportIssuedBy ?? "");
  const [passportIssuedDate, setPassportIssuedDate] = useState<Dayjs | null>(
    data?.passportIssuedDate ? dayjs(data.passportIssuedDate) : null,
  );
  const [counterpartyId, setCounterpartyId] = useState<number | null>(data?.counterpartyId ?? null);
  const [contractId, setContractId] = useState<number | null>(data?.contractId ?? null);
  const [basisDocument, setBasisDocument] = useState(data?.basisDocument ?? "");
  const [comment, setComment] = useState(data?.comment ?? "");
  const [lines, setLines] = useState<PowerOfAttorneyLine[]>(() =>
    data?.lines?.length ? data.lines.map((line) => ({ ...line })) : [emptyLine()],
  );

  const { data: products = [] } = useQuery({
    queryKey: ["power-of-attorney", "products"],
    queryFn: () => getJson<{ id: number; name: string; unitId?: number | null }[]>(`/${selectListEndpoints.productsSelectList}`),
    staleTime: 5 * 60 * 1000,
  });
  const { data: units = [] } = useQuery({
    queryKey: ["power-of-attorney", "units"],
    queryFn: () => getJson<{ id: number; name: string }[]>(`/${selectListEndpoints.unitsSelectList}`),
    staleTime: 10 * 60 * 1000,
  });

  // the agent's position and passport come from the employee and the last power given to them
  const pickAgent = (value: number | null) => {
    setEmployeeId(value);
    const agent = agents.find((item) => item.employeeId === value);
    if (!agent) return;
    setAgentPosition(agent.position ?? "");
    setPassportSeries(agent.passportSeries ?? "");
    setPassportNumber(agent.passportNumber ?? "");
    setPassportIssuedBy(agent.passportIssuedBy ?? "");
    setPassportIssuedDate(agent.passportIssuedDate ? dayjs(agent.passportIssuedDate) : null);
  };

  const patchLine = (index: number, patch: Partial<PowerOfAttorneyLine>) =>
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  const body = () => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    validUntil: validUntil.format("YYYY-MM-DD"),
    employeeId: employeeId ?? 0,
    agentPosition: agentPosition.trim() || null,
    passportSeries: passportSeries.trim() || null,
    passportNumber: passportNumber.trim() || null,
    passportIssuedBy: passportIssuedBy.trim() || null,
    passportIssuedDate: passportIssuedDate ? passportIssuedDate.format("YYYY-MM-DD") : null,
    counterpartyId: counterpartyId ?? 0,
    contractId,
    basisDocument: basisDocument.trim() || null,
    comment: comment.trim() || null,
    lines: lines
      .filter((line) => line.productId || line.name.trim())
      .map((line) => ({
        productId: line.productId ?? null,
        name: line.name.trim(),
        unitId: line.unitId ?? null,
        quantity: Number(line.quantity) || 0,
      })),
  });

  const run = (action: () => Promise<unknown>) => () => void action().catch(errorHandlers);
  const saveDoc = async () => {
    const savedId = await save.mutateAsync({ id, body: body() });
    toast.success(t("powerOfAttorney.saved"));
    if (!id) navigate(`${powerOfAttorneyPath}/${savedId}`, { replace: true });
  };
  const changeStatus = (statusId: number) =>
    run(() => setStatus.mutateAsync({ id: id!, statusId }).then(() => toast.success(t("powerOfAttorney.statusSaved"))));

  const columns: TableColumnsType<PowerOfAttorneyLine> = [
    { key: "n", title: "№", width: 50, render: (_, __, index) => index + 1 },
    {
      key: "name",
      title: t("powerOfAttorney.goods"),
      render: (_, line, index) => (
        <div className="flex min-w-80 flex-col gap-1">
          <Select
            showSearch
            allowClear
            className="w-full"
            disabled={!canEdit}
            value={line.productId ?? undefined}
            placeholder={t("powerOfAttorney.productPlaceholder")}
            optionFilterProp="label"
            options={products.map((product) => ({ value: product.id, label: product.name }))}
            onChange={(value?: number) => {
              const product = products.find((item) => item.id === value);
              patchLine(index, {
                productId: value ?? null,
                name: product?.name ?? line.name,
                unitId: product?.unitId ?? line.unitId ?? null,
              });
            }}
          />
          <Input
            disabled={!canEdit}
            value={line.name}
            placeholder={t("powerOfAttorney.namePlaceholder")}
            onChange={(event) => patchLine(index, { name: event.target.value })}
          />
        </div>
      ),
    },
    {
      key: "unit",
      title: t("powerOfAttorney.unit"),
      width: 160,
      render: (_, line, index) => (
        <Select
          showSearch
          className="w-full"
          disabled={!canEdit}
          value={line.unitId ?? undefined}
          optionFilterProp="label"
          options={units.map((unit) => ({ value: unit.id, label: unit.name }))}
          onChange={(value: number) => patchLine(index, { unitId: value })}
        />
      ),
    },
    {
      key: "quantity",
      title: t("powerOfAttorney.quantity"),
      width: 140,
      render: (_, line, index) => (
        <InputNumber min={0} className="w-full!" disabled={!canEdit} value={line.quantity} onChange={(value) => patchLine(index, { quantity: Number(value ?? 0) })} />
      ),
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

  const label = (key: string) => <div className="mb-1 text-sm text-secondary-text">{t(key)}</div>;

  return (
    <div className="w-full space-y-3">
      <Card className="space-y-4 border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <b>№ {data?.docNumber ?? t("powerOfAttorney.newNumber")}</b>
          {data && <PowerOfAttorneyStatusTag statusId={data.statusId} overdue={data.overdue} />}
        </div>
        {data?.overdue && <Alert showIcon type="warning" message={t("powerOfAttorney.overdueHint")} />}
        <Form layout="vertical" component="div">
          <div className="grid gap-x-4 gap-y-3 md:grid-cols-3 xl:grid-cols-6">
            <div>
              {label("powerOfAttorney.date")}
              <DatePicker className="w-full" format="DD.MM.YYYY" allowClear={false} disabled={!canEdit} value={docDate} onChange={(value) => value && setDocDate(value)} />
            </div>
            <div>
              {label("powerOfAttorney.validUntil")}
              <DatePicker className="w-full" format="DD.MM.YYYY" allowClear={false} disabled={!canEdit} value={validUntil} onChange={(value) => value && setValidUntil(value)} />
            </div>
            <div className="xl:col-span-2">
              {label("powerOfAttorney.agent")}
              <Select
                showSearch
                className="w-full"
                disabled={!canEdit}
                value={employeeId ?? undefined}
                placeholder={t("powerOfAttorney.agentPlaceholder")}
                optionFilterProp="label"
                style={{ backgroundColor: "transparent" }}
                options={agents.map((agent) => ({ value: agent.employeeId, label: agent.name }))}
                onChange={(value: number) => pickAgent(value)}
              />
            </div>
            <div className="xl:col-span-2">
              {label("powerOfAttorney.position")}
              <Input disabled={!canEdit} value={agentPosition} onChange={(event) => setAgentPosition(event.target.value)} />
            </div>
            <div>
              {label("powerOfAttorney.passportSeries")}
              <Input disabled={!canEdit} value={passportSeries} maxLength={10} onChange={(event) => setPassportSeries(event.target.value)} />
            </div>
            <div>
              {label("powerOfAttorney.passportNumber")}
              <Input disabled={!canEdit} value={passportNumber} maxLength={20} onChange={(event) => setPassportNumber(event.target.value)} />
            </div>
            <div className="xl:col-span-2">
              {label("powerOfAttorney.passportIssuedBy")}
              <Input disabled={!canEdit} value={passportIssuedBy} onChange={(event) => setPassportIssuedBy(event.target.value)} />
            </div>
            <div>
              {label("powerOfAttorney.passportIssuedDate")}
              <DatePicker className="w-full" format="DD.MM.YYYY" disabled={!canEdit} value={passportIssuedDate} onChange={(value) => setPassportIssuedDate(value)} />
            </div>
            <div />
            <div className="xl:col-span-2">
              <SelectCustom
                label="powerOfAttorney.supplier"
                path={selectListEndpoints.counterpartiesSelectList}
                value={counterpartyId}
                disabled={!canEdit}
                search
                required
                onChange={(value) => {
                  setCounterpartyId(value ? Number(value) : null);
                  setContractId(null);
                }}
                marginBottom="mb-0"
              />
            </div>
            <div className="xl:col-span-2">
              <SelectCustom
                key={`contract-${counterpartyId}`}
                label="powerOfAttorney.contract"
                path={selectListEndpoints.contractsSelectList}
                queryParams={{
                  [filterIds.counterparty]: counterpartyId,
                  [filterIds.contractType]: contractTypeIds.supplier,
                  choosedDate: docDate.format("YYYY-MM-DD"),
                }}
                enabled={Boolean(counterpartyId)}
                disabled={!canEdit || !counterpartyId}
                value={contractId}
                getFirstWhen={takeMainOrOnlyContract}
                onChange={(value) => setContractId(value ? Number(value) : null)}
                clearable
                marginBottom="mb-0"
              />
            </div>
            <div className="xl:col-span-2">
              {label("powerOfAttorney.basisDocument")}
              <Input
                disabled={!canEdit}
                value={basisDocument}
                placeholder={t("powerOfAttorney.basisPlaceholder")}
                onChange={(event) => setBasisDocument(event.target.value)}
              />
            </div>
            <div className="md:col-span-3 xl:col-span-6">
              {label("powerOfAttorney.comment")}
              <Input disabled={!canEdit} value={comment} onChange={(event) => setComment(event.target.value)} />
            </div>
          </div>
        </Form>

        <Space wrap>
          {canEdit && (
            <Button type="primary" icon={<Save className="size-4" />} loading={save.isPending} onClick={run(saveDoc)}>
              {t("powerOfAttorney.save")}
            </Button>
          )}
          {id && (
            <Button icon={<Printer className="size-4" />} onClick={() => navigate(`${powerOfAttorneyPath}/${id}/print`)}>
              {t("powerOfAttorney.print")}
            </Button>
          )}
          {id && canEdit && data?.statusId === powerOfAttorneyStatus.issued && (
            <Popconfirm title={t("powerOfAttorney.returnConfirm")} onConfirm={changeStatus(powerOfAttorneyStatus.returned)}>
              <Button icon={<RotateCcw className="size-4" />}>{t("powerOfAttorney.markReturned")}</Button>
            </Popconfirm>
          )}
          {id && canEdit && data?.statusId === powerOfAttorneyStatus.issued && (
            <Popconfirm title={t("powerOfAttorney.cancelConfirm")} okButtonProps={{ danger: true }} onConfirm={changeStatus(powerOfAttorneyStatus.cancelled)}>
              <Button danger icon={<Ban className="size-4" />}>{t("powerOfAttorney.cancel")}</Button>
            </Popconfirm>
          )}
          {id && closed && permissions.includes(powerOfAttorneyPermissions.create) && (
            <Button onClick={changeStatus(powerOfAttorneyStatus.issued)}>{t("powerOfAttorney.reopen")}</Button>
          )}
          {id && !done && permissions.includes(powerOfAttorneyPermissions.delete) && (
            <Popconfirm
              title={t("powerOfAttorney.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={run(() => remove.mutateAsync(id).then(() => navigate(powerOfAttorneyPath, { replace: true })))}
            >
              <Button danger icon={<Trash2 className="size-4" />} />
            </Popconfirm>
          )}
        </Space>
        {data?.purchases?.length ? (
          <div className="text-sm text-secondary-text">
            {t("powerOfAttorney.purchases")}:{" "}
            {data.purchases.map((purchase) => (
              <Button key={purchase.id} type="link" size="small" onClick={() => navigate(`/main/purchases/purchase/${purchase.id}`)}>
                №{purchase.docNumber} · {dayjs(purchase.docDate).format("DD.MM.YYYY")}
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
          dataSource={lines}
          scroll={{ x: "max-content" }}
          footer={() =>
            canEdit ? (
              <Button icon={<Plus className="size-4" />} onClick={() => setLines((current) => [...current, emptyLine()])}>
                {t("powerOfAttorney.addLine")}
              </Button>
            ) : null
          }
        />
      </Card>
    </div>
  );
}
