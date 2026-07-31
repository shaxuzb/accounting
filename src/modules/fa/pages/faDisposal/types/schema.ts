import * as Yup from "yup";

export const faDisposalSchema = Yup.object().shape({
  disposalDate: Yup.string().required("Sana kiritilishi shart"),
  disposalType: Yup.string().required("Tur kiritilishi shart"),
  reason: Yup.string().required("Sabab kiritilishi shart"),
  lines: Yup.array().of(
    Yup.object().shape({
      faAssetId: Yup.number().required("Asosiy vositani tanlang"),
      saleAmount: Yup.number().required("Summa kiritilishi shart").min(0, "Manfiy son bo'lmasligi kerak"),
      note: Yup.string().nullable(),
    })
  ).min(1, "Kamida bitta qator qo'shing"),
});
