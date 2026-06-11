import i18n from "@/config/i18n";
import * as Yup from "yup";

const t = (key: string, options?: Record<string, unknown>) =>
  String(i18n.t(key, options));

export const validationMessage = {
  required: (fieldKey: string) =>
    t("validation.required", { field: t(fieldKey) }),
  invalidEmail: () => t("validation.invalidEmail"),
  invalidPhone: () => t("validation.invalidPhone"),
  minString: (fieldKey: string, min: number) =>
    t("validation.minString", { field: t(fieldKey), min }),
  minArray: (fieldKey: string, min: number) =>
    t("validation.minArray", { field: t(fieldKey), min }),
};

export const requiredString = (fieldKey: string) =>
  Yup.string().trim().required(validationMessage.required(fieldKey));

export const optionalString = () => Yup.string().trim().nullable();

export const requiredNumber = (fieldKey: string) =>
  Yup.number()
    .nullable()
    .typeError(validationMessage.required(fieldKey))
    .required(validationMessage.required(fieldKey));

export const optionalNumber = () => Yup.number().nullable();

export const requiredEmail = (fieldKey = "settings.fields.email") =>
  Yup.string()
    .trim()
    .email(validationMessage.invalidEmail())
    .required(validationMessage.required(fieldKey));

export const requiredPhone = (fieldKey = "settings.fields.phoneNumber") =>
  Yup.string()
    .trim()
    .matches(/^\+998 \d{2} \d{3}-\d{2}-\d{2}$/, validationMessage.invalidPhone())
    .required(validationMessage.required(fieldKey));

export const requiredPassword = (fieldKey = "settings.fields.password") =>
  Yup.string()
    .min(6, validationMessage.minString(fieldKey, 6))
    .required(validationMessage.required(fieldKey));

export const editStateSchema = (isEdit: boolean) =>
  isEdit ? requiredNumber("settings.fields.status") : optionalNumber();
