import { Button, Form, Input, InputNumber, Space } from "antd";
import Card from "@/components/ui/card/Card";
import type { LedgerQuery } from "../types/type";

interface Props {
  loading?: boolean;
  onSubmit: (values: LedgerQuery) => void;
}

export default function LedgerFilters({ loading = false, onSubmit }: Props) {
  return (
    <Card className="border border-border p-4">
      <Form<LedgerQuery>
        layout="vertical"
        initialValues={{
          accountId: null,
          periodId: null,
          dateFrom: "",
          dateTo: "",
          currencyId: null,
          counterpartyId: null,
          warehouseId: null,
          page: 1,
          pageSize: 50,
        }}
        onFinish={onSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Form.Item
            label="Account ID"
            name="accountId"
            rules={[{ required: true, message: "Account ID kiriting" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label="Period ID" name="periodId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label="Date from" name="dateFrom">
            <Input placeholder="2026-07-01T00:00:00" />
          </Form.Item>
          <Form.Item label="Date to" name="dateTo">
            <Input placeholder="2026-07-31T23:59:59" />
          </Form.Item>
          <Form.Item label="Currency ID" name="currencyId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label="Counterparty ID" name="counterpartyId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label="Warehouse ID" name="warehouseId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label="Page" name="page">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label="Page size" name="pageSize">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
        </div>

        <Space className="mt-2">
          <Button type="primary" htmlType="submit" loading={loading}>
            Hisoblash
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
