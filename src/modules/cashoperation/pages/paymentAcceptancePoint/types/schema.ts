import {
  editStateSchema,
  optionalNumber,
  optionalString,
  requiredNumber,
} from "@/modules/settings/shared/validation";
import { requiredString } from "@/utils/validations";
import * as Yup from "yup";

export const paymentAcceptancePointSchema = (isEdit = false) =>
  Yup.object({
    typeId: requiredNumber("settings.fields.paymentAcceptancePointType"),
    bankAccountId: optionalNumber(),
    name: requiredString("settings.fields.name"),
    merchantId: optionalString(),
    externalId: optionalString(),
    serialNumber: optionalString(),
    stateId: editStateSchema(isEdit),
  });
