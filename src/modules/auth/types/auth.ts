import * as Yup from "yup";
import type { TFunction } from "i18next";

export interface Auth {
  id: string | number;
  name: string;
  createdAt?: string;
}

export interface AuthForm {
  name: string;
}

export const createAuthSchema = (t: TFunction) =>
  Yup.object({
    userName: Yup.string().required(t("auth.validation.userNameRequired")),
    password: Yup.string().required(t("auth.validation.passwordRequired")),
  });
