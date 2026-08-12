import * as yup from "yup";
import type { TFunction } from "i18next";

export const faMovementSchema = (t: TFunction) => yup.object({
  docDate: yup.string().required(t("fa.validation.dateRequired")),
  toDepartmentId: yup.number().nullable(),
  toResponsibleUserId: yup.number().nullable(),
  note: yup.string(),
  lines: yup.array().of(yup.object({
    faAssetId: yup.number().nullable().required(t("fa.validation.assetRequired")),
    note: yup.string(),
  })).min(1, t("fa.validation.atLeastOneAsset")).test("unique-assets", t("fa.validation.duplicateAsset"), (lines) => {
    const ids = (lines ?? []).map((line) => line?.faAssetId).filter((id): id is number => id != null);
    return new Set(ids).size === ids.length;
  }),
}).test("destination", t("fa.validation.movementDestinationRequired"), (values) =>
  Boolean(values?.toDepartmentId || values?.toResponsibleUserId),
);
