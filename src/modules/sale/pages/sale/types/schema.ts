import * as Yup from "yup";

const requiredId = (message: string) =>
  Yup.number()
    .nullable()
    .required(message)
    .moreThan(0, message);

export const saleDocSchema = (isEdit = false) =>
  Yup.object({
    docDate: Yup.string().required("Sana majburiy"),
    counterpartyId: requiredId("Kontragentni tanlang"),
    contractId: requiredId("Shartnomani tanlang"),
    warehouseId: requiredId("Omborni tanlang"),
    currencyId: requiredId("Valyutani tanlang"),
    customerAccountId: isEdit
      ? Yup.number().nullable()
      : requiredId("Mijoz schyotini tanlang"),
    vatAccountId: isEdit
      ? Yup.number().nullable()
      : requiredId("QQS schyotini tanlang"),
    comment: Yup.string().trim().default(""),
  });

export const saleDocLinesSchema = (isEdit = false) =>
  Yup.array()
    .of(
      Yup.object({
        productId: requiredId("Mahsulotni tanlang"),
        quantity: requiredId("Mahsulot miqdorini kiriting"),
        unitId: requiredId("Mahsulot birligini tanlang"),
        inventoryAccountId: isEdit
          ? Yup.number().nullable()
          : requiredId("Tovarlar hisobvarag'ini tanlang"),
        incomeAccountId: isEdit
          ? Yup.number().nullable()
          : requiredId("Sotuv daromadi hisobvarag'ini tanlang"),
        costAccountId: isEdit
          ? Yup.number().nullable()
          : requiredId("Sotuv tannarxi hisobvarag'ini tanlang"),
      }),
    )
    .min(1, "Kamida bitta mahsulot tanlang")
    .required("Kamida bitta mahsulot tanlang");
