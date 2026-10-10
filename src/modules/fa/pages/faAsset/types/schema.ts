import * as Yup from "yup";
import type { TFunction } from "i18next";

// OKOF classifies fixed assets: an intangible asset has none
export const faAssetSchema = (t: TFunction, intangible = false) =>
  Yup.object({
    inventoryNumber: Yup.string()
      .trim()
      .required(t("fa.validation.inventoryNumberRequired")),
    name: Yup.string().trim().required(t("fa.validation.nameRequired")),
    faGroupId: Yup.number()
      .nullable()
      .required(t("fa.validation.groupRequired")),
    okofId: intangible
      ? Yup.number().nullable()
      : Yup.number().nullable().required(t("fa.validation.okofRequired")),
  });
