import {
  editStateSchema,
  requiredNumber,
  requiredString as requiredTrimmedString,
} from "@/modules/settings/shared/validation";
import { requiredString } from "@/utils/validations";
import * as Yup from "yup";
export const contractSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    counterpartyId: requiredNumber("settings.fields.supplyContractor"),
    contractTypeId: requiredNumber("settings.fields.contractType"),
    // Mas'ul shaxs ixtiyoriy — shartnomaning o'zi undan mustaqil.
    responsiblePersonId: Yup.number().nullable(),
    contractDate: requiredString("settings.fields.contractDate"),
    startDate: requiredString("settings.fields.startDate"),
    stateId: editStateSchema(isEdit),
  });

export const contractResponsiblePersonSchema = (isEdit = false) =>
  Yup.object({
    fullName: requiredTrimmedString("contract.fields.responsiblePerson"),
    stateId: editStateSchema(isEdit),
  });
