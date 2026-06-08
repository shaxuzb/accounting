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

export interface Role {
  id: string | number;
  name: string;
  createdAt?: string;
}
export interface RoleForm {
  name: string;
}
export const roleSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});
export interface Users {
  id: string | number;
  name: string;
  createdAt?: string;
}
export interface UsersForm {
  name: string;
}
export const usersSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

/* modux:types */
