import { Alert, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useRepostAccounting } from "../hooks";
import RepostForm from "../components/RepostForm";
import { documentTypes } from "../constants/documentTypes";
import type { RepostDocument, RepostFilter } from "../types/type";

/**
 * 1C «Перепроведение документов»: the posted documents of a range are posted again in date
 * order with the current rules and account settings; their status and stock stay as they are.
 */
export default function RepostPage() {
  const { t } = useTranslation();
  const mutation = useRepostAccounting();

  const handleSubmit = async (values: RepostFilter) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const typeName = (id: number) => {
    const type = documentTypes.find((item) => item.id === id);
    return type ? t(type.key) : `#${id}`;
  };

  const columns: TableColumnsType<RepostDocument> = [
    {
      dataIndex: "postingDate",
      title: t("repost.date"),
      width: 170,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    { dataIndex: "documentType", title: t("accountings.fields.documentType"), render: (value: number) => typeName(value) },
    { dataIndex: "documentId", title: t("accountings.fields.documentId"), width: 140 },
  ];

  return (
    <div className="space-y-4">
      <Alert type="info" showIcon message={t("repost.hint")} />
      <RepostForm loading={mutation.isPending} onSubmit={handleSubmit} />
      {mutation.data && (
        <Card className="space-y-3 border border-border p-4">
          <div className="font-semibold">{t("repost.done", { count: mutation.data.processedCount })}</div>
          <Table<RepostDocument>
            rowKey={(row) => `${row.documentType}-${row.documentId}`}
            size="small"
            columns={columns}
            dataSource={mutation.data.documents}
            pagination={{ pageSize: 50, showSizeChanger: false }}
          />
        </Card>
      )}
    </div>
  );
}
