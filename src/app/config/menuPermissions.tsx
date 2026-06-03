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
      code: "DROPDOWN",
      linkData: {
        path: "dashboard/finance",
        title: "Pages.dashboard",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },
    {
      code: "DROPDOWN",
      dropdown: true,
      iconName: <Warehouse className="size-5" />,
      dropdownName: "Pages.stock",
      linkData: {
        path: "warehouses",
      },
      items: [
        {
          code: "DROPDOWN",
          linkData: {
            path: "warehouse",
            title: "Pages.productStock",
          },
        },
        {
          code: "DROPDOWN",
          linkData: {
            path: "products",
            title: "Pages.products",
          },
        },
      ],
    },
  ],
  BOTTOM: [
    {
      code: "SETTINGS",
      linkData: {
        path: "settings",
        title: "Settings.title",
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

