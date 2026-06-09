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
  createdDate: string;
  fullName: string;
  id: number;
  shortName: string;
  stateId: number;
  stateName: string;
}
export interface RoleForm {
  fullName: string;
  shortName: string;
  roleModules: number[];
  id?: number | null;
  stateId?: number | null;
}

export interface RoleModule {
  id: number;
  code: string;
  fullName: string;
  shortName: string;
}

export interface RoleModuleGroup {
  id: number;
  fullName: string;
  shortName?: string;
  modules: RoleModule[];
}

export interface RoleDetail extends Role {
  roleModules: Array<{
    id?: number;
    moduleId: number;
  }>;
}

export const roleSchema = (isEdit = false) =>
  Yup.object({
    fullName: Yup.string().required("To'liq nomini kiriting"),
    shortName: Yup.string().required("Qisqacha nomini kiriting"),
    roleModules: Yup.array()
      .of(Yup.number().required())
      .min(1, "Kamida bitta modul tanlang")
      .required("Modullarni tanlang"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// users

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
