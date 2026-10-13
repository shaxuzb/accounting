import { Alert, DatePicker, Descriptions, InputNumber, Modal, Spin } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import LeaveAverageTable from "./LeaveAverageTable";
import { days, leaveApi, money } from "./api";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId?: number | null;
}

/**
 * 1C «Отпуск»: the employee, the first day and the calendar days of the leave; the average
 * earnings, the paid days (Sundays and holidays not paid) and the amount are shown before the
 * document is made. It is posted and paid from the payroll document it becomes.
 */
export default function VacationCreateModal({ open, onClose, employeeId: initialEmployee }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState<number | null>(initialEmployee ?? null);
  const [start, setStart] = useState<Dayjs | null>(null);
  const [calendarDays, setCalendarDays] = useState<number | null>(21);
  const [docDate, setDocDate] = useState<Dayjs>(dayjs());

  const request =
    employeeId && start && calendarDays && calendarDays > 0
      ? {
          employeeId,
          leaveStart: start.format("YYYY-MM-DD"),
          calendarDays,
          docDate: docDate.format("YYYY-MM-DD"),
        }
      : null;

  const preview = useQuery({
    queryKey: ["payroll-vacation-preview", request],
    queryFn: () => leaveApi.previewVacation(request!),
    enabled: open && Boolean(request),
    retry: false,
  });
  const create = useMutation({ mutationFn: leaveApi.createVacation });

  const submit = async () => {
    if (!request) return;
    try {
      const id = await create.mutateAsync(request);
      toast.success(t("payroll.leave.vacationCreated"));
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
      title={t("payroll.leave.newVacation")}
      width={820}
      maskClosable={false}
      okText={t("payroll.leave.createVacation")}
      cancelText={t("common.cancel")}
      okButtonProps={{ disabled: !data || !data.periodId || data.amount <= 0 }}
      confirmLoading={create.isPending}
      onOk={() => void submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <PayrollEmployeeSelect
            standalone
            label="payroll.fields.employee"
            value={employeeId}
            onChange={setEmployeeId}
            required
            marginBottom="mb-0"
          />
        </div>
        <div>
          <div className="mb-1 text-sm">{t("payroll.leave.start")}</div>
          <DatePicker className="w-full" format="DD.MM.YYYY" value={start} onChange={setStart} />
        </div>
        <div>
          <div className="mb-1 text-sm">{t("payroll.leave.calendarDays")}</div>
          <InputNumber<number>
            className="w-full!"
            min={1}
            max={366}
            precision={0}
            value={calendarDays}
            onChange={(value) => setCalendarDays(value ?? null)}
          />
        </div>
        <div>
          <div className="mb-1 text-sm">{t("payroll.leave.docDate")}</div>
          <DatePicker
            className="w-full"
            format="DD.MM.YYYY"
            value={docDate}
            allowClear={false}
            onChange={(value) => value && setDocDate(value)}
          />
        </div>
      </div>

      <Spin spinning={preview.isFetching}>
        {preview.isError && (
          <Alert className="mt-3" type="error" showIcon message={(preview.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? t("error.title")} />
        )}
        {data && (
          <div className="mt-4 space-y-3">
            {data.warnings.map((warning) => (
              <Alert key={warning} type="warning" showIcon message={warning} />
            ))}
            <Descriptions size="small" bordered column={2}>
              <Descriptions.Item label={t("payroll.leave.period")}>
                {dayjs(data.leaveStart).format("DD.MM.YYYY")} — {dayjs(data.leaveEnd).format("DD.MM.YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.calendarDays")}>
                {data.calendarDays}
                {data.holidaysInside > 0 && (
                  <span className="ml-1 text-secondary-text">
                    ({t("payroll.leave.holidaysInside", { count: data.holidaysInside })})
                  </span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.paidDays")}>{data.paidDays}</Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.amount")}>
                <b>{money(data.amount)}</b>
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.balanceBefore")}>{days(data.balance.balanceDays)}</Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.balanceAfter")}>
                <span className={data.balanceAfter < 0 ? "text-red-600" : ""}>{days(data.balanceAfter)}</span>
              </Descriptions.Item>
              <Descriptions.Item label={t("payroll.fields.period")}>{data.periodName ?? "—"}</Descriptions.Item>
              <Descriptions.Item label={t("payroll.leave.earned")}>
                {t("payroll.leave.earnedText", {
                  accrued: days(data.balance.accruedDays),
                  used: days(data.balance.usedDays),
                  months: data.balance.serviceMonths,
                })}
              </Descriptions.Item>
            </Descriptions>
            <LeaveAverageTable average={data.average} />
          </div>
        )}
      </Spin>
    </Modal>
  );
}
