import * as Yup from "yup";

export const departmentsSchema = (isEdit = false) =>
  Yup.object({
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
