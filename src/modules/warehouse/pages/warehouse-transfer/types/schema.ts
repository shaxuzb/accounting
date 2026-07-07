import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const warehouseTransferSchema = Yup.object({
  docDate: Yup.string().required(),
  sourceWarehouseId: requiredNumber("settings.entities.warehouse"),
  destinationWarehouseId: requiredNumber("settings.entities.warehouse"),
  comment: Yup.string().nullable(),
  lines: Yup.array()
    .of(
      Yup.object({
        productId: requiredNumber("purchase.fields.product"),
        unitId: requiredNumber("purchase.fields.quantity"),
        quantity: Yup.number().nullable().required(),
        comment: Yup.string().nullable(),
        items: Yup.array().of(
          Yup.object({
            productTableId: Yup.number().nullable(),
            costPrice: Yup.number().nullable(),
            markingNumber: Yup.string().nullable(),
            serialNumber: Yup.string().nullable(),
          }),
        ),
      }),
    )
    .min(1),
});
