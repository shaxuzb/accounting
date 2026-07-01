import * as Yup from "yup";

export const saleDocSchema = Yup.object({
  docDate: Yup.string().required("Sana majburiy"),
  counterpartyId: Yup.number().nullable().required("Kontragentni tanlang"),
  contractId: Yup.number().nullable().required("Shartnomani tanlang"),
  warehouseId: Yup.number().nullable().required("Omborni tanlang"),
  currencyId: Yup.number().nullable().required("Valyutani tanlang"),
  comment: Yup.string().trim().default(""),
});
