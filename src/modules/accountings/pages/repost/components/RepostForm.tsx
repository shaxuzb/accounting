import { Button, DatePicker, Form, InputNumber, Select, Space } from "antd";
import type { Dayjs } from "dayjs";
import Card from "@/components/ui/card/Card";
import type { RepostFilter } from "../types/type";
import { documentTypes } from "../constants/documentTypes";
import { useTranslation } from "react-i18next";

interface Props {
  loading?: boolean;
  onSubmit: (values: RepostFilter) => void;
}

interface RepostFormValues {
  range?: [Dayjs, Dayjs] | null;
  documentType?: number | null;
  documentId?: number | null;
}


/** 1C «Перепроведение документов»: a date range, optionally one kind or one document. */
export default function RepostForm({ loading = false, onSubmit }: Props) {
  const { t } = useTranslation();
  return (
    <Card className="border border-border p-4">
      <Form<RepostFormValues>
        layout="vertical"
        initialValues={{ range: null, documentType: null, documentId: null }}
        onFinish={(values) =>
          onSubmit({
            periodId: null,
            dateFrom: values.range ? values.range[0].format("YYYY-MM-DDT00:00:00") : null,
            dateTo: values.range ? values.range[1].format("YYYY-MM-DDT23:59:59") : null,
            documentType: values.documentType ?? null,
            documentId: values.documentId ?? null,
          })
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Form.Item label={t("repost.period")} name="range">
            <DatePicker.RangePicker className="w-full" format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item label={t("accountings.fields.documentType")} name="documentType">
            <Select
              allowClear
              placeholder={t("repost.allTypes")}
              options={documentTypes.map((type) => ({ value: type.id, label: t(type.key) }))}
            />
          </Form.Item>
          <Form.Item label={t("accountings.fields.documentId")} name="documentId">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
        </div>

        <Space className="mt-2">
          <Button type="primary" htmlType="submit" loading={loading}>
            {t("accountings.actions.repost")}
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
