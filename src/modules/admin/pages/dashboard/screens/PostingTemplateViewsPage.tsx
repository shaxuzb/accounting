import { useMemo } from "react";
import { useNavigate } from "react-router";
import { RefreshCw } from "lucide-react";
import { Button, Spin, Table } from "antd";
import type { TableColumnsType } from "antd";
import { customDate, generateKeyTable } from "@/utils/utils";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { useGetPostingTemplateViews } from "../hooks";
import type { PostingTemplateView } from "../types/type";

const toDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";

  if (typeof value === "boolean") return value ? "Ha" : "Yo'q";

  if (typeof value === "number") return String(value);

  if (value instanceof Date) return customDate(value.toISOString());

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      trimmed &&
      dayjs(trimmed).isValid() &&
      trimmed.includes("T") &&
      trimmed.includes("-")
    ) {
      return customDate(trimmed);
    }
    return trimmed || "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getColumnCandidates = (record: PostingTemplateView | null) => {
  if (!record) return [];

  const ordered = [
    "name",
    "templateName",
    "title",
    "code",
    "statusName",
    "stateName",
    "organizationName",
    "createdAt",
    "updatedAt",
    "createdBy",
    "id",
  ];
  const keys = new Set(Object.keys(record));
  const base = ordered.filter((field) => keys.has(field));

  const additional = [...keys].filter(
    (key) =>
      !base.includes(key) &&
      key !== "id" &&
      key !== "key" &&
      key !== "indexId",
  );

  return [...base, ...additional].slice(0, 10);
};

export default function PostingTemplateViewsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } =
    useGetPostingTemplateViews();

  const rows = data ?? [];
  const tableData = useMemo(() => generateKeyTable(rows, "id"), [rows]);

  const titleLabel = useMemo(() => {
    const first = tableData?.[0] as PostingTemplateView | undefined;
    return getColumnCandidates(first ?? null);
  }, [tableData]);

  const columns = useMemo<TableColumnsType<PostingTemplateView>>(
    () => [
      {
        dataIndex: "indexId",
        title: "No",
        width: 72,
        align: "center",
      },
      ...titleLabel.map((field) => ({
        title: field,
        dataIndex: field,
        width: 220,
        render: (value: unknown) => toDisplayValue(value),
      })),
    ],
    [titleLabel],
  );

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
            columns={columns}
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
