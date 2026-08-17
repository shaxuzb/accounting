import * as yup from "yup";
import type { TFunction } from "i18next";

const assetSchema = (t: TFunction) =>
  yup.object({
    inventoryNumber: yup.string().trim().required(t("fa.validation.inventoryNumberRequired")),
    name: yup.string().trim().required(t("fa.validation.nameRequired")),
    faGroupId: yup.number().nullable().required(t("fa.validation.groupRequired")),
    okofId: yup.number().nullable().required(t("fa.validation.okofRequired")),
    initialCost: yup.number().nullable().min(0, t("fa.validation.initialCostNonNegative")).required(t("fa.validation.initialCostRequired")),
    assetAccountId: yup.number().nullable().required(t("fa.validation.assetAccountRequired")),
  });

const lineSchema = (t: TFunction) =>
  yup.object({
    name: yup.string().trim().required(t("fa.validation.nameRequired")),
    quantity: yup.number().integer().min(1, t("fa.validation.quantityMin")).required(t("fa.validation.quantityRequired")),
    price: yup.number().min(0, t("fa.validation.nonNegative")).required(t("fa.validation.priceRequired")),
    vatRateId: yup.number().nullable(),
    capitalInvestmentAccountId: yup.number().nullable().required(t("fa.validation.capitalInvestmentAccountRequired")),
    vatAccountId: yup.number().nullable().when("vatRateId", {
      is: (value: unknown) => Boolean(value),
      then: (schema) => schema.required(t("fa.validation.vatAccountRequired")),
      otherwise: (schema) => schema.nullable(),
    }),
    assets: yup.array().of(assetSchema(t)).min(1, t("fa.validation.atLeastOneAsset")).required(t("fa.validation.atLeastOneAsset")),
  }).test("asset-count", t("fa.validation.assetQuantityMismatch"), (line) =>
    Boolean(line && line.assets?.length === Number(line.quantity)),
  );

export const faReceiptSchema = (t: TFunction) =>
  yup.object({
    docDate: yup.string().required(t("fa.validation.dateRequired")),
    counterpartyId: yup.number().nullable().required(t("fa.validation.counterpartyRequired")),
    currencyId: yup.number().nullable().required(t("fa.validation.currencyRequired")),
    receiptTypeId: yup.number().nullable().required(t("fa.validation.receiptTypeRequired")),
    supplierAccountId: yup.number().nullable().required(t("fa.validation.supplierAccountRequired")),
    lines: yup.array().of(lineSchema(t)).min(1, t("fa.validation.atLeastOneLine")).required(t("fa.validation.atLeastOneLine")),
  });
