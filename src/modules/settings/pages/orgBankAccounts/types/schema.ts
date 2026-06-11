import * as Yup from "yup";

export const orgBankAccountsSchema = (isEdit = false) =>
  Yup.object({
    accountNumber: Yup.string().required("Account number is required"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
