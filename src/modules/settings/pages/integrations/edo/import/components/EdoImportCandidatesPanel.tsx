import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Empty,
  InputNumber,
  Skeleton,
  Table,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { ExternalLink, FilePenLine, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import {
  useEdoImportCandidate,
  useEdoImportCandidates,
  useSaveEdoImportCandidateMapping,
} from "../hooks";
import type {
  EdoImportCandidateLineMappingRequestDto,
  EdoImportCandidateListDto,
  EdoImportCandidateMappingRequestDto,
} from "../types";
import {
  formatImportNumber,
  getImportErrorMessage,
  importStatusTag,
} from "./presentation";

interface EdoImportCandidatesPanelProps {
  jobId: number;
}

const positiveOrNull = (value: number | null | undefined) =>
  value != null && value > 0 ? value : null;

export default function EdoImportCandidatesPanel({
  jobId,
}: EdoImportCandidatesPanelProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedId, setSelectedId] = useState<number>(0);
  const candidates = useEdoImportCandidates(jobId, { page, pageSize });
  const detail = useEdoImportCandidate(jobId, selectedId, selectedId > 0);
  const saveMapping = useSaveEdoImportCandidateMapping(jobId, selectedId);
  const defaultMapping = useMemo<EdoImportCandidateMappingRequestDto>(
    () => ({
      counterpartyId: detail.data?.counterpartyId ?? null,
      contractId: detail.data?.contractId ?? null,
      currencyId: detail.data?.currencyId ?? null,
      warehouseId: detail.data?.warehouseId ?? null,
      lines:
        detail.data?.lines.map((line) => ({
          lineNumber: line.number,
          productId: line.productId ?? null,
          unitId: line.unitId ?? null,
          vatRateId: line.vatRateId ?? null,
          debitAccountId: line.debitAccountId ?? null,
          vatAccountId: line.vatAccountId ?? null,
        })) ?? [],
    }),
    [detail.data],
  );
  const [mappingOverride, setMappingOverride] =
    useState<EdoImportCandidateMappingRequestDto | null>(null);
  const mapping = mappingOverride ?? defaultMapping;

  const columns = useMemo<TableColumnsType<EdoImportCandidateListDto>>(
    () => [
      {
        title: "Provider",
        dataIndex: "providerCode",
        width: 110,
        render: (value: string) => <Tag className="m-0">{value}</Tag>,
      },
      {
        title: "Hujjat",
        key: "document",
        minWidth: 180,
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
        minWidth: 220,
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
        align: "right",
        width: 150,
        render: (value?: number | null) => formatImportNumber(value),
      },
      {
        title: "Import holati",
        dataIndex: "status",
        width: 160,
        render: (value: string) => importStatusTag(value),
      },
      {
        title: "Mapping",
        dataIndex: "mappingStatus",
        width: 170,
        render: (value: string) => importStatusTag(value),
      },
      {
        title: "Amal",
        key: "actions",
        fixed: "right",
        width: 150,
        render: (_, record) => (
          <div className="flex items-center gap-1">
            <Button
              type="text"
              icon={<FilePenLine className="size-4" />}
              onClick={() => {
                setMappingOverride(null);
                setSelectedId(record.id);
              }}
            >
              Mapping
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
        ),
      },
    ],
    [navigate],
  );

  const updateHeader = (
    key: "counterpartyId" | "contractId" | "currencyId" | "warehouseId",
    value: number | null,
  ) =>
    setMappingOverride((current) => ({
      ...(current ?? defaultMapping),
      [key]: positiveOrNull(value),
    }));

  const updateLine = (
    lineNumber: number,
    key: Exclude<keyof EdoImportCandidateLineMappingRequestDto, "lineNumber">,
    value: number | null,
  ) =>
    setMappingOverride((current) => ({
      ...(current ?? defaultMapping),
      lines: (current ?? defaultMapping).lines.map((line) =>
        line.lineNumber === lineNumber
          ? { ...line, [key]: positiveOrNull(value) }
          : line,
      ),
    }));

  const submitMapping = async () => {
    if (!selectedId || !detail.data) return;
    const lineNumbers = mapping.lines.map((line) => line.lineNumber);
    if (
      lineNumbers.some((lineNumber) => lineNumber <= 0) ||
      new Set(lineNumbers).size !== lineNumbers.length
    ) {
      toast.error("Qator raqamlari musbat va takrorlanmas bo‘lishi kerak.");
      return;
    }
    try {
      await saveMapping.mutateAsync(mapping);
      toast.success("Candidate mapping saqlandi.");
      setSelectedId(0);
      setMappingOverride(null);
    } catch (error) {
      toast.error(getImportErrorMessage(error));
    }
  };

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
            Backend kontrakti bo‘yicha faqat sahifalash mavjud; mapping detail
            ichida bajariladi.
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
        pagination={{
          current: page,
          pageSize,
          total: candidates.data?.totalCount ?? undefined,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          onChange: (nextPage, nextSize) => {
            setPage(nextSize !== pageSize ? 1 : nextPage);
            setPageSize(Math.min(100, nextSize));
          },
        }}
      />

      <Drawer
        open={selectedId > 0}
        onClose={() => {
          setSelectedId(0);
          setMappingOverride(null);
        }}
        width={920}
        title={
          detail.data?.documentNumber
            ? `Hujjat ${detail.data.documentNumber}`
            : `Candidate #${selectedId}`
        }
        extra={
          <Button
            type="primary"
            loading={saveMapping.isPending}
            disabled={!detail.data}
            onClick={() => void submitMapping()}
          >
            Mappingni saqlash
          </Button>
        }
      >
        {detail.isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : detail.isError ? (
          <Alert
            type="error"
            showIcon
            message={getImportErrorMessage(detail.error)}
          />
        ) : detail.data ? (
          <div className="space-y-5">
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Provider">
                {detail.data.providerCode}
              </Descriptions.Item>
              <Descriptions.Item label="Provider ID">
                {detail.data.providerDocumentId}
              </Descriptions.Item>
              <Descriptions.Item label="Sotuvchi">
                {detail.data.sellerName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Sotuvchi STIR">
                {detail.data.sellerTin || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Shartnoma">
                {detail.data.providerContractNumber || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Jami">
                {formatImportNumber(detail.data.totalAmount)}
              </Descriptions.Item>
            </Descriptions>

            <section>
              <h3 className="mb-3 font-semibold text-heading">
                Hujjat mappingi
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Kontragent ID", "counterpartyId", mapping.counterpartyId],
                  ["Shartnoma ID", "contractId", mapping.contractId],
                  ["Valuta ID", "currencyId", mapping.currencyId],
                  ["Ombor ID", "warehouseId", mapping.warehouseId],
                ].map(([label, key, value]) => (
                  <label
                    key={String(key)}
                    className="space-y-2 text-sm font-medium text-heading"
                  >
                    <span>{label}</span>
                    <InputNumber
                      min={1}
                      precision={0}
                      value={value as number | null | undefined}
                      onChange={(next) =>
                        updateHeader(
                          key as
                            | "counterpartyId"
                            | "contractId"
                            | "currencyId"
                            | "warehouseId",
                          next,
                        )
                      }
                      className="w-full"
                      placeholder="Ixtiyoriy"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-semibold text-heading">
                Hujjat qatorlari
              </h3>
              <div className="space-y-3">
                {detail.data.lines.map((line) => {
                  const lineMapping = mapping.lines.find(
                    (item) => item.lineNumber === line.number,
                  );
                  return (
                    <div
                      key={line.number}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-heading">
                            #{line.number} ·{" "}
                            {line.providerProductName || "Nomsiz mahsulot"}
                          </div>
                          <div className="mt-1 text-xs text-secondary-text">
                            MXIK: {line.catalogCode || "—"} ·{" "}
                            {formatImportNumber(line.quantity)} ×{" "}
                            {formatImportNumber(line.unitPrice)}
                          </div>
                        </div>
                        {importStatusTag(line.mappingStatus)}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {[
                          ["Mahsulot ID", "productId", lineMapping?.productId],
                          ["Birlik ID", "unitId", lineMapping?.unitId],
                          [
                            "QQS stavka ID",
                            "vatRateId",
                            lineMapping?.vatRateId,
                          ],
                          [
                            "Debet hisob ID",
                            "debitAccountId",
                            lineMapping?.debitAccountId,
                          ],
                          [
                            "QQS hisob ID",
                            "vatAccountId",
                            lineMapping?.vatAccountId,
                          ],
                        ].map(([label, key, value]) => (
                          <label
                            key={String(key)}
                            className="space-y-2 text-xs font-medium text-heading"
                          >
                            <span>{label}</span>
                            <InputNumber
                              min={1}
                              precision={0}
                              value={value as number | null | undefined}
                              onChange={(next) =>
                                updateLine(
                                  line.number,
                                  key as Exclude<
                                    keyof EdoImportCandidateLineMappingRequestDto,
                                    "lineNumber"
                                  >,
                                  next,
                                )
                              }
                              className="w-full"
                              placeholder="—"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : null}
      </Drawer>
    </Card>
  );
}
