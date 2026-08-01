import * as Yup from "yup";
import i18n from "@/config/i18n";

export const requiredString = (fieldKey = "common.required") =>
  Yup.string()
    .trim()
    .required(
      String(
        i18n.t("validation.required", {
          field: i18n.t(fieldKey),
        }),
      ),
    );
