import { Button, DatePicker, Empty, InputNumber, Popconfirm, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs, { type Dayjs } from "dayjs";
import SectionCard from "@/components/ui/card/SectionCard";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

interface EarningHistory {
  id: number;
  periodYear: number;
  periodMonth: number;
  earnings: number;
  workedDays: number;
  normDays: number;
  note?: string | null;
}

interface ServicePeriod {
  id: number;
  startDate: string;
  endDate: string;
  note?: string | null;
}

const money = (value: number) => Number(value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2 });

/**
 * What an employee brings from before the payroll was kept here (1C «Данные для расчета среднего
 * заработка», «Стаж»): earlier months' earnings for the average earnings, and earlier periods of
 * insurance record for the sick benefit's share.
 */
export default function EmployeeRecordsPanel({ employeeId, canEdit }: { employeeId: number; canEdit: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const base = `hr/employees/${employeeId}`;

  const history = useQuery({
    queryKey: ["employee-earning-history", employeeId],
    queryFn: () => $axiosPrivate.get<EarningHistory[]>(`${base}/earning-history`).then((r) => r.data),
  });
  const periods = useQuery({
    queryKey: ["employee-service-periods", employeeId],
    queryFn: () => $axiosPrivate.get<ServicePeriod[]>(`${base}/service-periods`).then((r) => r.data),
  });

  const [month, setMonth] = useState<Dayjs | null>(null);
  const [earnings, setEarnings] = useState<number | null>(null);
  const [worked, setWorked] = useState<number | null>(null);
  const [norm, setNorm] = useState<number | null>(null);
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["employee-earning-history", employeeId] });
    void queryClient.invalidateQueries({ queryKey: ["employee-service-periods", employeeId] });
  };
  const saveHistory = useMutation({
    mutationFn: () =>
      $axiosPrivate.post(`${base}/earning-history`, {
        periodYear: month?.year(),
        periodMonth: (month?.month() ?? 0) + 1,
        earnings,
        workedDays: worked,
        normDays: norm,
      }),
    onSuccess: () => {
      toast.success(t("settings.messages.created"));
      setMonth(null);
      setEarnings(null);
      setWorked(null);
      setNorm(null);
      refresh();
    },
    onError: errorHandlers,
  });
  const removeHistory = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${base}/earning-history/${id}`),
    onSuccess: refresh,
    onError: errorHandlers,
  });
  const addPeriod = useMutation({
    mutationFn: () =>
      $axiosPrivate.post(`${base}/service-periods`, {
        startDate: range?.[0]?.format("YYYY-MM-DD"),
        endDate: range?.[1]?.format("YYYY-MM-DD"),
      }),
    onSuccess: () => {
      toast.success(t("settings.messages.created"));
      setRange(null);
      refresh();
    },
    onError: errorHandlers,
  });
  const removePeriod = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${base}/service-periods/${id}`),
    onSuccess: refresh,
    onError: errorHandlers,
  });

  const historyColumns: TableColumnsType<EarningHistory> = [
    {
      key: "month",
      title: t("payroll.leave.month"),
      render: (_, row) => `${String(row.periodMonth).padStart(2, "0")}.${row.periodYear}`,
    },
    { dataIndex: "earnings", title: t("payroll.leave.earnings"), align: "right", render: money },
    { dataIndex: "workedDays", title: t("payroll.leave.workedDays"), align: "right" },
    { dataIndex: "normDays", title: t("payroll.leave.normDays"), align: "right" },
    {
      key: "actions",
      width: 48,
      render: (_, row) =>
        canEdit && (
          <Popconfirm title={t("common.delete")} onConfirm={() => removeHistory.mutate(row.id)}>
            <Button type="text" danger size="small" icon={<Trash2 className="size-4" />} />
          </Popconfirm>
        ),
    },
  ];
  const periodColumns: TableColumnsType<ServicePeriod> = [
    {
      key: "period",
      title: t("payroll.records.period"),
      render: (_, row) => `${dayjs(row.startDate).format("DD.MM.YYYY")} — ${dayjs(row.endDate).format("DD.MM.YYYY")}`,
    },
    {
      key: "months",
      title: t("payroll.records.months"),
      align: "right",
      render: (_, row) => dayjs(row.endDate).add(1, "day").diff(dayjs(row.startDate), "month"),
    },
    {
      key: "actions",
      width: 48,
      render: (_, row) =>
        canEdit && (
          <Popconfirm title={t("common.delete")} onConfirm={() => removePeriod.mutate(row.id)}>
            <Button type="text" danger size="small" icon={<Trash2 className="size-4" />} />
          </Popconfirm>
        ),
    },
  ];

  return (
    <>
      <SectionCard title="payroll.records.historyTitle" description="payroll.records.historyHint">
        {(history.data ?? []).length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("payroll.records.empty")} />
        ) : (
          <Table<EarningHistory> rowKey="id" size="small" pagination={false} columns={historyColumns} dataSource={history.data} />
        )}
        {canEdit && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.4fr_1fr_1fr_auto]">
            <DatePicker picker="month" format="MM.YYYY" value={month} onChange={setMonth} placeholder={t("payroll.leave.month")} />
            <InputNumber className="w-full" min={0} precision={2} value={earnings} onChange={(v) => setEarnings(v === null ? null : Number(v))} placeholder={t("payroll.leave.earnings")} />
            <InputNumber className="w-full" min={0} max={31} value={worked} onChange={(v) => setWorked(v === null ? null : Number(v))} placeholder={t("payroll.leave.workedDays")} />
            <InputNumber className="w-full" min={0} max={31} value={norm} onChange={(v) => setNorm(v === null ? null : Number(v))} placeholder={t("payroll.leave.normDays")} />
            <Button type="primary" icon={<Plus className="size-4" />} disabled={!month || earnings == null || !worked || !norm} loading={saveHistory.isPending} onClick={() => saveHistory.mutate()}>
              {t("common.add")}
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="payroll.records.periodsTitle" description="payroll.records.periodsHint">
        {(periods.data ?? []).length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("payroll.records.empty")} />
        ) : (
          <Table<ServicePeriod> rowKey="id" size="small" pagination={false} columns={periodColumns} dataSource={periods.data} />
        )}
        {canEdit && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <DatePicker.RangePicker format="DD.MM.YYYY" value={range} onChange={(v) => setRange(v as [Dayjs | null, Dayjs | null] | null)} />
            <Button type="primary" icon={<Plus className="size-4" />} disabled={!range?.[0] || !range?.[1]} loading={addPeriod.isPending} onClick={() => addPeriod.mutate()}>
              {t("common.add")}
            </Button>
          </div>
        )}
      </SectionCard>
    </>
  );
}
