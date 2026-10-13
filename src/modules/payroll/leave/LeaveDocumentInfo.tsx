import { Descriptions, Tag } from "antd";
import { useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import type { PayrollDocument } from "@/modules/payroll/pages/documents/types/type";
import LeaveAverageTable from "./LeaveAverageTable";
import { days, money, type AverageEarnings, type LeaveBalance } from "./api";

interface LeaveDetails {
  average?: AverageEarnings | null;
  balance?: LeaveBalance | null;
  holidays?: number;
  recovery?: boolean;
}

/** The leave of a vacation or a dismissal settlement document: its days, the average and how it was found. */
export default function LeaveDocumentInfo({ record }: { record: PayrollDocument }) {
  const { t } = useTranslation();
  const details = useMemo<LeaveDetails>(() => {
    try {
      return record.leaveDetails ? (JSON.parse(record.leaveDetails) as LeaveDetails) : {};
    } catch {
      return {};
    }
  }, [record.leaveDetails]);
  const vacation = record.documentKind === "VACATION";
  const recovery = !vacation && Number(record.leaveCalendarDays ?? 0) < 0;

  return (
    <Card className="space-y-3 border border-border p-4">
      <div className="flex flex-wrap items-center gap-2 font-semibold">
        {t(vacation ? "payroll.leave.vacationInfo" : "payroll.leave.settlementInfo")}
        {!vacation && record.settlementNoRecovery && <Tag color="blue">{t("payroll.leave.noRecovery")}</Tag>}
      </div>
      <Descriptions size="small" bordered column={{ xs: 1, md: 2 }}>
        <Descriptions.Item label={t("payroll.fields.employee")}>
          {record.employeeId ? (
            <Link to={`/main/hr/employees/${record.employeeId}`}>{record.employeeName}</Link>
          ) : (
            record.employeeName
          )}
        </Descriptions.Item>
        {vacation ? (
          <>
            <Descriptions.Item label={t("payroll.leave.period")}>
              {dayjs(record.leaveStart).format("DD.MM.YYYY")} — {dayjs(record.leaveEnd).format("DD.MM.YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label={t("payroll.leave.calendarDays")}>
              {days(record.leaveCalendarDays)}
              {Boolean(details.holidays) && (
                <span className="ml-1 text-secondary-text">
                  ({t("payroll.leave.holidaysInside", { count: details.holidays })})
                </span>
              )}
            </Descriptions.Item>
          </>
        ) : (
          <Descriptions.Item label={t(recovery ? "payroll.leave.advanceDays" : "payroll.leave.unusedDays")}>
            {days(Math.abs(Number(record.leaveCalendarDays ?? 0)))}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t("payroll.leave.paidDays")}>{days(Math.abs(Number(record.leavePaidDays ?? 0)))}</Descriptions.Item>
        <Descriptions.Item label={t("payroll.leave.dailyAverage")}>{money(record.averageDaily)}</Descriptions.Item>
        {details.balance && (
          <Descriptions.Item label={t("payroll.leave.earned")}>
            {t("payroll.leave.earnedText", {
              accrued: days(details.balance.accruedDays),
              used: days(details.balance.usedDays),
              months: details.balance.serviceMonths,
            })}
          </Descriptions.Item>
        )}
      </Descriptions>
      {details.average && <LeaveAverageTable average={details.average} />}
      {vacation && <div className="text-xs text-secondary-text">{t("payroll.leave.vacationPostHint")}</div>}
    </Card>
  );
}
