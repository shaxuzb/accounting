import { Alert, Checkbox, DatePicker, Descriptions, InputNumber, Modal, Spin } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import LeaveAverageTable from "./LeaveAverageTable";
import { days, leaveApi, money } from "./api";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName?: string | null;
  dismissalDate?: string | null;
}

/**
 * The settlement of 1C «Увольнение»: the unused leave paid (Labour Code art. 234, Sundays not
 * paid) or the leave taken in advance recovered (art. 269) unless the ground frees the employee
 * from it (part 3), and the severance pay the dismissal ground grants (art. 173).
 */
export default function SettlementModal({ open, onClose, employeeId, employeeName, dismissalDate }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = useState<Dayjs | null>(dismissalDate ? dayjs(dismissalDate) : null);
  const [noRecovery, setNoRecovery] = useState(false);
  const [paySeverance, setPaySeverance] = useState<boolean | null>(null);
  const [severancePercent, setSeverancePercent] = useState<number | null>(null);
  // typed here, sent to the preview once the field is left: a preview per keystroke overwrote the typing
  const [percentInput, setPercentInput] = useState<number | null>(null);

  const request = {
    employeeId,
    dismissalDate: date ? date.format("YYYY-MM-DD") : null,
    noRecovery,
    paySeverance,
    severancePercent,
  };
  const preview = useQuery({
    queryKey: ["payroll-settlement-preview", request],
    queryFn: () => leaveApi.previewSettlement(request),
    enabled: open,
    retry: false,
  });
  const create = useMutation({ mutationFn: leaveApi.createSettlement });

  const submit = async () => {
    try {
      const id = await create.mutateAsync(request);
      toast.success(t("payroll.leave.settlementCreated"));
      onClose();
      navigate(`/main/payroll/documents/${id}`);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const data = preview.data;
  return (
    <Modal
      open={open}
      title={t("payroll.leave.settlementTitle", { name: employeeName ?? data?.employeeName ?? "" })}
      width={820}
      maskClosable={false}
      okText={t("payroll.leave.createSettlement")}
      cancelText={t("common.cancel")}
      okButtonProps={{ disabled: !data || !data.periodId || (data.amount === 0 && data.severanceAmount === 0) }}
      confirmLoading={create.isPending}
      onOk={() => void submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-sm">{t("payroll.leave.dismissalDate")}</div>
          <DatePicker className="w-full" format="DD.MM.YYYY" value={date} onChange={setDate} />
        </div>
        <div className="flex items-end">
          <Checkbox checked={noRecovery} onChange={(event) => setNoRecovery(event.target.checked)}>
            {t("payroll.leave.noRecovery")}
          </Checkbox>
        </div>
      </div>

      <Spin spinning={preview.isFetching}>
        {preview.isError && (
          <Alert className="mt-3" type="error" showIcon message={(preview.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? t("error.title")} />
        )}
        {data && (
          <div className="mt-4 space-y-3">
            {data.warnings.map((warning) => (
              <Alert key={warning} type={data.recovery ? "warning" : "info"} showIcon message={warning} />
            ))}
            <Descriptions size="small" bordered column={2} title={t("payroll.leave.leavePart")}>
              <Descriptions.Item label={t("payroll.leave.earned")}>
                {t("payroll.leave.earnedText", {
                  accrued: days(data.balance.accruedDays),
                  used: days(data.balance.usedDays),
                  months: data.balance.serviceMonths,
                })}
                {data.balance.excludedDays > 0 && (
                  <div className="text-xs text-secondary-text">
                    {t("payroll.leave.excludedText", { count: data.balance.excludedDays })}
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.balance")}>{days(data.balance.balanceDays)}</Descriptions.Item>
              <Descriptions.Item label={t(data.recovery ? "payroll.leave.advanceDays" : "payroll.leave.unusedDays")}>
                {Math.abs(data.days)}
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.paidDays")}>{data.paidDays}</Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.dailyAverage")}>{money(data.dailyAverage)}</Descriptions.Item>
              <Descriptions.Item label={t(data.recovery ? "payroll.leave.recoveryAmount" : "payroll.leave.compensationAmount")}>
                <b className={data.amount < 0 ? "text-red-600" : ""}>{money(data.amount)}</b>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions size="small" bordered column={2} title={t("payroll.leave.severance")}>
              <Descriptions.Item label={t("payroll.leave.dismissalGround")} span={2}>
                {data.dismissalGround
                  ? `${t(`hr.dismissalGrounds.${data.dismissalGround}`)} (MK ${data.dismissalArticle})`
                  : "—"}
                <span className={`ml-2 text-xs ${data.severanceByLaw ? "text-primary" : "text-secondary-text"}`}>
                  {t(data.severanceByLaw ? "payroll.leave.severanceByLaw" : "payroll.leave.severanceNotByLaw")}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.paySeverance")}>
                <Checkbox
                  checked={data.paySeverance}
                  onChange={(event) => setPaySeverance(event.target.checked)}
                />
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.serviceYears")}>{days(data.serviceYears)}</Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.severancePercent")}>
                <InputNumber
                  size="small"
                  min={0}
                  max={1000}
                  disabled={!data.paySeverance}
                  value={percentInput ?? data.severancePercent}
                  onChange={(value) => setPercentInput(value === null ? null : Number(value))}
                  onBlur={() => setSeverancePercent(percentInput)}
                  onPressEnter={() => setSeverancePercent(percentInput)}
                  addonAfter="%"
                  style={{ width: 130 }}
                />
                <div className="text-xs text-secondary-text">
                  {t("payroll.leave.severanceMin", { percent: data.severanceMinPercent })}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.monthlyAverage")}>
                {data.paySeverance ? money(data.monthlyAverage) : "—"}
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.severanceAmount")}>
                <b>{money(data.severanceAmount)}</b>
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.settlementTotal")}>
                <b className={data.total < 0 ? "text-red-600" : "text-primary"}>{money(data.total)}</b>
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.fields.period")} span={2}>
                {data.periodName ?? "—"}
              </Descriptions.Item>
            </Descriptions>
            <div className="text-xs text-secondary-text">{t("payroll.leave.severanceTaxHint")}</div>
            {data.average && <LeaveAverageTable average={data.average} />}
          </div>
        )}
      </Spin>
    </Modal>
  );
}
