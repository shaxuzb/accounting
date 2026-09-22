import { lazy } from "react";
import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
const SettingsListPage = lazy(() => import("./pages/SettingsListPage"));
const RoleListPage = lazy(() => import("./pages/role/screens/RoleListPage"));
const RoleAddEditPage = lazy(() => import("./pages/role/screens/RoleAddEditPage"));
const UserListPage = lazy(() => import("./pages/users/screens/UserListPage"));
const OrganizationListPage = lazy(() => import("./pages/organizations/screens/OrganizationListPage"));
const CounterpartyListPage = lazy(() => import("./pages/counterparty/screens/CounterpartyListPage"));
const DepartmentListPage = lazy(() => import("./pages/departments/screens/DepartmentListPage"));
const ChartAccountListPage = lazy(() => import("./pages/chartAccounts/screens/ChartAccountListPage"));
const DocumentAccountSettingsListPage = lazy(() => import("./pages/documentAccountSettings/screens/DocumentAccountSettingsListPage"));
const DocumentAccountSettingsDetailPage = lazy(() => import("./pages/documentAccountSettings/screens/DocumentAccountSettingsDetailPage"));
const BranchListPage = lazy(() => import("./pages/branches/screens/BranchListPage"));
const CounterpartyBankAccountListPage = lazy(() => import("./pages/counterpartybankaccount/screens/CounterpartyBankAccountListPage"));
const SettingsBankListPage = lazy(() => import("./pages/bank/screens/SettingsBankListPage"));
const OrgBankAccountListPage = lazy(() => import("./pages/orgBankAccounts/screens/OrgBankAccountListPage"));
const PositionListPage = lazy(() => import("./pages/positions/screens/PositionListPage"));
const ProductGroupListPage = lazy(() => import("./pages/productGroups/screens/ProductGroupListPage"));
const CashBoxListPage = lazy(() => import("./pages/cashbox/screens/CashBoxListPage"));
const CounterpartyContactListPage = lazy(() => import("./pages/counterpartycontact/screens/CounterpartyContactListPage"));
const WarehouseListPage = lazy(() => import("./pages/warehouse/screens/WarehouseListPage"));
const PricingConditionListPage = lazy(() => import("./pages/pricingCondition/screens/PricingConditionListPage"));
const SaleConditionListPage = lazy(() => import("./pages/saleCondition/screens/SaleConditionListPage"));
import { rolePermissions } from "./pages/role/constants/permissions";
import { userPermissions } from "./pages/users/constants/permissions";
import { organizationsPermissions } from "./pages/organizations/constants/permissions";
import { counterpartyPermissions } from "./pages/counterparty/constants/permissions";
import { departmentsPermissions } from "./pages/departments/constants/permissions";
import { branchesPermissions } from "./pages/branches/constants/permissions";
import { chartAccountsPermissions } from "./pages/chartAccounts/constants/permissions";
import { counterpartybankaccountPermissions } from "./pages/counterpartybankaccount/constants/permissions";
import { settingsBankPermissions } from "./pages/bank/constants/permissions";
import { orgBankAccountsPermissions } from "./pages/orgBankAccounts/constants/permissions";
import { positionsPermissions } from "./pages/positions/constants/permissions";
import { productGroupsPermissions } from "./pages/productGroups/constants/permissions";
import { cashBoxPermissions } from "./pages/cashbox/constants/permissions";
import { counterpartyContactPermissions } from "./pages/counterpartycontact/constants/permissions";
import { warehousePermissions } from "./pages/warehouse/constants/permissions";
import { pricingConditionPermissions } from "./pages/pricingCondition/constants/permissions";
import { saleConditionPermissions } from "./pages/saleCondition/constants/permissions";
import { purchasePermissions } from "../purchase/pages/purchase/constants/permissions";
import { bankPermissions } from "../bank";
const OpeningBalancePage = lazy(() => import("./pages/openingBalance/screens/OpeningBalancePage"));
const OpeningBalanceAccountPage = lazy(() => import("./pages/openingBalance/screens/OpeningBalanceAccountPage"));
import { openingBalancePermissions } from "./pages/openingBalance/constants/permissions";
const OpeningInventoryListPage = lazy(() => import("./pages/openingInventory/screens/OpeningInventoryListPage"));
const OpeningInventoryEditorPage = lazy(() => import("./pages/openingInventory/screens/OpeningInventoryEditorPage"));
import { openingInventoryPermissions } from "./pages/openingInventory/constants/permissions";
const EimzoProvider = lazy(() => import("@/features/eimzo").then((m) => ({ default: m.EimzoProvider })));
const IntegrationsPage = lazy(() => import("./pages/integrations/screens/IntegrationsPage"));
import { integrationPermissions } from "./pages/integrations/constants/permissions";
const PayrollComponentListPage = lazy(() => import("./pages/payrollComponents/screens/PayrollComponentListPage"));
const PayrollTaxDefinitionListPage = lazy(() => import("./pages/payrollTaxDefinitions/screens/PayrollTaxDefinitionListPage"));
const ContractResponsiblePersonListPage = lazy(() => import("@/modules/contract/screens/ContractResponsiblePersonListPage"));
import { contractPermissions } from "@/modules/contract/constants/permissions";
import { payrollComponentPermissions } from "./pages/payrollComponents/constants/permissions";
import { payrollTaxDefinitionPermissions } from "./pages/payrollTaxDefinitions/constants/permissions";
const EdoWorkspacePage = lazy(() => import("./pages/integrations/edo/screens/EdoWorkspacePage"));
const EdoInboxPage = lazy(() => import("./pages/integrations/edo/screens/EdoInboxPage"));
const EdoOutboxCreatePage = lazy(() => import("./pages/integrations/edo/screens/EdoOutboxCreatePage"));
const EdoOutboxDetailPage = lazy(() => import("./pages/integrations/edo/screens/EdoOutboxDetailPage"));
const EdoSessionGuard = lazy(() => import("./pages/integrations/edo/components/EdoSessionGuard"));
const EdoImportPage = lazy(() => import("./pages/integrations/edo/import/screens/EdoImportPage"));
const EdoImportCandidateMappingPage = lazy(() => import("./pages/integrations/edo/import/screens/EdoImportCandidateMappingPage"));
const FiscalCashRegisterListPage = lazy(() => import("./pages/fiscalCashRegister/screens/FiscalCashRegisterListPage"));
import { fiscalCashRegisterPermissions } from "./pages/fiscalCashRegister/constants/permissions";
const RegulatedObligationSettingsListPage = lazy(() => import("./pages/regulatedObligationSettings/screens/RegulatedObligationSettingsListPage"));
const RegulatedObligationSettingDetailPage = lazy(() => import("./pages/regulatedObligationSettings/screens/RegulatedObligationSettingDetailPage"));
import { regulatedObligationSettingPermissions } from "./pages/regulatedObligationSettings/constants/permissions";
const AccountingPolicyPage = lazy(() => import("./pages/accountingPolicy/screens/AccountingPolicyListPage"));
import { accountingPolicyPermissions } from "./pages/accountingPolicy/constants/permissions";

const settingsPermissions = [
  rolePermissions.view,
  userPermissions.view,
  organizationsPermissions.view,
  counterpartyPermissions.view,
  departmentsPermissions.view,
  branchesPermissions.view,
  chartAccountsPermissions.view,
  settingsBankPermissions.view,
  bankPermissions.view,
  counterpartybankaccountPermissions.view,
  orgBankAccountsPermissions.view,
  positionsPermissions.view,
  productGroupsPermissions.view,
  cashBoxPermissions.view,
  fiscalCashRegisterPermissions.view,
  counterpartyContactPermissions.view,
  warehousePermissions.view,
  purchasePermissions.view,
  pricingConditionPermissions.view,
  saleConditionPermissions.view,
  openingBalancePermissions.view,
  openingInventoryPermissions.view,
  integrationPermissions.view,
  payrollTaxDefinitionPermissions.view,
  payrollComponentPermissions.view,
  contractPermissions.view,
  regulatedObligationSettingPermissions.view,
  accountingPolicyPermissions.view,
];

const withPermission = (
  element: React.ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

const withEimzo = (element: React.ReactElement) => (
  <EimzoProvider
    apiKeys={
      import.meta.env.VITE_EIMZO_DOMAIN && import.meta.env.VITE_EIMZO_API_KEY
        ? [
            import.meta.env.VITE_EIMZO_DOMAIN,
            import.meta.env.VITE_EIMZO_API_KEY,
          ]
        : undefined
    }
  >
    {element}
  </EimzoProvider>
);

const withEdoSession = (
  element: React.ReactElement,
  requireSession = false,
) => (
  <EdoSessionGuard requireSession={requireSession}>{element}</EdoSessionGuard>
);

export const settingsRoutes: RouteObject = {
  path: "settings",
  handle: { title: "settings.title" },
  children: [
    {
      index: true,
      element: withPermission(<SettingsListPage />, settingsPermissions),
    },
    {
      path: "integrations",
      handle: {
        title: "settings.integrations.title",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        withEimzo(withEdoSession(<IntegrationsPage />)),
        integrationPermissions.view,
      ),
    },
    {
      path: "integrations/edo",
      handle: {
        title: "settings.integrations.edo.title",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        withEimzo(withEdoSession(<EdoWorkspacePage />)),
        integrationPermissions.view,
      ),
    },
    {
      path: "integrations/edo/inbox",
      handle: {
        title: "settings.integrations.edo.inbox.title",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        withEimzo(withEdoSession(<EdoInboxPage />, true)),
        integrationPermissions.view,
      ),
    },
    {
      path: "integrations/edo/import",
      handle: {
        title: "settings.integrations.edo.import.title",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        withEimzo(withEdoSession(<EdoImportPage />)),
        integrationPermissions.view,
      ),
    },
    {
      path: "integrations/edo/import/:jobId/candidate/:candidateId",
      handle: {
        title: "settings.integrations.edo.import.title",
        showBack: true,
        backTo: "../../..",
      },
      element: withPermission(
        withEimzo(withEdoSession(<EdoImportCandidateMappingPage />)),
        integrationPermissions.view,
      ),
    },
    {
      path: "integrations/edo/outbox/create",
      handle: {
        title: "settings.integrations.edo.outbox.create",
        showBack: true,
        backTo: "../..",
      },
      element: withPermission(
        withEimzo(withEdoSession(<EdoOutboxCreatePage />, true)),
        integrationPermissions.view,
      ),
    },
    {
      path: "integrations/edo/outbox/:id",
      handle: {
        title: "settings.integrations.edo.outbox.sign",
        showBack: true,
        backTo: "../..",
      },
      element: withPermission(
        withEimzo(withEdoSession(<EdoOutboxDetailPage />, true)),
        integrationPermissions.view,
      ),
    },
    {
      path: "users",
      handle: {
        title: "settings.entities.users",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<UserListPage />, userPermissions.view),
    },
    {
      path: "role",
      handle: { title: "settings.entities.role", showBack: true, backTo: ".." },
      children: [
        {
          index: true,
          element: withPermission(<RoleListPage />, rolePermissions.view),
        },
        {
          path: "add",
          element: withPermission(<RoleAddEditPage />, rolePermissions.create),
          handle: {
            title: "settings.form.createRole",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(<RoleAddEditPage />, rolePermissions.update),
          handle: {
            title: "settings.form.editRole",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "organizations",
      handle: {
        title: "settings.entities.organizations",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <OrganizationListPage />,
        organizationsPermissions.view,
      ),
    },
    {
      path: "counterparty",
      handle: {
        title: "settings.entities.counterparty",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <CounterpartyListPage />,
        counterpartyPermissions.view,
      ),
    },
    {
      path: "departments",
      handle: {
        title: "settings.entities.departments",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <DepartmentListPage />,
        departmentsPermissions.view,
      ),
    },
    {
      path: "branches",
      handle: {
        title: "settings.entities.branches",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<BranchListPage />, branchesPermissions.view),
    },
    {
      path: "chart-accounts",
      handle: {
        title: "settings.entities.chartAccounts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <ChartAccountListPage />,
        chartAccountsPermissions.view,
      ),
    },
    {
      path: "regulated-obligation-settings",
      handle: {
        title: "settings.entities.regulatedObligationSettings",
        showBack: true,
        backTo: "..",
      },
      children: [
        {
          index: true,
          element: withPermission(
            <RegulatedObligationSettingsListPage />,
            regulatedObligationSettingPermissions.view,
          ),
        },
        {
          path: ":id",
          handle: {
            title: "settings.entities.regulatedObligationSettings",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <RegulatedObligationSettingDetailPage />,
            regulatedObligationSettingPermissions.view,
          ),
        },
      ],
    },
    {
      path: "accounting-policy",
      handle: {
        title: "settings.entities.accountingPolicy",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <AccountingPolicyPage />,
        accountingPolicyPermissions.view,
      ),
    },
    {
      path: "document-account-settings",
      handle: {
        title: "settings.entities.documentAccountSettings",
        showBack: true,
        backTo: "..",
      },
      children: [
        {
          index: true,
          element: withPermission(
            <DocumentAccountSettingsListPage />,
            chartAccountsPermissions.view,
          ),
        },
        {
          path: ":documentTypeId",
          handle: {
            title: "settings.entities.documentAccountSettings",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <DocumentAccountSettingsDetailPage />,
            chartAccountsPermissions.view,
          ),
        },
      ],
    },
    {
      path: "opening-balances",
      handle: {
        title: "openingBalance.title",
        showBack: true,
        backTo: "..",
      },
      children: [
        {
          index: true,
          element: withPermission(
            <OpeningBalancePage />,
            openingBalancePermissions.view,
          ),
        },
        {
          path: ":id/accounts/:accountId",
          handle: {
            title: "openingBalance.accountDetail",
            showBack: true,
            backTo: "../../..",
          },
          element: withPermission(
            <OpeningBalanceAccountPage />,
            openingBalancePermissions.view,
          ),
        },
      ],
    },
    {
      path: "banks",
      handle: {
        title: "settings.entities.banks",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<SettingsBankListPage />, [
        settingsBankPermissions.view,
        bankPermissions.view,
      ]),
    },
    {
      path: "counterparty-bank-accounts",
      handle: {
        title: "settings.entities.bankAccounts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <CounterpartyBankAccountListPage />,
        counterpartybankaccountPermissions.view,
      ),
    },
    {
      path: "org-bank-accounts",
      handle: {
        title: "settings.entities.orgBankAccounts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <OrgBankAccountListPage />,
        orgBankAccountsPermissions.view,
      ),
    },
    {
      path: "positions",
      handle: {
        title: "settings.entities.positions",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<PositionListPage />, positionsPermissions.view),
    },
    {
      path: "product-groups",
      handle: {
        title: "settings.entities.productGroups",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <ProductGroupListPage />,
        productGroupsPermissions.view,
      ),
    },
    {
      path: "cash-boxes",
      handle: {
        title: "settings.entities.cashBox",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<CashBoxListPage />, cashBoxPermissions.view),
    },
    {
      path: "fiscal-cash-registers",
      handle: {
        title: "settings.entities.fiscalCashRegisters",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <FiscalCashRegisterListPage />,
        fiscalCashRegisterPermissions.view,
      ),
    },
    {
      path: "counterparty-contacts",
      handle: {
        title: "settings.entities.counterpartyContacts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <CounterpartyContactListPage />,
        counterpartyContactPermissions.view,
      ),
    },
    {
      path: "warehouses",
      handle: {
        title: "settings.entities.warehouse",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<WarehouseListPage />, warehousePermissions.view),
    },
    {
      path: "bank",
      handle: {
        title: "settings.entities.counterpartyContacts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<SettingsBankListPage />, bankPermissions.view),
    },
    {
      path: "payroll-components",
      handle: {
        title: "payroll.components.title",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <PayrollComponentListPage />,
        payrollComponentPermissions.view,
      ),
    },
    {
      path: "payroll-taxes",
      handle: {
        title: "payroll.taxes.title",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <PayrollTaxDefinitionListPage />,
        payrollTaxDefinitionPermissions.view,
      ),
    },
    {
      path: "contract-responsible-persons",
      handle: {
        title: "contract.responsiblePersons.title",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <ContractResponsiblePersonListPage />,
        contractPermissions.view,
      ),
    },
    {
      path: "pricing-conditions",
      handle: {
        title: "settings.entities.pricingConditions",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <PricingConditionListPage />,
        pricingConditionPermissions.view,
      ),
    },
    {
      path: "sale-conditions",
      handle: {
        title: "settings.entities.saleConditions",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <SaleConditionListPage />,
        saleConditionPermissions.view,
      ),
    },
    {
      path: "opening-inventory",
      handle: {
        title: "settings.entities.openingInventory",
        showBack: true,
        backTo: "..",
      },
      children: [
        {
          index: true,
          element: withPermission(
            <OpeningInventoryListPage />,
            openingInventoryPermissions.view,
          ),
        },
        {
          path: "add",
          handle: {
            title: "common.add",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <OpeningInventoryEditorPage />,
            openingInventoryPermissions.create,
          ),
        },
        {
          path: "edit/:id",
          handle: {
            title: "common.edit",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <OpeningInventoryEditorPage />,
            openingInventoryPermissions.update,
          ),
        },
      ],
    },
  ],
};
