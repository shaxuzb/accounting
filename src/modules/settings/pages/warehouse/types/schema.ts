import * as Yup from "yup";

export const warehouseSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().required("To'liq nomini kiriting"),
    organizationId: Yup.number().required("Tashkilotni tanlang"),
    code: Yup.string().required("Code is required"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
