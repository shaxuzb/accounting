import { editStateSchema, requiredNumber } from "@/modules/settings/shared/validation";
import * as Yup from "yup";
export const contractSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    counterpartyId: requiredNumber("settings.fields.counterparty"),
    contractType: requiredNumber("settings.fields.contractType"),
    stateId: editStateSchema(isEdit),
  });
