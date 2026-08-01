import * as yup from "yup";
import type { TFunction } from "i18next";

export const faMovementSchema = (t: TFunction) => yup.object().shape({
  docDate: yup.string().required(t("fa.validation.dateRequired")),
  toDepartmentId: yup.number().required(t("fa.validation.departmentRequired")).nullable(),
  toResponsibleUserId: yup.number().required(t("fa.validation.responsibleUserRequired")).nullable(),
  note: yup.string(),
  lines: yup
    .array()
    .of(
      yup.object().shape({
        faAssetId: yup.number().required(t("fa.validation.assetRequired")).nullable(),
        note: yup.string(),
      })
    )
    .min(1, t("fa.validation.atLeastOneAsset")),
});
