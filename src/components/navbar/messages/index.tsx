import { Badge, Button, Popover } from "antd";
import { Bell, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Messages = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  return (
    <div className=" border-gray-200 rounded-xl transition-all hover:border-gray-500 hover:bg-gray-100">
      <Button type="link" className="w-10! h-10!" variant="text">
        <Badge count={0} offset={[1, -3]} size="small" className="text-xs!">
          <Popover
            classNames={{
              root: "!max-w-[400px]",
              content: "!p-0",
            }}
            content={
              <div>
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                  className={`flex gap-3 hover:bg-secondary-foreground cursor-pointer duration-100 px-3 py-2 ${
                      i !== 0 ? "border-t border-t-secondary" : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-secondary rounded-full shrink-0"></div>
                    <div className="flex flex-col">
                      <h1 className="text-text text-sm font-semibold">
                        {t("notifications.defaultSender")}
                      </h1>
                      <span className="text-xs text-primary-text">
                        {t("notifications.dayAgo")}
                      </span>
                      <p className="text-text line-clamp-2 text-xs">
                        {t("notifications.defaultMessage")}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="p-2">
                  <div className="bg-secondary hover:bg-surface-hover flex cursor-pointer items-center justify-center rounded-lg py-2 transition-colors">
                    <span className="text-text flex items-center text-sm">
                      {t("notifications.viewAll")} <ChevronRight className="size-4" />
                    </span>
                  </div>
                </div>
              </div>
            }
            title={false}
            placement="bottomRight"
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
          >
            <Bell className="text-primary-text size-5" />
          </Popover>
        </Badge>
      </Button>
    </div>
  );
};

export default Messages;
