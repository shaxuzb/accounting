import { Button, Modal, Table, type TableColumnsType } from "antd";
import { useFormik } from "formik";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { BankStatementCardData } from "../types/type";

interface MissingBankAccountModalProps {
  open: boolean;
  items: BankStatementCardData[];
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
  onClose,
  onApply,
}: MissingBankAccountModalProps) {
  const { t } = useTranslation();
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
    onSubmit: (values, helpers) => {
      const assignments: Record<string, BankInfoAssignment> = {};
      const hasEmpty = rows.some((row) => {
        const rowAssignment = values.assignments[row.formKey] ?? {};

        if (
          row.needsBankAccount &&
          !hasValidNumber(rowAssignment.bankAccountId)
        ) {
          return true;
        }
        if (
          row.needsOperationType &&
          !hasValidNumber(rowAssignment.operationTypeId)
        ) {
          return true;
        }
        if (row.needsCurrency && !hasValidNumber(rowAssignment.currencyId)) {
          return true;
        }

        assignments[row.id] = {
          ...(row.needsBankAccount && rowAssignment.bankAccountId
            ? { bankAccountId: Number(rowAssignment.bankAccountId) }
            : {}),
          ...(row.needsOperationType && rowAssignment.operationTypeId
            ? { operationTypeId: Number(rowAssignment.operationTypeId) }
            : {}),
          ...(row.needsCurrency && rowAssignment.currencyId
            ? { currencyId: Number(rowAssignment.currencyId) }
            : {}),
        };

        return false;
      });

      if (hasEmpty) {
        toast.error(t("bank.messages.selectCompleteBankInfo"));
        return;
      }

      onApply(assignments);
      helpers.resetForm();
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
      >
        {t("common.submit")}
      </Button>
    </Modal>
  );
}
