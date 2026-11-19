import { Badge, Button, Empty, Popover, Spin } from "antd";
import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
  type NotificationItem,
} from "@/modules/notifications/api";
import NotificationIcon from "@/modules/notifications/NotificationIcon";

/**
 * The user's notifications: the platform's news, tax and health warnings, contract expiry and the like.
 * The unread count is refreshed every minute; a click marks one read and opens what it is about.
 */
const Messages = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const unread = useUnreadNotificationCount();
  const list = useNotifications({ page: 1, pageSize: 10 }, open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const openItem = (item: NotificationItem) => {
    if (!item.isRead) markRead.mutate(item.id);
    if (item.link) {
      setOpen(false);
      navigate(item.link);
    }
  };

  const items = list.data?.items ?? [];

  return (
    <div className=" border-gray-200 rounded-xl transition-all hover:border-gray-500 hover:bg-gray-100">
      <Popover
        classNames={{ root: "!max-w-[420px] !w-[400px]", content: "!p-0" }}
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
                      onClick={() => openItem(item)}
                      className={`flex gap-3 hover:bg-secondary-foreground cursor-pointer duration-100 px-3 py-2 ${
                        index !== 0 ? "border-t border-t-secondary" : ""
                      } ${item.isRead ? "opacity-60" : ""}`}
                    >
                      <NotificationIcon code={item.typeCode} size="sm" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h1 className="text-text text-sm font-semibold">
                          {!item.isRead && <span className="mr-1.5 inline-block size-2 rounded-full bg-blue-500 align-middle" />}
                          {item.title}
                        </h1>
                        <span className="text-xs text-primary-text">
                          {t(`notifications.types.${item.typeCode}`, { defaultValue: item.typeName })} ·{" "}
                          {dayjs(item.createdDate).format("DD.MM.YYYY HH:mm")}
                        </span>
                        <p className="text-text text-xs whitespace-pre-line line-clamp-3">{item.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Spin>
            <div className="border-t border-t-secondary p-1.5">
              <Button
                type="link"
                block
                onClick={() => {
                  setOpen(false);
                  navigate("/main/notifications");
                }}
              >
                {t("notifications.viewAll")}
              </Button>
            </div>
          </div>
        }
      >
        <Button type="link" className="w-11! h-11!" variant="text">
          {/* the count sits on the bell's upper right corner, not above it */}
          <Badge count={unread.data ?? 0} overflowCount={99} offset={[0, 6]} size="small">
            <Bell className="text-primary-text size-7" />
          </Badge>
        </Button>
      </Popover>
    </div>
  );
};

export default Messages;
