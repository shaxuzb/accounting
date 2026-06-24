import { purchasePermissions } from "@/modules/purchase/pages/purchase";

import type { MenuRole } from "@/shared/types";
import {
  Box,
  Briefcase,
  Building,
  Building2,
  ContactRound,
  CreditCard,
  GitBranch,
  Handshake,
  Landmark,
  LayoutDashboard,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react";
import { contractPermissions } from "@/modules/purchase/pages/contract/constants/permissions";
import { salePermissions } from "@/modules/sale";
import { productPermissions } from "@/modules/warehouse/pages/products/constants/permissions";
import { warehousePermissions } from "@/modules/warehouse";
import { bankPermissions } from "@/modules/bank";

interface MainMenu {
  TOP: MenuRole[];
  BOTTOM: MenuRole[];
  SETTINGS: MenuRole[];
}

export const settingsViewPermissions = [
  "ROLE_VIEW",
  "USER_VIEW",
  "ORGANIZATION_VIEW",
  "COUNTERPARTY_CARD_VIEW",
  "DEPARTMENT_VIEW",
  "BRANCH_VIEW",
  "CHART_ACCOUNT_VIEW",
  "COUNTERPARTY_BANK_ACCOUNT_VIEW",
  "ORG_BANK_ACCOUNT_VIEW",
  "POSITION_VIEW",
  "PRODUCT_GROUP_VIEW",
  "CASH_BOX_VIEW",
  "COUNTERPARTY_CONTACT_VIEW",
  "WAREHOUSE_VIEW",
  purchasePermissions.view,
] as const;

export const menuPermissions: MainMenu = {
  TOP: [
    {
      code: "ROLE_VIEW",
      linkData: {
        path: "dashboard",
        title: "menu.dashboard",
      },
      iconName: <LayoutDashboard className="size-5" />,
    },

    {
      code: purchasePermissions.view,
      iconName: <ShoppingCart className="size-5" />,
      dropdown: true,
      dropdownName: "purchase.title",
      linkData: {
        path: "purchases",
        title: "purchase.title",
      },
      items: [
        {
          code: purchasePermissions.view,
          linkData: {
            path: "purchase",
            title: "purchase.title",
          },
        },
        {
          code: contractPermissions.view,
          linkData: {
            path: "contracts",
            title: "contract.title",
          },
        },
      ],
    },

    {
      code: warehousePermissions.view,
      iconName: <Box className="size-5" />,
      dropdown: true,
      dropdownName: "menu.warehouse",
      linkData: {
        path: "warehouses",
        title: "menu.warehouse",
      },
      items: [
        {
          code: warehousePermissions.view,
          linkData: {
            path: "warehouse",
            title: "menu.warehouseMain",
          },
        },
        {
          code: productPermissions.view,
          linkData: {
            path: "products",
            title: "products.title",
          },
        },
      ],
    },
    {
      code: "ROLE_VIEW",
      linkData: {
        path: "bank",
        title: "bank.title",
      },
      iconName: <Landmark className="size-5" />,
      filterCode: bankPermissions.view,
    },

    {
      code: salePermissions.view,
      linkData: {
        path: "sale",
        title: "sale.title",
      },
      iconName: <ShoppingBag className="size-5" />,
    },

    // {
    //   code: "SET",
    //   linkData: {
    //     path: "dashboard/financesss",
    //     title: "Kassa",
    //   },
    //   iconName: <Banknote className="size-5" />,
    // },

    // {
    //   code: "S",
    //   linkData: {
    //     path: "dashboard/financ",
    //     title: "Ish haqi",
    //   },
    //   iconName: <Users className="size-5" />,
    // },
    // {
    //   code: "Ss",
    //   linkData: {
    //     path: "dashboard/finan",
    //     title: "Hisobotlar",
    //   },
    //   iconName: <ChartColumnBig className="size-5" />,
    // },
    {
      code: "Sss",
      linkData: {
        path: "settings",
        title: "settings.title",
      },
      iconName: <Settings className="size-5" />,
    },
  ],
  BOTTOM: [
    {
      code: "SETTINGS",
      linkData: {
        path: "settings",
        title: "menu.company",
      },
      iconName: <Building2 className="size-5" />,
    },
  ],
  SETTINGS: [
    {
      code: "ROLE_VIEW",
      iconName: <ShieldCheck className="size-5" />,
      linkData: {
        path: "role",
        title: "settings.entities.roles",
        // img: role,
        description: "settings.descriptions.roles",
      },
    },
    {
      code: "USER_VIEW",
      iconName: <Users className="size-5" />,
      linkData: {
        path: "users",
        title: "settings.entities.users",
        // img: role,
        description: "settings.descriptions.users",
      },
    },
    {
      code: "ORGANIZATION_VIEW",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "organizations",
        title: "settings.entities.organizations",
        // img: role,
        description: "settings.descriptions.organizations",
      },
    },
    {
      code: "COUNTERPARTY_CARD_VIEW",
      iconName: <Handshake className="size-5" />,
      linkData: {
        path: "counterparty",
        title: "settings.entities.counterparty",
        // img: role,
        description: "settings.descriptions.counterparty",
      },
    },
    {
      code: "DEPARTMENT_VIEW",
      iconName: <Building className="size-5" />,
      linkData: {
        path: "departments",
        title: "settings.entities.departments",
        // img: role,
        description: "settings.descriptions.departments",
      },
    },
    {
      code: "BRANCH_VIEW",
      iconName: <GitBranch className="size-5" />,
      linkData: {
        path: "branches",
        title: "settings.entities.branches",
        // img: role,
        description: "settings.descriptions.branches",
      },
    },
    {
      code: "CHART_ACCOUNT_VIEW",
      iconName: <ReceiptText className="size-5" />,
      linkData: {
        path: "chart-accounts",
        title: "settings.entities.chartAccounts",
        // img: role,
        description: "settings.descriptions.chartAccounts",
      },
    },
    {
      code: "COUNTERPARTY_BANK_ACCOUNT_VIEW",
      iconName: <Landmark className="size-5" />,
      linkData: {
        path: "counterparty-bank-accounts",
        title: "settings.entities.bankAccounts",
        // img: role,
        description: "settings.descriptions.bankAccounts",
      },
    },
    {
      code: "ORG_BANK_ACCOUNT_VIEW",
      iconName: <Wallet className="size-5" />,
      linkData: {
        path: "org-bank-accounts",
        title: "settings.entities.orgBankAccounts",
        // img: role,
        description: "settings.descriptions.orgBankAccounts",
      },
    },
    {
      code: "POSITION_VIEW",
      iconName: <Briefcase className="size-5" />,
      linkData: {
        path: "positions",
        title: "settings.entities.positions",
        // img: role,
        description: "settings.descriptions.positions",
      },
    },
    {
      code: "PRODUCT_GROUP_VIEW",
      iconName: <Building2 className="size-5" />,
      linkData: {
        path: "product-groups",
        title: "settings.entities.productGroups",
        // img: role,
        description: "settings.descriptions.productGroups",
      },
    },
    {
      code: "CASH_BOX_VIEW",
      iconName: <CreditCard className="size-5" />,
      linkData: {
        path: "cash-boxes",
        title: "settings.entities.cashBox",
        // img: role,
        description: "settings.descriptions.cashBox",
      },
    },
    {
      code: "COUNTERPARTY_CONTACT_VIEW",
      iconName: <ContactRound className="size-5" />,
      linkData: {
        path: "counterparty-contacts",
        title: "settings.entities.counterpartyContacts",
        // img: role,
        description: "settings.descriptions.counterpartyContacts",
      },
    },
    {
      code: "WAREHOUSE_VIEW",
      iconName: <Warehouse className="size-5" />,
      linkData: {
        path: "warehouses",
        title: "settings.entities.warehouse",
        // img: role,
        description: "settings.descriptions.warehouse",
      },
    },
    {
      code: purchasePermissions.view,
      iconName: <Wrench className="size-5" />,
      linkData: {
        path: "purchase-services",
        title: "settings.entities.purchaseServices",
        description: "settings.descriptions.purchaseServices",
      },
    },
  ],
};
