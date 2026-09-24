import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

// Barcode, serial and marking are optional: goods kept by quantity have none, and
// Formik validates an empty input as undefined, so .defined() rejected every such
// line and a count filled from the stock could not be saved.
const itemSchema = Yup.object({
  productTableId: Yup.number().nullable(),
  barcode: Yup.string().nullable(),
  serialNumber: Yup.string().nullable(),
  markingNumber: Yup.string().nullable(),
  costPrice: Yup.number().nullable(),
});

const lineSchema = Yup.object({
  productId: requiredNumber("purchase.fields.product"),
  unitId: requiredNumber("purchase.fields.unit"),
  countedQuantity: Yup.number().nullable().required(),
  defaultCostPrice: Yup.number().nullable(),
  comment: Yup.string().nullable(),
  items: Yup.array().of(itemSchema).min(1).required(),
});

export const inventoryCountCreateSchema = Yup.object({
  docDate: Yup.string().required(),
  warehouseId: requiredNumber("settings.entities.warehouse"),
  comment: Yup.string().nullable(),
  isCountCompleted: Yup.boolean().required(),
  lines: Yup.array().of(lineSchema).min(1),
});

export const inventoryCountUpdateSchema = Yup.object({
  docDate: Yup.string().required(),
  warehouseId: requiredNumber("settings.entities.warehouse"),
  stateId: Yup.number().required(),
  comment: Yup.string().nullable(),
  isCountCompleted: Yup.boolean().required(),
  lines: Yup.array().of(lineSchema).min(1),
});
