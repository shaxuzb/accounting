import { Alert, Button, Modal, Popconfirm, Space, Spin, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Lock,
  LockOpen,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { periodPermissions } from "./api";
import { useCloseCheck, useClosePeriod, usePeriods, useReopenPeriod } from "./hooks";
import type { AccountingPeriod, MonthCloseLine } from "./types";

const money = (value?: number | null) =>
  (value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


/**
 * The accounting months: each closes by hand once it is over (its 9xxx accounts go to 9910,
 * in December 9910 to 8710) and only someone allowed to reopen periods opens it again.
 */
export default function PeriodsPage() {
  const { t } = useTranslation();
  const monthName = (month: number) => t(`periods.monthNames.${month}`);
  const [year, setYear] = useState(dayjs().year());
  const { data = [], isLoading } = usePeriods(year);
  const reopen = useReopenPeriod();
  const [closing, setClosing] = useState<number | null>(null);
  const userPermissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const canClose = userPermissions.includes(periodPermissions.close);
  const canReopen = userPermissions.includes(periodPermissions.reopen);

  // a month opens again only when it is the last closed one
  const lastClosedId = [...data].reverse().find((x) => x.isClosed)?.id;
  // and closes only when every earlier month is closed
  const firstOpenId = data.find((x) => x.hasPeriod && !x.isClosed)?.id;

  const columns: TableColumnsType<AccountingPeriod> = [
    {
      key: "month",
      title: t("periods.month"),
      render: (_, period) => <b>{monthName(period.month)}</b>,
    },
    {
      key: "status",
      title: t("periods.status"),
      render: (_, period) =>
        !period.hasPeriod ? (
          <Tag>{t("periods.noActivity")}</Tag>
        ) : period.isClosed ? (
          <Tag color="green" icon={<Lock className="mr-1 inline size-3" />}>
            {t("periods.closed")}
          </Tag>
        ) : (
          <Tag color="blue" icon={<LockOpen className="mr-1 inline size-3" />}>
            {t("periods.open")}
          </Tag>
        ),
    },
    {
      dataIndex: "result",
      title: t("periods.result"),
      align: "right",
      render: (value?: number | null) =>
        value == null ? (
          "—"
        ) : (
          <span className={value >= 0 ? "text-green-600" : "text-red-600"}>{money(value)}</span>
        ),
    },
    {
      dataIndex: "closedAt",
      title: t("periods.closedAt"),
      render: (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY HH:mm") : "—"),
    },
    {
      key: "actions",
      title: t("common.actions"),
      align: "center",
      render: (_, period) => {
        if (!period.id) return null;
        if (!period.isClosed)
          return canClose && period.id === firstOpenId ? (
            <Button type="primary" size="small" icon={<Lock className="size-4" />} onClick={() => setClosing(period.id)}>
              {t("periods.close")}
            </Button>
          ) : null;
        return canReopen && period.id === lastClosedId ? (
          <Popconfirm
            title={t("periods.reopenConfirm")}
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              reopen.mutateAsync(period.id!).then(() => toast.success(t("periods.reopened")))
            }
          >
            <Button size="small" danger icon={<LockOpen className="size-4" />}>
              {t("periods.reopen")}
            </Button>
          </Popconfirm>
        ) : null;
      },
    },
  ];

  return (
    <div className="w-full space-y-3">
      <Card className="flex items-center justify-between border border-border p-3">
        <Space>
          <Button icon={<ChevronLeft className="size-4" />} onClick={() => setYear((y) => y - 1)} />
          <span className="min-w-16 text-center text-lg font-semibold">{year}</span>
          <Button icon={<ChevronRight className="size-4" />} onClick={() => setYear((y) => y + 1)} />
        </Space>
        <span className="text-sm text-secondary-text">{t("periods.hint")}</span>
      </Card>
      <Card className="overflow-hidden border border-border">
        <Table<AccountingPeriod>
          rowKey="month"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </Card>
      {closing !== null && <CloseMonthModal periodId={closing} onClose={() => setClosing(null)} />}
    </div>
  );
}

function CheckItem({ ok, warning, children }: { ok: boolean; warning?: boolean; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1">
      {ok ? (
        <CircleCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
      ) : warning ? (
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
      ) : (
        <CircleX className="mt-0.5 size-4 shrink-0 text-red-600" />
      )}
      <div>{children}</div>
    </div>
  );
}

function CloseMonthModal({ periodId, onClose }: { periodId: number; onClose: () => void }) {
  const { t } = useTranslation();
  const monthName = (month: number) => t(`periods.monthNames.${month}`);
  const { data: check, isLoading } = useCloseCheck(periodId);
  const close = useClosePeriod();

  const submit = async () => {
    await close.mutateAsync(periodId);
    toast.success(t("periods.closedMessage"));
    onClose();
  };

  const columns: TableColumnsType<MonthCloseLine> = [
    {
      key: "account",
      title: t("periods.account"),
      render: (_, line) => (
        <div>
          <b>{line.accountNumber}</b> <span className="text-secondary-text">{line.accountName}</span>
          {line.analytics && <div className="text-xs text-secondary-text">{line.analytics}</div>}
        </div>
      ),
    },
    {
      dataIndex: "amount",
      title: t("periods.amount"),
      align: "right",
      width: 170,
      render: (value: number) => (
        <span className={value >= 0 ? "text-green-600" : "text-red-600"}>{money(value)}</span>
      ),
    },
    {
      key: "entry",
      title: t("periods.entry"),
      width: 170,
      render: (_, line) => (
        <Tag className="m-0">
          {line.amount >= 0 ? `Dt ${line.accountNumber} — Kt 9910` : `Dt 9910 — Kt ${line.accountNumber}`}
        </Tag>
      ),
    },
  ];

  const costColumns: TableColumnsType<MonthCloseLine> = [
    columns[0],
    {
      dataIndex: "amount",
      title: t("periods.amount"),
      align: "right",
      width: 170,
      render: (value: number) => money(Math.abs(value)),
    },
    {
      key: "entry",
      title: t("periods.entry"),
      width: 170,
      render: (_, line) => (
        <Tag className="m-0">
          {line.amount >= 0 ? `Dt 9130 — Kt ${line.accountNumber}` : `Dt ${line.accountNumber} — Kt 9130`}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      open
      width={900}
      title={check ? `${t("periods.closeTitle")}: ${monthName(check.month)} ${check.year}` : t("periods.closeTitle")}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("common.cancel")}
        </Button>,
        <Button
          key="close"
          type="primary"
          icon={<Lock className="size-4" />}
          disabled={!check?.canClose}
          loading={close.isPending}
          onClick={() => void submit()}
        >
          {t("periods.close")}
        </Button>,
      ]}
    >
      {isLoading || !check ? (
        <div className="flex justify-center p-8">
          <Spin />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md border border-border p-3">
            <CheckItem ok={check.monthIsOver}>{t(check.monthIsOver ? "periods.check.monthOver" : "periods.check.monthNotOver")}</CheckItem>
            <CheckItem ok={!check.previousPeriodsOpen}>
              {t(check.previousPeriodsOpen ? "periods.check.previousOpen" : "periods.check.previousClosed")}
            </CheckItem>
            <CheckItem ok={check.revaluationLineCount === 0 && !check.revaluationError}>
              {check.revaluationError ? (
                check.revaluationError
              ) : check.revaluationLineCount > 0 ? (
                <>
                  {t("periods.check.revaluationNeeded", {
                    count: check.revaluationLineCount,
                    amount: money(check.revaluationDifference),
                  })}{" "}
                  <Link to="/main/accountings/currency-revaluation">{t("periods.check.goRevaluation")}</Link>
                </>
              ) : (
                t("periods.check.revaluationDone")
              )}
            </CheckItem>
            <CheckItem ok={Math.abs(check.openingOffsetBalance ?? 0) < 0.01}>
              {Math.abs(check.openingOffsetBalance ?? 0) < 0.01
                ? t("periods.check.openingOffsetZero")
                : t("periods.check.openingOffsetNotZero", { amount: money(check.openingOffsetBalance) })}
            </CheckItem>
            <CheckItem ok={check.missingAccounts.length === 0}>
              {check.missingAccounts.length === 0
                ? t("periods.check.accountsPresent")
                : t("periods.check.accountsMissing", { accounts: check.missingAccounts.join(", ") })}
            </CheckItem>
            <CheckItem ok={(check.assetsAwaitingDepreciation ?? 0) === 0}>
              {(check.assetsAwaitingDepreciation ?? 0) === 0
                ? t("periods.check.depreciationDone")
                : t("periods.check.depreciationMissing", { count: check.assetsAwaitingDepreciation })}
            </CheckItem>
            <CheckItem ok={check.draftDocumentCount === 0} warning>
              {check.draftDocumentCount === 0
                ? t("periods.check.noDrafts")
                : t("periods.check.drafts", { count: check.draftDocumentCount })}
            </CheckItem>
          </div>

          <div className="font-semibold">{t("periods.stepVat")}</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-md border border-border p-3 md:grid-cols-3">
            <span className="text-secondary-text">{t("periods.vatInput")}</span>
            <b className="text-right md:col-span-2 md:text-left">{money(check.vatInput)}</b>
            <span className="text-secondary-text">{t("periods.vatOutput")}</span>
            <b className="text-right md:col-span-2 md:text-left">{money(check.vatOutput)}</b>
            <span className="text-secondary-text">{t("periods.vatOffset")}</span>
            <b className="text-right md:col-span-2 md:text-left">{money(check.vatOffset)}</b>
            <span className="text-secondary-text">
              {check.vatOutput >= check.vatInput ? t("periods.vatPayable") : t("periods.vatCarry")}
            </span>
            <b className="text-right md:col-span-2 md:text-left">{money(Math.abs(check.vatOutput - check.vatInput))}</b>
          </div>

          <div className="font-semibold">{t("periods.stepCosts")}</div>
          <Table<MonthCloseLine>
            rowKey={(line) => `${line.accountNumber}-${line.analytics ?? ""}`}
            size="small"
            columns={costColumns}
            dataSource={check.costLines}
            pagination={false}
            scroll={{ y: 200 }}
            locale={{ emptyText: t("periods.noCosts") }}
          />

          <div className="font-semibold">{t("periods.stepResult")}</div>
          <Table<MonthCloseLine>
            rowKey={(line) => `${line.accountNumber}-${line.analytics ?? ""}`}
            size="small"
            columns={columns}
            dataSource={check.lines}
            pagination={false}
            scroll={{ y: 300 }}
            locale={{ emptyText: t("periods.noLines") }}
          />

          <div className="flex justify-end gap-6 text-base">
            <span>
              {t("periods.monthResult")}:{" "}
              <b className={check.result >= 0 ? "text-green-600" : "text-red-600"}>{money(check.result)}</b>
            </span>
          </div>
          {check.isYearEnd && !!check.yearResult && (
            <Alert
              type="info"
              showIcon
              message={t(check.yearResult! >= 0 ? "periods.yearProfit" : "periods.yearLoss", {
                amount: money(Math.abs(check.yearResult!)),
              })}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
