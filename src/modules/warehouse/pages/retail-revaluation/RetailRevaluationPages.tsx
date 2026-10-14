import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, DatePicker, Form, Input, InputNumber, Table, Tag } from "antd";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import dayjs, { type Dayjs } from "dayjs";
import SelectCustom from "@/components/fields/SelectCustom";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

export const retailRevaluationPermissions = {
  view: "RETAIL_REVALUATION_VIEW",
  create: "RETAIL_REVALUATION_CREATE",
  confirm: "RETAIL_REVALUATION_CONFIRM",
  cancel: "RETAIL_REVALUATION_CANCEL",
} as const;

interface RevaluationLine {
  id?: number | null;
  productId: number | null;
  productName?: string | null;
  newPrice: number | null;
  quantity?: number;
  amount?: number;
}

interface Revaluation {
  id: number;
  docNumber: string;
  docDate: string;
  warehouseId: number;
  warehouseName?: string | null;
  comment?: string | null;
  totalAmount: number;
  statusId: number;
  lines: RevaluationLine[];
}

const endpoint = "/retail-revaluations";
const money = (value?: number | null) =>
  (value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatusTag({ statusId }: { statusId: number }) {
  const { t } = useTranslation();
  if (statusId === 2) return <Tag color="green">{t("retailRevaluation.posted")}</Tag>;
  if (statusId === 3) return <Tag color="red">{t("retailRevaluation.cancelled")}</Tag>;
  return <Tag>{t("retailRevaluation.draft")}</Tag>;
}

/** 1C «Переоценка товаров в рознице»: the list. */
export function RetailRevaluationListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({
    queryKey: ["retail-revaluations"],
    queryFn: async () => (await $axiosPrivate.get<Revaluation[]>(endpoint)).data,
  });

  return (
    <Card className="border border-border">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm text-secondary-text">{t("retailRevaluation.hint")}</div>
        <PermissionCard permission={retailRevaluationPermissions.create}>
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate("add")}>
            {t("common.create")}
          </Button>
        </PermissionCard>
      </div>
      <Table<Revaluation>
        rowKey="id"
        size="small"
        loading={isLoading}
        dataSource={data}
        onRow={(row) => ({ onClick: () => navigate(String(row.id)), className: "cursor-pointer" })}
        columns={[
          { title: "№", dataIndex: "docNumber", width: 120 },
          { title: t("retailRevaluation.date"), dataIndex: "docDate", render: (v: string) => dayjs(v).format("DD.MM.YYYY HH:mm"), width: 150 },
          { title: t("retailRevaluation.store"), dataIndex: "warehouseName" },
          { title: t("retailRevaluation.total"), dataIndex: "totalAmount", align: "right", render: money },
          { title: t("retailRevaluation.status"), dataIndex: "statusId", render: (v: number) => <StatusTag statusId={v} />, width: 130 },
        ]}
      />
    </Card>
  );
}

/** 1C «Переоценка товаров в рознице»: the store, the date and the new prices. */
export function RetailRevaluationEditorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { modal } = App.useApp();
  const { id } = useParams();
  const docId = id && id !== "add" ? Number(id) : null;
  const [docDate, setDocDate] = useState<Dayjs>(dayjs());
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [lines, setLines] = useState<RevaluationLine[]>([{ productId: null, newPrice: null }]);
  const [busy, setBusy] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["retail-revaluations", docId],
    queryFn: async () => (await $axiosPrivate.get<Revaluation>(`${endpoint}/${docId}`)).data,
    enabled: Boolean(docId),
  });

  useEffect(() => {
    if (!data) return;
    setDocDate(dayjs(data.docDate));
    setWarehouseId(data.warehouseId);
    setComment(data.comment ?? "");
    setLines(data.lines);
  }, [data]);

  const readOnly = Boolean(data && data.statusId !== 1);
  const body = () => ({
    docDate: docDate.format("YYYY-MM-DDTHH:mm:ss"),
    warehouseId,
    comment: comment || null,
    lines: lines.filter((line) => line.productId).map((line) => ({ productId: line.productId, newPrice: Number(line.newPrice) || 0 })),
  });

  const run = async (action: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: ["retail-revaluations"] });
    } catch (error) {
      errorHandlers(error);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (docId) {
      await $axiosPrivate.put(`${endpoint}/${docId}`, body());
      return docId;
    }
    const { data: created } = await $axiosPrivate.post<number>(endpoint, body());
    return created;
  };

  return (
    <div className="space-y-3">
      <Card className="border border-border">
        <Form layout="vertical" component={false}>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="mb-1 text-sm">{t("retailRevaluation.date")}</div>
            <DatePicker showTime format="DD.MM.YYYY HH:mm" value={docDate} disabled={readOnly} onChange={(value) => value && setDocDate(value)} />
          </div>
          <div className="w-72">
            <SelectCustom
              label="retailRevaluation.store"
              fieldName="warehouseId"
              path={selectListEndpoints.warehousesSelectList}
              value={warehouseId}
              disabled={readOnly}
              marginBottom="mb-0"
              onChange={(value) => setWarehouseId(Number(value) || null)}
            />
          </div>
          <div className="min-w-64 flex-1">
            <div className="mb-1 text-sm">{t("retailRevaluation.comment")}</div>
            <Input value={comment} disabled={readOnly} onChange={(event) => setComment(event.target.value)} />
          </div>
          <div className="flex gap-2">
            {data && <StatusTag statusId={data.statusId} />}
            {!readOnly && (
              <PermissionCard permission={retailRevaluationPermissions.create}>
                <Button
                  loading={busy}
                  onClick={() =>
                    void run(async () => {
                      const savedId = await save();
                      if (!docId) navigate(`../${savedId}`, { relative: "path", replace: true });
                      else await refetch();
                    }, t("retailRevaluation.saved"))
                  }
                >
                  {t("retailRevaluation.saveDraft")}
                </Button>
              </PermissionCard>
            )}
            {!readOnly && (
              <PermissionCard permission={retailRevaluationPermissions.confirm}>
                <Button
                  type="primary"
                  loading={busy}
                  onClick={() =>
                    void run(async () => {
                      const savedId = await save();
                      await $axiosPrivate.post(`${endpoint}/${savedId}/confirm`);
                      if (!docId) navigate(`../${savedId}`, { relative: "path", replace: true });
                      else await refetch();
                    }, t("retailRevaluation.postedMessage"))
                  }
                >
                  {t("retailRevaluation.post")}
                </Button>
              </PermissionCard>
            )}
            {data?.statusId === 2 && (
              <PermissionCard permission={retailRevaluationPermissions.cancel}>
                <Button
                  danger
                  loading={busy}
                  onClick={() =>
                    modal.confirm({
                      title: t("retailRevaluation.cancelConfirm"),
                      okButtonProps: { danger: true },
                      onOk: () =>
                        run(async () => {
                          await $axiosPrivate.post(`${endpoint}/${docId}/cancel`);
                          await refetch();
                        }, t("retailRevaluation.cancelledMessage")),
                    })
                  }
                >
                  {t("retailRevaluation.cancel")}
                </Button>
              </PermissionCard>
            )}
          </div>
        </div>
        </Form>
      </Card>

      <Card className="border border-border">
        <Form layout="vertical" component={false}>
        <Table<RevaluationLine>
          rowKey={(_, index) => String(index)}
          size="small"
          pagination={false}
          dataSource={lines}
          columns={[
            {
              title: t("retailRevaluation.product"),
              render: (_, line, index) =>
                readOnly ? (
                  line.productName
                ) : (
                  <SelectCustom
                    fieldName={`product-${index}`}
                    path={selectListEndpoints.productsSelectList}
                    value={line.productId}
                    search
                    marginBottom="mb-0"
                    onChange={(value) =>
                      setLines((current) => current.map((row, i) => (i === index ? { ...row, productId: Number(value) || null } : row)))
                    }
                  />
                ),
            },
            {
              title: t("retailRevaluation.newPrice"),
              width: 180,
              render: (_, line, index) => (
                <InputNumber
                  min={0}
                  disabled={readOnly}
                  className="w-full!"
                  value={line.newPrice}
                  onChange={(value) =>
                    setLines((current) => current.map((row, i) => (i === index ? { ...row, newPrice: value } : row)))
                  }
                />
              ),
            },
            { title: t("retailRevaluation.quantity"), dataIndex: "quantity", align: "right", width: 120 },
            { title: t("retailRevaluation.amount"), dataIndex: "amount", align: "right", width: 160, render: money },
            {
              key: "remove",
              width: 50,
              render: (_, __, index) =>
                !readOnly && (
                  <Button
                    size="small"
                    danger
                    type="text"
                    icon={<Trash2 className="size-4" />}
                    onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                  />
                ),
            },
          ]}
        />
        {!readOnly && (
          <Button className="mt-2" icon={<Plus className="size-4" />} onClick={() => setLines((current) => [...current, { productId: null, newPrice: null }])}>
            {t("retailRevaluation.addLine")}
          </Button>
        )}
        {data && data.statusId === 2 && (
          <div className="mt-2 text-right font-semibold">
            {t("retailRevaluation.total")}: {money(data.totalAmount)}
          </div>
        )}
        </Form>
      </Card>
    </div>
  );
}
