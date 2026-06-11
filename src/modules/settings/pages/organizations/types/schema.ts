import * as Yup from "yup";

export const organizationsSchema = (isEdit = false) =>
  Yup.object({
    fullName: Yup.string().required("To'liq nomini kiriting"),
    shortName: Yup.string().required("Qisqacha nomini kiriting"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
