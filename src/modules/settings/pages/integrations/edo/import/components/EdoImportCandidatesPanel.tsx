import {
  Alert,
  Button,
  Empty,
  Table,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { ExternalLink, FilePenLine, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Card from "@/components/ui/card/Card";
import ListPagination from "@/components/ui/table/ListPagination";
import { useEdoImportCandidates } from "../hooks";
import type { EdoImportCandidateListDto } from "../types";
import {
  formatImportNumber,
  getImportErrorMessage,
  importStatusTag,
  isCandidateMappingEditable,
} from "./presentation";

interface EdoImportCandidatesPanelProps {
  jobId: number;
}

export default function EdoImportCandidatesPanel({
  jobId,
}: EdoImportCandidatesPanelProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const candidates = useEdoImportCandidates(jobId, { page, pageSize });

  const columns = useMemo<TableColumnsType<EdoImportCandidateListDto>>(
    () => [
      {
        title: "Provider",
        dataIndex: "providerCode",
        width: 150,
        render: (value: string) => <Tag className="m-0">{value}</Tag>,
      },
      {
        title: "Hujjat",
        key: "document",
        render: (_, record) => (
          <div>
            <div className="font-medium text-heading">
              {record.documentNumber || "Raqamsiz hujjat"}
            </div>
            <div className="mt-1 text-xs text-secondary-text">
              {record.documentDate
                ? dayjs(record.documentDate).format("DD.MM.YYYY")
                : "Sana yo‘q"}
            </div>
          </div>
        ),
      },
      {
        title: "Sotuvchi",
        key: "seller",
        render: (_, record) => (
          <div>
            <div className="text-heading">{record.sellerName || "—"}</div>
            <div className="mt-1 text-xs text-secondary-text">
              STIR: {record.sellerTin || "—"}
            </div>
          </div>
        ),
      },
      {
        title: "Summa",
        dataIndex: "totalAmount",
        align: "center",
        render: (value?: number | null) => formatImportNumber(value),
      },
      {
        title: "Import holati",
        dataIndex: "status",
        render: (value: string) => importStatusTag(value),
        align: "center",
      },
      {
        title: "Moslashtirish holati",
        dataIndex: "mappingStatus",
        render: (value: string) => importStatusTag(value),
        align: "center",
      },
      {
        title: "Amal",
        key: "actions",
        fixed: "right",
        align: "center",
        width: 175,
        render: (_, record) => {
          const canMap = isCandidateMappingEditable(
            record.status,
            record.mappingStatus,
          );

          return (
          <div className="flex items-center gap-1">
            <Button
              type="text"
              icon={<FilePenLine className="size-4" />}
              disabled={!canMap}
              title={
                canMap
                  ? "Hujjat moslashtirishini ochish"
                  : "Bu hujjat uchun moslashtirish yopilgan"
              }
              onClick={() =>
                navigate(
                  `/main/settings/integrations/edo/import/${jobId}/candidate/${record.id}`,
                )
              }
            >
              {canMap ? "Moslashtirish" : "Yopilgan"}
            </Button>
            {record.existingPurchaseId ? (
              <Button
                type="text"
                aria-label="Purchase hujjatini ochish"
                icon={<ExternalLink className="size-4" />}
                onClick={() =>
                  navigate(
                    `/main/purchases/purchase/${record.existingPurchaseId}`,
                  )
                }
              />
            ) : null}
          </div>
          );
        },
      },
    ],
    [jobId, navigate],
  );

  if (candidates.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message={getImportErrorMessage(candidates.error)}
      />
    );
  }

  return (
    <Card className="border border-border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-heading">
            Topilgan EDO hujjatlari
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            Backend kontrakti bo‘yicha faqat sahifalash mavjud; moslashtirish
            hujjat tafsilotlarida bajariladi.
          </p>
        </div>
        <Button
          icon={<RefreshCw className="size-4" />}
          loading={candidates.isFetching}
          onClick={() => void candidates.refetch()}
        >
          Yangilash
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={candidates.data?.items ?? []}
        loading={candidates.isLoading || candidates.isFetching}
        scroll={{ x: 1100 }}
        locale={{
          emptyText: <Empty description="Bu job uchun candidate topilmadi" />,
        }}
        pagination={false}
      />
      <ListPagination
        current={page}
        pageSize={pageSize}
        total={candidates.data?.totalCount ?? 0}
        pageSizeOptions={[10, 20, 50, 100]}
        onChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(Math.min(100, nextSize));
        }}
      />

    </Card>
  );
}
