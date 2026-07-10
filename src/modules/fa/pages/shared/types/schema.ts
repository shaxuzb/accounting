import * as Yup from "yup";

export const faGenericDocumentSchema = Yup.object({
  documentNumber: Yup.string().trim().required("Document number is required"),
  documentDate: Yup.string().trim().required("Document date is required"),
  comment: Yup.string().trim(),
});

