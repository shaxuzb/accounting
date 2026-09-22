import * as Yup from "yup";

export const productItemSchema = (nameRequired = true) =>
  Yup.object({
    code: Yup.string().trim().notRequired(),
    sku: Yup.string().trim().notRequired(),
    article: Yup.string().trim().notRequired(),
    name: nameRequired
      ? Yup.string().trim().required("validation.required")
      : Yup.string().trim().notRequired(),
    // Backend MXIK'ni aynan 17 belgi deb tekshiradi (ProductInGroupBaseDtoValidator).
    // MXIK to'ldirilmagan mahsulot bazadan null bo'lib keladi, shuning uchun
    // nullable bo'lishi shart — aks holda butun guruhni saqlab bo'lmaydi.
    mxik: Yup.string()
      .trim()
      .nullable()
      .notRequired()
      .test(
        "mxik-length",
        "products.validation.mxikLength",
        (value) => !value || value.length === 17,
      ),
    isService: Yup.boolean().required("validation.required"),
    isPieceTracked: Yup.boolean().notRequired(),
    productTypeId: Yup.number().nullable().notRequired(),
    isSold: Yup.boolean().required("validation.required"),
    isPurchased: Yup.boolean().required("validation.required"),
    unitId: Yup.number().nullable().required("validation.required"),
    description: Yup.string().trim().notRequired(),
    defaultVatRateId: Yup.number().nullable().notRequired(),
    minStock: Yup.number().nullable().notRequired(),
  }).test(
    // Backend kamida bittasini talab qiladi: "Product must be marked as sold or purchased."
    "sold-or-purchased",
    "products.validation.soldOrPurchased",
    (value) => Boolean(value?.isSold || value?.isPurchased),
  );

export const productTypeSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().trim().required("validation.required"),
    isService: Yup.boolean().required("validation.required"),
    stateId: isEdit
      ? Yup.number().nullable().required("validation.required")
      : Yup.number().nullable(),
    products: Yup.array().of(productItemSchema()).default([]),
  });
