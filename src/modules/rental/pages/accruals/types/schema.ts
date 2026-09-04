import * as Yup from "yup";

export const rentalAccrualSchema = Yup.object({
  exchangeRate: Yup.number()
    .moreThan(0, "Exchange rate must be greater than zero")
    .required("Exchange rate is required"),
  lessorPayableAccountId: Yup.number().nullable(),
  taxPayableAccountId: Yup.number().nullable(),
  comment: Yup.string().nullable(),
  items: Yup.array().required(),
});
