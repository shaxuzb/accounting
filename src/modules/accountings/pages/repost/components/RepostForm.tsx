import { Button, Form, Input, InputNumber, Space } from "antd";
import Card from "@/components/ui/card/Card";
import type { RepostFilter } from "../types/type";

interface Props {
  loading?: boolean;
  onSubmit: (values: RepostFilter) => void;
}

export default function RepostForm({ loading = false, onSubmit }: Props) {
  return (
    <Card className="border border-border p-4">
      <Form<RepostFilter>
        layout="vertical"
        initialValues={{
          periodId: null,
          dateFrom: "",
          dateTo: "",
          documentType: null,
          documentId: null,
        }}
        onFinish={onSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Form.Item label="Period ID" name="periodId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label="Date from" name="dateFrom">
            <Input placeholder="2026-07-01T00:00:00" />
          </Form.Item>
          <Form.Item label="Date to" name="dateTo">
            <Input placeholder="2026-07-31T23:59:59" />
          </Form.Item>
          <Form.Item label="Document type" name="documentType">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label="Document ID" name="documentId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
        </div>

        <Space className="mt-2">
          <Button type="primary" htmlType="submit" loading={loading}>
            Repost qilish
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
