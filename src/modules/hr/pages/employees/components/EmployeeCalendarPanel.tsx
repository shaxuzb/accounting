import { Calendar, Empty, Spin, Tag } from "antd";
import type { CalendarProps } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHrEmployeeCalendar } from "../hooks";
import type { HrCalendarStatusCode } from "../types/type";

interface Props {
  employeeId: string | number;
}

const statusColors: Record<HrCalendarStatusCode, string> = {
  WORKED: "green",
  PLANNED_WORK: "blue",
  DAY_OFF: "default",
  ANNUAL_LEAVE: "cyan",
  SICK_LEAVE: "red",
  UNPAID_LEAVE: "gold",
  UNEXCUSED_ABSENCE: "volcano",
  MATERNITY_LEAVE: "purple",
  STUDY_LEAVE: "geekblue",
  CHILD_CARE_LEAVE: "magenta",
};

export default function EmployeeCalendarPanel({ employeeId }: Props) {
  const { t } = useTranslation();
  const [month, setMonth] = useState(() => dayjs());
  const dateFrom = month.startOf("month").format("YYYY-MM-DD");
  const dateTo = month.endOf("month").format("YYYY-MM-DD");
  const { data = [], isLoading } = useHrEmployeeCalendar(
    employeeId,
    dateFrom,
    dateTo,
  );

  const daysByDate = useMemo(
    () => new Map(data.map((item) => [item.date.slice(0, 10), item])),
    [data],
  );

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (date, info) => {
    if (info.type !== "date") return info.originNode;
    const item = daysByDate.get(date.format("YYYY-MM-DD"));
    if (!item) return info.originNode;
    // leave and sick lists run in calendar days: a day off inside one shows it, faded
    if (item.statusCode === "DAY_OFF" && item.coveringAbsenceCode) {
      return (
        <div className="mt-1 opacity-60">
          <Tag
            color={statusColors[item.coveringAbsenceCode] ?? "default"}
            className="m-0! max-w-full truncate text-[10px]!"
          >
            {t(`hr.calendar.status.${item.coveringAbsenceCode}`)}
          </Tag>
        </div>
      );
    }
    return (
      <div className="mt-1">
        <Tag
          color={statusColors[item.statusCode]}
          className="m-0! max-w-full truncate text-[10px]!"
        >
          {t(`hr.calendar.status.${item.statusCode}`)}
          {item.workHours != null ? ` · ${item.workHours}h` : ""}
        </Tag>
      </div>
    );
  };

  return (
    <Spin spinning={isLoading}>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(statusColors) as HrCalendarStatusCode[]).map((status) => (
          <Tag key={status} color={statusColors[status]} className="m-0!">
            {t(`hr.calendar.status.${status}`)}
          </Tag>
        ))}
      </div>
      {!isLoading && data.length === 0 ? (
        <Empty description={t("hr.calendar.empty")} />
      ) : (
        <Calendar
          value={month}
          fullscreen={false}
          onPanelChange={(value) => setMonth(value)}
          cellRender={cellRender}
        />
      )}
    </Spin>
  );
}
