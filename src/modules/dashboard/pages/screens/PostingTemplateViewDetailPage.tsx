import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Spin, Table, type TableColumnsType } from "antd";
import Card from "@/components/ui/card/Card";
import { generateKeyTable } from "@/utils/utils";
import { useGetPostingTemplateViewDetail } from "../hooks";
import type { PostingTemplateView } from "../types/type";

type ResolveRule = {
  id?: number;
  alias?: string;
  dimensionKey?: string;
  dimensionValue?: string;
  accountId?: number;
  accountCode?: string;
  accountName?: string;
  priority?: number;
};

type PostingLine = {
  id?: number;
  orderNumber?: number;
  debitAlias?: string;
  creditAlias?: string;
  amountSource?: string;
  isOptional?: boolean;
  debitResolveRules?: ResolveRule[];
  creditResolveRules?: ResolveRule[];
};

type DetailRow = {
  key: string;
  field: string;
  value: string;
};

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Ha" : "Yo'q";
  return String(value);
};

const ruleColumns: TableColumnsType<ResolveRule> = [
  {
    dataIndex: "indexId",
    title: "No",
    width: 70,
    align: "center",
  },
  {
    dataIndex: "alias",
    title: "Alias",
    width: 120,
  },
  {
    dataIndex: "dimensionKey",
    title: "Dimension key",
    width: 140,
  },
  {
    dataIndex: "dimensionValue",
    title: "Dimension value",
    width: 160,
  },
  {
    dataIndex: "accountCode",
    title: "Hisob kodi",
    width: 120,
  },
  {
    dataIndex: "accountName",
    title: "Hisob nomi",
    width: 260,
  },
  {
    dataIndex: "priority",
    title: "Priority",
    width: 100,
    align: "center",
    render: (value) => displayValue(value),
  },
];

const lineColumns: TableColumnsType<PostingLine> = [
  {
    dataIndex: "indexId",
    title: "No",
    width: 70,
    align: "center",
  },
  {
    dataIndex: "orderNumber",
    title: "Order",
    width: 90,
    align: "center",
    render: (value) => displayValue(value),
  },
  {
    dataIndex: "debitAlias",
    title: "Debit alias",
    width: 150,
    render: (value) => displayValue(value),
  },
  {
    dataIndex: "creditAlias",
    title: "Credit alias",
    width: 150,
    render: (value) => displayValue(value),
  },
  {
    dataIndex: "amountSource",
    title: "Amount source",
    width: 140,
    render: (value) => displayValue(value),
  },
  {
    dataIndex: "isOptional",
    title: "Optional",
    width: 100,
    align: "center",
    render: (value: boolean) => displayValue(value),
  },
];

const detailColumns: TableColumnsType<DetailRow> = [
  {
    dataIndex: "indexId",
    title: "N",
    align: "center",
  },
  {
    dataIndex: "field",
    title: "Maydon",
  },
  {
    dataIndex: "value",
    title: "Qiymat",
  },
];

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) => (
  <div className="rounded-lg border border-border bg-muted/30 p-4">
    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="text-sm font-semibold text-text">{displayValue(value)}</div>
  </div>
);

const RulesTable = ({
  title,
  data,
}: {
  title: string;
  data?: ResolveRule[];
}) => (
  <div className="space-y-2">
    <div className="text-sm font-semibold text-text">{title}</div>
    <Table<ResolveRule>
      size="small"
      columns={ruleColumns}
      dataSource={generateKeyTable(data ?? [], "id")}
      pagination={false}
      scroll={{ x: "max-content" }}
      locale={{ emptyText: "Ma'lumot yo'q" }}
    />
  </div>
);

export default function PostingTemplateViewDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, isFetching } = useGetPostingTemplateViewDetail(id);

  const detail = (data ?? {}) as PostingTemplateView & {
    policyId?: number;
    code?: string;
    name?: string;
    documentTypeId?: number;
    documentTypeCode?: string;
    documentTypeName?: string;
    linesCount?: number;
    lines?: PostingLine[];
  };

  const lines = useMemo(() => detail.lines ?? [], [detail.lines]);

  const extraDetails = useMemo<DetailRow[]>(() => {
    const skippedFields = new Set([
      "lines",
      "policyId",
      "code",
      "name",
      "documentTypeId",
      "documentTypeCode",
      "documentTypeName",
      "linesCount",
    ]);

    return Object.entries(detail)
      .filter(([field]) => !skippedFields.has(field))
      .map(([field, value]) => ({
        key: field,
        field,
        value: displayValue(value),
      }));
  }, [detail]);

  if (!id) {
    return <div className="rounded border p-4">ID topilmadi.</div>;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <Button
          icon={<ArrowLeft className="size-4" />}
          onClick={() => navigate(-1)}
        >
          Orqaga
        </Button>
      </div>

      {isLoading ? (
        <Card className="border border-border">
          <div className="flex justify-center p-10">
            <Spin />
          </div>
        </Card>
      ) : (
        <>
          <Card className="border border-border p-5">
            <div className="mb-4">
              <div className="text-xl font-semibold text-text">
                {displayValue(detail.name)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {displayValue(detail.code)}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <InfoItem label="Policy ID" value={detail.policyId} />
              <InfoItem label="Document type ID" value={detail.documentTypeId} />
              <InfoItem
                label="Document type code"
                value={detail.documentTypeCode}
              />
              <InfoItem
                label="Document type name"
                value={detail.documentTypeName}
              />
              <InfoItem label="Lines count" value={detail.linesCount} />
            </div>
          </Card>

          <Card className="border border-border p-5">
            <div className="mb-4 text-base font-semibold text-text">
              Posting lines
            </div>

            <Table<PostingLine>
              loading={isFetching}
              columns={lineColumns}
              dataSource={generateKeyTable(lines, "id")}
              pagination={false}
              scroll={{ x: "max-content" }}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="space-y-4 py-2">
                    <RulesTable
                      title="Debit resolve rules"
                      data={record.debitResolveRules}
                    />
                    <RulesTable
                      title="Credit resolve rules"
                      data={record.creditResolveRules}
                    />
                  </div>
                ),
                rowExpandable: (record) =>
                  Boolean(
                    record.debitResolveRules?.length ||
                      record.creditResolveRules?.length,
                  ),
              }}
            />
          </Card>

          {!!extraDetails.length && (
            <Card className="border border-border p-5">
              <div className="mb-4 text-base font-semibold text-text">
                Qo'shimcha ma'lumotlar
              </div>
              <Table<DetailRow>
                columns={detailColumns}
                dataSource={generateKeyTable(extraDetails, "key")}
                pagination={false}
                scroll={{ x: "max-content" }}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
