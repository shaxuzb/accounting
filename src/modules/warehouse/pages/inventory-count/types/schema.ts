import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const inventoryCountSchema = Yup.object({
  docDate: Yup.string().required(),
  warehouseId: requiredNumber("settings.entities.warehouse"),
  comment: Yup.string().nullable(),
  isCountCompleted: Yup.boolean().required(),
  lines: Yup.array()
    .of(
      Yup.object({
        productId: requiredNumber("purchase.fields.product"),
        unitId: requiredNumber("purchase.fields.quantity"),
        countedQuantity: Yup.number().nullable().required(),
        defaultCostPrice: Yup.number().nullable(),
        comment: Yup.string().nullable(),
      }),
    )
    .min(1),
});
