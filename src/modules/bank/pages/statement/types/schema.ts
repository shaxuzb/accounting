import * as Yup from "yup";
export const schema = Yup.object({
  bankAccountId: Yup.number()
    .nullable()
    .required("Bank hisobini tanlang")
    .moreThan(0, "Bank hisobini tanlang"),
  bankChartAccountId: Yup.number()
    .nullable()
    .required("Bank schyotini tanlang")
    .moreThan(0, "Bank schyotini tanlang"),
  offsetAccountId: Yup.number()
    .nullable()
    .required("Qarama-qarshi schyotni tanlang")
    .moreThan(0, "Qarama-qarshi schyotni tanlang"),
  operationTypeId: Yup.number()
    .nullable()
    .required("Operatsiya turini tanlang")
    .moreThan(0, "Operatsiya turini tanlang"),
  paymentTypeId: Yup.number()
    .nullable()
    .required("To'lov turini tanlang")
    .moreThan(0, "To'lov turini tanlang"),
  counterpartyId: Yup.number()
    .nullable()
    .required("Kontragentni tanlang")
    .moreThan(0, "Kontragentni tanlang"),
  counterpartyBankAccountId: Yup.number().nullable(),
  contractId: Yup.number().nullable(),
  exchangeRate: Yup.number().nullable(),
  docDate: Yup.string().required(),
  currencyId: Yup.number()
    .nullable()
    .required("Valyutani tanlang")
    .moreThan(0, "Valyutani tanlang"),
  amount: Yup.number().nullable().moreThan(0).required(),
  comment: Yup.string().trim().nullable(),
  stateId: Yup.number().nullable(),
});
