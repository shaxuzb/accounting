import * as Yup from "yup";

export const openingBalanceHeaderSchema = (isEdit: boolean) =>
  Yup.object({
    balanceDate: Yup.string().required("Balans sanasini kiriting"),
    description: Yup.string().max(500, "Izoh 500 belgidan oshmasligi kerak"),
    stateId: isEdit
      ? Yup.number()
          .nullable()
          .required("Holatni tanlang")
          .positive("Holatni tanlang")
      : Yup.number().nullable(),
  });
