import * as Yup from "yup";
import type { TFunction } from "i18next";

const requiredId = (message: string) =>
  Yup.number()
    .nullable()
    .required(message)
    .moreThan(0, message);

export const saleDocSchema = (t: TFunction, isEdit = false) =>
  Yup.object({
    docDate: Yup.string().required(t("sale.messages.dateRequired")),
    counterpartyId: requiredId(t("sale.messages.selectCounterparty")),
    contractId: requiredId(t("sale.messages.selectContract")),
    warehouseId: requiredId(t("sale.messages.selectWarehouse")),
    currencyId: requiredId(t("sale.messages.selectCurrency")),
    customerAccountId: isEdit
      ? Yup.number().nullable()
      : requiredId(t("sale.messages.selectCustomerAccount")),
    vatAccountId: isEdit
      ? Yup.number().nullable()
      : requiredId(t("sale.messages.selectVatAccount")),
    comment: Yup.string().trim().default(""),
  });

export const saleDocLinesSchema = (t: TFunction, isEdit = false) =>
  Yup.array()
    .of(
      Yup.object({
        productId: requiredId(t("sale.messages.selectProduct")),
        quantity: requiredId(t("sale.messages.enterQuantity")),
        unitId: requiredId(t("sale.messages.selectUnit")),
        inventoryAccountId: isEdit
          ? Yup.number().nullable()
          : requiredId(t("sale.messages.selectInventoryAccount")),
        incomeAccountId: isEdit
          ? Yup.number().nullable()
          : requiredId(t("sale.messages.selectIncomeAccount")),
        costAccountId: isEdit
          ? Yup.number().nullable()
          : requiredId(t("sale.messages.selectCostAccount")),
      }),
    )
    .min(1, t("sale.messages.atLeastOneProduct"))
    .required(t("sale.messages.atLeastOneProduct"));
