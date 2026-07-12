import * as Yup from "yup";
import {
  editStateSchema,
  optionalNumber,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const chartAccountsSchema = (isEdit = false) =>
  Yup.object({
    parentId: optionalNumber(),
    number: requiredString("settings.fields.number"),
    code: requiredString("settings.fields.code"),
    name: requiredString("settings.fields.name"),
    isGroup: Yup.boolean(),
    accountTypeId: requiredNumber("settings.fields.accountType"),
    isQuantity: Yup.boolean().required(),
    isCurrency: Yup.boolean().required(),
    isDepartment: Yup.boolean().required(),
    isTaxAccounting: Yup.boolean().required(),
    isOffBalance: Yup.boolean().required(),
    subkontos: Yup.array().of(
      Yup.object({
        subkontoTypeId: requiredNumber("settings.fields.subkonto"),
        sortOrder: requiredNumber("settings.fields.sortOrder"),
        isRequired: Yup.boolean().required(),
      }),
    ),
    stateId: editStateSchema(isEdit),
  });
