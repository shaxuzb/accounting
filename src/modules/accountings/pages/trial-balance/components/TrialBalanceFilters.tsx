import { Button, Checkbox, Form, Input, InputNumber, Space } from "antd";
import Card from "@/components/ui/card/Card";
import type { TrialBalanceQuery } from "../types/type";
import { useTranslation } from "react-i18next";

interface Props {
  loading?: boolean;
  onSubmit: (values: TrialBalanceQuery) => void;
}

export default function TrialBalanceFilters({
  loading = false,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  return (
    <Card className="border border-border p-4">
      <Form<TrialBalanceQuery>
        layout="vertical"
        initialValues={{
          periodId: null,
          dateFrom: "",
          dateTo: "",
          currencyId: null,
          includeZeroBalance: false,
        }}
        onFinish={onSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Form.Item label={t("accountings.fields.periodId")} name="periodId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item label={t("accountings.fields.dateFrom")} name="dateFrom">
            <Input placeholder="2026-07-01T00:00:00" />
          </Form.Item>
          <Form.Item label={t("accountings.fields.dateTo")} name="dateTo">
            <Input placeholder="2026-07-31T23:59:59" />
          </Form.Item>
          <Form.Item label={t("accountings.fields.currencyId")} name="currencyId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item name="includeZeroBalance" valuePropName="checked">
            <Checkbox>{t("accountings.fields.includeZeroBalance")}</Checkbox>
          </Form.Item>
        </div>

        <Space className="mt-2">
          <Button type="primary" htmlType="submit" loading={loading}>
            {t("accountings.actions.calculate")}
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
