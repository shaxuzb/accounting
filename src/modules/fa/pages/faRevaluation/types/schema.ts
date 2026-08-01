import * as Yup from "yup";
import type { TFunction } from "i18next";

export const faRevaluationSchema = (t: TFunction) => Yup.object().shape({
  revaluationDate: Yup.string().required(t("fa.validation.dateRequired")),
  reason: Yup.string().nullable(),
  revaluationReserveAccountId: Yup.number()
    .nullable()
    .required(t("fa.validation.revaluationReserveAccountRequired")),
  revaluationLossAccountId: Yup.number()
    .nullable()
    .required(t("fa.validation.revaluationLossAccountRequired")),
  lines: Yup.array()
    .of(
      Yup.object().shape({
        faAssetId: Yup.number().required(t("fa.validation.assetRequired")).nullable(),
        newValue: Yup.number().required(t("fa.validation.newValueRequired")),
        note: Yup.string().nullable(),
        assetAccountId: Yup.number()
          .nullable()
          .required(t("fa.validation.assetAccountRequired")),
        accumulatedDepreciationAccountId: Yup.number()
          .nullable()
          .required(t("fa.validation.accumulatedDepreciationAccountRequired")),
      })
    )
    .min(1, t("fa.validation.atLeastOneLine")),
});

