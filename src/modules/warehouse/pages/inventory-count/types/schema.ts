import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const inventoryCountSchema = Yup.object({
  docDate: Yup.string().required(),
  warehouseId: requiredNumber("settings.entities.warehouse"),
  stateId: Yup.number().nullable().required(),
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
        items: Yup.array()
          .of(
            Yup.object({
              productTableId: Yup.number().nullable(),
              barcode: Yup.string().nullable().defined(),
              serialNumber: Yup.string().nullable().defined(),
              markingNumber: Yup.string().nullable().defined(),
              costPrice: Yup.number().nullable(),
            }),
          )
          .min(1)
          .required(),
      }),
    )
    .min(1),
});
