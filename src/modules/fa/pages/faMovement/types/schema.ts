import * as yup from "yup";

export const faMovementSchema = yup.object().shape({
  docDate: yup.string().required("Sana kiritish majburiy"),
  toDepartmentId: yup.number().required("Bo'limni tanlash majburiy").nullable(),
  toResponsibleUserId: yup.number().required("Javobgar shaxsni tanlash majburiy").nullable(),
  note: yup.string(),
  lines: yup
    .array()
    .of(
      yup.object().shape({
        faAssetId: yup.number().required("Asosiy vositani tanlash majburiy").nullable(),
        note: yup.string(),
      })
    )
    .min(1, "Kamida bitta asosiy vosita kiritilishi kerak"),
});
