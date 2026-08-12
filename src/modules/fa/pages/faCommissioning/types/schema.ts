import * as yup from "yup";
import type { TFunction } from "i18next";

export const faCommissioningSchema = (t: TFunction) =>
  yup.object({
    docDate: yup.string().required(t("fa.validation.dateRequired")),
    note: yup.string(),
    lines: yup.array().of(yup.object({
      faAssetId: yup.number().nullable().required(t("fa.validation.assetRequired")),
      deprStartDate: yup.string().required(t("fa.validation.depreciationStartRequired")),
      salvageValue: yup.number().nullable().min(0, t("fa.validation.salvageValueNonNegative")).required(t("fa.validation.salvageValueRequired")),
      usefulLifeMonths: yup.number().nullable().integer().min(1, t("fa.validation.usefulLifeMin")).required(t("fa.validation.usefulLifeRequired")),
      depreciationMethodId: yup.number().nullable().required(t("fa.validation.depreciationMethodRequired")),
      plannedUnitsTotal: yup.number().nullable().min(0, t("fa.validation.plannedUnitsNonNegative")),
      departmentId: yup.number().nullable().required(t("fa.validation.departmentRequired")),
      responsibleUserId: yup.number().nullable().required(t("fa.validation.responsibleUserRequired")),
      accumulatedDepreciationAccountId: yup.number().nullable().required(t("fa.validation.accumulatedDepreciationAccountRequired")),
      depreciationExpenseAccountId: yup.number().nullable().required(t("fa.validation.depreciationExpenseAccountRequired")),
      note: yup.string(),
    })).min(1, t("fa.validation.atLeastOneAsset")).test("unique-assets", t("fa.validation.duplicateAsset"), (lines) => {
      const ids = (lines ?? []).map((line) => line?.faAssetId).filter((id): id is number => id != null);
      return new Set(ids).size === ids.length;
    }),
  });
