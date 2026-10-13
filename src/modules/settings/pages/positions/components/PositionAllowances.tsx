import { Button, DatePicker, Empty, InputNumber, Popconfirm, Select, Spin, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs, { type Dayjs } from "dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { usePayrollComponentLookup } from "@/modules/payroll/hooks/usePayrollComponentLookup";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

interface PositionAllowance {
  id: number;
  componentId: number;
  componentName: string;
  calculationMethod: string;
  amount?: number | null;
  rate?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

const path = (positionId: number) => `payroll/positions/${positionId}/components`;

/**
 * The allowances a position carries (1C «Плановые начисления» of the staff list): every holder of
 * the position gets them in the regular payroll, unless the employee has the component personally.
 */
export default function PositionAllowances({ positionId }: { positionId: number }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const queryKey = ["position-allowances", positionId];
  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => $axiosPrivate.get<PositionAllowance[]>(path(positionId)).then((r) => r.data),
  });
  const { data: components = [] } = usePayrollComponentLookup("EARNING");
  const allowanceComponents = components.filter(
    (component) => component.calculationMethod === "FIXED" || component.calculationMethod === "PERCENT_OF_GROSS",
  );

  const [componentId, setComponentId] = useState<number | null>(null);
  const [value, setValue] = useState<number | null>(null);
  const [from, setFrom] = useState<Dayjs | null>(dayjs().startOf("month"));
  const method = allowanceComponents.find((component) => component.id === componentId)?.calculationMethod;

  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const create = useMutation({
    mutationFn: () =>
      $axiosPrivate.post(path(positionId), {
        componentId,
        amount: method === "FIXED" ? value : null,
        rate: method === "PERCENT_OF_GROSS" ? value : null,
        effectiveFrom: from?.format("YYYY-MM-DD"),
        effectiveTo: null,
      }),
    onSuccess: () => {
      toast.success(t("settings.messages.created"));
      setComponentId(null);
      setValue(null);
      void refresh();
    },
    onError: errorHandlers,
  });
  const remove = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${path(positionId)}/${id}`),
    onSuccess: () => void refresh(),
    onError: errorHandlers,
  });

  const columns: TableColumnsType<PositionAllowance> = [
    { dataIndex: "componentName", title: t("payroll.fields.component") },
    {
      key: "value",
      title: t("payroll.fields.amount"),
      align: "right",
      render: (_, row) =>
        row.rate != null
          ? `${row.rate} %`
          : Number(row.amount ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2 }),
    },
    {
      key: "period",
      title: t("payroll.fields.effectiveFrom"),
      render: (_, row) =>
        `${dayjs(row.effectiveFrom).format("DD.MM.YYYY")}${row.effectiveTo ? ` — ${dayjs(row.effectiveTo).format("DD.MM.YYYY")}` : ""}`,
    },
    {
      key: "actions",
      width: 48,
      render: (_, row) => (
        <Popconfirm title={t("common.delete")} onConfirm={() => remove.mutate(row.id)}>
          <Button type="text" danger size="small" icon={<Trash2 className="size-4" />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="mt-4 rounded-xl border border-border p-3">
      <div className="text-sm font-semibold">{t("payroll.positionAllowances.title")}</div>
      <div className="mb-3 text-xs text-secondary-text">{t("payroll.positionAllowances.hint")}</div>
      <Spin spinning={isLoading}>
        {data.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("payroll.positionAllowances.empty")} />
        ) : (
          <Table<PositionAllowance> rowKey="id" size="small" pagination={false} columns={columns} dataSource={data} />
        )}
      </Spin>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <Select
          placeholder={t("payroll.fields.component")}
          value={componentId ?? undefined}
          onChange={(id: number) => setComponentId(id)}
          options={allowanceComponents.map((component) => ({ value: component.id, label: component.name }))}
        />
        <InputNumber
          className="w-full"
          min={0}
          precision={2}
          value={value}
          onChange={(next) => setValue(next === null ? null : Number(next))}
          addonAfter={method === "PERCENT_OF_GROSS" ? "%" : undefined}
          placeholder={t("payroll.fields.amount")}
        />
        <DatePicker format="DD.MM.YYYY" value={from} onChange={setFrom} />
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          disabled={!componentId || !value || !from}
          loading={create.isPending}
          onClick={() => create.mutate()}
        >
          {t("payroll.positionAllowances.add")}
        </Button>
      </div>
    </div>
  );
}
