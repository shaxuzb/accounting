import { Badge, Button, Empty, Popover, Spin } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { $axiosPrivate } from "@/services/AxiosService";

interface NotificationItem {
  id: number;
  typeName: string;
  title: string;
  body: string;
  isRead: boolean;
  link?: string | null;
  createdDate: string;
}

interface NotificationList {
  items: NotificationItem[];
  totalCount: number;
  unreadCount: number;
}

const keys = {
  unread: ["notifications", "unread-count"] as const,
  list: ["notifications", "list"] as const,
};

/**
 * The user's notifications: the platform's messages, contract expiry warnings and the like.
 * The unread count is refreshed every minute; opening the list shows the latest, a click marks
 * one read.
 */
const Messages = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const unread = useQuery({
    queryKey: keys.unread,
    // the server answers { count }
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<{ count?: number } | number>("/notifications/unread-count");
      return typeof data === "number" ? data : Number(data?.count ?? 0);
    },
    refetchInterval: 60000,
    retry: false,
  });
  const list = useQuery({
    queryKey: keys.list,
    queryFn: async () =>
      (await $axiosPrivate.get<NotificationList>("/notifications", { params: { page: 1, pageSize: 10 } })).data,
    enabled: open,
    retry: false,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };
  const markRead = useMutation({
    mutationFn: (id: number) => $axiosPrivate.post(`/notifications/${id}/read`),
    onSettled: refresh,
  });
  const markAll = useMutation({
    mutationFn: () => $axiosPrivate.post("/notifications/read-all"),
    onSettled: refresh,
  });

  const items = list.data?.items ?? [];

  return (
    <div className=" border-gray-200 rounded-xl transition-all hover:border-gray-500 hover:bg-gray-100">
      <Popover
        classNames={{ root: "!max-w-[400px] !w-[380px]", content: "!p-0" }}
        title={false}
        placement="bottomRight"
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        content={
          <div>
            <div className="flex items-center justify-between border-b border-b-secondary px-3 py-2">
              <span className="text-sm font-semibold">{t("notifications.title")}</span>
              <Button
                type="link"
                size="small"
                icon={<CheckCheck className="size-4" />}
                disabled={!unread.data}
                loading={markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                {t("notifications.markAll")}
              </Button>
            </div>
            <Spin spinning={list.isLoading}>
              <div className="max-h-[420px] overflow-y-auto">
                {items.length === 0 && !list.isLoading ? (
                  <Empty className="py-6" image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("notifications.empty")} />
                ) : (
                  items.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => !item.isRead && markRead.mutate(item.id)}
                      className={`flex gap-3 hover:bg-secondary-foreground cursor-pointer duration-100 px-3 py-2 ${
                        index !== 0 ? "border-t border-t-secondary" : ""
                      } ${item.isRead ? "opacity-60" : ""}`}
                    >
                      <div className={`mt-1.5 size-2 shrink-0 rounded-full ${item.isRead ? "bg-transparent" : "bg-blue-500"}`} />
                      <div className="flex min-w-0 flex-col">
                        <h1 className="text-text text-sm font-semibold">{item.title}</h1>
                        <span className="text-xs text-primary-text">
                          {item.typeName} · {dayjs(item.createdDate).format("DD.MM.YYYY HH:mm")}
                        </span>
                        <p className="text-text text-xs whitespace-pre-line">{item.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Spin>
          </div>
        }
      >
        <Button type="link" className="w-10! h-10!" variant="text">
          <Badge count={unread.data ?? 0} offset={[1, -3]} size="small" className="text-xs!">
            <Bell className="text-primary-text size-5" />
          </Badge>
        </Button>
      </Popover>
    </div>
  );
};

export default Messages;
