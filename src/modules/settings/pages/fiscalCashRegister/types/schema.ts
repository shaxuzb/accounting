import * as Yup from "yup";
import {
  editStateSchema,
  optionalNumber,
  optionalString,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const fiscalCashRegisterSchema = (isEdit = false) =>
  Yup.object({
    warehouseId: optionalNumber(),
    registerTypeId: requiredNumber("settings.fields.registerType"),
    name: requiredString("settings.fields.name"),
    externalRegisterId: optionalString(),
    model: optionalString(),
    serialNumber: optionalString(),
    fiscalModuleNumber: optionalString(),
    stateId: editStateSchema(isEdit),
  });
