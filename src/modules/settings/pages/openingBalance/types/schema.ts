import * as Yup from "yup";
import type { TFunction } from "i18next";

export const openingBalanceHeaderSchema = (t: TFunction, isEdit: boolean) =>
  Yup.object({
    balanceDate: Yup.string().required(t("openingBalance.validation.balanceDateRequired")),
    description: Yup.string().max(500, t("openingBalance.validation.descriptionMax")),
    stateId: isEdit
      ? Yup.number()
          .nullable()
          .required(t("openingBalance.validation.stateRequired"))
          .positive(t("openingBalance.validation.stateRequired"))
      : Yup.number().nullable(),
  });
