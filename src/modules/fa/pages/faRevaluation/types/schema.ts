import * as Yup from "yup";
export const faRevaluationSchema = Yup.object().shape({
  revaluationDate: Yup.string().required("Sana kiritish majburiy"),
  reason: Yup.string().nullable(),
  lines: Yup.array()
    .of(
      Yup.object().shape({
        faAssetId: Yup.number().required("Asosiy vositani tanlang").nullable(),
        newValue: Yup.number().required("Yangi qiymat kiritish majburiy"),
        note: Yup.string().nullable(),
      })
    )
    .min(1, "Kamida bitta qator qo'shilishi kerak"),
});

