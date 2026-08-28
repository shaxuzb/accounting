import { purchasePermissions } from "@/modules/purchase/pages/purchase";
import type { MenuRole } from "@/shared/types";
import {
  Banknote,
  BookOpen,
  Box,
  Briefcase,
  Building,
  Building2,
  CalendarOff,
  ContactRound,
  CreditCard,
  GitBranch,
  Handshake,
  Landmark,
  // LayoutDashboard,
  ReceiptText,
  Scale,
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
  PlugZap,
  Boxes,
  BadgeDollarSign,
  SlidersHorizontal,
} from "lucide-react";
import { salePermissions } from "@/modules/sale";
import { retailSalePermissions } from "@/modules/sale/pages/retail-sale/constants/permissions";
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
import { openingBalancePermissions } from "@/modules/settings/pages/openingBalance/constants/permissions";
import { openingInventoryPermissions } from "@/modules/settings/pages/openingInventory/constants/permissions";
import { integrationPermissions } from "@/modules/settings/pages/integrations/constants/permissions";
import {
  payrollDocumentPermissions,
  payrollPaymentPermissions,
  payrollPeriodPermissions,
  payrollReportPermissions,
  payrollTimesheetPermissions,
} from "@/modules/payroll/constants/permissions";
import {
  hrAbsencePermissions,
  hrEmployeePermissions,
} from "@/modules/hr/constants/permissions";
import { payrollComponentPermissions } from "@/modules/settings/pages/payrollComponents/constants/permissions";
import { fiscalCashRegisterPermissions } from "@/modules/settings/pages/fiscalCashRegister/constants/permissions";
import { bankTerminalPermissions } from "@/modules/settings/pages/bankTerminal/constants/permissions";
import {
  cashBookPermissions,
  cashDocumentPermissions,
  cashOperationPermissions,
} from "@/modules/cashoperation";
import {
  faAssetPermissions,
  faDisposalPermissions,
  faDepreciationPermissions,
  faMovementPermissions,
  faReceiptPermissions,
  faRevaluationPermissions,
  faCommissioningPermissions,
} from "@/modules/fa";
import { accountingReportPermissions } from "@/modules/accountings/pages/accounting-report/constants/permissions";
import { ledgerPermissions } from "@/modules/accountings/pages/ledger/constants/permissions";
import { trialBalancePermissions } from "@/modules/accountings/pages/trial-balance/constants/permissions";

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
  fiscalCashRegisterPermissions.view,
  bankTerminalPermissions.view,
  "COUNTERPARTY_CONTACT_VIEW",
  "WAREHOUSE_VIEW",
  purchasePermissions.view,
  pricingConditionPermissions.view,
  saleConditionPermissions.view,
  openingBalancePermissions.view,
  openingInventoryPermissions.view,
  integrationPermissions.view,
  payrollComponentPermissions.view,
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
      dropdownName: "app.menu.warehouseGroup",
      linkData: {
        path: "warehouses",
        title: "app.menu.warehouseGroup",
      },
      items: [
        {
          code: productPermissions.view,
          linkData: {
            path: "warehouse",
            title: "app.menu.warehouse",
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
            title: "app.menu.transfers",
          },
        },
        {
          code: inventoryCountPermissions.view,
          linkData: {
            path: "inventory-counts",
            title: "app.menu.inventory",
          },
        },
        {
          code: inventoryAdjustmentPermissions.view,
          linkData: {
            path: "inventory-adjustments",
            title: "app.menu.adjustment",
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
    },
    {
      code: "DROPDOWN",
      dropdown: true,
      dropdownName: "app.menu.cash",
      iconName: <Banknote className="size-5" />,
      linkData: {
        path: "cash-operationses",
        title: "app.menu.cash",
      },
      items: [
        {
          code: cashOperationPermissions.view,
          linkData: {
            path: "cash-operations",
            title: "app.menu.cashOperations",
          },
        },
        {
          code: cashDocumentPermissions.view,
          linkData: {
            path: "cash-documents/pko",
            title: "app.menu.incomeOrders",
          },
        },
        {
          code: cashDocumentPermissions.view,
          linkData: {
            path: "cash-documents/rko",
            title: "app.menu.expenseOrders",
          },
        },
        {
          code: cashBookPermissions.view,
          linkData: {
            path: "cash-book",
            title: "app.menu.cashBook",
          },
        },
      ],
    },

    {
      code: "DROPDOWN",
      dropdown: true,
      dropdownName: "app.accounting.sidebarTitle",
      iconName: <ReceiptText className="size-5" />,
      linkData: {
        path: "accountings",
        title: "app.accounting.sidebarTitle",
      },
      items: [
        {
          code: accountingReportPermissions.balanceSheet,
          linkData: {
            path: "reports/balance-sheet",
            title: "app.accounting.reports",
          },
        },
        {
          code: ledgerPermissions.view,
          linkData: {
            path: "ledger",
            title: "app.accounting.ledger",
          },
        },
        {
          code: trialBalancePermissions.view,
          linkData: {
            path: "trial-balance",
            title: "app.accounting.trialBalance",
          },
        },
        // {
        //   code: auditLogPermissions.view,
        //   linkData: {
        //     path: "audit-log",
        //     title: "Audit log",
        //   },
        // },
        // {
        //   code: repostPermissions.update,
        //   linkData: {
        //     path: "repost",
        //     title: "Repost",
        //   },
        // },
      ],
    },
    {
      code: "DROPDOWN",
      dropdown: true,
      dropdownName: "fa.title",
      iconName: <Boxes className="size-5" />,
      linkData: {
        path: "fa",
        title: "fa.title",
      },
      items: [
        {
          code: faAssetPermissions.view,
          linkData: {
            path: "assets",
            title: "fa.entities.assets",
          },
        },
        {
          code: faReceiptPermissions.view,
          linkData: {
            path: "receipts",
            title: "fa.entities.receipts",
          },
        },
        {
          code: faCommissioningPermissions.view,
          linkData: {
            path: "commissionings",
            title: "fa.entities.commissionings",
          },
        },
        {
          code: faMovementPermissions.view,
          linkData: {
            path: "movements",
            title: "fa.entities.movements",
          },
        },
        {
          code: faRevaluationPermissions.view,
          linkData: {
            path: "revaluations",
            title: "fa.entities.revaluations",
          },
        },
        {
          code: faDisposalPermissions.view,
          linkData: {
            path: "disposals",
            title: "fa.entities.disposals",
          },
        },
        {
          code: faDepreciationPermissions.view,
          linkData: {
            path: "depreciation",
            title: "fa.entities.depreciation",
          },
        },
      ],
    },

    {
      code: "DROPDOWN",
      dropdown: true,
      dropdownName: "app.menu.sales",
      iconName: <ShoppingBag className="size-5" />,
      linkData: {
        path: "sales",
        title: "app.menu.sales",
      },
      items: [
        {
          code: salePermissions.view,
          linkData: {
            path: "sale",
            title: "app.menu.salesList",
          },
        },
        {
          code: retailSalePermissions.view,
          linkData: {
            path: "retail-sale",
            title: "app.menu.retailSales",
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
      dropdown: true,
      dropdownName: "hr.title",
      iconName: <ContactRound className="size-5" />,
      linkData: {
        path: "hr",
        title: "hr.title",
      },
      items: [
        {
          code: hrEmployeePermissions.view,
          linkData: {
            path: "employees",
            title: "hr.employees.title",
          },
        },
        {
          code: hrAbsencePermissions.view,
          iconName: <CalendarOff className="size-4" />,
          linkData: {
            path: "absences",
            title: "hr.absences.title",
          },
        },
      ],
    },
    {
      code: "DROPDOWN",
      dropdown: true,
      dropdownName: "payroll.title",
      iconName: <BadgeDollarSign className="size-5" />,
      linkData: {
        path: "payroll",
        title: "payroll.title",
      },
      items: [
        {
          code: payrollPeriodPermissions.view,
          linkData: {
            path: "periods",
            title: "payroll.periods.title",
          },
        },
        {
          code: payrollTimesheetPermissions.view,
          linkData: {
            path: "timesheets",
            title: "payroll.timesheets.title",
          },
        },
        {
          code: payrollDocumentPermissions.view,
          linkData: {
            path: "documents",
            title: "payroll.documents.title",
          },
        },
        {
          code: payrollPaymentPermissions.view,
          linkData: {
            path: "payments",
            title: "payroll.payments.title",
          },
        },
        {
          code: payrollReportPermissions.view,
          linkData: {
            path: "reports/register",
            title: "payroll.reports.registerTitle",
          },
        },
        {
          code: payrollReportPermissions.view,
          linkData: {
            path: "reports/payslip",
            title: "payroll.reports.payslipTitle",
          },
        },
      ],
    },
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
        title: "app.menu.company",
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
      code: openingBalancePermissions.view,
      iconName: <Scale className="size-5" />,
      linkData: {
        path: "opening-balances",
        title: "settings.entities.openingBalance",
        description: "settings.descriptions.openingBalance",
      },
    },
    {
      code: openingInventoryPermissions.view,
      iconName: <Box className="size-5" />,
      linkData: {
        path: "opening-inventory",
        title: "settings.entities.openingInventory",
        description: "settings.descriptions.openingInventory",
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
      code: fiscalCashRegisterPermissions.view,
      iconName: <ReceiptText className="size-5" />,
      linkData: {
        path: "fiscal-cash-registers",
        title: "settings.entities.fiscalCashRegisters",
        description: "settings.descriptions.fiscalCashRegisters",
      },
    },
    {
      code: bankTerminalPermissions.view,
      iconName: <CreditCard className="size-5" />,
      linkData: {
        path: "bank-terminals",
        title: "settings.entities.bankTerminals",
        description: "settings.descriptions.bankTerminals",
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
    {
      code: payrollComponentPermissions.view,
      iconName: <SlidersHorizontal className="size-5" />,
      linkData: {
        path: "payroll-components",
        title: "payroll.components.title",
        description: "payroll.components.description",
      },
    },
    {
      code: integrationPermissions.view,
      iconName: <PlugZap className="size-5" />,
      linkData: {
        path: "integrations",
        title: "settings.integrations.title",
        description: "settings.integrations.description",
      },
    },
  ],
};
