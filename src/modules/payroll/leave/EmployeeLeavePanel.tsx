import { Button, Descriptions, Spin } from "antd";
import { Plane } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SectionCard from "@/components/ui/card/SectionCard";
import { payrollDocumentPermissions } from "@/modules/payroll/constants/permissions";
import VacationCreateModal from "./VacationCreateModal";
import { days, useLeaveBalance } from "./api";

/** The employee's leave balance today (1C «Остатки отпусков») and a new vacation from here. */
export default function EmployeeLeavePanel({ employeeId, active }: { employeeId: number; active: boolean }) {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const { data, isLoading } = useLeaveBalance(employeeId);

  return (
    <SectionCard
      title="payroll.leave.balanceTitle"
      description="payroll.leave.balanceHint"
      extra={
        active ? (
          <PermissionCard permission={payrollDocumentPermissions.calculate}>
            <Button icon={<Plane className="size-4" />} onClick={() => setCreating(true)}>
              {t("payroll.leave.newVacation")}
            </Button>
          </PermissionCard>
        ) : undefined
      }
    >
      <Spin spinning={isLoading}>
        {data && (
          <Descriptions size="small" column={{ xs: 1, md: 3 }}>
            <Descriptions.Item label={t("payroll.leave.annualDays")}>{days(data.annualDays)}</Descriptions.Item>
            <Descriptions.Item label={t("payroll.leave.countedFrom")}>
              {data.countedFrom ? dayjs(data.countedFrom).format("DD.MM.YYYY") : "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("payroll.leave.serviceMonths")}>{data.serviceMonths}</Descriptions.Item>
            <Descriptions.Item label={t("payroll.leave.accrued")}>{days(data.accruedDays)}</Descriptions.Item>
            <Descriptions.Item label={t("payroll.leave.used")}>{days(data.usedDays)}</Descriptions.Item>
            {data.excludedDays > 0 && (
              <Descriptions.Item label={t("payroll.leave.excludedDays")}>{data.excludedDays}</Descriptions.Item>
            )}
            <Descriptions.Item label={t("payroll.leave.balance")}>
              <b className={data.balanceDays < 0 ? "text-red-600" : "text-primary"}>{days(data.balanceDays)}</b>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Spin>
      {creating && <VacationCreateModal open employeeId={employeeId} onClose={() => setCreating(false)} />}
    </SectionCard>
  );
}
