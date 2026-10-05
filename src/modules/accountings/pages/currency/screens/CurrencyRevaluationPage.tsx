import { Alert, Button, DatePicker, Modal, Popconfirm, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Eye, Plus, Undo2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import type { Dayjs } from "dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import { useAppSelector } from "@/store/hooks";
import { currencyRevaluationPermissions as permissions, revaluationStatus } from "../constants";
import {
  useCancelRevaluation,
  usePostRevaluation,
  usePreviewRevaluation,
  useRevaluation,
  useRevaluations,
} from "../hooks";
import RevaluationLinesTable from "../components/RevaluationLinesTable";
import type { Revaluation } from "../types";

const PAGE_SIZE = 50;

const money = (value?: number) =>
  (value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The month-end (or any date's) revaluation of money and settlements in foreign currency. */
export default function CurrencyRevaluationPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const userPermissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const can = (code: string) => userPermissions.includes(code);
  const page = Number(searchParams.get("page") || 1);
  const { data, isLoading, isFetching, refetch } = useRevaluations({
    revaluationFrom: searchParams.get("dateFrom") || undefined,
    revaluationTo: searchParams.get("dateTo") || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const cancel = useCancelRevaluation();
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);

  const statusTag = (statusId: number) =>
    statusId === revaluationStatus.posted ? (
      <Tag color="green">{t("currency.status.posted")}</Tag>
    ) : statusId === revaluationStatus.cancelled ? (
      <Tag color="red">{t("currency.status.cancelled")}</Tag>
    ) : (
      <Tag>{t("currency.status.draft")}</Tag>
    );

  const columns: TableColumnsType<Revaluation> = [
    { dataIndex: "id", title: "№", width: 70 },
    {
      dataIndex: "revaluationDate",
      title: t("currency.revaluation.date"),
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    { dataIndex: "statusId", title: t("currency.status.title"), render: statusTag },
    {
      dataIndex: "totalGain",
      title: t("currency.revaluation.gain"),
      align: "right",
      render: (value?: number) => <span className="text-green-600">{money(value)}</span>,
    },
    {
      dataIndex: "totalLoss",
      title: t("currency.revaluation.loss"),
      align: "right",
      render: (value?: number) => <span className="text-red-600">{money(value)}</span>,
    },
    { dataIndex: "lineCount", title: t("currency.revaluation.lines"), align: "center" },
    {
      key: "actions",
      title: t("common.actions"),
      align: "center",
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<Eye className="size-4" />} onClick={() => setViewing(record.id)} />
          {can(permissions.cancel) && record.statusId === revaluationStatus.posted && (
            <Popconfirm
              title={t("currency.revaluation.cancelConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={() =>
                cancel.mutateAsync(record.id).then(() => toast.success(t("currency.revaluation.cancelled")))
              }
            >
              <Button size="small" danger icon={<Undo2 className="size-4" />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={<DateRangeFilter placeholderKeys={["currency.dateFrom", "currency.dateTo"]} />}
        actions={
          <PermissionCard permission={permissions.create}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
              {t("currency.revaluation.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<Revaluation>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data?.items ?? []}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: data?.totalCount ?? 0,
            showSizeChanger: false,
            onChange: (next) => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set("page", String(next));
              setSearchParams(nextParams);
            },
          }}
          scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
        />
      </Card>
      {creating && <NewRevaluationModal canPost={can(permissions.confirm)} onClose={() => setCreating(false)} />}
      <RevaluationDetailModal id={viewing} statusTag={statusTag} onClose={() => setViewing(null)} />
    </div>
  );
}

function NewRevaluationModal({ canPost, onClose }: { canPost: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const today = dayjs();
  // a month is revalued on its last day: before the month is over, the previous month's end
  const [date, setDate] = useState<Dayjs>(
    today.endOf("month").isAfter(today, "day") ? today.subtract(1, "month").endOf("month") : today,
  );
  const preview = usePreviewRevaluation();
  const post = usePostRevaluation();
  const body = { revaluationDate: date.format("YYYY-MM-DDT23:59:59") };
  const lines = preview.data?.lines ?? [];

  const submit = async () => {
    await post.mutateAsync(body);
    toast.success(t("currency.revaluation.posted"));
    onClose();
  };

  return (
    <Modal
      open
      width={1240}
      title={t("currency.revaluation.new")}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {t("common.cancel")}
        </Button>,
        <Button
          key="post"
          type="primary"
          disabled={!canPost || !preview.isSuccess || lines.length === 0}
          loading={post.isPending}
          onClick={() => void submit()}
        >
          {t("currency.revaluation.post")}
        </Button>,
      ]}
    >
      <Space className="mb-3" wrap>
        <span>{t("currency.revaluation.date")}:</span>
        <DatePicker
          value={date}
          format="DD.MM.YYYY"
          allowClear={false}
          disabledDate={(day) => day.isAfter(today, "day")}
          onChange={(value) => {
            if (!value) return;
            setDate(value);
            preview.reset();
          }}
        />
        <Button loading={preview.isPending} onClick={() => preview.mutate(body)}>
          {t("currency.revaluation.calculate")}
        </Button>
      </Space>
      <Alert className="mb-3" type="info" showIcon message={t("currency.revaluation.hint")} />
      {preview.isSuccess && <RevaluationLinesTable lines={lines} />}
    </Modal>
  );
}

function RevaluationDetailModal({
  id,
  statusTag,
  onClose,
}: {
  id: number | null;
  statusTag: (statusId: number) => ReactNode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading } = useRevaluation(id);
  return (
    <Modal
      open={id !== null}
      width={1240}
      footer={null}
      onCancel={onClose}
      title={
        data ? (
          <Space>
            {t("currency.revaluation.title")} №{data.id} — {dayjs(data.revaluationDate).format("DD.MM.YYYY")}
            {statusTag(data.statusId)}
          </Space>
        ) : (
          t("currency.revaluation.title")
        )
      }
    >
      <RevaluationLinesTable lines={data?.lines ?? []} loading={isLoading} />
    </Modal>
  );
}
