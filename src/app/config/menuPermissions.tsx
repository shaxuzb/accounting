import type { MenuRole } from "@/shared/types";
import {
  Banknote,
  Box,
  Building2,
  ChartColumnBig,
  House,
  Landmark,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User2,
  Users,
} from "lucide-react";

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
        path: "setti",
        title: "Bosh sahifa",
      },
      iconName: <House className="size-5" />,
    },
    {
      code: "PURCHASE",
      dropdown: true,
      iconName: <ShoppingCart className="size-5" />,
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
      iconName: <ShoppingBag className="size-5" />,
    },
    {
      code: "SETT",
      linkData: {
        path: "dashboard/financess",
        title: "Bank",
      },
      iconName: <Landmark className="size-5" />,
    },
    {
      code: "SET",
      linkData: {
        path: "dashboard/financesss",
        title: "Kassa",
      },
      iconName: <Banknote className="size-5" />,
    },
    {
      code: "SE",
      linkData: {
        path: "dashboard/financessss",
        title: "Ombor",
      },
      iconName: <Box className="size-5" />,
    },
    {
      code: "S",
      linkData: {
        path: "dashboard/financ",
        title: "Ish haqi",
      },
      iconName: <Users className="size-5" />,
    },
    {
      code: "Ss",
      linkData: {
        path: "dashboard/finan",
        title: "Hisobotlar",
      },
      iconName: <ChartColumnBig className="size-5" />,
    },
    {
      code: "Sss",
      linkData: {
        path: "settings",
        title: "Sozlamalar",
      },
      iconName: <Settings className="size-5" />,
    },
  ],
  BOTTOM: [
    {
      code: "SETTINGS",
      linkData: {
        path: "settingss",
        title: "HisobKitob MCHJ",
      },
      iconName: <Building2 className="size-5" />,
    },
  ],
  SETTINGS: [
    {
      code: "DROPDOWN",
      iconName: <User2 className="size-5" />,
      linkData: {
        path: "role",
        title: "Rollar",
        // img: role,
        description: "Tizimdagi rollarni va ularning huquqlarini boshqarish.",
      },
    },
    {
      code: "sdasda",
      iconName: <Users className="size-5" />,
      linkData: {
        path: "users",
        title: "Foydalanuvchilar",
        // img: role,
        description:
          "Foydalanuvchilarning huquqlari va tizimdagi rollarini boshqarish.",
      },
    },
    {
      code: "sdasdas",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "organizations",
        title: "Organizatsiyalar",
        // img: role,
        description: "ddwwrwrwfwfwrwrewewd",
      },
    },
    {
      code: "sdasdass",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "counterparty",
        title: "Kontragentlar",
        // img: role,
        description: "asasasasasasasasas",
      },
    },
    {
      code: "sdasdassss",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "departments",
        title: "Departments",
        // img: role,
        description: "departments",
      },
    },
    {
      code: "sdasdasssss",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "branches",
        title: "Branches",
        // img: role,
        description: "Branches",
      },
    },
    {
      code: "sdasdassssss",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "chart-accounts",
        title: "Charts",
        // img: role,
        description: "Chartes",
      },
    },
    {
      code: "sdasdasssssss",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "counterparty-bank-accounts",
        title: "Bank Account",
        // img: role,
        description: "counterparty",
      },
    },
    {
      code: "sdasdassssssss",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "org-bank-accounts",
        title: "Org Bank Account",
        // img: role,
        description: "Bank",
      },
    },
    {
      code: "sdasdasssssssss",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "positions",
        title: "Positions",
        // img: role,
        description: "positions",
      },
    },
  ],
};
