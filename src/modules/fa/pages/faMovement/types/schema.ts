import * as yup from "yup";
import type { TFunction } from "i18next";

export const faMovementSchema = (t: TFunction) => yup.object().shape({
  docDate: yup.string().required(t("fa.validation.dateRequired")),
  toDepartmentId: yup
    .number()
    .nullable()
    .required(t("fa.validation.departmentRequired")),
  toResponsibleUserId: yup
    .number()
    .nullable()
    .required(t("fa.validation.responsibleUserRequired")),
  note: yup.string(),
  lines: yup
    .array()
    .of(
      yup.object().shape({
        faAssetId: yup
          .number()
          .nullable()
          .required(t("fa.validation.assetRequired")),
        fromDepartmentId: yup
          .number()
          .nullable()
          .required(t("fa.validation.departmentRequired")),
        fromResponsibleUserId: yup
          .number()
          .nullable()
          .required(t("fa.validation.responsibleUserRequired")),
        note: yup.string(),
      }),
    )
    .min(1, t("fa.validation.atLeastOneAsset"))
    .test(
      "unique-assets",
      t("fa.validation.duplicateAsset"),
      (lines) => {
        if (!lines) return true;
        const assetIds = lines
          .map((line) => line.faAssetId)
          .filter((assetId): assetId is number => assetId != null);
        return new Set(assetIds).size === assetIds.length;
      },
    )
    .required(t("fa.validation.atLeastOneAsset")),
});
