import * as Yup from "yup";

export const counterpartyContactSchema = (isEdit = false) =>
  Yup.object({
    fullName: Yup.string().required("Full name is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    position: Yup.string().nullable(),
    comment: Yup.string().nullable(),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
