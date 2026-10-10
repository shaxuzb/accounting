import * as Yup from "yup";
import type { TFunction } from "i18next";

export const openingBalanceHeaderSchema = (t: TFunction) =>
  Yup.object({
    balanceDate: Yup.string().required(t("openingBalance.validation.balanceDateRequired")),
    description: Yup.string().max(500, t("openingBalance.validation.descriptionMax")),
    stateId: Yup.number().nullable(),
  });
