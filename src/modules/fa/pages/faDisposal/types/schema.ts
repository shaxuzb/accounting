import * as Yup from "yup";
import type { TFunction } from "i18next";

export const faDisposalSchema = (t: TFunction) => Yup.object().shape({
  disposalDate: Yup.string().required(t("fa.validation.dateRequired")),
  disposalTypeId: Yup.number()
    .nullable()
    .required(t("fa.validation.disposalTypeRequired")),
  reason: Yup.string().required(t("fa.validation.reasonRequired")),
  disposalAccountId: Yup.number().nullable().required(t("fa.validation.disposalAccountRequired")),
  customerAccountId: Yup.number().nullable().required(t("fa.validation.customerAccountRequired")),
  vatAccountId: Yup.number().nullable().required(t("fa.validation.vatAccountRequired")),
  gainAccountId: Yup.number().nullable().required(t("fa.validation.gainAccountRequired")),
  lossAccountId: Yup.number().nullable().required(t("fa.validation.lossAccountRequired")),
  lines: Yup.array()
    .of(
      Yup.object().shape({
        faAssetId: Yup.number()
          .nullable()
          .required(t("fa.validation.assetRequired")),
        saleAmount: Yup.number()
          .required(t("fa.validation.saleAmountRequired"))
          .min(0, t("fa.validation.nonNegative")),
        note: Yup.string().nullable(),
      }),
    )
    .min(1, t("fa.validation.atLeastOneLine"))
    .test("unique-assets", t("fa.validation.duplicateAsset"), (lines) => {
      const selectedIds = (lines ?? [])
        .map((line) => line?.faAssetId)
        .filter((assetId): assetId is number => assetId != null);
      return new Set(selectedIds).size === selectedIds.length;
    })
    .test(
      "sale-amount",
      t("fa.validation.saleAmountForSaleRequired"),
      function validateSaleAmount(lines) {
        const disposalTypeId = Number(this.parent.disposalTypeId);
        if (disposalTypeId !== 1) return true;
        return (lines ?? []).some((line) => Number(line?.saleAmount) > 0);
      },
    ),
});
