import * as Yup from "yup";

const requiredText = (key: string) =>
  Yup.string().trim().required(`${key} majburiy`);

export const rentalContractSchema = Yup.object({
  isFreeOfCharge: Yup.boolean().required(),
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
        totalArea: Yup.number().nullable().min(0),
        rentedArea: Yup.number().nullable().min(0),
        contractAmount: Yup.number().min(0).required(),
        taxBaseAmount: Yup.number().min(0).required(),
        taxRate: Yup.number().min(0).max(100).required(),
        expenseAccountId: Yup.number().nullable(),
        utilities: Yup.array()
          .of(
            Yup.object({
              utilityServiceId: Yup.number().required(),
              payerCode: Yup.string().oneOf(["LESSOR", "LESSEE"]).required(),
            }),
          )
          .required(),
      }),
    )
    .min(1, "Kamida bitta ijara obyekti kerak"),
  lessors: Yup.array()
    .of(
      Yup.object({
        lessorKindCode: Yup.string()
          .oneOf(["INDIVIDUAL", "LEGAL_ENTITY"])
          .required(),
        fullName: requiredText("Ijaraga beruvchi"),
        inn: Yup.string().nullable(),
        pinfl: Yup.string().nullable(),
        phoneNumber: Yup.string().nullable(),
        registeredAddress: Yup.string().nullable(),
        residentialAddress: Yup.string().nullable(),
      }),
    )
    .min(1, "Kamida bitta ijaraga beruvchi kerak")
    .required(),
}).test(
  "lessor-identity",
  "Har bir ijaraga beruvchi uchun STIR yoki JShShIR kiriting",
  (value) =>
    Boolean(
      value?.lessors?.every(
        (lessor) => Boolean(lessor.inn?.trim() || lessor.pinfl?.trim()),
      ),
    ),
).test(
  "legal-entity-inn",
  "Yuridik shaxs uchun STIR majburiy",
  (value) =>
    Boolean(
      value?.lessors?.every(
        (lessor) =>
          lessor.lessorKindCode !== "LEGAL_ENTITY" || Boolean(lessor.inn?.trim()),
      ),
    ),
).test(
  "unique-lessor-identifiers",
  "Bir xil STIR yoki JShShIR takrorlanmasligi kerak",
  (value) => {
    const identifiers = (value?.lessors ?? [])
      .flatMap((lessor) => [lessor.inn, lessor.pinfl])
      .filter((identifier): identifier is string => Boolean(identifier?.trim()))
      .map((identifier) => identifier.trim());
    return new Set(identifiers).size === identifiers.length;
  },
).test(
  "contract-rules",
  "Ijara maʼlumotlari backend qoidalariga mos emas",
  (value) => {
    if (!value) return false;
    const contractStart = String(value.startDate).slice(0, 10);
    const contractEnd = String(value.endDate).slice(0, 10);
    const objects = value.objects ?? [];
    const utilitiesAreUnique = objects.every((object) => {
      const ids = object.utilities.map((utility) => utility.utilityServiceId);
      return new Set(ids).size === ids.length;
    });
    const objectsAreValid = objects.every((object) => {
      const objectStart = String(object.startDate).slice(0, 10);
      const objectEnd = String(object.endDate).slice(0, 10);
      const datesAreInside =
        objectStart >= contractStart && objectEnd <= contractEnd;
      const areaIsValid =
        object.totalArea == null ||
        object.rentedArea == null ||
        object.rentedArea <= object.totalArea;
      const freeValuesAreValid = value.isFreeOfCharge
        ? object.contractAmount === 0 &&
          object.taxBaseAmount === 0 &&
          object.taxRate === 0 &&
          object.expenseAccountId == null
        : object.contractAmount > 0 &&
          object.taxBaseAmount >= object.contractAmount;
      return datesAreInside && areaIsValid && freeValuesAreValid;
    });
    return utilitiesAreUnique && objectsAreValid;
  },
);
