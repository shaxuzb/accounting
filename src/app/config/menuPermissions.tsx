import { purchasePermissions } from "@/modules/purchase/pages/purchase";
import type { MenuRole } from "@/shared/types";
import {
  Banknote,
  BookOpen,
  Box,
  Briefcase,
  Building,
  Building2,
  ContactRound,
  CreditCard,
  GitBranch,
  Handshake,
  Landmark,
  // LayoutDashboard,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  // Boxes,
  Tag,
  TrendingUp,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react";
import { salePermissions } from "@/modules/sale";
import { productPermissions } from "@/modules/warehouse/pages/products/constants/permissions";
import {
  inventoryAdjustmentPermissions,
  inventoryCountPermissions,
  warehouseTransferPermissions,
} from "@/modules/warehouse";
import { bankPermissions } from "@/modules/bank";
import { settingsBankPermissions } from "@/modules/settings/pages/bank/constants/permissions";
import { pricingConditionPermissions } from "@/modules/settings/pages/pricingCondition/constants/permissions";
import { saleConditionPermissions } from "@/modules/settings/pages/saleCondition/constants/permissions";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import {
  cashBookPermissions,
  cashDocumentPermissions,
  cashOperationPermissions,
} from "@/modules/cashoperation";
// import {
//   faAssetPermissions,
// } from "@/modules/fa/pages/faAsset/constants/permissions";
// import { faDisposalPermissions } from "@/modules/fa/pages/faDisposal/constants/permissions";
// import { faDepreciationPermissions } from "@/modules/fa/pages/faDepreciation/constants/permissions";
// import { faMovementPermissions } from "@/modules/fa/pages/faMovement/constants/permissions";
// import { faReceiptPermissions } from "@/modules/fa/pages/faReceipt/constants/permissions";
// import { faRevaluationPermissions } from "@/modules/fa/pages/faRevaluation/constants/permissions";
// import { accountingReportPermissions } from "@/modules/accountings/pages/accounting-report/constants/permissions";
// import { accountingPeriodsPermissions } from "@/modules/accountings/pages/accounting-periods/constants/permissions";
// import { ledgerPermissions } from "@/modules/accountings/pages/ledger/constants/permissions";
// import { trialBalancePermissions } from "@/modules/accountings/pages/trial-balance/constants/permissions";
// import { auditLogPermissions } from "@/modules/accountings/pages/audit-log/constants/permissions";
// import { repostPermissions } from "@/modules/accountings/pages/repost/constants/permissions";

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
  settingsBankPermissions.view,
  bankPermissions.view,
  "COUNTERPARTY_BANK_ACCOUNT_VIEW",
  "ORG_BANK_ACCOUNT_VIEW",
  "POSITION_VIEW",
  "PRODUCT_GROUP_VIEW",
  "CASH_BOX_VIEW",
  "COUNTERPARTY_CONTACT_VIEW",
  "WAREHOUSE_VIEW",
  purchasePermissions.view,
  pricingConditionPermissions.view,
  saleConditionPermissions.view,
] as const;

export const menuPermissions: MainMenu = {
  TOP: [
    // {
    //   code: dashboardPermissions.view,
    //   linkData: {
    //     path: "dashboard",
    //     title: "Boshqaruv",
    //   },
    //   iconName: <LayoutDashboard className="size-5" />,
    // },

    {
      code: "DROPDOWN",
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
      code: "DROPDOWN",
      iconName: <Box className="size-5" />,
      dropdown: true,
      dropdownName: "Ombor",
      linkData: {
        path: "warehouses",
        title: "Ombor",
      },
      items: [
        {
          code: productPermissions.view,
          linkData: {
            path: "warehouse",
            title: "Omborxona",
          },
        },
        {
          code: productPermissions.view,
          linkData: {
            path: "products",
            title: "products.title",
          },
        },
        {
          code: warehouseTransferPermissions.view,
          linkData: {
            path: "transfers",
            title: "Omborlar orasida ko'chirish",
          },
        },
        {
          code: inventoryCountPermissions.view,
          linkData: {
            path: "inventory-counts",
            title: "Inventarizatsiya",
          },
        },
        {
          code: inventoryAdjustmentPermissions.view,
          linkData: {
            path: "inventory-adjustments",
            title: "Qoldiqni tuzatish",
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
      code: "DROPDOWN",
      dropdown: true,
      dropdownName: "Kassa",
      iconName: <Banknote className="size-5" />,
      linkData: {
        path: "cash-operationses",
        title: "Kassa",
      },
      items: [
        {
          code: cashOperationPermissions.view,
          linkData: {
            path: "cash-operations",
            title: "Kassa amaliyotlari",
          },
        },
        {
          code: cashDocumentPermissions.view,
          linkData: {
            path: "cash-documents/pko",
            title: "Kirim orderlari",
          },
        },
        {
          code: cashDocumentPermissions.view,
          linkData: {
            path: "cash-documents/rko",
            title: "Chiqim orderlari",
          },
        },
        {
          code: cashBookPermissions.view,
          linkData: {
            path: "cash-book",
            title: "Kassa hisobi",
          },
        },
      ],
    },

    // {
    //   code: "DROPDOWN",
    //   dropdown: true,
    //   dropdownName: "Accounting",
    //   iconName: <ReceiptText className="size-5" />,
    //   linkData: {
    //     path: "accountings",
    //     title: "Accounting",
    //   },
    //   items: [
    //     {
    //       code: accountingReportPermissions.balanceSheet,
    //       linkData: {
    //         path: "reports/balance-sheet",
    //         title: "Accounting reports",
    //       },
    //     },
    //     {
    //       code: accountingPeriodsPermissions.close,
    //       linkData: {
    //         path: "register-entries",
    //         title: "Accounting period",
    //       },
    //     },

    //     {
    //       code: ledgerPermissions.view,
    //       linkData: {
    //         path: "ledger",
    //         title: "Ledger",
    //       },
    //     },
    //     {
    //       code: trialBalancePermissions.view,
    //       linkData: {
    //         path: "trial-balance",
    //         title: "Trial balance",
    //       },
    //     },
    //     {
    //       code: auditLogPermissions.view,
    //       linkData: {
    //         path: "audit-log",
    //         title: "Audit log",
    //       },
    //     },
    //     {
    //       code: repostPermissions.update,
    //       linkData: {
    //         path: "repost",
    //         title: "Repost",
    //       },
    //     },
    //     {
    //       code: accountingPeriodsPermissions.reopen,
    //       linkData: {
    //         path: "accounting-periods",
    //         title: "Accounting periods",
    //       },
    //     },
    //   ],
    // },
    // {
    //   code: "DROPDOWN",
    //   dropdown: true,
    //   dropdownName: "fa.title",
    //   iconName: <Boxes className="size-5" />,
    //   linkData: {
    //     path: "fa",
    //     title: "fa.title",
    //   },
    //   items: [
    //     {
    //       code: faAssetPermissions.view,
    //       linkData: {
    //         path: "assets",
    //         title: "fa.entities.assets",
    //       },
    //     },
    //     {
    //       code: faReceiptPermissions.view,
    //       linkData: {
    //         path: "receipts",
    //         title: "fa.entities.receipts",
    //       },
    //     },
    //     {
    //       code: faMovementPermissions.view,
    //       linkData: {
    //         path: "movements",
    //         title: "fa.entities.movements",
    //       },
    //     },
    //     {
    //       code: faRevaluationPermissions.view,
    //       linkData: {
    //         path: "revaluations",
    //         title: "fa.entities.revaluations",
    //       },
    //     },
    //     {
    //       code: faDisposalPermissions.view,
    //       linkData: {
    //         path: "disposals",
    //         title: "fa.entities.disposals",
    //       },
    //     },
    //     {
    //       code: faDepreciationPermissions.view,
    //       linkData: {
    //         path: "depreciation",
    //         title: "fa.entities.depreciation",
    //       },
    //     },
    //   ],
    // },

    {
      code: salePermissions.view,
      dropdown: true,
      dropdownName: "Sotuv",
      iconName: <ShoppingBag className="size-5" />,
      linkData: {
        path: "sales",
        title: "Sotuv",
      },
      items: [
        {
          code: salePermissions.view,
          linkData: {
            path: "sale",
            title: "Sotuvlar",
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
      code: "SETTINGS",
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
        title: "HisobKitob MCHJ",
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
      code: "CHART_ACCOUNT_VIEW",
      iconName: <BookOpen className="size-5" />,
      linkData: {
        path: "document-account-settings",
        title: "settings.entities.documentAccountSettings",
        description: "settings.descriptions.documentAccountSettings",
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
    {
      code: settingsBankPermissions.view,
      iconName: <Landmark className="size-5" />,
      linkData: {
        path: "banks",
        title: "settings.entities.banks",
        description: "settings.descriptions.banks",
      },
    },
    {
      code: pricingConditionPermissions.view,
      iconName: <Tag className="size-5" />,
      linkData: {
        path: "pricing-conditions",
        title: "settings.entities.pricingConditions",
        description: "settings.descriptions.pricingConditions",
      },
    },
    {
      code: saleConditionPermissions.view,
      iconName: <TrendingUp className="size-5" />,
      linkData: {
        path: "sale-conditions",
        title: "settings.entities.saleConditions",
        description: "settings.descriptions.saleConditions",
      },
    },
  ],
};
