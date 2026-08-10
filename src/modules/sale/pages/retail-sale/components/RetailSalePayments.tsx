import InputNumberFormat from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import Card from "@/components/ui/card/Card";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { Button, Input, Table } from "antd";
import type { TableColumnsType } from "antd";
import type { FormikProps } from "formik";
import { Plus, Trash2, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";
import { numberSpacing } from "@/utils/utils";
import type {
  RetailSaleFormValues,
  RetailSalePaymentForm,
} from "../types/form";

interface Props {
  formik: FormikProps<RetailSaleFormValues>;
  disabled?: boolean;
}

const createEmptyPayment = (): RetailSalePaymentForm => ({
  paymentMethodId: null,
  bankTerminalId: null,
  debitAccountId: null,
  amount: null,
  transactionNumber: "",
});

const toNullableId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export default function RetailSalePayments({
  formik,
  disabled = false,
}: Props) {
  const { t } = useTranslation();
  const payments = formik.values.payments;

  const updatePayment = (
    index: number,
    patch: Partial<RetailSalePaymentForm>,
  ) => {
    const next = payments.map((payment, paymentIndex) =>
      paymentIndex === index ? { ...payment, ...patch } : payment,
    );
    void formik.setFieldValue("payments", next, true);
  };

  const columns: TableColumnsType<RetailSalePaymentForm> = [
    {
      title: t("common.rowNumber"),
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: t("retailSale.fields.paymentMethod"),
      minWidth: 180,
      render: (_, payment, index) => (
        <SelectCustom
          path={selectListEndpoints.paymentMethodsSelectList}
          value={payment.paymentMethodId}
          marginBottom="mb-0"
          disabled={disabled}
          search
          required
          onChange={(value) =>
            updatePayment(index, {
              paymentMethodId: toNullableId(value),
              bankTerminalId: null,
            })
          }
        />
      ),
    },
    {
      title: t("retailSale.fields.bankTerminal"),
      minWidth: 180,
      render: (_, payment, index) => (
        <SelectCustom
          path={selectListEndpoints.bankTerminalsSelectList}
          value={payment.bankTerminalId}
          marginBottom="mb-0"
          disabled={disabled}
          clearable
          optional
          search
          onChange={(value) =>
            updatePayment(index, { bankTerminalId: toNullableId(value) })
          }
        />
      ),
    },
    {
      title: t("retailSale.fields.debitAccount"),
      minWidth: 220,
      render: (_, payment, index) => (
        <SelectCustom
          path={selectListEndpoints.chartAccountsSelectList}
          value={payment.debitAccountId}
          displayConfig={chartAccountSelectDisplayConfig}
          marginBottom="mb-0"
          disabled={disabled}
          search
          required
          onChange={(value) =>
            updatePayment(index, { debitAccountId: toNullableId(value) })
          }
        />
      ),
    },
    {
      title: t("retailSale.fields.amount"),
      width: 170,
      render: (_, payment, index) => (
        <InputNumberFormat
          standalone
          value={payment.amount}
          min={0}
          precision={2}
          emptyZero
          disabled={disabled}
          onValueChange={(amount) => updatePayment(index, { amount })}
        />
      ),
    },
    {
      title: t("retailSale.fields.transactionNumber"),
      minWidth: 180,
      render: (_, payment, index) => (
        <Input
          value={payment.transactionNumber}
          disabled={disabled}
          onChange={(event) =>
            updatePayment(index, { transactionNumber: event.target.value })
          }
        />
      ),
    },
    {
      title: t("common.actions"),
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <Button
          danger
          type="text"
          icon={<Trash2 className="size-4" />}
          disabled={disabled}
          onClick={() => {
            void formik.setFieldValue(
              "payments",
              payments.filter((_, paymentIndex) => paymentIndex !== index),
              true,
            );
          }}
        />
      ),
    },
  ];

  const total = payments.reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0,
  );

  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
        <div className="flex items-center gap-2 font-semibold">
          <WalletCards className="size-5 text-primary" />
          {t("retailSale.payments.title")}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-secondary-text">
            {t("retailSale.payments.total")}: {numberSpacing(total)}
          </span>
          <Button
            icon={<Plus className="size-4" />}
            disabled={disabled}
            onClick={() => {
              void formik.setFieldValue(
                "payments",
                [...payments, createEmptyPayment()],
                false,
              );
            }}
          >
            {t("retailSale.payments.add")}
          </Button>
        </div>
      </div>
      <Table<RetailSalePaymentForm>
        rowKey={(_, index) => String(index)}
        columns={columns}
        dataSource={payments}
        pagination={false}
        locale={{ emptyText: t("retailSale.payments.empty") }}
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}
