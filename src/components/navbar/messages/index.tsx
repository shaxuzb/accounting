import { Badge, Button, Popover } from "antd";
import { Bell, ChevronRight } from "lucide-react";
import { useState } from "react";

const Messages = () => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  return (
    <div className=" border-gray-200 rounded-xl transition-all hover:border-gray-500 hover:bg-gray-100">
      <Button type="link" className="w-10" variant="text">
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
                      <h1 className="font-semibold text-sm">John Smith</h1>
                      <span className="text-xs text-primary-text">1d ago</span>
                      <p className="line-clamp-2 text-xs">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Earum sed doloremque voluptatum exercitationem nobis nam
                        tempora deleniti magni maiores iusto?
                      </p>
                    </div>
                  </div>
                ))}
                <div className="p-2">
                  <div className="flex justify-center items-center py-2 bg-secondary cursor-pointer">
                    <span className="text-sm flex items-center">
                      Hammasini ko'rish <ChevronRight className="size-4" />
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
