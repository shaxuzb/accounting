import { useMemo } from "react";
import { useNavigate } from "react-router";
import { RefreshCw } from "lucide-react";
import { Button, Spin, Table } from "antd";
import Card from "@/components/ui/card/Card";
import { useGetPostingTemplateViews } from "../hooks";
import type { PostingTemplateView } from "../types/type";
import {
  createPostingTemplateViewTableData,
  postingTemplateViewColumns,
} from "../components";

export default function PostingTemplateViewsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } =
    useGetPostingTemplateViews();

  const tableData = useMemo(() => createPostingTemplateViewTableData(data), [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Posting Template Views</h1>
        <Button
          icon={<RefreshCw className="size-4" />}
          onClick={() => void refetch()}
        >
          Yangilash
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Spin />
        </div>
      ) : (
        <Card className="overflow-hidden border border-border">
          <Table<PostingTemplateView>
            loading={isFetching}
            columns={postingTemplateViewColumns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: "max-content", y: "calc(100vh - 260px)" }}
            onRow={(record) => ({
              onClick: () =>
                record.id !== undefined &&
                navigate(
                  `/main/dashboard/posting-template-views/${record.id}`,
                ),
            })}
            rowClassName={() => "cursor-pointer"}
          />
        </Card>
      )}
    </div>
  );
}
