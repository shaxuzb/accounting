import * as Yup from "yup";

export interface Settings {
  id: string | number;
  name: string;
  createdAt?: string;
}

export interface SettingsForm {
  name: string;
}

export const settingsSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

/* modux:types */
