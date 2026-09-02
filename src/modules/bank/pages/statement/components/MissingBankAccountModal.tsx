import { Button, Modal, Table, type TableColumnsType } from "antd";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import SelectCustom from "@/components/fields/SelectCustom";
import { useAppSelector } from "@/store/hooks";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useCreateOrgBankAccounts } from "@/modules/settings/pages/orgBankAccounts/hooks";
import type { BankStatementCardData } from "../types/type";
import {
  buildMissingOrgBankAccountPayload,
  getBankAccountIdFromResponse,
  normalizeBankAccountNumber,
} from "../utils/bankImportRules";

interface MissingBankAccountModalProps {
  open: boolean;
  items: BankStatementCardData[];
  bankIdFallback?: number | null;
  onClose: () => void;
  onApply: (assignments: Record<string, BankInfoAssignment>) => void;
}

export interface BankInfoAssignment {
  bankAccountId?: number;
  operationTypeId?: number;
  currencyId?: number;
}

interface MissingBankInfoForm {
  assignments: Record<string, BankInfoAssignment>;
}

interface MissingBankInfoRow extends BankStatementCardData {
  formKey: string;
  needsBankAccount: boolean;
  needsOperationType: boolean;
  needsCurrency: boolean;
}

const hasValidNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0;
};

const getFieldName = (
  row: MissingBankInfoRow,
  fieldName: keyof BankInfoAssignment,
) => `assignments.${row.formKey}.${fieldName}`;

export default function MissingBankAccountModal({
  open,
  items,
  bankIdFallback,
  onClose,
  onApply,
}: MissingBankAccountModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const organizationId = useAppSelector((state) => state.organization.id);
  const createOrgBankAccount = useCreateOrgBankAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rows = useMemo<MissingBankInfoRow[]>(
    () =>
      items.map((item, index) => ({
        ...item,
        formKey: `row_${index}`,
        needsBankAccount: !hasValidNumber(item.bankAccountId),
        needsOperationType:
          !hasValidNumber(item.operationTypeId) &&
          item.transactions.some(
            (transaction) => !hasValidNumber(transaction.operationTypeId),
          ),
        needsCurrency:
          !hasValidNumber(item.currencyId) &&
          item.transactions.some(
            (transaction) => !hasValidNumber(transaction.currencyId),
          ),
      })),
    [items],
  );
  const formik = useFormik<MissingBankInfoForm>({
    initialValues: { assignments: {} },
    onSubmit: async (values, helpers) => {
      const assignments: Record<string, BankInfoAssignment> = {};
      const hasEmpty = rows.some((row) => {
        const rowAssignment = values.assignments[row.formKey] ?? {};

        if (
          row.needsOperationType &&
          !hasValidNumber(rowAssignment.operationTypeId)
        ) {
          return true;
        }
        if (row.needsCurrency && !hasValidNumber(rowAssignment.currencyId)) {
          return true;
        }

        return false;
      });

      if (hasEmpty) {
        toast.error(t("bank.messages.selectCompleteBankInfo"));
        return;
      }

      setIsSubmitting(true);
      try {
        const createdAccountIds = new Map<string, number>();
        let createdAccountCount = 0;

        for (const row of rows) {
          const rowAssignment = values.assignments[row.formKey] ?? {};
          let bankAccountId = hasValidNumber(rowAssignment.bankAccountId)
            ? Number(rowAssignment.bankAccountId)
            : hasValidNumber(row.bankAccountId)
              ? Number(row.bankAccountId)
              : null;

          if (!bankAccountId && row.needsBankAccount) {
            const currencyId =
              rowAssignment.currencyId ??
              row.currencyId ??
              row.transactions.find((transaction) =>
                hasValidNumber(transaction.currencyId),
              )?.currencyId;
            const payload = buildMissingOrgBankAccountPayload(
              { ...row, bankId: row.bankId ?? bankIdFallback },
              organizationId,
              currencyId,
            );

            if (!payload) {
              toast.error(t("bank.messages.selectCompleteBankInfo"));
              return;
            }

            const accountKey = [
              payload.organizationId,
              payload.bankId,
              payload.bankBranchId ?? "",
              normalizeBankAccountNumber(payload.accountNumber),
              payload.currencyId,
            ].join(":");
            const cachedAccountId = createdAccountIds.get(accountKey);

            if (cachedAccountId) {
              bankAccountId = cachedAccountId;
            } else {
              const response = await createOrgBankAccount.mutateAsync(payload);
              const createdAccountId = getBankAccountIdFromResponse(response);

              if (!createdAccountId) {
                toast.error(t("bank.messages.selectCompleteBankInfo"));
                return;
              }

              createdAccountIds.set(accountKey, createdAccountId);
              bankAccountId = createdAccountId;
              createdAccountCount += 1;
            }
          }

          assignments[row.id] = {
            ...(bankAccountId ? { bankAccountId } : {}),
            ...(row.needsOperationType && rowAssignment.operationTypeId
              ? { operationTypeId: Number(rowAssignment.operationTypeId) }
              : {}),
            ...(row.needsCurrency && rowAssignment.currencyId
              ? { currencyId: Number(rowAssignment.currencyId) }
              : {}),
          };
        }

        if (createdAccountCount > 0) {
          invalidateSelectListQuery(
            queryClient,
            "bankAccountId",
            selectListEndpoints.orgBankAccountsSelectList,
          );
          toast.success(t("bank.messages.bankAccountsCreated"));
        }

        onApply(assignments);
        helpers.resetForm();
      } catch (error) {
        errorHandlers(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  const hasBankAccountColumn = rows.some((row) => row.needsBankAccount);
  const hasOperationTypeColumn = rows.some((row) => row.needsOperationType);
  const hasCurrencyColumn = rows.some((row) => row.needsCurrency);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const columns = useMemo<TableColumnsType<MissingBankInfoRow>>(() => {
    const result: TableColumnsType<MissingBankInfoRow> = [
      {
        title: t("bank.fields.card"),
        dataIndex: "title",
        width: 220,
      },
      {
        title: t("bank.fields.accountNumber"),
        dataIndex: "accountNumber",
        width: 180,
        render: (value) => value || "-",
      },
    ];

    if (hasBankAccountColumn) {
      result.push({
        title: t("bank.fields.bankAccount"),
        dataIndex: "bankAccountId",
        width: 260,
        render: (_, record) =>
          record.needsBankAccount ? (
            <SelectCustom
              formik={formik}
              fieldName={getFieldName(record, "bankAccountId")}
              path={selectListEndpoints.orgBankAccountsSelectList}
              placeholder="bank.fields.bankAccount"
              marginBottom="mb-0"
              search
              enabled={open}
            />
          ) : null,
      });
    }

    if (hasOperationTypeColumn) {
      result.push({
        title: t("bank.fields.operationType"),
        dataIndex: "operationTypeId",
        width: 240,
        render: (_, record) =>
          record.needsOperationType ? (
            <SelectCustom
              formik={formik}
              fieldName={getFieldName(record, "operationTypeId")}
              path={selectListEndpoints.bankOperationTypesSelectList}
              placeholder="bank.fields.operationType"
              marginBottom="mb-0"
              search
              enabled={open}
            />
          ) : null,
      });
    }

    if (hasCurrencyColumn) {
      result.push({
        title: t("settings.fields.currency"),
        dataIndex: "currencyId",
        width: 220,
        render: (_, record) =>
          record.needsCurrency ? (
            <SelectCustom
              formik={formik}
              fieldName={getFieldName(record, "currencyId")}
              path={selectListEndpoints.currenciesSelectList}
              placeholder="settings.fields.currency"
              marginBottom="mb-0"
              search
              enabled={open}
            />
          ) : null,
      });
    }

    return result;
  }, [
    formik,
    hasBankAccountColumn,
    hasCurrencyColumn,
    hasOperationTypeColumn,
    open,
    t,
  ]);

  return (
    <Modal maskClosable={false}
      title={t("bank.import.assignMissingBankInfo")}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={1000}
      destroyOnHidden
    >
      <Table<MissingBankInfoRow>
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={rows}
        columns={columns}
        scroll={{ y: 360, x: "max-content" }}
      />
      <Button
        type="primary"
        block
        className="mt-3"
        onClick={() => formik.handleSubmit()}
        size="large"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {t("common.submit")}
      </Button>
    </Modal>
  );
}
