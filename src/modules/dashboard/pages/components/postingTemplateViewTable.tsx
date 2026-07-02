import type { TableColumnsType } from "antd";
import dayjs from "@/config/dayjs";
import { customDate, generateKeyTable } from "@/utils/utils";
import type {
  PostingTemplateView,
  PostingTemplateViewDetailRow,
} from "../types/type";

export const formatPostingTemplateValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";

  if (typeof value === "boolean") return value ? "Ha" : "Yo'q";

  if (typeof value === "number") return String(value);

  if (value instanceof Date) return customDate(value.toISOString());

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (
      trimmed &&
      trimmed.includes("T") &&
      trimmed.includes("-") &&
      dayjs(trimmed).isValid()
    ) {
      return customDate(trimmed);
    }

    return trimmed || "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

export const postingTemplateViewColumns: TableColumnsType<PostingTemplateView> =
  [
    {
      dataIndex: "indexId",
      title: "No",
      width: 72,
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Nomi",
      width: 220,
      render: (value) => formatPostingTemplateValue(value),
    },
    {
      dataIndex: "code",
      title: "Kodi",
      width: 160,
      render: (value) => formatPostingTemplateValue(value),
    },
    {
      dataIndex: "documentTypeName",
      title: "Document type",
      width: 220,
      render: (value) => formatPostingTemplateValue(value),
    },
    {
      dataIndex: "linesCount",
      title: "Lines",
      width: 100,
      align: "center",
      render: (value) => formatPostingTemplateValue(value),
    },
    {
      dataIndex: "createdBy",
      title: "Created by",
      width: 180,
      render: (value) => formatPostingTemplateValue(value),
    },
    {
      dataIndex: "createdAt",
      title: "Created at",
      width: 180,
      render: (value) => formatPostingTemplateValue(value),
    },
    {
      dataIndex: "updatedAt",
      title: "Updated at",
      width: 180,
      render: (value) => formatPostingTemplateValue(value),
    },
  ];

export const createPostingTemplateViewTableData = (
  data?: PostingTemplateView[],
) => generateKeyTable(data ?? [], "id");

export const createPostingTemplateViewDetailRows = (
  data?: PostingTemplateView,
): PostingTemplateViewDetailRow[] =>
  Object.entries(data ?? {}).map(([field, value]) => ({
    key: field,
    field,
    value: formatPostingTemplateValue(value),
  }));

export const postingTemplateViewDetailColumns: TableColumnsType<PostingTemplateViewDetailRow> =
  [
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
        typeof value === "string" &&
        (value.includes("{") || value.includes("["))
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
