import * as Yup from "yup";
import type { PurchaseImportForm } from "./form";
import type { PurchaseImportRow } from "./type";

export const isCompletePurchaseLine = (line: PurchaseImportRow) => {
  const price = Number(line.price ?? line.pricePerUom ?? 0);
  const qty = Number(line.qty ?? 0);

  return Boolean(line.productId && line.unitId && qty > 0 && price > 0);
};

export const purchaseValidationSchema = Yup.object<PurchaseImportForm>({
  docDate: Yup.string().trim().required("validation.required"),
  counterpartyId: Yup.number().required("validation.required"),
  contractId: Yup.number().required("validation.required"),
  warehouseId: Yup.number().required("validation.required"),
  currencyId: Yup.number().required("validation.required"),
  comment: Yup.string().trim().notRequired(),
  lines: Yup.array().required("validation.required"),
}).test(
  "has-lines",
  "Kamida bitta mahsulot yoki xizmat kiriting",
  (value: unknown) => {
    const form = value as PurchaseImportForm | undefined;
    return Boolean(form?.lines?.some(isCompletePurchaseLine));
  },
);
