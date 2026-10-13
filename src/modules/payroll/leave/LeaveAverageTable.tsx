import { Table, Tag } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { days, money, type AverageEarnings, type AverageMonth } from "./api";

/** How the average daily earnings were found (Labour Code art. 257): the months, their earnings and days. */
export default function LeaveAverageTable({ average }: { average: AverageEarnings }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-secondary-text">{t("payroll.leave.averagePeriod")}:</span>
        <b>
          {dayjs(average.from).format("DD.MM.YYYY")} — {dayjs(average.to).format("DD.MM.YYYY")}
        </b>
        {average.basis !== "HISTORY" && (
          <Tag color="orange">{t(`payroll.leave.basis.${average.basis}`)}</Tag>
        )}
      </div>
      <Table<AverageMonth>
        size="small"
        rowKey={(row) => `${row.year}-${row.month}`}
        pagination={false}
        dataSource={average.months}
        locale={{ emptyText: t("payroll.leave.noMonths") }}
        columns={[
          {
            key: "month",
            title: t("payroll.leave.month"),
            render: (_: unknown, row) => `${String(row.month).padStart(2, "0")}.${row.year}`,
          },
          { dataIndex: "earnings", title: t("payroll.leave.earnings"), align: "right", render: (v: number) => money(v) },
          { dataIndex: "workedDays", title: t("payroll.leave.workedDays"), align: "right", render: (v: number) => days(v) },
          { dataIndex: "normDays", title: t("payroll.leave.normDays"), align: "right", render: (v: number) => days(v) },
          { dataIndex: "days", title: t("payroll.leave.countedDays"), align: "right", render: (v: number) => days(v) },
        ]}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <b>{t("payroll.leave.total")}</b>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <b>{money(average.earnings)}</b>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} />
            <Table.Summary.Cell index={3} />
            <Table.Summary.Cell index={4} align="right">
              <b>{days(average.days)}</b>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div className="text-sm">
        {t("payroll.leave.dailyAverage")}: <b>{money(average.dailyAverage)}</b>
        <span className="ml-2 text-secondary-text">{t("payroll.leave.dailyFormula")}</span>
      </div>
    </div>
  );
}
