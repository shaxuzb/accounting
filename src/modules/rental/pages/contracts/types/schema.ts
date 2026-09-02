import * as Yup from "yup";

const requiredText = (key: string) =>
  Yup.string().trim().required(`${key} majburiy`);

export const rentalContractSchema = Yup.object({
  lessorFullName: requiredText("Ijaraga beruvchi"),
  lessorInn: Yup.string().nullable(),
  lessorPinfl: Yup.string().nullable(),
  contractNumber: requiredText("Shartnoma raqami"),
  contractDate: requiredText("Shartnoma sanasi"),
  startDate: requiredText("Boshlanish sanasi"),
  endDate: requiredText("Tugash sanasi"),
  currencyId: Yup.number().nullable().required("Valyuta majburiy"),
  objects: Yup.array()
    .of(
      Yup.object({
        rentalObjectTypeId: Yup.number().required("Obyekt turi majburiy"),
        objectName: requiredText("Obyekt nomi"),
        startDate: requiredText("Boshlanish sanasi"),
        endDate: requiredText("Tugash sanasi"),
        periodUnit: Yup.string().oneOf(["DAY", "MONTH"]).required(),
        periodValue: Yup.number().moreThan(0).required(),
        contractAmount: Yup.number().moreThan(0).required(),
        taxBaseAmount: Yup.number().moreThan(0).required(),
        taxRate: Yup.number().min(0).max(100).required(),
      }),
    )
    .min(1, "Kamida bitta ijara obyekti kerak"),
}).test(
  "lessor-identity",
  "STIR yoki JShShIR dan kamida bittasini kiriting",
  (value) => Boolean(value?.lessorInn?.trim() || value?.lessorPinfl?.trim()),
);
