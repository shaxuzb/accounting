import type { TableColumnsType } from "antd";
import dayjs from "@/config/dayjs";
import { customDate } from "@/utils/utils";
import type {
  PostingTemplateView,
  PostingTemplateViewDetailRow,
} from "../types/type";

const preferredFields = [
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
] as const;

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

export const getPostingTemplateViewFields = (
  record: PostingTemplateView | null,
) => {
  if (!record) return [];

  const keys = new Set(Object.keys(record));
  const baseFields = preferredFields.filter((field) => keys.has(field));
  const additionalFields = [...keys].filter(
    (key) =>
      !baseFields.includes(key as (typeof preferredFields)[number]) &&
      key !== "id" &&
      key !== "key" &&
      key !== "indexId",
  );

  return [...baseFields, ...additionalFields].slice(0, 10);
};

export const createPostingTemplateViewColumns = (
  fields: string[],
): TableColumnsType<PostingTemplateView> => [
  {
    dataIndex: "indexId",
    title: "No",
    width: 72,
    align: "center",
  },
  ...fields.map((field) => ({
    title: field,
    dataIndex: field,
    width: 220,
    render: (value: unknown) => formatPostingTemplateValue(value),
  })),
];

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
