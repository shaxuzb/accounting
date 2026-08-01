import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Checkbox, Empty, Select, Spin, Tag } from "antd";
import { BookOpen, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountOptionLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useGetDetailDocumentAccountSettings,
  useSaveDocumentAccountSettings,
} from "../hooks";
import type {
  DocumentAccountSettingAccount,
  DocumentAccountSettingRole,
  DocumentAccountSettingsBatchPayload,
  DocumentAccountSettingsDetail,
  DocumentAccountChartAccount,
} from "../types/type";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

type ChartAccountResponse =
  | DocumentAccountChartAccount[]
  | { items?: DocumentAccountChartAccount[]; data?: DocumentAccountChartAccount[] };

const normalizeRoles = (
  detail?: DocumentAccountSettingsDetail,
): DocumentAccountSettingRole[] =>
  (detail?.accountSettings ?? []).map((role) => {
    const accounts = (role.accounts ?? []).map((account, index) => ({
      ...account,
      canChange: true,
      sortOrder: account.sortOrder || index + 1,
    }));

    if (accounts.length && !accounts.some((account) => account.isDefault)) {
      accounts[0] = { ...accounts[0], isDefault: true };
    }

    return { ...role, accounts };
  });

const accountTitle = (
  account: DocumentAccountSettingAccount,
  options: DocumentAccountChartAccount[],
  t: TFunction,
) => {
  const option = options.find((item) => item.id === account.chartAccountId);
  if (option) return chartAccountOptionLabel(option);

  return (
    [account.chartAccountNumber, account.chartAccountName]
      .filter(Boolean)
      .join(" - ") ||
    t("settings.documentAccounts.accountWithId", {
      id: account.chartAccountId,
    })
  );
};

function AccountRoleCard({
  role,
  chartAccounts,
  chartAccountsLoading,
  onAdd,
  onRemove,
  onSetDefault,
}: {
  role: DocumentAccountSettingRole;
  chartAccounts: DocumentAccountChartAccount[];
  chartAccountsLoading: boolean;
  onAdd: (roleId: number, chartAccountId: number) => void;
  onRemove: (roleId: number, chartAccountId: number) => void;
  onSetDefault: (roleId: number, chartAccountId: number) => void;
}) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const selectedIds = new Set(
    role.accounts.map((account) => account.chartAccountId),
  );
  const options = chartAccounts
    .filter((account) => !selectedIds.has(account.id))
    .map((account) => ({
      value: account.id,
      label: chartAccountOptionLabel(account),
    }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {role.documentAccountRoleName}
            </h3>
            {role.isRequired ? (
              <Tag color="blue">{t("common.required")}</Tag>
            ) : (
              <Tag>{t("common.optional")}</Tag>
            )}
          </div>
          {role.documentAccountRoleDescription && (
            <p className="mt-1 text-xs text-gray-500">
              {role.documentAccountRoleDescription}
            </p>
          )}
        </div>
        <Button
          type="dashed"
          icon={<Plus className="size-4" />}
          onClick={() => setIsAdding((value) => !value)}
        >
          {t("settings.documentAccounts.addAccount")}
        </Button>
      </div>

      {isAdding && (
        <div className="border-b border-dashed border-blue-200 bg-blue-50/40 px-4 py-3">
          <Select
            autoFocus
            showSearch
            className="w-full"
            loading={chartAccountsLoading}
            placeholder={t("settings.documentAccounts.selectFromManual")}
            options={options}
            onChange={(value: number) => {
              onAdd(role.documentAccountTypeRoleId, value);
              setIsAdding(false);
            }}
          />
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {role.accounts.length ? (
          role.accounts.map((account) => (
            <div
              key={`${role.documentAccountTypeRoleId}-${account.chartAccountId}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <BookOpen className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900">
                  {accountTitle(account, chartAccounts, t)}
                </div>
                <div className="text-xs text-gray-500">
                  {account.isDefault
                    ? t("settings.documentAccounts.defaultAccount")
                    : t("settings.documentAccounts.additionalAccount")}
                </div>
              </div>
              <Checkbox
                checked={account.isDefault}
                onChange={() =>
                  onSetDefault(
                    role.documentAccountTypeRoleId,
                    account.chartAccountId,
                  )
                }
              >
                {t("settings.documentAccounts.defaultAccount")}
              </Checkbox>
              <Button
                type="text"
                danger
                icon={<Trash2 className="size-4" />}
                aria-label={t("settings.documentAccounts.removeAccount")}
                onClick={() =>
                  onRemove(
                    role.documentAccountTypeRoleId,
                    account.chartAccountId,
                  )
                }
              />
            </div>
          ))
        ) : (
          <div className="px-4 py-7">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("settings.documentAccounts.noAccount")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentAccountSettingsDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { documentTypeId = "" } = useParams<{ documentTypeId: string }>();
  const { data, isLoading, isFetching } =
    useGetDetailDocumentAccountSettings(documentTypeId);
  const saveMutation = useSaveDocumentAccountSettings();
  const [draftRoles, setDraftRoles] = useState<
    DocumentAccountSettingRole[] | null
  >(null);
  const { data: chartAccounts = [], isLoading: chartAccountsLoading } =
    useQuery({
      queryKey: ["selectlist", selectListEndpoints.chartAccountsSelectList],
      queryFn: async () => {
        const response = await $axiosPrivate.get<ChartAccountResponse>(
          selectListEndpoints.chartAccountsSelectList,
        );
        const payload = response.data;
        return Array.isArray(payload)
          ? payload
          : (payload.items ?? payload.data ?? []);
      },
    });

  const roles = draftRoles ?? normalizeRoles(data);
  const debitRoles = useMemo(
    () => roles.filter((role) => role.accountSide.toLowerCase() === "debit"),
    [roles],
  );
  const creditRoles = useMemo(
    () => roles.filter((role) => role.accountSide.toLowerCase() === "credit"),
    [roles],
  );

  const updateRole = (
    roleId: number,
    updater: (role: DocumentAccountSettingRole) => DocumentAccountSettingRole,
  ) => {
    setDraftRoles((current) =>
      (current ?? normalizeRoles(data)).map((role) =>
        role.documentAccountTypeRoleId === roleId ? updater(role) : role,
      ),
    );
  };

  const handleAdd = (roleId: number, chartAccountId: number) => {
    updateRole(roleId, (role) => {
      if (
        role.accounts.some(
          (account) => account.chartAccountId === chartAccountId,
        )
      ) {
        return role;
      }

      return {
        ...role,
        accounts: [
          ...role.accounts,
          {
            chartAccountId,
            isDefault: role.accounts.length === 0,
            canChange: true,
            sortOrder: role.accounts.length + 1,
          },
        ],
      };
    });
  };

  const handleRemove = (roleId: number, chartAccountId: number) => {
    updateRole(roleId, (role) => {
      const accounts = role.accounts.filter(
        (account) => account.chartAccountId !== chartAccountId,
      );
      if (accounts.length && !accounts.some((account) => account.isDefault)) {
        accounts[0] = { ...accounts[0], isDefault: true };
      }
      return { ...role, accounts };
    });
  };

  const handleSetDefault = (roleId: number, chartAccountId: number) => {
    updateRole(roleId, (role) => ({
      ...role,
      accounts: role.accounts.map((account) => ({
        ...account,
        isDefault: account.chartAccountId === chartAccountId,
      })),
    }));
  };

  const handleSave = async () => {
    const payload: DocumentAccountSettingsBatchPayload = {
      items: roles.map((role) => ({
        documentAccountTypeRoleId: role.documentAccountTypeRoleId,
        accounts: role.accounts.map((account, index) => ({
          chartAccountId: account.chartAccountId,
          isDefault: account.isDefault,
          canChange: true,
          sortOrder: index + 1,
        })),
      })),
    };

    try {
      await saveMutation.mutateAsync(payload);
      setDraftRoles(null);
      toast.success(t("settings.documentAccounts.saved"));
      navigate(-1);
    } catch (error: unknown) {
      errorHandlers(error);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const renderRoles = (
    side: "debit" | "credit",
    sideRoles: DocumentAccountSettingRole[],
  ) => (
    <Card
      title={
        <div className="flex items-center gap-2 m-2">
          <span
            className={`flex size-9 items-center justify-center rounded-lg ${
              side === "debit"
                ? "bg-blue-50 text-blue-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            <BookOpen className="size-5" />
          </span>
          <span>
            {t(
              side === "debit"
                ? "openingBalance.fields.debit"
                : "openingBalance.fields.credit",
            )}
          </span>
        </div>
      }
      className="h-full! border-gray-200! shadow-sm"
      styles={{ body: { padding: 16 } }}
    >
      <div className="space-y-4">
        {sideRoles.length ? (
          sideRoles.map((role) => (
            <AccountRoleCard
              key={role.documentAccountTypeRoleId}
              role={role}
              chartAccounts={chartAccounts}
              chartAccountsLoading={chartAccountsLoading}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onSetDefault={handleSetDefault}
            />
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("settings.documentAccounts.noRole")}
          />
        )}
      </div>
    </Card>
  );

  return (
    <div className="w-full pb-6">
      <Card className="mb-4 overflow-hidden border-gray-200! p-0! shadow-sm">
        <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-[minmax(260px,30%)_minmax(0,1fr)_154px] md:divide-x md:divide-y-0">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500">
                {t("settings.documentAccounts.documentType")}
              </div>
              <div className="truncate font-semibold text-gray-900">
                {data.documentTypeName}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.42fr)] sm:items-center">
            <div className="min-w-0">
              <div className="text-xs text-gray-500">
                {t("settings.fields.description")}
              </div>
              <div className="truncate text-sm font-medium text-gray-900">
                {data.documentTypeDescription ||
                  t("settings.documentAccounts.assignDescription")}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500">
                {t("settings.fields.code")}
              </div>
              <div className="truncate text-sm font-medium text-gray-900">
                {data.documentTypeCode}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end px-4 py-4">
            <Button
              type="primary"
              size="large"
              icon={<Save className="size-4" />}
              loading={saveMutation.isPending || isFetching}
              onClick={() => handleSave()}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2 mt-5">
        {renderRoles("debit", debitRoles)}
        {renderRoles("credit", creditRoles)}
      </div>
    </div>
  );
}
