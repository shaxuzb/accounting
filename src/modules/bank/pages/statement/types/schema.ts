import * as Yup from "yup";
export const schema = Yup.object({
  bankAccountId: Yup.number().nullable().required(),
  operationTypeId: Yup.number().nullable().required(),
  counterpartyId: Yup.number().nullable().required(),
  docDate: Yup.string().required(),
  currencyId: Yup.number().nullable().required(),
  amount: Yup.number().nullable().moreThan(0).required(),
  comment: Yup.string().trim().nullable(),
  stateId: Yup.number().nullable(),
});
