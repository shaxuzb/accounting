import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import { menuPermissions } from "@/app/config/menuPermissions";
import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";
import type { MenuRole } from "@/shared/types";
import Card from "@/components/ui/card/Card";

function SettingsCard({
  item,
  icon,
  onClick,
}: {
  item: MenuRole["linkData"];
  icon: React.ReactNode;
  onClick: (to: string) => void;
}) {
  return (
    <Card
      onClick={() => onClick(item.path)}
      hoverable
      className="items-center justify-between p-4 border border-border  cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12! h-12! rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            {icon}
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {item.title}
            </div>
            {item.description && (
              <div className="text-xs text-gray-500">{item.description}</div>
            )}
          </div>
        </div>
        <div>
          <ChevronRight className="text-muted-second size-4" />
        </div>
      </div>
    </Card>
  );
}

export default function SettingsListPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const settingsRoute = useMemo(() => {
    // .filter((item) =>
    //     user?.user.permissions.find((per) => per === item.code),
    //   )
    return menuPermissions.SETTINGS;
  }, [user]);
  console.log(settingsRoute);

  const handleClick = (path: string) => {
    navigate(`/main/settings/${path}`);
  };

  return (
    <div className="p-2">
      <h1 className="pt-5 font-bold text-4xl">Sozlamalar</h1>
      <p className="pt-1 text-gray-500">Tizim parametrlari</p>
      <div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-4">
          {settingsRoute.map((item) => (
            <SettingsCard
              key={item.code}
              item={item.linkData}
              icon={item.iconName}
              onClick={handleClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
