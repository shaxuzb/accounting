import * as Yup from "yup";
import type { TFunction } from "i18next";

export const faAssetSchema = (t: TFunction) => Yup.object({
  inventoryNumber: Yup.string().trim().required(t("fa.validation.inventoryNumberRequired")),
  name: Yup.string().trim().required(t("fa.validation.nameRequired")),
  faGroupId: Yup.number().nullable().required(t("fa.validation.groupRequired")),
  okofId: Yup.number().nullable().required(t("fa.validation.okofRequired")),
  depreciationMethodId: Yup.number()
    .nullable()
    .required(t("fa.validation.depreciationMethodRequired")),
  usefulLifeMonths: Yup.number()
    .nullable()
    .min(1, t("fa.validation.usefulLifeMin"))
    .required(t("fa.validation.usefulLifeRequired")),
  initialCost: Yup.number()
    .nullable()
    .min(0, t("fa.validation.initialCostNonNegative"))
    .required(t("fa.validation.initialCostRequired")),
  salvageValue: Yup.number()
    .nullable()
    .min(0, t("fa.validation.salvageValueNonNegative"))
    .required(t("fa.validation.salvageValueRequired")),
  commissioningDate: Yup.string()
    .trim()
    .required(t("fa.validation.commissioningDateRequired")),
  deprStartDate: Yup.string()
    .trim()
    .required(t("fa.validation.depreciationStartRequired")),
  plannedUnitsTotal: Yup.number()
    .nullable()
    .min(0, t("fa.validation.plannedUnitsNonNegative"))
    .required(t("fa.validation.plannedUnitsRequired")),
  sourceProductTableId: Yup.number()
    .nullable()
    .required(t("fa.validation.sourceProductRequired")),
  departmentId: Yup.number().nullable().required(t("fa.validation.departmentRequired")),
  responsibleUserId: Yup.number()
    .nullable()
    .required(t("fa.validation.responsibleUserRequired")),
  assetAccountId: Yup.number()
    .nullable()
    .required(t("fa.validation.assetAccountRequired")),
  accumulatedDepreciationAccountId: Yup.number()
    .nullable()
    .required(t("fa.validation.accumulatedDepreciationAccountRequired")),
  depreciationExpenseAccountId: Yup.number()
    .nullable()
    .required(t("fa.validation.depreciationExpenseAccountRequired")),
  stateId: Yup.number().nullable(),
  statusId: Yup.number().nullable(),
});
