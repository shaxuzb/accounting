import { Button, DatePicker, InputNumber, Popconfirm, Table, Tag } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calculator, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { faReceiptPermissions } from "../../constants/permissions";
import { formatReceiptAmount } from "./faReceiptReadonlyUtils";

interface LeasePayment {
  lineNo: number;
  paymentDate: string;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

interface Lease {
  exists: boolean;
  amount: number;
  annualRate: number;
  termMonths: number;
  firstPaymentDate: string;
  buyoutAmount: number;
  longTermAccountNumber?: string | null;
  totalPayments: number;
  totalInterest: number;
  payments: LeasePayment[];
}

interface Terms {
  annualRate: number;
  termMonths: number;
  firstPaymentDate: Dayjs;
  buyoutAmount: number;
}

/**
 * The payment schedule of an asset received under a financial lease (NSBU 6, 29–30): equal
 * payments, the interest at a constant rate on the obligation left. The month close books each
 * month's row: the interest Dt 9610 Kt 6920, the principal falling due Dt 7910 Kt 6950.
 */
export default function FaLeaseScheduleCard({ receiptId }: { receiptId: number }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const canChange = permissions.includes(faReceiptPermissions.confirm);
  const path = `fa-receipts/${receiptId}/lease`;
  const [terms, setTerms] = useState<Terms | null>(null);
  const [preview, setPreview] = useState<Lease | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["fa-receipt-lease", receiptId],
    queryFn: () => $axiosPrivate.get<Lease>(path).then((res) => res.data),
  });
  useEffect(() => {
    if (!data) return;
    setTerms({
      annualRate: Number(data.annualRate),
      termMonths: Number(data.termMonths),
      firstPaymentDate: dayjs(data.firstPaymentDate),
      buyoutAmount: Number(data.buyoutAmount),
    });
    setPreview(null);
  }, [data]);

  const body = () =>
    terms && {
      annualRate: terms.annualRate,
      termMonths: terms.termMonths,
      firstPaymentDate: terms.firstPaymentDate.format("YYYY-MM-DD"),
      buyoutAmount: terms.buyoutAmount,
    };
  const onError = (error: unknown) => errorHandlers(error);
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["fa-receipt-lease", receiptId] });

  const calculate = useMutation({
    mutationFn: () => $axiosPrivate.post<Lease>(`${path}/preview`, body()).then((res) => res.data),
    onSuccess: setPreview,
    onError,
  });
  const save = useMutation({
    mutationFn: () => $axiosPrivate.put(path, body()),
    onSuccess: () => {
      toast.success(t("fa.lease.saved"));
      refresh();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: () => $axiosPrivate.delete(path),
    onSuccess: refresh,
    onError,
  });

  const shown = preview ?? (data?.exists ? data : null);
  const update = (patch: Partial<Terms>) => {
    setTerms((current) => (current ? { ...current, ...patch } : current));
    setPreview(null);
  };

  return (
    <Card className="border border-border p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-heading">
            {t("fa.lease.title")}{" "}
            {data && !data.exists && <Tag color="orange">{t("fa.lease.notSet")}</Tag>}
          </div>
          <div className="max-w-3xl text-sm text-secondary-text">{t("fa.lease.hint")}</div>
        </div>
        {data && (
          <div className="text-right">
            <div className="text-xs text-secondary-text">
              {t("fa.lease.obligation")} {data.longTermAccountNumber ? `(${data.longTermAccountNumber})` : ""}
            </div>
            <div className="text-base font-bold tabular-nums">{formatReceiptAmount(data.amount)}</div>
          </div>
        )}
      </div>

      {terms && canChange && (
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-secondary-text">
            {t("fa.lease.annualRate")}
            <InputNumber
              min={0}
              max={100}
              value={terms.annualRate}
              addonAfter="%"
              onChange={(value) => update({ annualRate: Number(value ?? 0) })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-secondary-text">
            {t("fa.lease.termMonths")}
            <InputNumber
              min={1}
              max={600}
              precision={0}
              value={terms.termMonths}
              onChange={(value) => update({ termMonths: Number(value ?? 1) })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-secondary-text">
            {t("fa.lease.firstPaymentDate")}
            <DatePicker
              value={terms.firstPaymentDate}
              format="DD.MM.YYYY"
              allowClear={false}
              onChange={(value) => value && update({ firstPaymentDate: value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-secondary-text">
            {t("fa.lease.buyoutAmount")}
            <InputNumber
              className="w-44"
              min={0}
              value={terms.buyoutAmount}
              onChange={(value) => update({ buyoutAmount: Number(value ?? 0) })}
            />
          </label>
          <Button icon={<Calculator className="size-4" />} loading={calculate.isPending} onClick={() => calculate.mutate()}>
            {t("fa.lease.calculate")}
          </Button>
          <Button type="primary" icon={<Save className="size-4" />} loading={save.isPending} onClick={() => save.mutate()}>
            {t("fa.lease.save")}
          </Button>
          {data?.exists && (
            <Popconfirm title={t("fa.lease.deleteConfirm")} onConfirm={() => remove.mutate()}>
              <Button danger icon={<Trash2 className="size-4" />} loading={remove.isPending} />
            </Popconfirm>
          )}
        </div>
      )}

      {shown && (
        <div className="mb-2 flex flex-wrap gap-x-8 gap-y-1 text-sm">
          {preview && <Tag color="blue">{t("fa.lease.previewTag")}</Tag>}
          <span>
            {t("fa.lease.totalPayments")}: <b className="tabular-nums">{formatReceiptAmount(shown.totalPayments)}</b>
          </span>
          <span>
            {t("fa.lease.totalInterest")}: <b className="tabular-nums">{formatReceiptAmount(shown.totalInterest)}</b>
          </span>
        </div>
      )}
      <Table<LeasePayment>
        rowKey="lineNo"
        size="small"
        loading={isLoading}
        pagination={false}
        scroll={{ y: 360 }}
        dataSource={shown?.payments ?? []}
        locale={{ emptyText: t("fa.lease.none") }}
        columns={[
          { title: "№", dataIndex: "lineNo", width: 56 },
          {
            title: t("fa.lease.paymentDate"),
            dataIndex: "paymentDate",
            render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
          },
          { title: t("fa.lease.payment"), dataIndex: "payment", align: "right", render: formatReceiptAmount },
          { title: t("fa.lease.interest"), dataIndex: "interest", align: "right", render: formatReceiptAmount },
          { title: t("fa.lease.principal"), dataIndex: "principal", align: "right", render: formatReceiptAmount },
          { title: t("fa.lease.balance"), dataIndex: "balance", align: "right", render: formatReceiptAmount },
        ]}
      />
    </Card>
  );
}
