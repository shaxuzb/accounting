import type { MenuRole } from "@/shared/types";
import { LayoutDashboard, Settings, Warehouse } from "lucide-react";

interface MainMenu {
  TOP: MenuRole[];
  BOTTOM: MenuRole[];
  SETTINGS: MenuRole[];
}

export const menuPermissions: MainMenu = {
  TOP: [
    {
      code: "SETTINGS",
      linkData: {
        path: "dashboard/finance",
        title: "Bosh sahifa",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
    {
      code: "PURCHASE",
      dropdown: true,
      iconName: <Warehouse className="size-5" />,
      dropdownName: "Sotib olish",
      linkData: {
        path: "sotib-olish",
      },
      items: [
        {
          code: "SETTING",
          linkData: {
            path: "warehouse",
            title: "Buyurtmalar",
          },
        },
        {
          code: "SETTIN",
          linkData: {
            path: "products",
            title: "Kirim hujjatlari",
          },
        },
      ],
    },
    {
      code: "SETTI",
      linkData: {
        path: "dashboard/finances",
        title: "Sotuv",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
    {
      code: "SETT",
      linkData: {
        path: "dashboard/financess",
        title: "Bank",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
    {
      code: "SET",
      linkData: {
        path: "dashboard/financesss",
        title: "Kassa",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
    {
      code: "SE",
      linkData: {
        path: "dashboard/financessss",
        title: "Ombor",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
    {
      code: "S",
      linkData: {
        path: "dashboard/financ",
        title: "Ish haqi",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
     {
      code: "Ss",
      linkData: {
        path: "dashboard/finan",
        title: "Hisobotlar",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
     {
      code: "Sss",
      linkData: {
        path: "dashboard/fina",
        title: "Sozlamalar",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
  ],
  BOTTOM: [
    {
      code: "SETTINGS",
      linkData: {
        path: "settings",
        title: "HisobKitob MCHJ",
      },
      iconName: <Settings className="size-5" />,
    },
  ],
  SETTINGS: [
    {
      code: "DROPDOWN",
      filterCode: "default",
      linkData: {
        path: "role",
        title: "Settings.role.title",
        // img: role,
        description:
          "Foydalanuvchilarning huquqlari va tizimdagi rollarini boshqarish.",
      },
    },
  ],
};
