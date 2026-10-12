import * as yup from "yup";
import type { TFunction } from "i18next";

// OKOF classifies fixed assets: an intangible asset has none
const assetSchema = (t: TFunction, intangible: boolean) =>
  yup.object({
    inventoryNumber: yup.string().trim().required(t("fa.validation.inventoryNumberRequired")),
    name: yup.string().trim().required(t("fa.validation.nameRequired")),
    faGroupId: yup.number().nullable().required(t("fa.validation.groupRequired")),
    okofId: intangible
      ? yup.number().nullable()
      : yup.number().nullable().required(t("fa.validation.okofRequired")),
    initialCost: yup.number().nullable().min(0, t("fa.validation.initialCostNonNegative")).required(t("fa.validation.initialCostRequired")),
    assetAccountId: yup.number().nullable().required(t("fa.validation.assetAccountRequired")),
  });

const lineSchema = (t: TFunction, vatPayer: boolean, intangible: boolean) =>
  yup.object({
    name: yup.string().trim().required(t("fa.validation.nameRequired")),
    quantity: yup.number().integer().min(1, t("fa.validation.quantityMin")).required(t("fa.validation.quantityRequired")),
    price: yup.number().min(0, t("fa.validation.nonNegative")).required(t("fa.validation.priceRequired")),
    vatRateId: yup.number().nullable(),
    capitalInvestmentAccountId: yup.number().nullable().required(t("fa.validation.capitalInvestmentAccountRequired")),
    vatAccountId: yup.number().nullable().when("vatRateId", {
      // a non-payer puts the VAT into the asset's cost: no VAT account
      is: (value: unknown) => vatPayer && Boolean(value),
      then: (schema) => schema.required(t("fa.validation.vatAccountRequired")),
      otherwise: (schema) => schema.nullable(),
    }),
    assets: yup.array().of(assetSchema(t, intangible)).min(1, t("fa.validation.atLeastOneAsset")).required(t("fa.validation.atLeastOneAsset")),
  }).test("asset-count", t("fa.validation.assetQuantityMismatch"), (line) =>
    Boolean(line && line.assets?.length === Number(line.quantity)),
  );

export const faReceiptSchema = (t: TFunction, vatPayer = true) =>
  yup.lazy((values: { assetKindId?: number }) => receiptSchema(t, vatPayer, values?.assetKindId === 2));

const receiptSchema = (t: TFunction, vatPayer: boolean, intangible: boolean) =>
  yup.object({
    docDate: yup.string().required(t("fa.validation.dateRequired")),
    // a surplus found at an inventory has no supplier (Dt 08 Kt 9390)
    counterpartyId: yup.number().nullable().when("receiptTypeId", {
      is: (value: unknown) => Number(value) === 4,
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.required(t("fa.validation.counterpartyRequired")),
    }),
    currencyId: yup.number().nullable().required(t("fa.validation.currencyRequired")),
    receiptTypeId: yup.number().nullable().required(t("fa.validation.receiptTypeRequired")),
    supplierAccountId: yup.number().nullable().required(t("fa.validation.supplierAccountRequired")),
    lines: yup.array().of(lineSchema(t, vatPayer, intangible)).min(1, t("fa.validation.atLeastOneLine")).required(t("fa.validation.atLeastOneLine")),
  });
