import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, Empty, Pagination, Segmented, Select, Spin } from "antd";
import { CheckCheck, ChevronRight } from "lucide-react";
import Card from "@/components/ui/card/Card";
import dayjs from "@/config/dayjs";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationTypes,
  useNotifications,
  type NotificationItem,
} from "./api";
import NotificationIcon from "./NotificationIcon";

type ReadFilter = "all" | "unread";

/** Every notification of the user: filtered by read state and kind, a click opens what it is about. */
export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [read, setRead] = useState<ReadFilter>("all");
  const [typeId, setTypeId] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isFetching } = useNotifications({
    page,
    pageSize,
    isRead: read === "unread" ? false : undefined,
    typeId,
  });
  const { data: types = [] } = useNotificationTypes();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const open = (item: NotificationItem) => {
    if (!item.isRead) markRead.mutate(item.id);
    if (item.link) navigate(item.link);
  };

  const items = data?.items ?? [];

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented<ReadFilter>
            value={read}
            onChange={(value) => {
              setRead(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: t("notifications.all") },
              {
                value: "unread",
                label: `${t("notifications.unread")}${data?.unreadCount ? ` (${data.unreadCount})` : ""}`,
              },
            ]}
          />
          <Select
            allowClear
            className="min-w-48"
            placeholder={t("notifications.allTypes")}
            value={typeId}
            onChange={(value) => {
              setTypeId(value);
              setPage(1);
            }}
            options={types.map((type) => ({
              value: type.id,
              label: t(`notifications.types.${type.code}`, { defaultValue: type.name }),
            }))}
          />
        </div>
        <Button
          icon={<CheckCheck className="size-4" />}
          disabled={!data?.unreadCount}
          loading={markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          {t("notifications.markAll")}
        </Button>
      </div>

      <Card className="overflow-hidden border border-border">
        <Spin spinning={isLoading || isFetching}>
          {items.length === 0 && !isLoading ? (
            <Empty className="py-10" image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("notifications.empty")} />
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => open(item)}
                onKeyDown={(event) => event.key === "Enter" && open(item)}
                className={`flex cursor-pointer gap-3 px-4 py-3 transition hover:bg-(--theme-bg-muted) ${
                  index !== 0 ? "border-t border-border" : ""
                } ${item.isRead ? "opacity-70" : ""}`}
              >
                <NotificationIcon code={item.typeCode} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-heading">
                      {!item.isRead && <span className="mr-2 inline-block size-2 rounded-full bg-blue-500 align-middle" />}
                      {item.title}
                    </h3>
                    <span className="shrink-0 text-xs text-(--theme-text-secondary)">
                      {dayjs(item.createdDate).format("DD.MM.YYYY HH:mm")}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-(--theme-text-secondary)">{item.body}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-(--theme-text-secondary)">
                    <span>{t(`notifications.types.${item.typeCode}`, { defaultValue: item.typeName })}</span>
                    {item.link && (
                      <span className="inline-flex items-center text-(--theme-brand)">
                        {t("notifications.open")}
                        <ChevronRight className="size-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </Spin>
      </Card>

      {(data?.totalCount ?? 0) > pageSize && (
        <div className="flex justify-end">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={data?.totalCount ?? 0}
            showSizeChanger={false}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
