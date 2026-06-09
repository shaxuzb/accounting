import * as Yup from "yup";

// Settings
export const settingsSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

// Role
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

// Users
export const usersSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

// Organizations
export const organizationsSchema = (isEdit = false) =>
  Yup.object({
    fullName: Yup.string().required("To'liq nomini kiriting"),
    shortName: Yup.string().required("Qisqacha nomini kiriting"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Country
export const counterpartySchema = (isEdit = false) =>
  Yup.object({
    fullName: Yup.string().required("To'liq nomini kiriting"),
    shortName: Yup.string().required("Qisqacha nomini kiriting"),
    // roleModules: Yup.array()
    //   .of(Yup.number().required())
    //   .min(1, "Kamida bitta modul tanlang")
    //   .required("Modullarni tanlang"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
