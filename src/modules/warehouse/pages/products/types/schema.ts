import * as Yup from "yup";

export const productItemSchema = (nameRequired = true) =>
  Yup.object({
    name: nameRequired
      ? Yup.string().trim().required("validation.required")
      : Yup.string().trim().notRequired(),
    barcode: Yup.string().trim().notRequired(),
    mxik: Yup.string().trim().notRequired(),
    isService: Yup.boolean().required("validation.required"),
    isPieceTracked: Yup.boolean().required("validation.required"),
    unitId: Yup.number().nullable().required("validation.required"),
    description: Yup.string().trim().notRequired(),
  });

export const productTypeSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().trim().required("validation.required"),
    isService: Yup.boolean().required("validation.required"),
    stateId: isEdit
      ? Yup.number().nullable().required("validation.required")
      : Yup.number().nullable(),
    products: Yup.array().of(productItemSchema()).default([]),
  });
