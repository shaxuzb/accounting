import * as Yup from "yup";
import type { TFunction } from "i18next";

export const faDisposalSchema = (t: TFunction) => Yup.object().shape({
  disposalDate: Yup.string().required(t("fa.validation.dateRequired")),
  disposalType: Yup.string().required(t("fa.validation.disposalTypeRequired")),
  reason: Yup.string().required(t("fa.validation.reasonRequired")),
  disposalAccountId: Yup.number().nullable().required(t("fa.validation.disposalAccountRequired")),
  customerAccountId: Yup.number().nullable().required(t("fa.validation.customerAccountRequired")),
  vatAccountId: Yup.number().nullable().required(t("fa.validation.vatAccountRequired")),
  gainAccountId: Yup.number().nullable().required(t("fa.validation.gainAccountRequired")),
  lossAccountId: Yup.number().nullable().required(t("fa.validation.lossAccountRequired")),
  lines: Yup.array().of(
    Yup.object().shape({
      faAssetId: Yup.number().required(t("fa.validation.assetRequired")),
      saleAmount: Yup.number().required(t("fa.validation.saleAmountRequired")).min(0, t("fa.validation.nonNegative")),
      note: Yup.string().nullable(),
      assetAccountId: Yup.number().nullable().required(t("fa.validation.assetAccountRequired")),
      accumulatedDepreciationAccountId: Yup.number().nullable().required(t("fa.validation.accumulatedDepreciationAccountRequired")),
    })
  ).min(1, t("fa.validation.atLeastOneLine")),
});
