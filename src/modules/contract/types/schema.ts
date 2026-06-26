import {
  editStateSchema,
  requiredNumber,
} from "@/modules/settings/shared/validation";
import { requiredString } from "@/utils/validations";
import * as Yup from "yup";
export const contractSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    counterpartyId: requiredNumber("settings.fields.counterparty"),
    contractTypeId: requiredNumber("settings.fields.contractType"),
    contractDate: requiredString("settings.fields.contractDate"),
    startDate: requiredString("settings.fields.startDate"),
    endDate: requiredString("settings.fields.endDate"),
    stateId: editStateSchema(isEdit),
  });
