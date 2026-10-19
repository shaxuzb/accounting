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
import { faDisposalPermissions } from "../../../faDisposal/constants/permissions";
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
  isLessor?: boolean;
  amount: number;
  currencyCode?: string | null;
  /** The lessor's deferred difference (NSBU 6, 42): + income, − expense, over the term. */
  deferredAmount?: number;
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
 * The payment schedule of a financial lease (NSBU 6): equal payments, the interest at a constant
 * rate on what is left. The lessee's, kept by the receipt (29–30): the month close books the
 * interest Dt 9610 Kt 6920 and the principal falling due Dt 7910 Kt 6950, a lease in a foreign
 * currency in it. The lessor's, kept by the disposal (38–42): the interest Dt 4830 Kt 9530, the
 * receivable falling due Dt 4810 Kt 0920 and the month's share of the deferred difference.
 */
export default function FaLeaseScheduleCard({ receiptId, disposalId }: { receiptId?: number; disposalId?: number }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const canChange = permissions.includes(disposalId ? faDisposalPermissions.confirm : faReceiptPermissions.confirm);
  const path = disposalId ? `fa/disposals/${disposalId}/lease` : `fa-receipts/${receiptId}/lease`;
  const queryKey = disposalId ? ["fa-disposal-lease", disposalId] : ["fa-receipt-lease", receiptId];
  const [terms, setTerms] = useState<Terms | null>(null);
  const [preview, setPreview] = useState<Lease | null>(null);

  const { data, isLoading } = useQuery({
    queryKey,
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
  const refresh = () => void queryClient.invalidateQueries({ queryKey });

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
  const deferred = data?.isLessor ? Number(data.deferredAmount ?? 0) : 0;
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
          <div className="max-w-3xl text-sm text-secondary-text">{t(data?.isLessor ? "fa.lease.lessorHint" : "fa.lease.hint")}</div>
        </div>
        {data && (
          <div className="text-right">
            <div className="text-xs text-secondary-text">
              {t(data.isLessor ? "fa.lease.receivable" : "fa.lease.obligation")}{" "}
              {data.longTermAccountNumber ? `(${data.longTermAccountNumber})` : ""}
            </div>
            <div className="text-base font-bold tabular-nums">
              {formatReceiptAmount(data.amount)} {data.currencyCode ?? ""}
            </div>
            {data.isLessor && Number(data.deferredAmount ?? 0) !== 0 && (
              <div className="text-xs text-secondary-text">
                {t(Number(data.deferredAmount) > 0 ? "fa.lease.deferredIncome" : "fa.lease.deferredExpense")}:{" "}
                <b className="tabular-nums">{formatReceiptAmount(Math.abs(Number(data.deferredAmount)))}</b>
              </div>
            )}
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
          {
            title: t(data?.isLessor ? "fa.lease.lessorInterest" : "fa.lease.interest"),
            dataIndex: "interest",
            align: "right",
            render: formatReceiptAmount,
          },
          {
            title: t(data?.isLessor ? "fa.lease.lessorPrincipal" : "fa.lease.principal"),
            dataIndex: "principal",
            align: "right",
            render: formatReceiptAmount,
          },
          {
            title: t(data?.isLessor ? "fa.lease.lessorBalance" : "fa.lease.balance"),
            dataIndex: "balance",
            align: "right",
            render: formatReceiptAmount,
          },
          // the lessor's deferred difference, equal over the rows, the last taking what is left
          ...(deferred !== 0
            ? [
                {
                  title: t("fa.lease.deferredShare"),
                  key: "deferred",
                  align: "right" as const,
                  render: (_: unknown, row: LeasePayment) => {
                    const count = shown?.payments.length ?? 0;
                    const share = Math.round((deferred / count) * 100) / 100;
                    return formatReceiptAmount(row.lineNo === count ? deferred - share * (count - 1) : share);
                  },
                },
              ]
            : []),
        ]}
      />
    </Card>
  );
}
