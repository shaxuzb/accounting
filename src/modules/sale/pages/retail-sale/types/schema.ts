import type { TFunction } from "i18next";
import * as Yup from "yup";

const requiredId = (message: string) =>
  Yup.number().nullable().required(message).moreThan(0, message);

export const retailSaleSchema = (t: TFunction) =>
  Yup.object({
    docDate: Yup.string().required(t("retailSale.messages.dateRequired")),
    warehouseId: requiredId(t("retailSale.messages.warehouseRequired")),
    cashRegisterId: requiredId(
      t("retailSale.messages.cashRegisterRequired"),
    ),
    currencyId: requiredId(t("retailSale.messages.currencyRequired")),
    payments: Yup.array().of(
      Yup.object({
        paymentMethodId: requiredId(
          t("retailSale.messages.paymentMethodRequired"),
        ),
        debitAccountId: requiredId(
          t("retailSale.messages.debitAccountRequired"),
        ),
        amount: Yup.number()
          .nullable()
          .required(t("retailSale.messages.paymentAmountRequired"))
          .moreThan(0, t("retailSale.messages.paymentAmountRequired")),
        paymentAcceptancePointId: Yup.number()
          .nullable()
          .test(
            "payment-acceptance-point-rule",
            t("retailSale.messages.paymentAcceptancePointRequired"),
            function (value) {
              const method = `${this.parent.paymentMethodCode ?? ""} ${this.parent.paymentMethodName ?? ""}`.toUpperCase();
              if (method.includes("CASH") || method.includes("NAQD") || method.includes("НАЛИЧ")) return value == null;
              return Number(value) > 0;
            },
          ),
      }),
    ),
  });
