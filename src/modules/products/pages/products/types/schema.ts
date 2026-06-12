import * as Yup from "yup";

const uomSchema = Yup.object({
  supplierUomId: Yup.number().nullable().required("validation.required"),
  stockUomId: Yup.number().nullable().required("validation.required"),
  clientUomId: Yup.number().nullable().required("validation.required"),
  supplierToStockFactor: Yup.number()
    .nullable()
    .min(0)
    .required("validation.required"),
  stockToClientFactor: Yup.number()
    .nullable()
    .min(0)
    .required("validation.required"),
});

export const productItemSchema = Yup.object({
  name: Yup.string().trim().required("validation.required"),
  barcode: Yup.string().trim().required("validation.required"),
  isService: Yup.boolean().required("validation.required"),
  unitId: Yup.number().nullable().required("validation.required"),
  // supplierId: Yup.number().nullable().required("validation.required"),
  description: Yup.string().trim().default(""),
  // currencyId: Yup.number().nullable().required("validation.required"),
  // productUom: uomSchema,
  // characteristics: Yup.array()
  //   .of(
  //     Yup.object({
  //       key: Yup.string().trim().required("validation.required"),
  //       value: Yup.string().trim().required("validation.required"),
  //     }),
  //   )
  //   .default([]),
});

export const productTypeSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().trim().required("validation.required"),
    // description: Yup.string().trim().default(""),
    // supplierId: Yup.number().nullable(),
    stateId: isEdit
      ? Yup.number().nullable().required("validation.required")
      : Yup.number().nullable(),
    products: Yup.array().of(productItemSchema).default([]),
  });
