import { Button, Form, InputNumber, Space } from "antd";
import Card from "@/components/ui/card/Card";
import type { AccountingPeriodActionQuery } from "../types/type";

interface Props {
  loading?: boolean;
  onClose: (values: AccountingPeriodActionQuery) => void;
  onReopen: (values: AccountingPeriodActionQuery) => void;
}

export default function AccountingPeriodActions({
  loading = false,
  onClose,
  onReopen,
}: Props) {
  const [form] = Form.useForm<AccountingPeriodActionQuery>();

  return (
    <Card className="border border-border p-4">
      <Form<AccountingPeriodActionQuery>
        form={form}
        layout="vertical"
        initialValues={{ periodId: null }}
      >
        <Form.Item
          label="Period ID"
          name="periodId"
          rules={[{ required: true, message: "Period ID kiriting" }]}
        >
          <InputNumber className="w-full" min={1} />
        </Form.Item>

        <Space wrap>
          <Button
            type="primary"
            loading={loading}
            onClick={async () => {
              const values = await form.validateFields();
              onClose(values);
            }}
          >
            Close
          </Button>
          <Button
            loading={loading}
            onClick={async () => {
              const values = await form.validateFields();
              onReopen(values);
            }}
          >
            Reopen
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
