import * as Yup from "yup";
import type { PurchaseImportForm } from "./form";

export const purchaseValidationSchema = Yup.object<PurchaseImportForm>({
  docDate: Yup.string().trim().required("validation.required"),
  counterpartyId: Yup.number().nullable().required("validation.required"),
  warehouseId: Yup.number().nullable().required("validation.required"),
  currencyId: Yup.number().nullable().required("validation.required"),
  comment: Yup.string().trim().notRequired(),
  lines: Yup.array()
    .min(1, "validation.required")
    .required("validation.required"),
});
