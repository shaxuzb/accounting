import { Button, DatePicker, Form, Select, Space } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import type { RepostFilter } from "../types/type";
import { documentTypes } from "../constants/documentTypes";
import { repostEndpoints } from "../constants/endpoints";
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

interface RepostDocumentOption {
  documentType: number;
  documentId: number;
  number?: string | null;
  docDate: string;
}

/** 1C «Перепроведение документов»: a date range, optionally one kind or one document. */
export default function RepostForm({ loading = false, onSubmit }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm<RepostFormValues>();
  const documentType = Form.useWatch("documentType", form);
  const [search, setSearch] = useState("");

  // the documents of the kind chosen, by their own number and date (not an id to type in)
  const { data: documents = [], isFetching } = useQuery({
    queryKey: ["repost-documents", documentType, search],
    queryFn: async () =>
      (
        await $axiosPrivate.get<RepostDocumentOption[]>(repostEndpoints.documents, {
          params: { documentType, search: search || undefined },
        })
      ).data,
    enabled: Boolean(documentType),
  });

  return (
    <Card className="border border-border p-4">
      <Form<RepostFormValues>
        form={form}
        layout="vertical"
        initialValues={{ range: null, documentType: null, documentId: null }}
        onValuesChange={(changed) => {
          if ("documentType" in changed) {
            form.setFieldValue("documentId", null);
            setSearch("");
          }
        }}
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
              showSearch
              optionFilterProp="label"
              placeholder={t("repost.allTypes")}
              options={documentTypes.map((type) => ({ value: type.id, label: t(type.key) }))}
            />
          </Form.Item>
          <Form.Item label={t("repost.document")} name="documentId">
            <Select
              allowClear
              showSearch
              filterOption={false}
              disabled={!documentType}
              loading={isFetching}
              placeholder={t(documentType ? "repost.documentPlaceholder" : "repost.chooseTypeFirst")}
              onSearch={setSearch}
              notFoundContent={documentType ? t("repost.noDocuments") : null}
              options={documents.map((document) => ({
                value: document.documentId,
                label: `№${document.number ?? document.documentId} · ${dayjs(document.docDate).format("DD.MM.YYYY")}`,
              }))}
            />
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
