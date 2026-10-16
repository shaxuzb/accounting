import { Button, DatePicker, Form, Input, Select, Space } from "antd";
import type { Dayjs } from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useGetAuditLogTables } from "../hooks";
import type { AuditLogQuery } from "../types/type";
import { auditTableLabel } from "../utils/auditLabels";

interface Props {
  loading?: boolean;
  onSubmit: (values: AuditLogQuery) => void;
}

interface FilterValues {
  range?: [Dayjs, Dayjs] | null;
  changedUserId?: number | null;
  tableName?: string | null;
  action?: string | null;
  recordId?: string | null;
  search?: string | null;
}

interface UserOption {
  id: number;
  name?: string | null;
  fullName?: string | null;
  login?: string | null;
}

/** 1C «Журнал регистрации»: the period, the user, the object kind, the action. */
export default function AuditLogFilters({ loading = false, onSubmit }: Props) {
  const { t } = useTranslation();
  const { data: tables = [] } = useGetAuditLogTables();
  const { data: users = [] } = useQuery({
    queryKey: ["audit-log", "users"],
    queryFn: async () => (await $axiosPrivate.get<UserOption[]>(selectListEndpoints.usersSelectList)).data,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="border border-border p-4">
      <Form<FilterValues>
        layout="vertical"
        onFinish={(values) =>
          onSubmit({
            fromDate: values.range ? values.range[0].format("YYYY-MM-DDT00:00:00") : null,
            toDate: values.range ? values.range[1].format("YYYY-MM-DDT23:59:59") : null,
            changedUserId: values.changedUserId ?? null,
            tableName: values.tableName ?? null,
            action: values.action ?? null,
            recordId: values.recordId?.trim() || null,
            search: values.search?.trim() || null,
          })
        }
      >
        <div className="grid gap-x-4 md:grid-cols-3 xl:grid-cols-6">
          <Form.Item label={t("accountings.audit.period")} name="range" className="xl:col-span-2">
            <DatePicker.RangePicker className="w-full" format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item label={t("accountings.audit.user")} name="changedUserId">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={t("accountings.audit.allUsers")}
              options={users.map((user) => ({
                value: user.id,
                label: user.fullName || user.name || user.login || String(user.id),
              }))}
            />
          </Form.Item>
          <Form.Item label={t("accountings.audit.object")} name="tableName">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={t("accountings.audit.allObjects")}
              options={tables.map((table) => ({ value: table, label: auditTableLabel(t, table) }))}
            />
          </Form.Item>
          <Form.Item label={t("accountings.audit.action")} name="action">
            <Select
              allowClear
              placeholder={t("accountings.audit.allActions")}
              options={["INSERT", "UPDATE", "DELETE"].map((action) => ({
                value: action,
                label: t(`accountings.audit.actions.${action}`),
              }))}
            />
          </Form.Item>
          <Form.Item label={t("accountings.audit.recordId")} name="recordId">
            <Input allowClear />
          </Form.Item>
          <Form.Item label={t("accountings.audit.search")} name="search" className="md:col-span-2">
            <Input allowClear placeholder={t("accountings.audit.searchPlaceholder")} />
          </Form.Item>
        </div>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t("common.view")}
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
