import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const inventoryAdjustmentSchema = Yup.object({
  docDate: Yup.string().required(),
  warehouseId: requiredNumber("settings.entities.warehouse"),
  adjustmentType: Yup.string().required(),
  comment: Yup.string().nullable(),
  lines: Yup.array()
    .of(
      Yup.object({
        productId: requiredNumber("purchase.fields.product"),
        unitId: requiredNumber("purchase.fields.quantity"),
        quantity: Yup.number().nullable().required(),
        comment: Yup.string().nullable(),
      }),
    )
    .min(1),
});
