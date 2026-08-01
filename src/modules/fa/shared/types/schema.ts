import * as Yup from "yup";
import type { TFunction } from "i18next";

export const faGenericDocumentSchema = (t: TFunction) => Yup.object({
  documentNumber: Yup.string().trim().required(t("fa.validation.documentNumberRequired")),
  documentDate: Yup.string().trim().required(t("fa.validation.dateRequired")),
  comment: Yup.string().trim(),
});
