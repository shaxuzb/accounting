import * as Yup from "yup";

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
