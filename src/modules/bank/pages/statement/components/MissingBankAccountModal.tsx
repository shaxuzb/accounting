import { Button, Input, Modal, Select, Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { BankStatementCardData } from "../types/type";

interface SelectOption {
  id: number;
  name: string;
}

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

const hasValidNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0;
};

export default function MissingBankAccountModal({
  open,
  items,
  onClose,
  onApply,
}: MissingBankAccountModalProps) {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState<
    Record<string, BankInfoAssignment>
  >({});

  const { data: bankAccountOptions = [], isFetching } = useQuery<
    SelectOption[]
  >({
    queryKey: ["selectlist", "bank-import-bank-accounts"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectOption[]>(
        selectListEndpoints.orgBankAccountsSelectList,
      );
      return data;
    },
    enabled: open,
  });
  const { data: operationTypeOptions = [], isFetching: isOperationTypesLoading } =
    useQuery<SelectOption[]>({
      queryKey: ["selectlist", "bank-import-operation-types"],
      queryFn: async () => {
        const { data } = await $axiosPrivate.get<SelectOption[]>(
          selectListEndpoints.bankOperationTypesSelectList,
        );
        return data;
      },
      enabled: open,
    });
  const { data: currencyOptions = [], isFetching: isCurrenciesLoading } =
    useQuery<SelectOption[]>({
      queryKey: ["selectlist", "bank-import-currencies"],
      queryFn: async () => {
        const { data } = await $axiosPrivate.get<SelectOption[]>(
          selectListEndpoints.currenciesSelectList,
        );
        return data;
      },
      enabled: open,
    });

  const handleClose = () => {
    setAssignments({});
    onClose();
  };

  const handleSubmit = () => {
    const hasEmpty = items.some((item) => {
      const assignment = assignments[item.id];
      const needsOperationType =
        !hasValidNumber(item.operationTypeId) &&
        item.transactions.some(
          (transaction) => !hasValidNumber(transaction.operationTypeId),
        );
      const needsCurrency =
        !hasValidNumber(item.currencyId) &&
        item.transactions.some(
          (transaction) => !hasValidNumber(transaction.currencyId),
        );

      return (
        (!hasValidNumber(item.bankAccountId) && !assignment?.bankAccountId) ||
        (needsOperationType && !assignment?.operationTypeId) ||
        (needsCurrency && !assignment?.currencyId)
      );
    });

    if (hasEmpty) {
      toast.error("Bank ma'lumotlarini to'liq tanlang");
      return;
    }

    onApply(assignments);
    setAssignments({});
  };

  return (
    <Modal
      title="Topilmagan bank ma'lumotlarini belgilash"
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={900}
      destroyOnHidden
    >
      <Table
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={items}
        columns={[
          {
            title: "Card",
            dataIndex: "title",
            width: 220,
          },
          {
            title: t("bank.fields.accountNumber"),
            dataIndex: "accountNumber",
            width: 180,
            render: (value) => value || "-",
          },
          {
            title: t("bank.fields.bankAccount"),
            dataIndex: "bankAccountId",
            render: (_, record) => (
              hasValidNumber(record.bankAccountId) ? (
                <Input disabled value={record.bankAccountId} />
              ) : (
                <Select
                  showSearch
                  className="w-full"
                  loading={isFetching}
                  placeholder={t("bank.fields.bankAccount")}
                  value={assignments[record.id]?.bankAccountId}
                  optionFilterProp="label"
                  options={bankAccountOptions.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  onChange={(value) =>
                    setAssignments((prev) => ({
                      ...prev,
                      [record.id]: {
                        ...prev[record.id],
                        bankAccountId: Number(value),
                      },
                    }))
                  }
                />
              )
            ),
          },
          {
            title: t("bank.fields.operationType"),
            dataIndex: "operationTypeId",
            width: 200,
            render: (_, record) =>
              hasValidNumber(record.operationTypeId) ? (
                <Input disabled value={record.operationTypeId ?? ""} />
              ) : (
                <Select
                  showSearch
                  className="w-full"
                  loading={isOperationTypesLoading}
                  placeholder={t("bank.fields.operationType")}
                  value={assignments[record.id]?.operationTypeId}
                  optionFilterProp="label"
                  options={operationTypeOptions.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  onChange={(value) =>
                    setAssignments((prev) => ({
                      ...prev,
                      [record.id]: {
                        ...prev[record.id],
                        operationTypeId: Number(value),
                      },
                    }))
                  }
                />
              ),
          },
          {
            title: t("settings.fields.currency"),
            dataIndex: "currencyId",
            width: 180,
            render: (_, record) =>
              hasValidNumber(record.currencyId) ? (
                <Input disabled value={record.currencyId ?? ""} />
              ) : (
                <Select
                  showSearch
                  className="w-full"
                  loading={isCurrenciesLoading}
                  placeholder={t("settings.fields.currency")}
                  value={assignments[record.id]?.currencyId}
                  optionFilterProp="label"
                  options={currencyOptions.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  onChange={(value) =>
                    setAssignments((prev) => ({
                      ...prev,
                      [record.id]: {
                        ...prev[record.id],
                        currencyId: Number(value),
                      },
                    }))
                  }
                />
              ),
          },
        ]}
        scroll={{ y: 360, x: "max-content" }}
      />
      <Button type="primary" block className="mt-3" onClick={handleSubmit}>
        {t("common.submit")}
      </Button>
    </Modal>
  );
}
