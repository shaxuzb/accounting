import * as Yup from "yup";

export const counterpartybankaccountSchema = (isEdit = false) =>
  Yup.object({
    accountNumber: Yup.string().required("Account number is required"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
