import * as Yup from "yup";
import type { PurchaseImportForm } from "./form";
import type { PurchaseImportRow } from "./type";

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

export const purchaseValidationSchema = Yup.object<PurchaseImportForm>({
  docDate: Yup.string().trim().required("validation.required"),
  counterpartyId: Yup.number().required("validation.required"),
  contractId: Yup.number().required("validation.required"),
  warehouseId: Yup.number().required("validation.required"),
  currencyId: Yup.number().required("validation.required"),
  supplierAccountId: Yup.number()
    .nullable()
    .required("Yetkazib beruvchi schyotini tanlang")
    .moreThan(0, "Yetkazib beruvchi schyotini tanlang"),
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
    .required("validation.required"),
}).test(
  "has-lines",
  "Kamida bitta mahsulot yoki xizmat kiriting",
  (value: unknown) => {
    const form = value as PurchaseImportForm | undefined;
    return Boolean(form?.lines?.some(isCompletePurchaseLineWithAccounts));
  },
);
