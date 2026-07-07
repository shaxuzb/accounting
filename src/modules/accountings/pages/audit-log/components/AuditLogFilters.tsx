import { Button, Form, Input, Space } from "antd";
import Card from "@/components/ui/card/Card";
import type { AuditLogQuery } from "../types/type";

interface Props {
  loading?: boolean;
  onSubmit: (values: AuditLogQuery) => void;
}

export default function AuditLogFilters({ loading = false, onSubmit }: Props) {
  return (
    <Card className="border border-border p-4">
      <Form<AuditLogQuery> layout="vertical" initialValues={{ recordId: "", tableName: "" }} onFinish={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item label="Record ID" name="recordId">
            <Input placeholder="Masalan: 12345" />
          </Form.Item>
          <Form.Item label="Table name" name="tableName">
            <Input placeholder="Masalan: sale_documents" />
          </Form.Item>
        </div>

        <Space className="mt-2">
          <Button type="primary" htmlType="submit" loading={loading}>
            Ko'rish
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
