import { useQuery } from "@tanstack/react-query";
import { Drawer, Empty, Spin, Tag, Timeline } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { $axiosPrivate } from "@/services/AxiosService";
import { changeActionLabel, endpointLabel, formatAuditValue, tableLabel } from "@/shared/audit/auditLabels";
import ChangeDiff from "./ChangeDiff";
import { closeRecordHistory, useRecordHistoryTarget } from "./recordHistory";

export interface AuditChange {
  id: number;
  createdAt: string;
  requestId: string | null;
  userId: number | null;
  userName: string | null;
  tableName: string;
  recordId: string;
  rootTable: string;
  rootId: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  changes: string;
  endpoint: string | null;
  labels: Record<string, string>;
}

const actionColor = { INSERT: "green", UPDATE: "blue", DELETE: "red" } as const;

/**
 * Who entered a record and who changed what, oldest first: each request is one step — its user,
 * time and action — with the rows it changed (the document and its lines).
 */
export default function RecordHistoryDrawer() {
  const { t } = useTranslation();
  const target = useRecordHistoryTarget();

  const { data = [], isLoading } = useQuery({
    queryKey: ["record-history", target?.table, target?.resource, target?.id],
    queryFn: () =>
      $axiosPrivate
        .get<AuditChange[]>("/audit/history", {
          params: { table: target?.table, resource: target?.resource, id: String(target?.id) },
        })
        .then((response) => response.data),
    enabled: Boolean(target),
  });

  const steps = useMemo(() => {
    const groups = new Map<string, AuditChange[]>();
    for (const change of data) {
      const key = change.requestId ?? `row-${change.id}`;
      groups.set(key, [...(groups.get(key) ?? []), change]);
    }
    return [...groups.values()];
  }, [data]);

  const created = data.find((change) => change.action === "INSERT" && change.tableName === change.rootTable);
  const lastChange = [...data].reverse().find((change) => change.action !== "INSERT");

  return (
    <Drawer
      open={Boolean(target)}
      onClose={closeRecordHistory}
      width={640}
      title={
        <div>
          <div>{t("audit.history.title")}</div>
          {target?.title && <div className="text-xs font-normal text-secondary-text">{target.title}</div>}
        </div>
      }
      destroyOnHidden
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : !data.length ? (
        <Empty description={t("audit.history.empty")} />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-secondary-text">{t("audit.history.createdBy")}</div>
              <div className="font-medium">{created?.userName ?? "—"}</div>
              <div className="text-xs text-secondary-text">{created ? formatAuditValue(created.createdAt) : ""}</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-secondary-text">{t("audit.history.changedBy")}</div>
              <div className="font-medium">{lastChange?.userName ?? "—"}</div>
              <div className="text-xs text-secondary-text">{lastChange ? formatAuditValue(lastChange.createdAt) : ""}</div>
            </div>
          </div>
          <Timeline
            items={steps.map((step) => ({
              key: step[0].requestId ?? step[0].id,
              children: (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">{step[0].userName ?? t("audit.system")}</span>
                    <span className="mx-1.5 text-secondary-text">·</span>
                    <span className="text-secondary-text">{formatAuditValue(step[0].createdAt)}</span>
                  </div>
                  {step[0].endpoint && (
                    <div className="text-xs text-secondary-text">{endpointLabel(t, step[0].endpoint)}</div>
                  )}
                  {step.map((change) => {
                    const changes = JSON.parse(change.changes) as Record<string, unknown[]>;
                    return (
                      <div key={change.id} className="rounded-md border border-border p-2">
                        <div className="mb-1.5 flex items-center gap-2 text-xs">
                          <Tag color={actionColor[change.action]} className="m-0!">
                            {changeActionLabel(t, change.action, changes)}
                          </Tag>
                          <span>{tableLabel(t, change.tableName)}</span>
                          {change.tableName !== change.rootTable && (
                            <span className="text-secondary-text">#{change.recordId}</span>
                          )}
                        </div>
                        <ChangeDiff
                          action={change.action}
                          changes={changes}
                          labels={change.labels}
                          parentId={change.tableName !== change.rootTable ? change.rootId : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              ),
            }))}
          />
        </>
      )}
    </Drawer>
  );
}
