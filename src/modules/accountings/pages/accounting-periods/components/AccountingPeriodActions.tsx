import { Button, Form, InputNumber, Space } from "antd";
import Card from "@/components/ui/card/Card";
import type { AccountingPeriodActionQuery } from "../types/type";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [form] = Form.useForm<AccountingPeriodActionQuery>();

  return (
    <Card className="border border-border p-4">
      <Form<AccountingPeriodActionQuery>
        form={form}
        layout="vertical"
        initialValues={{ periodId: null }}
      >
        <Form.Item
          label={t("accountings.fields.periodId")}
          name="periodId"
          rules={[{ required: true, message: t("accountings.validation.periodIdRequired") }]}
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
            {t("accountings.actions.closePeriod")}
          </Button>
          <Button
            loading={loading}
            onClick={async () => {
              const values = await form.validateFields();
              onReopen(values);
            }}
          >
            {t("accountings.actions.reopenPeriod")}
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
