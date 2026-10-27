import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, DatePicker, Drawer, Table, Tabs, Tag, type TableColumnsType } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import { onPresenceChange } from "@/services/presence";
import { formatAuditValue, formatMinutes } from "@/shared/audit/auditLabels";
import AuditJournal from "./AuditJournal";

interface UserActivity {
  userId: number;
  userName: string;
  fullName: string | null;
  roleName: string | null;
  isBlocked: boolean;
  isOnline: boolean;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
  sessions: number;
  workedMinutes: number;
  failedLogins: number;
  actions: number;
}

interface UserSession {
  id: number;
  startedAt: string;
  lastSeenAt: string;
  endedAt: string | null;
  endReason: string | null;
  minutes: number;
  isAdminPanel: boolean;
  ipAddress: string | null;
  userAgent: string | null;
}

interface LoginAttempt {
  id: number;
  createdDate: string;
  success: boolean;
  failureReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

interface Paged<T> {
  items: T[];
  totalCount: number;
}

type Range = [Dayjs, Dayjs];
const periodParams = (range: Range) => ({
  dateFrom: range[0].format("YYYY-MM-DD"),
  dateTo: range[1].format("YYYY-MM-DD"),
});

/** A browser and system from the user agent, short: «Chrome · Windows». */
const shortAgent = (agent: string | null) => {
  if (!agent) return "—";
  const browser = /Edg\//.test(agent) ? "Edge" : /OPR\//.test(agent) ? "Opera" : /Chrome\//.test(agent)
    ? "Chrome" : /Firefox\//.test(agent) ? "Firefox" : /Safari\//.test(agent) ? "Safari" : "";
  const system = /Windows/.test(agent) ? "Windows" : /Android/.test(agent) ? "Android"
    : /iPhone|iPad/.test(agent) ? "iOS" : /Mac OS/.test(agent) ? "macOS" : /Linux/.test(agent) ? "Linux" : "";
  return [browser, system].filter(Boolean).join(" · ") || agent.slice(0, 40);
};

function UserSessions({ userId, range }: { userId: number; range: Range }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ["user-activity-sessions", userId, periodParams(range), page],
    queryFn: () =>
      $axiosPrivate
        .get<Paged<UserSession>>(`/user-activity/${userId}/sessions`, { params: { ...periodParams(range), page } })
        .then((r) => r.data),
  });

  const columns: TableColumnsType<UserSession> = [
    { title: t("activity.sessions.started"), dataIndex: "startedAt", render: formatAuditValue },
    {
      title: t("activity.sessions.ended"),
      render: (_, row) =>
        row.endedAt ? formatAuditValue(row.endedAt) : <Tag color="green">{t("activity.sessions.open")}</Tag>,
    },
    { title: t("activity.sessions.duration"), dataIndex: "minutes", render: (m: number) => formatMinutes(t, m) },
    {
      title: t("activity.sessions.reason"),
      dataIndex: "endReason",
      render: (reason: string | null) => (reason ? t(`activity.endReasons.${reason}`) : "—"),
    },
    { title: "IP", dataIndex: "ipAddress" },
    { title: t("activity.sessions.device"), dataIndex: "userAgent", render: shortAgent },
  ];

  return (
    <Table
      rowKey="id"
      size="small"
      loading={isFetching}
      columns={columns}
      dataSource={data?.items ?? []}
      pagination={{ current: page, pageSize: 50, total: data?.totalCount ?? 0, onChange: setPage }}
    />
  );
}

function UserLogins({ userId, range }: { userId: number; range: Range }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ["user-activity-logins", userId, periodParams(range), page],
    queryFn: () =>
      $axiosPrivate
        .get<Paged<LoginAttempt>>(`/user-activity/${userId}/logins`, { params: { ...periodParams(range), page } })
        .then((r) => r.data),
  });

  const columns: TableColumnsType<LoginAttempt> = [
    { title: t("audit.journal.time"), dataIndex: "createdDate", render: formatAuditValue },
    {
      title: t("audit.journal.result"),
      render: (_, row) =>
        row.success ? (
          <Tag color="green">{t("activity.logins.success")}</Tag>
        ) : (
          <Tag color="red">{t(`activity.failureReasons.${row.failureReason}`, { defaultValue: row.failureReason ?? "" })}</Tag>
        ),
    },
    { title: "IP", dataIndex: "ipAddress" },
    { title: t("activity.sessions.device"), dataIndex: "userAgent", render: shortAgent },
  ];

  return (
    <Table
      rowKey="id"
      size="small"
      loading={isFetching}
      columns={columns}
      dataSource={data?.items ?? []}
      pagination={{ current: page, pageSize: 50, total: data?.totalCount ?? 0, onChange: setPage }}
    />
  );
}

/**
 * The organization's users (of the system, not the employees): online now, when they signed in
 * and out, how long they worked, wrong passwords and what they did, for the chosen period.
 */
export default function UserActivityPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [range, setRange] = useState<Range>([dayjs().startOf("day"), dayjs().startOf("day")]);
  const [selected, setSelected] = useState<UserActivity | null>(null);

  const queryKey = ["user-activity", periodParams(range)];
  const { data = [], isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      $axiosPrivate.get<UserActivity[]>("/user-activity", { params: periodParams(range) }).then((r) => r.data),
  });

  // the server tells when someone comes online or goes offline
  useEffect(
    () =>
      onPresenceChange(({ userId, online }) => {
        queryClient.setQueriesData<UserActivity[]>({ queryKey: ["user-activity"] }, (users) =>
          users?.map((user) => (user.userId === userId ? { ...user, isOnline: online } : user)),
        );
      }),
    [queryClient],
  );

  const columns: TableColumnsType<UserActivity> = [
    {
      title: t("activity.user"),
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Badge status={row.isOnline ? "success" : "default"} />
          <div>
            <div className="font-medium">{row.fullName ?? row.userName}</div>
            <div className="text-xs text-secondary-text">
              {row.userName}
              {row.roleName ? ` · ${row.roleName}` : ""}
            </div>
          </div>
          {row.isBlocked && <Tag color="red">{t("activity.blocked")}</Tag>}
        </div>
      ),
    },
    {
      title: t("activity.status"),
      align: "center",
      width: 110,
      render: (_, row) =>
        row.isOnline ? <Tag color="green">{t("activity.online")}</Tag> : <Tag>{t("activity.offline")}</Tag>,
    },
    { title: t("activity.lastLogin"), dataIndex: "lastLoginAt", width: 150, render: formatAuditValue },
    { title: t("activity.lastSeen"), dataIndex: "lastSeenAt", width: 150, render: formatAuditValue },
    { title: t("activity.worked"), dataIndex: "workedMinutes", width: 110, align: "right", render: (m: number) => formatMinutes(t, m) },
    { title: t("activity.sessionsCount"), dataIndex: "sessions", width: 90, align: "right" },
    { title: t("activity.actionsCount"), dataIndex: "actions", width: 100, align: "right" },
    {
      title: t("activity.failedLogins"),
      dataIndex: "failedLogins",
      width: 110,
      align: "right",
      render: (count: number) => (count ? <span className="text-red-500">{count}</span> : 0),
    },
  ];

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <DatePicker.RangePicker
          value={range}
          format="DD.MM.YYYY"
          allowClear={false}
          onChange={(value) => value?.[0] && value[1] && setRange([value[0], value[1]])}
        />
        <Button icon={<RefreshCw className="size-4" />} onClick={() => void refetch()} />
        <span className="text-xs text-secondary-text">{t("activity.hint")}</span>
      </div>
      <Table
        rowKey="userId"
        size="small"
        loading={isFetching}
        columns={columns}
        dataSource={data}
        pagination={false}
        onRow={(row) => ({ onClick: () => setSelected(row), className: "cursor-pointer" })}
        scroll={{ x: 1000 }}
      />
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width="min(1100px, 96vw)"
        destroyOnHidden
        title={
          selected && (
            <div className="flex items-center gap-2">
              <Badge status={selected.isOnline ? "success" : "default"} />
              {selected.fullName ?? selected.userName}
            </div>
          )
        }
      >
        {selected && (
          <Tabs
            items={[
              { key: "sessions", label: t("activity.tabs.sessions"), children: <UserSessions userId={selected.userId} range={range} /> },
              { key: "logins", label: t("activity.tabs.logins"), children: <UserLogins userId={selected.userId} range={range} /> },
              { key: "actions", label: t("activity.tabs.actions"), children: <AuditJournal userId={selected.userId} /> },
            ]}
          />
        )}
      </Drawer>
    </Card>
  );
}
