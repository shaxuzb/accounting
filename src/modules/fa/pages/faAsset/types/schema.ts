import * as Yup from "yup";
import type { TFunction } from "i18next";

export const faAssetSchema = (t: TFunction) =>
  Yup.object({
    inventoryNumber: Yup.string()
      .trim()
      .required(t("fa.validation.inventoryNumberRequired")),
    name: Yup.string().trim().required(t("fa.validation.nameRequired")),
    faGroupId: Yup.number()
      .nullable()
      .required(t("fa.validation.groupRequired")),
    okofId: Yup.number().nullable().required(t("fa.validation.okofRequired")),
  });
