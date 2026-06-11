import * as Yup from "yup";

export const positionsSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().required("To'liq nomini kiriting"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
