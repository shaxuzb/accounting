import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Form, Space, Spin } from "antd";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { $axiosPrivate } from "@/services/AxiosService";
import { chartAccountsService } from "@/modules/settings/pages/chartAccounts/api";
import type { ChartAccounts } from "@/modules/settings/pages/chartAccounts/types/type";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { openingBalancePermissions } from "../constants/permissions";
import {
  useGetOpeningBalanceAccount,
  useSaveOpeningBalanceAccount,
} from "../hooks";
import type {
  OpeningBalanceAccountForm,
  OpeningBalanceDetailForm,
} from "../types/form";
import type {
  OpeningBalanceAccountDetail,
  SubkontoTypeOption,
} from "../types/type";
import {
  calculateOpeningBalanceTotals,
  createEmptyOpeningBalanceAccount,
  createEmptyOpeningBalanceDetail,
  mapOpeningBalanceAccountToForm,
  toOpeningBalanceAccountPayload,
} from "../utils/openingBalanceForm";
import OpeningBalanceAccountOverview from "../components/OpeningBalanceAccountOverview";
import OpeningBalanceDetailsTable from "../components/OpeningBalanceDetailsTable";

type SubkontoTypeResponse =
  | SubkontoTypeOption[]
  | {
      items?: SubkontoTypeOption[];
      data?: SubkontoTypeOption[];
      results?: SubkontoTypeOption[];
    };

const normalizeSubkontoTypes = (
  response: SubkontoTypeResponse,
): SubkontoTypeOption[] =>
  Array.isArray(response)
    ? response
    : (response.items ?? response.data ?? response.results ?? []);

const buildSubkontoDefinitions = (
  chartAccount: ChartAccounts | undefined,
  subkontoTypes: SubkontoTypeOption[],
  accountData: OpeningBalanceAccountDetail | undefined,
) => {
  const fromAccount = (chartAccount?.subkontos ?? [])
    .map((definition) => {
      const type = subkontoTypes.find(
        (item) => item.id === definition.subkontoTypeId,
      );
      const responseDefinition = accountData?.details
        ?.flatMap((detail) => detail.subkontos)
        .find((item) => item.subkontoTypeId === definition.subkontoTypeId);
      return {
        id: definition.subkontoTypeId,
        name:
          type?.name ??
          responseDefinition?.subkontoTypeName ??
          `Subkonto #${definition.subkontoTypeId}`,
        code: type?.code ?? responseDefinition?.subkontoTypeCode,
        sortOrder: definition.sortOrder,
        isRequired: definition.isRequired,
      };
    })
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

  if (fromAccount.length) return fromAccount;

  const seen = new Set<number>();
  return (accountData?.details ?? [])
    .flatMap((detail) => detail.subkontos)
    .filter((subkonto) => {
      if (seen.has(subkonto.subkontoTypeId)) return false;
      seen.add(subkonto.subkontoTypeId);
      return true;
    })
    .map((subkonto) => ({
      id: subkonto.subkontoTypeId,
      name: subkonto.subkontoTypeName ?? `Subkonto #${subkonto.subkontoTypeId}`,
      code: subkonto.subkontoTypeCode,
      sortOrder: subkonto.sortOrder,
      isRequired: true,
    }))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
};

export default function OpeningBalanceAccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "", accountId = "" } = useParams<{
    id: string;
    accountId: string;
  }>();
  const isNew = accountId === "new";
  const [emptyAccount] = useState(createEmptyOpeningBalanceAccount);
  const [expandedDetailKey, setExpandedDetailKey] = useState<string | null>(
    emptyAccount.details[0].clientKey,
  );

  const {
    data: accountData,
    isLoading: isAccountLoading,
    isError: isAccountError,
    refetch: refetchAccount,
  } = useGetOpeningBalanceAccount(id, accountId, Boolean(id) && !isNew);
  const saveMutation = useSaveOpeningBalanceAccount(id);

  const initialValues = accountData
    ? mapOpeningBalanceAccountToForm(accountData)
    : emptyAccount;

  const formik = useFormik<OpeningBalanceAccountForm>({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!values.chartAccountId) {
        toast.error(t("openingBalance.validation.accountRequired"));
        return;
      }
      if (!values.details.length) {
        toast.error(t("openingBalance.validation.detailRequired"));
        return;
      }
      if (chartAccount?.isGroup) {
        toast.error(t("openingBalance.validation.groupAccount"));
        return;
      }

      for (let index = 0; index < values.details.length; index += 1) {
        const detail = values.details[index];
        const debit = Number(detail.debitAmount ?? 0);
        const credit = Number(detail.creditAmount ?? 0);
        if ((debit > 0 && credit > 0) || (debit <= 0 && credit <= 0)) {
          toast.error(
            t("openingBalance.validation.singleSide", { row: index + 1 }),
          );
          return;
        }
        if (chartAccount?.isQuantity && Number(detail.quantity ?? 0) <= 0) {
          toast.error(
            t("openingBalance.validation.quantityRequired", {
              row: index + 1,
            }),
          );
          return;
        }
        const missingRequiredSubkonto = subkontoDefinitions.find(
          (definition) =>
            definition.isRequired &&
            !detail.subkontos.some(
              (subkonto) =>
                subkonto.subkontoTypeId === definition.id &&
                Number(subkonto.subkontoId) > 0,
            ),
        );
        if (missingRequiredSubkonto) {
          toast.error(
            t("openingBalance.validation.subkontoRequired", {
              row: index + 1,
              name: missingRequiredSubkonto.name,
            }),
          );
          return;
        }
      }

      try {
        await saveMutation.mutateAsync(toOpeningBalanceAccountPayload(values));
        toast.success(t("openingBalance.messages.accountSaved"));
        navigate("/main/settings/opening-balances");
      } catch (error: unknown) {
        errorHandlers(error);
      }
    },
  });

  const chartAccountId = formik.values.chartAccountId;
  const { data: chartAccount, isLoading: isChartAccountLoading } = useQuery({
    queryKey: ["chart-accounts", "detail", chartAccountId],
    queryFn: () => chartAccountsService.detail(Number(chartAccountId)),
    enabled: Boolean(chartAccountId),
    staleTime: 5 * 60 * 1000,     
  });
  const { data: subkontoTypes } = useQuery({
    queryKey: ["selectlist", selectListEndpoints.subkontoTypes],
    queryFn: async () => {
      const response = await $axiosPrivate.get<SubkontoTypeResponse>(
        selectListEndpoints.subkontoTypes,
      );
      return normalizeSubkontoTypes(response.data);
    },
    enabled: Boolean(chartAccountId),
    staleTime: 5 * 60 * 1000,
  });

  const subkontoDefinitions = buildSubkontoDefinitions(
    chartAccount,
    subkontoTypes ?? [],
    accountData,
  );
  const totals = calculateOpeningBalanceTotals(formik.values.details);

  const updateDetail = (
    clientKey: string,
    changes: Partial<OpeningBalanceDetailForm>,
  ) => {
    formik.setFieldValue(
      "details",
      formik.values.details.map((detail) =>
        detail.clientKey === clientKey ? { ...detail, ...changes } : detail,
      ),
      false,
    );
  };

  const addDetail = () => {
    const detail = createEmptyOpeningBalanceDetail();
    formik.setFieldValue("details", [...formik.values.details, detail], false);
    setExpandedDetailKey(detail.clientKey);
  };

  const removeDetail = (clientKey: string) => {
    const nextDetails = formik.values.details.filter(
      (detail) => detail.clientKey !== clientKey,
    );
    void formik.setFieldValue("details", nextDetails, false);
    if (expandedDetailKey === clientKey) {
      setExpandedDetailKey(nextDetails[0]?.clientKey ?? null);
    }
  };

  if (isAccountLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <div className="space-y-4 pb-6">
        {isAccountError && (
          <Alert
            showIcon
            type="error"
            message={t("openingBalance.messages.accountLoadError")}
            action={
              <Button size="small" onClick={() => void refetchAccount()}>
                {t("common.refresh")}
              </Button>
            }
          />
        )}

        <Card className="border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-secondary-text">
                {t("openingBalance.accountDetail")}
              </div>
              <div className="truncate text-xl font-semibold text-heading">
                {accountData?.chartAccountNumber ||
                  chartAccount?.number ||
                  t("openingBalance.actions.addAccount")}
                {(accountData?.chartAccountName || chartAccount?.name) &&
                  ` — ${accountData?.chartAccountName || chartAccount?.name}`}
              </div>
            </div>
            <Space wrap>
              <Button
                onClick={() => navigate("/main/settings/opening-balances")}
              >
                {t("common.cancel")}
              </Button>
              <PermissionCard permission={openingBalancePermissions.update}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Save className="size-4" />}
                  loading={saveMutation.isPending}
                >
                  {t("common.save")}
                </Button>
              </PermissionCard>
            </Space>
          </div>
        </Card>

        <OpeningBalanceAccountOverview
          debit={totals.debit}
          credit={totals.credit}
          balance={totals.balance}
          balanceSide={totals.balanceSide}
          isLoading={isChartAccountLoading}
          accountSelector={
            <SelectCustom
              formik={formik}
              fieldName="chartAccountId"
              label="openingBalance.fields.account"
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              search
              required
              disabled={!isNew}
              marginBottom="mb-0"
              onChange={() => {
                const detail = createEmptyOpeningBalanceDetail();
                formik.setFieldValue("id", null, false);
                formik.setFieldValue("details", [detail], false);
                setExpandedDetailKey(detail.clientKey);
              }}
            />
          }
        />

        <OpeningBalanceDetailsTable
          details={formik.values.details}
          definitions={subkontoDefinitions}
          expandedDetailKey={expandedDetailKey}
          isQuantity={Boolean(chartAccount?.isQuantity)}
          onAdd={addDetail}
          onChange={updateDetail}
          onChangeSubkontos={(clientKey, subkontos) =>
            updateDetail(clientKey, { subkontos })
          }
          onExpand={setExpandedDetailKey}
          onRemove={removeDetail}
        />
      </div>
    </Form>
  );
}
