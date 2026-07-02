import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Spin, Table, type TableColumnsType } from "antd";
import Card from "@/components/ui/card/Card";
import { customDate, generateKeyTable } from "@/utils/utils";
import { useGetPostingTemplateViewDetail } from "../hooks";

type DetailRow = {
  key: string;
  field: string;
  value: unknown;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Ha" : "Yo'q";
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.includes("T") && trimmed.includes("-")) {
      const asDate = customDate(trimmed);
      if (asDate !== "Invalid Date") return asDate;
    }
    return trimmed || "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const columns: TableColumnsType<DetailRow> = [
  {
    dataIndex: "indexId",
    title: "No",
    align: "center",
    width: 80,
  },
  {
    dataIndex: "field",
    title: "Maydon",
    width: 260,
    render: (value) => String(value),
  },
  {
    dataIndex: "value",
    title: "Qiymat",
    render: (value) =>
      typeof value === "string" && (value.includes("{") || value.includes("["))
        ? (
          <pre className="max-w-[70vw] overflow-auto rounded border border-border bg-muted p-2 text-xs">
            {String(value)}
          </pre>
        )
        : (
          String(value)
        ),
  },
];

export default function PostingTemplateViewDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, isFetching } = useGetPostingTemplateViewDetail(id);

  const rows = useMemo<DetailRow[]>(() => {
    return Object.entries(data ?? {}).map(([field, rawValue]) => ({
      key: field,
      field,
      value: formatValue(rawValue),
    }));
  }, [data]);

  if (!id) {
    return <div className="rounded border p-4">ID topilmadi.</div>;
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3">
        <Button
          icon={<ArrowLeft className="size-4" />}
          onClick={() => navigate(-1)}
        >
          Orqaga
        </Button>
      </div>

      <Card className="overflow-hidden border border-border">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spin />
          </div>
        ) : (
          <Table<DetailRow>
            loading={isFetching}
            columns={columns}
            dataSource={generateKeyTable(rows, "key")}
            pagination={false}
            scroll={{ x: "max-content", y: "calc(100vh - 260px)" }}
          />
        )}
      </Card>
    </div>
  );
}
