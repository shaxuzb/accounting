import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

const itemSchema = Yup.object({
  productTableId: Yup.number().nullable(),
  barcode: Yup.string().nullable().defined(),
  serialNumber: Yup.string().nullable().defined(),
  markingNumber: Yup.string().nullable().defined(),
  costPrice: Yup.number().nullable(),
});

const lineSchema = Yup.object({
  productId: requiredNumber("purchase.fields.product"),
  unitId: requiredNumber("purchase.fields.quantity"),
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
