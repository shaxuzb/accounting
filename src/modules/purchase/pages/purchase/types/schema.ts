import * as Yup from "yup";
import type { PurchaseImportForm } from "./form";
import type { PurchaseImportRow } from "./type";
import type { TFunction } from "i18next";

export const isCompletePurchaseLine = (line: PurchaseImportRow) => {
  const price = Number(line.price ?? line.pricePerUom ?? 0);
  const qty = Number(line.qty ?? 0);

  return Boolean(line.productId && line.unitId && qty > 0 && price > 0);
};

export const isCompletePurchaseLineWithAccounts = (
  line: PurchaseImportRow,
) =>
  isCompletePurchaseLine(line) &&
  Boolean(line.debitAccountId && line.vatAccountId);

export const createPurchaseValidationSchema = (t: TFunction) => Yup.object<PurchaseImportForm>({
  docDate: Yup.string().trim().required(t("common.requiredFields")),
  counterpartyId: Yup.number().required(t("common.requiredFields")),
  contractId: Yup.number().required(t("common.requiredFields")),
  warehouseId: Yup.number().required(t("common.requiredFields")),
  currencyId: Yup.number().required(t("common.requiredFields")),
  supplierAccountId: Yup.number()
    .nullable()
    .required(t("purchase.messages.supplierAccountRequired"))
    .moreThan(0, t("purchase.messages.supplierAccountRequired")),
  comment: Yup.string().trim().notRequired(),
  lines: Yup.array()
    .of(
      Yup.object({
        productId: Yup.number().nullable(),
        qty: Yup.number().nullable(),
        unitId: Yup.number().nullable(),
        price: Yup.number().nullable(),
        debitAccountId: Yup.number().nullable(),
        vatAccountId: Yup.number().nullable(),
      }),
    )
    .required(t("common.requiredFields")),
}).test(
  "has-lines",
  t("purchase.messages.lineRequired"),
  (value: unknown) => {
    const form = value as PurchaseImportForm | undefined;
    return Boolean(form?.lines?.some(isCompletePurchaseLineWithAccounts));
  },
);
