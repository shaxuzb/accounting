import { Button, Form, Input, Space } from "antd";
import Card from "@/components/ui/card/Card";
import type { AuditLogQuery } from "../types/type";
import { useTranslation } from "react-i18next";

interface Props {
  loading?: boolean;
  onSubmit: (values: AuditLogQuery) => void;
}

export default function AuditLogFilters({ loading = false, onSubmit }: Props) {
  const { t } = useTranslation();
  return (
    <Card className="border border-border p-4">
      <Form<AuditLogQuery> layout="vertical" initialValues={{ recordId: "", tableName: "" }} onFinish={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item label={t("accountings.fields.recordId")} name="recordId">
            <Input placeholder={t("accountings.placeholders.recordId")} />
          </Form.Item>
          <Form.Item label={t("accountings.fields.tableName")} name="tableName">
            <Input placeholder={t("accountings.placeholders.tableName")} />
          </Form.Item>
        </div>

        <Space className="mt-2">
          <Button type="primary" htmlType="submit" loading={loading}>
            {t("common.view")}
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
